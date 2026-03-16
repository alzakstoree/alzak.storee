const AIRTABLE_CONFIG = {
    API_KEY: 'YOUR_API_KEY',
    BASE_ID: 'YOUR_BASE_ID',
    API_URL: 'https://api.airtable.com/v0/'
};

function updateApiStatus() {
    const statusEl = document.getElementById('apiStatus');
    if (AIRTABLE_CONFIG.API_KEY !== 'YOUR_API_KEY' && AIRTABLE_CONFIG.BASE_ID !== 'YOUR_BASE_ID') {
        statusEl.innerHTML = 'متصل (مهيأ)';
        statusEl.className = 'badge bg-success';
    } else {
        statusEl.innerHTML = 'غير مهيأ';
        statusEl.className = 'badge bg-warning text-dark';
    }
}

function saveApiConfig() {
    const newKey = document.getElementById('apiKeyInput').value;
    const newBase = document.getElementById('baseIdInput').value;
    if (newKey && newBase) {
        AIRTABLE_CONFIG.API_KEY = newKey;
        AIRTABLE_CONFIG.BASE_ID = newBase;
        updateApiStatus();
        bootstrap.Modal.getInstance(document.getElementById('apiConfigModal')).hide();
        localStorage.setItem('airtable_api_key', newKey);
        localStorage.setItem('airtable_base_id', newBase);
        loadDashboardData();
    } else {
        alert('أدخل القيم');
    }
}

function loadApiConfig() {
    const savedKey = localStorage.getItem('airtable_api_key');
    const savedBase = localStorage.getItem('airtable_base_id');
    if (savedKey && savedBase) {
        AIRTABLE_CONFIG.API_KEY = savedKey;
        AIRTABLE_CONFIG.BASE_ID = savedBase;
        document.getElementById('apiKeyInput').value = savedKey;
        document.getElementById('baseIdInput').value = savedBase;
    }
    updateApiStatus();
}

async function airtableFetch(tableName, options = {}) {
    const url = `${AIRTABLE_CONFIG.API_URL}${AIRTABLE_CONFIG.BASE_ID}/${tableName}`;
    const headers = {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
    };
    try {
        const response = await fetch(url, { headers, ...options });
        if (!response.ok) throw new Error(`خطأ ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Airtable error:', error);
        throw error;
    }
}

function showLoadingIndicators() {
    const ids = [
        'totalDebt', 'ordersThisMonth', 'totalSales', 'totalCosts', 'netProfit',
        'pendingOrders', 'totalOrders', 'activeProducts', 'totalUsers',
        'totalBalances', 'pendingRecharge', 'allowedDebtUsers'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<span class="spinner-border spinner-border-sm text-gold"></span>';
    });
}

async function loadDashboardData() {
    showLoadingIndicators();
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY' || AIRTABLE_CONFIG.BASE_ID === 'YOUR_BASE_ID') return;

    try {
        // جلب الطلبات
        const orders = await airtableFetch('orders');
        const ordersList = orders.records;
        document.getElementById('totalOrders').innerText = ordersList.length;

        // جلب المنتجات
        const products = await airtableFetch('products');
        const activeProducts = products.records.filter(p => p.fields.status === 'active').length;
        document.getElementById('activeProducts').innerText = activeProducts;

        // جلب المستخدمين
        const users = await airtableFetch('users');
        document.getElementById('totalUsers').innerText = users.records.length;

        // إجمالي رصيد المستخدمين
        let totalBal = 0;
        users.records.forEach(u => totalBal += (u.fields.balance || 0));
        document.getElementById('totalBalances').innerText = '$' + totalBal.toFixed(2);

        // طلبات معلقة
        const pending = ordersList.filter(o => o.fields.status === 'pending').length;
        document.getElementById('pendingOrders').innerText = pending;

        // إجمالي المبيعات والتكاليف والأرباح
        let sales = 0, costs = 0;
        ordersList.forEach(o => {
            sales += (o.fields.price || 0);
            costs += (o.fields.cost || 0);
        });
        document.getElementById('totalSales').innerText = '$' + sales.toFixed(4);
        document.getElementById('totalCosts').innerText = '$' + costs.toFixed(4);
        document.getElementById('netProfit').innerText = '$' + (sales - costs).toFixed(4);

        // تحويل لليرة (سعر صرف افتراضي)
        const exchangeRate = 15000; // يمكن جعله ديناميكياً
        document.getElementById('totalDebtSYP').innerText = (0).toFixed(2) + ' ل.س'; // سيتم تحديثه لاحقاً
        document.getElementById('totalSalesSYP').innerText = (sales * exchangeRate).toFixed(2) + ' ل.س';
        document.getElementById('totalCostsSYP').innerText = (costs * exchangeRate).toFixed(2) + ' ل.س';
        document.getElementById('netProfitSYP').innerText = ((sales - costs) * exchangeRate).toFixed(2) + ' ل.س';

        // طلبات الشحن المعالجة
        try {
            const recharges = await airtableFetch('recharge_requests');
            const pendingRecharge = recharges.records.filter(r => r.fields.status === 'pending').length;
            document.getElementById('pendingRecharge').innerText = pendingRecharge;
        } catch { document.getElementById('pendingRecharge').innerText = '0'; }

        // المستخدمون المسموح لهم برصيد مدين
        const allowedDebt = users.records.filter(u => u.fields.debt_allowed === true).length;
        document.getElementById('allowedDebtUsers').innerText = allowedDebt;

        // إجمالي المبلغ المدين
        let totalDebt = 0;
        users.records.forEach(u => totalDebt += (u.fields.debt_balance || 0));
        document.getElementById('totalDebt').innerText = '$' + totalDebt.toFixed(2);

        // عدد الطلبات هذا الشهر
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const ordersThisMonth = ordersList.filter(o => {
            const date = new Date(o.fields.date);
            return date >= startOfMonth && date <= endOfMonth;
        }).length;
        document.getElementById('ordersThisMonth').innerText = ordersThisMonth;

        // تحديث نطاق التاريخ
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        document.getElementById('ordersDateRange').innerText = 
            `${endOfMonth.toLocaleDateString('ar-EG', options)} – ${startOfMonth.toLocaleDateString('ar-EG', options)}`;

    } catch (error) {
        console.error(error);
        alert('فشل تحميل البيانات. تحقق من API والإعدادات.');
    }
}

async function addProduct() {
    const form = document.getElementById('addProductForm');
    const data = new FormData(form);
    const product = {};
    data.forEach((v, k) => product[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('products', { method: 'POST', body: JSON.stringify({ fields: product }) });
        alert('تمت الإضافة');
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
        form.reset();
        loadDashboardData();
    } catch (e) { alert('خطأ: ' + e.message); }
}

function sendNotification() {
    alert('وظيفة إرسال الإشعارات قيد التطوير');
}

function initProfitChart() {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
            datasets: [{
                label: 'صافي الربح ($)',
                data: [1200, 1900, 1500, 2200, 1800, 2400, 2100],
                borderColor: '#ffb347',
                backgroundColor: 'rgba(255,180,71,0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#e0e0e0' } } },
            scales: { y: { ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } }
        }
    });
}

window.onload = function() {
    loadApiConfig();
    initProfitChart();
    if (AIRTABLE_CONFIG.API_KEY !== 'YOUR_API_KEY' && AIRTABLE_CONFIG.BASE_ID !== 'YOUR_BASE_ID') {
        loadDashboardData();
    }

    const maintenanceSwitch = document.getElementById('maintenanceMode');
    if (maintenanceSwitch) {
        const saved = localStorage.getItem('maintenanceMode') === 'true';
        maintenanceSwitch.checked = saved;
        maintenanceSwitch.addEventListener('change', function() {
            localStorage.setItem('maintenanceMode', this.checked);
        });
    }
};
// نظام تسجيل الدخول البسيط
let isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

function adminLogin() {
    const username = document.querySelector('#adminLoginForm input[name="username"]').value;
    const password = document.querySelector('#adminLoginForm input[name="password"]').value;
    // هنا يمكنك التحقق من Airtable لاحقاً
    if (username === 'admin' && password === 'admin') {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        updateUIBasedOnLogin();
        bootstrap.Modal.getInstance(document.getElementById('adminLoginModal')).hide();
        alert('تم تسجيل الدخول بنجاح');
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

function logout() {
    isLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    updateUIBasedOnLogin();
    window.location.href = 'admin-login.html';
}

function updateUIBasedOnLogin() {
    const apiConfigBtn = document.getElementById('apiConfigBtn');
    if (apiConfigBtn) {
        if (isLoggedIn) {
            apiConfigBtn.style.display = 'inline-block';
        } else {
            apiConfigBtn.style.display = 'none';
        }
    }
    // تحديث حالة API (يمكن إضافتها)
}

// استدعاء عند تحميل الصفحة
window.addEventListener('load', function() {
    updateUIBasedOnLogin();
});