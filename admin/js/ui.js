// ===============================
// UI FUNCTIONS
// ===============================


// فتح قسم في لوحة التحكم
window.openSection = function(section){

const area = document.getElementById("contentArea");


// ===============================
// DASHBOARD
// ===============================

if(section === "dashboard"){

area.innerHTML = `

<h2>لوحة القيادة</h2>

<div class="stats-grid">

<div class="card">
<h3 id="statProducts">0</h3>
<p>عدد المنتجات</p>
</div>

<div class="card">
<h3 id="statOrders">0</h3>
<p>عدد الطلبات</p>
</div>

<div class="card">
<h3 id="statUsers">0</h3>
<p>المستخدمين</p>
</div>

</div>


<div class="card" style="margin-top:30px">

<h3>إحصائيات المبيعات</h3>

<canvas id="salesChart" height="100"></canvas>

</div>


<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px">


<div class="card">

<h3>آخر الطلبات</h3>

<div id="latestOrders">
جاري التحميل...
</div>

</div>


<div class="card">

<h3>أفضل المنتجات</h3>

<div id="topProducts">
جاري التحميل...
</div>

</div>


</div>

`;

loadDashboardStats();
loadSalesChart();
loadLatestOrders();
loadTopProducts();

}



// ===============================
// PRODUCTS
// ===============================

if(section === "products"){

area.innerHTML = `

<h2>إدارة المنتجات</h2>

<button onclick="openAddProduct()">إضافة منتج</button>

<div id="productsTable"></div>

`;

loadProducts();

}



// ===============================
// CATEGORIES
// ===============================

if(section === "categories"){

area.innerHTML = `

<h2>الأقسام</h2>

<button onclick="openAddCategory()">إضافة قسم</button>

<div id="categoriesTable"></div>

`;

loadCategories();

}



// ===============================
// ORDERS
// ===============================

if(section === "orders"){

area.innerHTML = `

<h2>الطلبات</h2>

<div id="ordersTable"></div>

`;

loadOrders();

}



// ===============================
// USERS
// ===============================

if(section === "users"){

area.innerHTML = `

<h2>المستخدمين</h2>

<div id="usersTable"></div>

`;

loadUsers();

}



// ===============================
// PAYMENTS
// ===============================

if(section === "payments"){

area.innerHTML = `

<h2>طرق الدفع</h2>

<button onclick="openAddPayment()">إضافة طريقة دفع</button>

<div id="paymentsTable"></div>

`;

loadPayments();

}



// ===============================
// SETTINGS
// ===============================

if(section === "settings"){

area.innerHTML = `

<h2>إعدادات المتجر</h2>

<div class="card">

<label>وضع الصيانة</label>

<select id="maintenanceMode">

<option value="off">إيقاف</option>
<option value="on">تشغيل</option>

</select>

<br><br>

<button onclick="saveSettings()">حفظ</button>

</div>

`;

}

}



// ===============================
// MODAL SYSTEM
// ===============================


// فتح نافذة
window.openModal = function(html){

const modal = document.getElementById("modal");
const body = document.getElementById("modalBody");

body.innerHTML = html;

modal.style.display = "flex";

};


// إغلاق نافذة
window.closeModal = function(){

document.getElementById("modal").style.display = "none";

};



// ===============================
// ADD PRODUCT MODAL
// ===============================

window.openAddProduct = function(){

openModal(`

<h3>إضافة منتج</h3>

<label>اسم المنتج</label>
<input id="productName">

<label>السعر</label>
<input id="productPrice">

<label>الصورة</label>
<input id="productImage">

<br><br>

<button onclick="addProduct()">إضافة</button>

`);

};



// ===============================
// ADD CATEGORY MODAL
// ===============================

window.openAddCategory = function(){

openModal(`

<h3>إضافة قسم</h3>

<label>اسم القسم</label>
<input id="categoryName">

<br><br>

<button onclick="addCategory()">إضافة</button>

`);

};



// ===============================
// ADD PAYMENT METHOD
// ===============================

window.openAddPayment = function(){

openModal(`

<h3>إضافة طريقة دفع</h3>

<label>اسم الطريقة</label>
<input id="paymentName">

<label>الوصف</label>
<input id="paymentDescription">

<br><br>

<button onclick="addPayment()">إضافة</button>

`);

};