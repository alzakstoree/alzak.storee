// =============================
// SALES CHART SYSTEM
// =============================

window.loadSalesChart = async function(){

try{

const orders = await fetchRecords(TABLES.ORDERS);

let salesMap = {};

orders.forEach(o=>{

const date = o.createdTime.split("T")[0];

if(!salesMap[date]){
salesMap[date] = 0;
}

salesMap[date]++;

});

const labels = Object.keys(salesMap);
const data = Object.values(salesMap);

const canvas = document.getElementById("salesChart");

if(!canvas) return;

const ctx = canvas.getContext("2d");

new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[{

label:"الطلبات اليومية",

data:data,

borderWidth:3,
tension:0.3

}]

},

options:{

responsive:true,

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