// ========== تكوين Airtable ==========
const AIRTABLE_CONFIG = {
    API_KEY: 'YOUR_API_KEY',          // <-- ضع مفتاح API هنا
    BASE_ID: 'YOUR_BASE_ID',           // <-- ضع معرف القاعدة هنا
    API_URL: 'https://api.airtable.com/v0/'
};

// تحديث حالة الاتصال
function updateApiStatus() {
    const statusEl = document.getElementById('apiStatus');
    if (AIRTABLE_CONFIG.API_KEY !== 'YOUR_API_KEY' && AIRTABLE_CONFIG.BASE_ID !== 'YOUR_BASE_ID') {
        statusEl.innerHTML = 'متصل (API مهيأ)';
        statusEl.className = 'badge bg-success';
    } else {
        statusEl.innerHTML = 'غير مهيأ (استخدم زر الإعدادات)';
        statusEl.className = 'badge bg-warning text-dark';
    }
}

// حفظ الإعدادات من النافذة
function saveApiConfig() {
    const newKey = document.getElementById('apiKeyInput').value;
    const newBase = document.getElementById('baseIdInput').value;
    if (newKey && newBase) {
        AIRTABLE_CONFIG.API_KEY = newKey;
        AIRTABLE_CONFIG.BASE_ID = newBase;
        updateApiStatus();
        bootstrap.Modal.getInstance(document.getElementById('apiConfigModal')).hide();
        // تخزين في localStorage
        localStorage.setItem('airtable_api_key', newKey);
        localStorage.setItem('airtable_base_id', newBase);
    } else {
        alert('يرجى إدخال القيم');
    }
}

// تحميل الإعدادات المحفوظة
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

// دوال مساعدة لاستدعاء Airtable
async function airtableFetch(tableName, options = {}) {
    const url = `${AIRTABLE_CONFIG.API_URL}${AIRTABLE_CONFIG.BASE_ID}/${tableName}`;
    const headers = {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
    };
    try {
        const response = await fetch(url, { headers, ...options });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Airtable error:', error);
        throw error;
    }
}

// ========== وظائف النماذج (معدة لربطها بـ Airtable) ==========
function addProduct() {
    const form = document.getElementById('addProductForm');
    if (!form) {
        alert('نموذج إضافة المنتج غير موجود في الصفحة');
        return;
    }
    const formData = new FormData(form);
    const product = {};
    formData.forEach((value, key) => { product[key] = value; });

    // محاكاة الإرسال إلى Airtable
    console.log('سيرسل المنتج إلى Airtable:', product);
    // مثال حقيقي:
    // airtableFetch('products', {
    //     method: 'POST',
    //     body: JSON.stringify({ fields: product })
    // }).then(data => {
    //     alert('تمت الإضافة بنجاح');
    //     bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    // }).catch(err => alert('خطأ: ' + err.message));

    alert('تم تجهيز البيانات للإرسال إلى Airtable (محاكاة).');
}

function editProduct() {
    alert('سيتم تحديث المنتج في Airtable');
}

function addCategory() {
    alert('سيتم إضافة الفئة إلى Airtable');
}

function updateUser() {
    alert('سيتم تحديث المستخدم في Airtable');
}

function sendNotification() {
    alert('سيتم إرسال الإشعار عبر Airtable أو خدمة أخرى');
}

// تحميل البيانات من Airtable (محاكاة)
function loadDashboardData() {
    // هنا يمكن جلب البيانات الفعلية من Airtable وتحديث العناصر
    // مثال: airtableFetch('orders').then(data => { document.getElementById('totalOrders').innerText = data.records.length; })
}

// رسم بياني للأرباح
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

// تهيئة الصفحة
window.onload = function() {
    loadApiConfig();
    initProfitChart();
    // loadDashboardData();
};