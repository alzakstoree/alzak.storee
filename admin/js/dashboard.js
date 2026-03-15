// =============================
// PRODUCTS MANAGEMENT
// =============================


// تحميل المنتجات

window.loadProducts = async function(){

const container = document.getElementById("productsTable");

container.innerHTML = "جاري تحميل المنتجات...";

try{

const records = await fetchRecords(TABLES.PRODUCTS);

if(records.length === 0){
container.innerHTML = "<p>لا يوجد منتجات</p>";
return;
}

let html = `
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
<img src="${image}" style="width:50px;border-radius:6px;">
</td>

<td>${name}</td>

<td>${price}$</td>

<td>

<button onclick="deleteProduct('${r.id}')">
<i class="fa fa-trash"></i>
</button>

</td>

</tr>

`;

});

html += "</tbody></table>";

container.innerHTML = html;

}catch(e){

container.innerHTML = "خطأ في تحميل المنتجات";

console.error(e);

}

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

showToast("فشل إضافة المنتج");

console.error(e);

}

};



// =============================
// حذف منتج
// =============================

window.deleteProduct = async function(id){

if(!confirmDelete("هل تريد حذف المنتج؟")) return;

try{

await deleteRecord(TABLES.PRODUCTS,id);

showToast("تم حذف المنتج");

loadProducts();

}catch(e){

showToast("فشل الحذف");

console.error(e);

}

};