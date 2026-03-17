const AIRTABLE_CONFIG = {
    API_KEY: 'YOUR_API_KEY',
    BASE_ID: 'YOUR_BASE_ID',
    API_URL: 'https://api.airtable.com/v0/'
};

// ==================== دوال Toast (إشعارات) ====================
function showToast(message, type = 'success', duration = 3000) {
    // إنشاء عنصر toast ديناميكياً
    const toastContainer = document.getElementById('toastContainer') || (() => {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    })();

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: duration });
    toast.show();

    // حذف العنصر بعد الإخفاء
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ==================== دوال API ====================
function updateApiStatus() {
    const statusEl = document.getElementById('apiStatus');
    const statusIconMobile = document.getElementById('apiStatusIconMobile');
    const statusIcon = document.getElementById('apiStatusIcon');
    
    let statusText = '';
    let statusClass = '';
    let iconBadge = '';

    if (AIRTABLE_CONFIG.API_KEY !== 'YOUR_API_KEY' && AIRTABLE_CONFIG.BASE_ID !== 'YOUR_BASE_ID') {
        statusText = 'متصل (مهيأ)';
        statusClass = 'badge bg-success';
        iconBadge = '<span class="badge bg-success rounded-circle p-1" style="width: 8px; height: 8px; display: inline-block;"></span>';
    } else {
        statusText = 'غير مهيأ';
        statusClass = 'badge bg-warning text-dark';
        iconBadge = '<span class="badge bg-warning rounded-circle p-1" style="width: 8px; height: 8px; display: inline-block;"></span>';
    }

    if (statusEl) {
        statusEl.innerHTML = statusText;
        statusEl.className = statusClass;
    }

    // تحديث شارة الأيقونة الدائرية
    if (statusIcon) {
        statusIcon.innerHTML = iconBadge;
    }
    if (statusIconMobile) {
        statusIconMobile.innerHTML = iconBadge;
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
        showToast('تم حفظ الإعدادات بنجاح', 'success');
        loadDashboardData();
    } else {
        showToast('الرجاء إدخال القيم', 'warning');
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
        showToast('فشل تحميل البيانات. تحقق من API والإعدادات.', 'error');
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
        showToast('تم تسجيل الدخول بنجاح', 'success');
    } else {
        showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
}

function logout() {
    isLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    updateUIBasedOnLogin();
    showToast('تم تسجيل الخروج', 'success');
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
    if (!form) return showToast('النموذج غير موجود', 'error');
    const data = new FormData(form);
    const product = {};
    data.forEach((v, k) => product[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { showToast('أدخل مفاتيح API أولاً', 'warning'); return; }
    try {
        await airtableFetch('products', { method: 'POST', body: JSON.stringify({ fields: product }) });
        showToast('تمت إضافة المنتج بنجاح', 'success');
        window.location.href = 'manage-products.html';
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
}

async function updateProduct() {
    const form = document.getElementById('editProductForm');
    if (!form) return showToast('النموذج غير موجود', 'error');
    const data = new FormData(form);
    const product = {};
    data.forEach((v, k) => product[k] = v);
    const id = product.id;
    delete product.id;
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { showToast('أدخل مفاتيح API أولاً', 'warning'); return; }
    try {
        await airtableFetch('products/' + id, { method: 'PATCH', body: JSON.stringify({ fields: product }) });
        showToast('تم تحديث المنتج بنجاح', 'success');
        window.location.href = 'manage-products.html';
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
}

async function addCategory() {
    const form = document.getElementById('addCategoryForm');
    if (!form) return showToast('النموذج غير موجود', 'error');
    const data = new FormData(form);
    const category = {};
    data.forEach((v, k) => category[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { showToast('أدخل مفاتيح API أولاً', 'warning'); return; }
    try {
        await airtableFetch('categories', { method: 'POST', body: JSON.stringify({ fields: category }) });
        showToast('تمت إضافة الفئة بنجاح', 'success');
        window.location.href = 'categories.html';
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
}

async function addPaymentMethod() {
    const form = document.getElementById('addPaymentMethodForm');
    if (!form) return showToast('النموذج غير موجود', 'error');
    const data = new FormData(form);
    const method = {};
    data.forEach((v, k) => method[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { showToast('أدخل مفاتيح API أولاً', 'warning'); return; }
    try {
        await airtableFetch('payment_methods', { method: 'POST', body: JSON.stringify({ fields: method }) });
        showToast('تمت إضافة طريقة الدفع بنجاح', 'success');
        window.location.href = 'payment-methods.html';
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
}

async function addSupplier() {
    const form = document.getElementById('addSupplierForm');
    if (!form) return showToast('النموذج غير موجود', 'error');
    const data = new FormData(form);
    const supplier = {};
    data.forEach((v, k) => supplier[k] = v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { showToast('أدخل مفاتيح API أولاً', 'warning'); return; }
    try {
        await airtableFetch('suppliers', { method: 'POST', body: JSON.stringify({ fields: supplier }) });
        showToast('تمت إضافة المورد بنجاح', 'success');
        window.location.href = 'suppliers.html';
    } catch (e) { showToast('خطأ: ' + e.message, 'error'); }
}

// ==================== دوال الحفظ الأخرى (محاكاة) مع Toast ====================
function sendNotification() {
    showToast('تم إرسال الإشعار (محاكاة)', 'success');
}

function saveOrderMessages() {
    showToast('تم حفظ رسائل الطلبات (محاكاة)', 'success');
}

function saveExchangeRates() {
    showToast('تم حفظ أسعار الصرف (محاكاة)', 'success');
}

function saveReferralSettings() {
    showToast('تم حفظ إعدادات الإحالة (محاكاة)', 'success');
}

function saveDesignSettings() {
    showToast('تم حفظ إعدادات التصميم (محاكاة)', 'success');
}

function saveSocialLinks() {
    showToast('تم حفظ روابط التواصل (محاكاة)', 'success');
}

function saveTwoFactorSettings() {
    showToast('تم حفظ إعدادات المصادقة الثنائية (محاكاة)', 'success');
}

function saveLayoutOrder() {
    showToast('تم حفظ ترتيب التخطيط (محاكاة)', 'success');
}

function importProducts() {
    showToast('تم استيراد المنتجات (محاكاة)', 'success');
}

function createApiKey() {
    showToast('تم إنشاء مفتاح API جديد (محاكاة)', 'success');
}

function openAddAgentModal() {
    showToast('فتح نموذج إضافة وكيل (قيد التطوير)', 'info');
}

function openAddAdminModal() {
    showToast('فتح نموذج إضافة مشرف (قيد التطوير)', 'info');
}

function generateCard() {
    showToast('تم إنشاء بطاقة جديدة (محاكاة)', 'success');
}

// ==================== تهيئة الصفحة ====================
window.onload = function() {
    loadApiConfig();
    
    if (document.getElementById('profitChart')) {
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

// دالة الرسم البياني
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