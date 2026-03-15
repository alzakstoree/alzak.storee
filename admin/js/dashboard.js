// =============================
// PRODUCTS PRO MAX SYSTEM
// =============================

let productsCache = [];



// تحميل المنتجات

window.loadProducts = async function(){

const container = document.getElementById("contentArea");

container.innerHTML = "جاري تحميل المنتجات...";

try{

const records = await fetchRecords(TABLES.PRODUCTS);

productsCache = records;

renderProducts(records);

}catch(e){

container.innerHTML = "خطأ في تحميل المنتجات";
console.error(e);

}

};



// رسم المنتجات

function renderProducts(records){

const container = document.getElementById("contentArea");

let html = `

<div style="display:flex;justify-content:space-between;margin-bottom:20px;">

<input 
id="searchProduct" 
placeholder="بحث عن منتج..."
onkeyup="searchProducts()"
style="padding:8px;width:200px">

<button onclick="openAddProduct()">
إضافة منتج
</button>

</div>


<table class="admin-table">

<thead>
<tr>
<th>الصورة</th>
<th>الاسم</th>
<th>السعر</th>
<th>الإجراءات</th>
</tr>
</thead>

<tbody>
`;

records.forEach(r=>{

const name = r.fields.name || "";
const price = r.fields.price || "";
const image = r.fields.image || "";

html += `

<tr>

<td>
<img src="${image}" style="width:45px;border-radius:6px">
</td>

<td>${name}</td>

<td>${price}$</td>

<td>

<button onclick="editProduct('${r.id}')">
<i class="fa fa-pen"></i>
</button>

<button onclick="deleteProduct('${r.id}')">
<i class="fa fa-trash"></i>
</button>

</td>

</tr>

`;

});

html += "</tbody></table>";

container.innerHTML = html;

}



// =============================
// البحث
// =============================

window.searchProducts = function(){

const value = document
.getElementById("searchProduct")
.value
.toLowerCase();

const filtered = productsCache.filter(p=>
(p.fields.name || "")
.toLowerCase()
.includes(value)
);

renderProducts(filtered);

};



// =============================
// نافذة إضافة منتج
// =============================

window.openAddProduct = function(){

const html = `

<h3>إضافة منتج</h3>

<input id="productName" placeholder="اسم المنتج">

<input id="productPrice" placeholder="السعر">

<input id="productImage" placeholder="رابط الصورة">

<br><br>

<button onclick="addProduct()">إضافة</button>

`;

openModal(html);

};



// =============================
// إضافة منتج
// =============================

window.addProduct = async function(){

const name = document.getElementById("productName").value;
const price = document.getElementById("productPrice").value;
const image = document.getElementById("productImage").value;

if(!name || !price){
showToast("املأ الحقول");
return;
}

try{

await createRecord(TABLES.PRODUCTS,{
name:name,
price:price,
image:image
});

showToast("تم إضافة المنتج");

closeModal();

loadProducts();

}catch(e){

showToast("فشل الإضافة");
console.error(e);

}

};



// =============================
// تعديل المنتج
// =============================

window.editProduct = function(id){

const product = productsCache.find(p=>p.id === id);

const html = `

<h3>تعديل المنتج</h3>

<input id="editName" value="${product.fields.name || ""}">

<input id="editPrice" value="${product.fields.price || ""}">

<input id="editImage" value="${product.fields.image || ""}">

<br><br>

<button onclick="updateProduct('${id}')">
حفظ
</button>

`;

openModal(html);

};



// تحديث المنتج

window.updateProduct = async function(id){

const name = document.getElementById("editName").value;
const price = document.getElementById("editPrice").value;
const image = document.getElementById("editImage").value;

try{

await updateRecord(TABLES.PRODUCTS,id,{
name:name,
price:price,
image:image
});

showToast("تم التعديل");

closeModal();

loadProducts();

}catch(e){

showToast("فشل التعديل");
console.error(e);

}

};



// =============================
// حذف المنتج
// =============================

window.deleteProduct = async function(id){

if(!confirmDelete("هل تريد حذف المنتج؟")) return;

try{

await deleteRecord(TABLES.PRODUCTS,id);

showToast("تم الحذف");

loadProducts();

}catch(e){

showToast("فشل الحذف");
console.error(e);

}

};
// =============================
// ORDERS MANAGEMENT
// =============================

window.loadOrders = async function(){

const container = document.getElementById("contentArea");

container.innerHTML = "جاري تحميل الطلبات...";

try{

const records = await fetchRecords(TABLES.ORDERS);

if(records.length === 0){
container.innerHTML = "لا يوجد طلبات";
return;
}

let html = `

<h2>إدارة الطلبات</h2>

<table class="admin-table">

<thead>

<tr>

<th>المنتج</th>
<th>ID اللاعب</th>
<th>الحالة</th>
<th>الإجراءات</th>

</tr>

</thead>

<tbody>

`;

records.forEach(r=>{

const product = r.fields.product || "";
const playerId = r.fields.playerId || "";
const status = r.fields.status || "pending";

html += `

<tr>

<td>${product}</td>

<td>${playerId}</td>

<td>${status}</td>

<td>

<button onclick="completeOrder('${r.id}')">
إنهاء
</button>

<button onclick="deleteOrder('${r.id}')">
حذف
</button>

</td>

</tr>

`;

});

html += "</tbody></table>";

container.innerHTML = html;

}catch(e){

container.innerHTML = "خطأ في تحميل الطلبات";

console.error(e);

}

};



// =============================
// إنهاء الطلب
// =============================

window.completeOrder = async function(id){

try{

await updateRecord(TABLES.ORDERS,id,{
status:"done"
});

showToast("تم إنهاء الطلب");

loadOrders();

}catch(e){

showToast("فشل العملية");

console.error(e);

}

};



// =============================
// حذف الطلب
// =============================

window.deleteOrder = async function(id){

if(!confirmDelete("هل تريد حذف الطلب؟")) return;

try{

await deleteRecord(TABLES.ORDERS,id);

showToast("تم حذف الطلب");

loadOrders();

}catch(e){

showToast("فشل الحذف");

console.error(e);

}

};
// =============================
// PAYMENTS MANAGEMENT
// =============================

window.loadPayments = async function(){

const container = document.getElementById("paymentsTable");

if(!container) return;

container.innerHTML = "جاري تحميل طرق الدفع...";

try{

const records = await fetchRecords(TABLES.PAYMENTS);

if(records.length === 0){
container.innerHTML = "لا يوجد طرق دفع";
return;
}

let html = `

<table class="admin-table">

<thead>
<tr>
<th>الاسم</th>
<th>الوصف</th>
<th>الحالة</th>
<th>الإجراءات</th>
</tr>
</thead>

<tbody>

`;

records.forEach(r=>{

const name = r.fields.name || "";
const description = r.fields.description || "";
const status = r.fields.status || "active";

html += `

<tr>

<td>${name}</td>

<td>${description}</td>

<td>${status}</td>

<td>

<button onclick="editPayment('${r.id}')">
<i class="fa fa-pen"></i>
</button>

<button onclick="deletePayment('${r.id}')">
<i class="fa fa-trash"></i>
</button>

</td>

</tr>

`;

});

html += "</tbody></table>";

container.innerHTML = html;

}catch(e){

container.innerHTML = "خطأ في تحميل طرق الدفع";
console.error(e);

}

};



// =============================
// ADD PAYMENT
// =============================

window.addPayment = async function(){

const name = document.getElementById("paymentName").value;
const desc = document.getElementById("paymentDescription").value;

if(!name){
showToast("اكتب اسم طريقة الدفع");
return;
}

try{

await createRecord(TABLES.PAYMENTS,{
name:name,
description:desc,
status:"active"
});

showToast("تم إضافة طريقة الدفع");

closeModal();

loadPayments();

}catch(e){

showToast("فشل الإضافة");

console.error(e);

}

};



// =============================
// EDIT PAYMENT
// =============================

window.editPayment = async function(id){

const newName = prompt("اسم طريقة الدفع الجديد");

if(!newName) return;

try{

await updateRecord(TABLES.PAYMENTS,id,{
name:newName
});

showToast("تم تعديل الطريقة");

loadPayments();

}catch(e){

showToast("فشل التعديل");

console.error(e);

}

};



// =============================
// DELETE PAYMENT
// =============================

window.deletePayment = async function(id){

if(!confirmDelete("هل تريد حذف طريقة الدفع؟")) return;

try{

await deleteRecord(TABLES.PAYMENTS,id);

showToast("تم حذف الطريقة");

loadPayments();

}catch(e){

showToast("فشل الحذف");

console.error(e);

}

};