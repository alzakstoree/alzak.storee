// =============================
// SALES CHART SYSTEM PRO
// =============================

let salesChartInstance = null;

window.loadSalesChart = async function(){

try{

const orders = await fetchRecords(TABLES.ORDERS);

let salesMap = {};
let revenueMap = {};

orders.forEach(o=>{

const date = o.createdTime.split("T")[0];
const price = Number(o.fields.price || 0);

// عدد الطلبات
if(!salesMap[date]){
salesMap[date] = 0;
}

salesMap[date]++;

// الأرباح
if(!revenueMap[date]){
revenueMap[date] = 0;
}

revenueMap[date] += price;

});


// ترتيب الأيام

const labels = Object.keys(salesMap).sort();

const ordersData = labels.map(d => salesMap[d]);
const revenueData = labels.map(d => revenueMap[d]);

const canvas = document.getElementById("salesChart");

if(!canvas) return;

const ctx = canvas.getContext("2d");


// منع تكرار الرسم

if(salesChartInstance){
salesChartInstance.destroy();
}


// إنشاء الرسم

salesChartInstance = new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{
label:"عدد الطلبات",
data:ordersData,
borderWidth:3,
tension:0.3
},

{
label:"الأرباح",
data:revenueData,
borderWidth:3,
tension:0.3
}

]

},

options:{

responsive:true,

interaction:{
mode:"index",
intersect:false
},

plugins:{
legend:{
display:true
}
},

scales:{
y:{
beginAtZero:true
}
}

}

});

}catch(e){

console.error("Sales Chart Error",e);

}

};