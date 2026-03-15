// UI FUNCTIONS

// فتح قسم في لوحة التحكم
window.openSection = function(section){

const area = document.getElementById("contentArea");

if(section === "dashboard"){

area.innerHTML = `
<h2>لوحة القيادة</h2>

<div class="card">
<h3>إحصائيات المتجر</h3>
<p>هنا ستظهر إحصائيات المنتجات والطلبات.</p>
</div>

`;

}


if(section === "products"){

area.innerHTML = `
<h2>إدارة المنتجات</h2>

<button onclick="openAddProduct()">إضافة منتج</button>

<div id="productsTable"></div>
`;

loadProducts();

}


if(section === "categories"){

area.innerHTML = `
<h2>الأقسام</h2>

<button onclick="openAddCategory()">إضافة قسم</button>

<div id="categoriesTable"></div>
`;

}


if(section === "orders"){

area.innerHTML = `
<h2>الطلبات</h2>

<div class="card">
<p>سيتم عرض طلبات العملاء هنا.</p>
</div>
`;

}


if(section === "users"){

area.innerHTML = `
<h2>المستخدمين</h2>

<div class="card">
<p>إدارة المستخدمين.</p>
</div>
`;

}


if(section === "payments"){

area.innerHTML = `
<h2>طرق الدفع</h2>

<div class="card">
<p>إضافة شام كاش أو فيزا أو باي بال.</p>
</div>
`;

}


if(section === "settings"){

area.innerHTML = `
<h2>الإعدادات</h2>

<div class="card">
<p>إعدادات المتجر العامة.</p>
</div>
`;

}

}


// فتح نافذة منبثقة
window.openModal = function(html){

const modal = document.getElementById("modal");
const body = document.getElementById("modalBody");

body.innerHTML = html;

modal.style.display = "flex";

}


// إغلاق النافذة
window.closeModal = function(){

document.getElementById("modal").style.display = "none";

}


// نافذة إضافة منتج
window.openAddProduct = function(){

openModal(`

<h3>إضافة منتج</h3>

<label>اسم المنتج</label>
<input id="productName">

<label>السعر</label>
<input id="productPrice">

<label>الصورة</label>
<input id="productImage">

<button onclick="addProduct()">إضافة</button>

`);

}


// نافذة إضافة قسم
window.openAddCategory = function(){

openModal(`

<h3>إضافة قسم</h3>

<label>اسم القسم</label>
<input id="categoryName">

<button onclick="addCategory()">إضافة</button>

`);

}