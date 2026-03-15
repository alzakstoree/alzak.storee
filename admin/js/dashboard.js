// DASHBOARD LOGIC

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
<table>
<tr>
<th>الاسم</th>
<th>السعر</th>
<th>إجراءات</th>
</tr>
`;

records.forEach(r=>{

const name = r.fields.name || "";
const price = r.fields.price || "";

html += `
<tr>

<td>${name}</td>

<td>${price}</td>

<td>

<button onclick="deleteProduct('${r.id}')">
حذف
</button>

</td>

</tr>
`;

});

html += "</table>";

container.innerHTML = html;

}catch(e){

container.innerHTML = "خطأ في جلب المنتجات";

console.error(e);

}

};



// إضافة منتج
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



// حذف منتج
window.deleteProduct = async function(id){

if(!confirm("حذف المنتج؟")) return;

try{

await deleteRecord(TABLES.PRODUCTS,id);

showToast("تم حذف المنتج");

loadProducts();

}catch(e){

showToast("فشل الحذف");

console.error(e);

}

};