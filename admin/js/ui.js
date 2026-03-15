function openSection(section){

const content = document.getElementById("contentArea");

if(section === "dashboard"){
content.innerHTML = `
<h2>لوحة القيادة</h2>

<div class="cards">

<div class="card">
<h3>عدد المنتجات</h3>
<p id="productsCount">0</p>
</div>

<div class="card">
<h3>عدد الطلبات</h3>
<p id="ordersCount">0</p>
</div>

<div class="card">
<h3>المستخدمين</h3>
<p id="usersCount">0</p>
</div>

</div>

<canvas id="salesChart"></canvas>
`;
}

if(section === "products"){
content.innerHTML = `
<h2>إدارة المنتجات</h2>
<button onclick="addProduct()">إضافة منتج</button>
<div id="productsList">لا يوجد منتجات</div>
`;
}

if(section === "orders"){
content.innerHTML = `
<h2>إدارة الطلبات</h2>
<div id="ordersList">لا يوجد طلبات</div>
`;
}

if(section === "users"){
content.innerHTML = `
<h2>إدارة المستخدمين</h2>
<div id="usersList">لا يوجد مستخدمين</div>
`;
}

if(section === "payments"){
content.innerHTML = `
<h2>طرق الدفع</h2>
<div>إدارة طرق الدفع هنا</div>
`;
}

if(section === "settings"){
content.innerHTML = `
<h2>الإعدادات</h2>
<div>إعدادات المتجر</div>
`;
}

}