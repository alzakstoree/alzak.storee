// =============================
// HELPERS
// أدوات مساعدة للنظام
// =============================


// إشعار بسيط
window.showToast = function(message){

const toast = document.createElement("div");

toast.innerText = message;

toast.style.position = "fixed";
toast.style.bottom = "20px";
toast.style.left = "20px";
toast.style.background = "#0f172a";
toast.style.color = "white";
toast.style.padding = "12px 18px";
toast.style.borderRadius = "8px";
toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
toast.style.zIndex = "9999";

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},3000);

};


// تأكيد حذف
window.confirmDelete = function(text="هل أنت متأكد؟"){
return confirm(text);
};


// تحويل التاريخ
window.formatDate = function(dateString){

const date = new Date(dateString);

return date.toLocaleDateString("ar-EG",{
year:"numeric",
month:"2-digit",
day:"2-digit"
});

};


console.log("Helpers loaded");