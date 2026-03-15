let currentProduct = null;


// تحميل المنتجات

async function loadProducts(){

const container = document.getElementById("productsContainer");

try{

const records = await fetchRecords(TABLES.PRODUCTS);

if(records.length === 0){
container.innerHTML = "لا يوجد منتجات";
return;
}

let html = "";

records.forEach(r=>{

const name = r.fields.name || "";
const price = r.fields.price || "";
const image = r.fields.image || "";

html += `

<div class="product">

<img src="${image}">

<h3>${name}</h3>

<p>${price} $</p>

<button onclick="openOrder('${r.id}')">
شراء
</button>

</div>

`;

});

container.innerHTML = html;

}catch(e){

container.innerHTML = "خطأ في تحميل المنتجات";

console.error(e);

}

}


// فتح نافذة الطلب

function openOrder(id){

currentProduct = id;

document.getElementById("orderModal").style.display = "flex";

}


// إغلاق

function closeOrder(){

document.getElementById("orderModal").style.display = "none";

}


// إرسال الطلب

async function submitOrder(){

const playerId = document.getElementById("playerId").value;

if(!playerId){
showToast("ادخل ID اللاعب");
return;
}

try{

await createRecord(TABLES.ORDERS,{
product:currentProduct,
playerId:playerId,
status:"pending"
});

showToast("تم إرسال الطلب");

closeOrder();

}catch(e){

showToast("فشل الطلب");

console.error(e);

}

}


// تشغيل عند فتح الموقع

loadProducts();