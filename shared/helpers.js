// Helpers

// إظهار رسالة
window.showToast = function(message) {
  const toast = document.createElement("div");
  toast.innerText = message;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "20px";
  toast.style.background = "#111";
  toast.style.color = "#fff";
  toast.style.padding = "10px 15px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
};

// إنشاء ID عشوائي
window.generateId = function() {
  return Math.random().toString(36).substring(2, 10);
};

console.log("Helpers Loaded");