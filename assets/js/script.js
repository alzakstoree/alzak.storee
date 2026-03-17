const AIRTABLE_CONFIG = {
    API_KEY: 'YOUR_API_KEY',
    BASE_ID: 'YOUR_BASE_ID',
    API_URL: 'https://api.airtable.com/v0/'
};

// ==================== دوال API ====================
function updateApiStatus() {
    const statusEl = document.getElementById('apiStatus');
    if (statusEl) {
        if (AIRTABLE_CONFIG.API_KEY !== 'YOUR_API_KEY' && AIRTABLE_CONFIG.BASE_ID !== 'YOUR_BASE_ID') {
            statusEl.innerHTML = 'متصل (مهيأ)';
            statusEl.className = 'badge bg-success';
        } else {
            statusEl.innerHTML = 'غير مهيأ';
            statusEl.className = 'badge bg-warning text-dark';
        }
    }
}

function saveApiConfig() {
    const newKey = document.getElementById('apiKeyInput')?.value;
    const newBase = document.getElementById('baseIdInput')?.value;
    if (newKey && newBase) {
        AIRTABLE_CONFIG.API_KEY = newKey;
        AIRTABLE_CONFIG.BASE_ID = newBase;
        updateApiStatus();
        localStorage.setItem('airtable_api_key', newKey);
        localStorage.setItem('airtable_base_id', newBase);
        alert('تم حفظ الإعدادات');
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
        const keyInput = document.getElementById('apiKeyInput');
        const baseInput = document.getElementById('baseIdInput');
        if (keyInput) keyInput.value = savedKey;
        if (baseInput) baseInput.value = savedBase;
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

// ==================== دوال تحميل البيانات للوحة الرئيسية ====================
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
    // فقط إذا كنا في الصفحة الرئيسية
    if (!document.getElementById('totalOrders')) return;
    
    showLoadingIndicators();
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY' || AIRTABLE_CONFIG.BASE_ID === 'YOUR_BASE_ID') return;

    try {
        const orders = await airtableFetch('orders');
        const ordersList = orders.records;
        setElementText('totalOrders', ordersList.length);

        const products = await airtableFetch('products');
        const activeProducts = products.records.filter(p => p.fields.status === 'active').length;
        setElementText('activeProducts', activeProducts);

        const users = await airtableFetch('users');
        setElementText('totalUsers', users.records.length);

        let totalBal = 0;
        users.records.forEach(u => totalBal += (u.fields.balance || 0));
        setElementText('totalBalances', '$' + totalBal.toFixed(2));

        const pending = ordersList.filter(o => o.fields.status === 'pending').length;
        setElementText('pendingOrders', pending);

        let sales = 0, costs = 0;
        ordersList.forEach(o => {
            sales += (o.fields.price || 0);
            costs += (o.fields.cost || 0);
        });
        setElementText('totalSales', '$' + sales.toFixed(4));
        setElementText('totalCosts', '$' + costs.toFixed(4));
        setElementText('netProfit', '$' + (sales - costs).toFixed(4));

        const exchangeRate = 15000;
        setElementText('totalDebtSYP', (0).toFixed(2) + ' ل.س');
        setElementText('totalSalesSYP', (sales * exchangeRate).toFixed(2) + ' ل.س');
        setElementText('totalCostsSYP', (costs * exchangeRate).toFixed(2) + ' ل.س');
        setElementText('netProfitSYP', ((sales - costs) * exchangeRate).toFixed(2) + ' ل.س');

        try {
            const recharges = await airtableFetch('recharge_requests');
            const pendingRecharge = recharges.records.filter(r => r.fields.status === 'pending').length;
            setElementText('pendingRecharge', pendingRecharge);
        } catch { setElementText('pendingRecharge', '0'); }

        const allowedDebt = users.records.filter(u => u.fields.debt_allowed === true).length;
        setElementText('allowedDebtUsers', allowedDebt);

        let totalDebt = 0;
        users.records.forEach(u => totalDebt += (u.fields.debt_balance || 0));
        setElementText('totalDebt', '$' + totalDebt.toFixed(2));

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const ordersThisMonth = ordersList.filter(o => {
            const date = new Date(o.fields.date);
            return date >= startOfMonth && date <= endOfMonth;
        }).length;
        setElementText('ordersThisMonth', ordersThisMonth);

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        setElementText('ordersDateRange', `${endOfMonth.toLocaleDateString('ar-EG', options)} – ${startOfMonth.toLocaleDateString('ar-EG', options)}`);

    } catch (error) {
        console.error(error);
        alert('فشل تحميل البيانات. تحقق من API والإعدادات.');
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

// ==================== دوال تسجيل الدخول ====================
let isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

function adminLogin() {
    const username = document.querySelector('#adminLoginForm input[name="username"]')?.value;
    const password = document.querySelector('#adminLoginForm input[name="password"]')?.value;
    if (username === 'admin' && password === 'admin') {
        isLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        updateUIBasedOnLogin();
        const modal = document.getElementById('adminLoginModal');
        if (modal) bootstrap.Modal.getInstance(modal)?.hide();
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
        apiConfigBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
}

// ==================== دوال الإضافة والتعديل ====================
async function addProduct() {
    const form = document.getElementById('addProductForm');
    if (!form) return alert('النموذج غير موجود');
    const data = new FormData(form);
    const product = {};
    data.forEach((v, k) => product[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('products', { method: 'POST', body: JSON.stringify({ fields: product }) });
        alert('تمت الإضافة');
        window.location.href = 'manage-products.html';
    } catch (e) { alert('خطأ: ' + e.message); }
}

async function updateProduct() {
    const form = document.getElementById('editProductForm');
    if (!form) return alert('النموذج غير موجود');
    const data = new FormData(form);
    const product = {};
    data.forEach((v, k) => product[k] = v);
    const id = product.id;
    delete product.id;
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('products/' + id, { method: 'PATCH', body: JSON.stringify({ fields: product }) });
        alert('تم التحديث');
        window.location.href = 'manage-products.html';
    } catch (e) { alert('خطأ: ' + e.message); }
}

async function addCategory() {
    const form = document.getElementById('addCategoryForm');
    if (!form) return alert('النموذج غير موجود');
    const data = new FormData(form);
    const category = {};
    data.forEach((v, k) => category[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('categories', { method: 'POST', body: JSON.stringify({ fields: category }) });
        alert('تمت الإضافة');
        window.location.href = 'categories.html';
    } catch (e) { alert('خطأ: ' + e.message); }
}

async function addPaymentMethod() {
    const form = document.getElementById('addPaymentMethodForm');
    if (!form) return alert('النموذج غير موجود');
    const data = new FormData(form);
    const method = {};
    data.forEach((v, k) => method[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('payment_methods', { method: 'POST', body: JSON.stringify({ fields: method }) });
        alert('تمت الإضافة');
        window.location.href = 'payment-methods.html';
    } catch (e) { alert('خطأ: ' + e.message); }
}

async function addSupplier() {
    const form = document.getElementById('addSupplierForm');
    if (!form) return alert('النموذج غير موجود');
    const data = new FormData(form);
    const supplier = {};
    data.forEach((v, k) => supplier[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('suppliers', { method: 'POST', body: JSON.stringify({ fields: supplier }) });
        alert('تمت الإضافة');
        window.location.href = 'suppliers.html';
    } catch (e) { alert('خطأ: ' + e.message); }
}

// ==================== دوال الحفظ الأخرى (محاكاة) ====================
function sendNotification() {
    alert('تم إرسال الإشعار (محاكاة)');
}

function saveOrderMessages() {
    alert('تم حفظ رسائل الطلبات (محاكاة)');
}

function saveExchangeRates() {
    alert('تم حفظ أسعار الصرف (محاكاة)');
}

function saveReferralSettings() {
    alert('تم حفظ إعدادات الإحالة (محاكاة)');
}

function saveDesignSettings() {
    alert('تم حفظ إعدادات التصميم (محاكاة)');
}

function saveSocialLinks() {
    alert('تم حفظ روابط التواصل (محاكاة)');
}

function saveTwoFactorSettings() {
    alert('تم حفظ إعدادات المصادقة الثنائية (محاكاة)');
}

function saveLayoutOrder() {
    alert('تم حفظ ترتيب التخطيط (محاكاة)');
}

function importProducts() {
    alert('تم استيراد المنتجات (محاكاة)');
}

function createApiKey() {
    alert('تم إنشاء مفتاح API جديد (محاكاة)');
}

function openAddAgentModal() {
    alert('فتح نموذج إضافة وكيل (قيد التطوير)');
}

function openAddAdminModal() {
    alert('فتح نموذج إضافة مشرف (قيد التطوير)');
}

function generateCard() {
    alert('تم إنشاء بطاقة جديدة (محاكاة)');
}

// ==================== تهيئة الصفحة ====================
window.onload = function() {
    loadApiConfig();
    
    // فقط إذا كان هناك رسم بياني في الصفحة
    if (document.getElementById('profitChart')) {
        // تحميل Chart.js ديناميكياً فقط عند الحاجة
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = function() {
            initProfitChart();
        };
        document.head.appendChild(script);
    }

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

    updateUIBasedOnLogin();
};

// دالة الرسم البياني (تُستدعى بعد تحميل Chart.js)
function initProfitChart() {
    const ctx = document.getElementById('profitChart');
    if (!ctx || typeof Chart === 'undefined') return;
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