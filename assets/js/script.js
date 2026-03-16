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
    const response = await fetch(url, { headers, ...options });
    if (!response.ok) throw new Error(`خطأ ${response.status}`);
    return await response.json();
}

function showLoadingIndicators() {
    const ids = ['pendingOrders','totalOrders','activeProducts','totalUsers','pendingRecharge','totalBalances','totalSales','totalCosts','netProfit'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<span class="spinner-border spinner-border-sm text-gold"></span>';
    });
    document.getElementById('topSpenders').innerHTML = '<tr><td colspan="2" class="text-center"><span class="spinner-border spinner-border-sm text-gold"></span></td></tr>';
    document.getElementById('negativeBalanceUsers').innerHTML = '<tr><td colspan="2" class="text-center"><span class="spinner-border spinner-border-sm text-gold"></span></td></tr>';
    document.getElementById('recentOrders').innerHTML = '<tr><td colspan="6" class="text-center"><span class="spinner-border spinner-border-sm text-gold"></span></td></tr>';
}

async function loadDashboardData() {
    showLoadingIndicators();
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY' || AIRTABLE_CONFIG.BASE_ID === 'YOUR_BASE_ID') return;

    try {
        const orders = await airtableFetch('orders');
        document.getElementById('totalOrders').innerText = orders.records.length;

        const products = await airtableFetch('products');
        const active = products.records.filter(p => p.fields.status === 'active').length;
        document.getElementById('activeProducts').innerText = active;

        const users = await airtableFetch('users');
        document.getElementById('totalUsers').innerText = users.records.length;

        let totalBal = 0;
        users.records.forEach(u => totalBal += (u.fields.balance || 0));
        document.getElementById('totalBalances').innerText = '$' + totalBal.toLocaleString();

        let sales = 0, costs = 0;
        orders.records.forEach(o => {
            sales += (o.fields.price || 0);
            costs += (o.fields.cost || 0);
        });
        document.getElementById('totalSales').innerText = '$' + sales.toLocaleString();
        document.getElementById('totalCosts').innerText = '$' + costs.toLocaleString();
        document.getElementById('netProfit').innerText = '$' + (sales - costs).toLocaleString();

        const pendingOrders = orders.records.filter(o => o.fields.status === 'pending').length;
        document.getElementById('pendingOrders').innerText = pendingOrders;

        try {
            const recharges = await airtableFetch('rechargeRequests');
            const pendingRe = recharges.records.filter(r => r.fields.status === 'pending').length;
            document.getElementById('pendingRecharge').innerText = pendingRe;
        } catch { document.getElementById('pendingRecharge').innerText = '0'; }

        // top spenders
        const spend = {};
        orders.records.forEach(o => { if (o.fields.user_id) spend[o.fields.user_id] = (spend[o.fields.user_id]||0) + (o.fields.price||0); });
        const top = Object.entries(spend).sort((a,b) => b[1]-a[1]).slice(0,3);
        let topHtml = '';
        for (let [uid, amt] of top) {
            const u = users.records.find(u => u.id === uid);
            topHtml += `<tr><td>${u ? u.fields.name : '?'}</td><td>$${amt.toLocaleString()}</td></tr>`;
        }
        document.getElementById('topSpenders').innerHTML = topHtml || '<tr><td colspan="2">لا بيانات</td></tr>';

        const neg = users.records.filter(u => (u.fields.balance||0) < 0).slice(0,3);
        let negHtml = '';
        neg.forEach(u => negHtml += `<tr><td>${u.fields.name}</td><td class="text-danger">$${u.fields.balance}</td></tr>`);
        document.getElementById('negativeBalanceUsers').innerHTML = negHtml || '<tr><td colspan="2">لا يوجد</td></tr>';

        const recent = orders.records.slice(-5).reverse();
        let recentHtml = '';
        recent.forEach(o => {
            const u = users.records.find(u => u.id === o.fields.user_id);
            recentHtml += `<tr><td>${o.id}</td><td>${u ? u.fields.name : '?'}</td><td>${o.fields.product_name||'منتج'}</td><td><span class="badge-gold">${o.fields.status||'مكتمل'}</span></td><td>$${o.fields.price||0}</td><td>${o.fields.date||'-'}</td></tr>`;
        });
        document.getElementById('recentOrders').innerHTML = recentHtml || '<tr><td colspan="6">لا طلبات</td></tr>';
    } catch (e) {
        console.error(e);
        alert('فشل تحميل البيانات. تحقق من API والإعدادات.');
    }
}

async function addProduct() {
    const form = document.getElementById('addProductForm');
    const data = new FormData(form);
    const product = {};
    data.forEach((v,k) => product[k]=v);
    if (AIRTABLE_CONFIG.API_KEY === 'YOUR_API_KEY') { alert('أدخل مفاتيح API أولاً'); return; }
    try {
        await airtableFetch('products', { method:'POST', body: JSON.stringify({ fields: product }) });
        alert('تمت الإضافة');
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
        form.reset();
        loadDashboardData();
    } catch (e) { alert('خطأ: '+e.message); }
}

function initProfitChart() {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'],
            datasets: [{
                label: 'صافي الربح ($)',
                data: [1200,1900,1500,2200,1800,2400,2100],
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
};