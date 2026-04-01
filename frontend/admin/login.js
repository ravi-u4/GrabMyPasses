/* frontend/admin/login.js */

window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = '';
  if(type === 'success') icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  if(type === 'error') icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('admin-login-card');
  if (card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  }
  if(typeof lucide !== 'undefined') lucide.createIcons();
});

const form = document.querySelector(".form");

if(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      const email = document.getElementById("adminEmail").value.trim();
      const password = document.getElementById("adminPassword").value;
      const btn = form.querySelector("button");
    
      btn.disabled = true;
      btn.textContent = "Verifying...";
    
      try {
        const res = await fetch("/api/organizer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
    
        const result = await res.json();
    
        if (result.success) {
          localStorage.setItem("organizer", JSON.stringify(result.organizer));
    
          if (window.showToast) window.showToast("Organizer login successful", "success");
    
          setTimeout(() => {
            // FIXED: Redirect to the Admin Dashboard route explicitly
            window.location.href = "/admin/dashboard"; 
          }, 1000);
        } else {
          if (window.showToast) window.showToast(result.message, "error");
          else alert(result.message);
    
          btn.disabled = false;
          btn.textContent = "Login";
        }
      } catch(err) {
        console.error(err);
        if (window.showToast) window.showToast("Server connection failed.", "error");
        btn.disabled = false;
        btn.textContent = "Login";
      }
    });
}