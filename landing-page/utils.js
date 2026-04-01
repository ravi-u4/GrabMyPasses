// GLOBAL TOAST FUNCTION
window.showToast = function(message, type = 'success') {
  // Create container if not exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Create Toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon based on type
  let icon = '';
  if(type === 'success') icon = '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>';
  if(type === 'error') icon = '<i data-lucide="alert-circle" class="w-5 h-5 text-red-400"></i>';
  if(type === 'info') icon = '<i data-lucide="info" class="w-5 h-5 text-violet-400"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  
  // Initialize Icons
  if(typeof lucide !== 'undefined') lucide.createIcons();

  // Remove after 3s
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};