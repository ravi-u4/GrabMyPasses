/* frontend/contact/contact.js */

// 1. TOAST FUNCTION
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

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};

// 2. SPOTLIGHT EFFECT & ORGANIZER LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("contact-card");
  if (card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  }
  lucide.createIcons();

  // --- ORGANIZER REDIRECT LOGIC ---
  const organizer = JSON.parse(localStorage.getItem("organizer"));
  if (organizer) {
      const backLink = document.getElementById("nav-back");
      const navLogo = document.getElementById("nav-logo");
      const footerLogo = document.getElementById("footer-logo");
      const backText = document.getElementById("nav-back-text");

      const dashboardPath = "/admin/dashboard";

      if (backLink) {
          backLink.href = dashboardPath;
          if (backText) backText.innerText = "Back to Dashboard";
      }
      if (navLogo) navLogo.href = dashboardPath;
      if (footerLogo) footerLogo.href = dashboardPath;
  }
});

// 3. FORM LOGIC (Now connected to Backend!)
const form = document.getElementById('contactForm');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailError.classList.remove('hidden');
            emailInput.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            emailError.classList.add('hidden');
            emailInput.style.borderColor = ''; 
        }

        if (phoneInput.value.length !== 10) {
            phoneError.classList.remove('hidden');
            phoneInput.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            phoneError.classList.add('hidden');
            phoneInput.style.borderColor = '';
        }

        if (isValid) {
            const btn = form.querySelector('button');
            const span = btn.querySelector('span');
            const originalContent = span.innerHTML;
            
            span.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Sending...`;
            btn.disabled = true;
            lucide.createIcons();

            try {
                // Sending data to your new backend route!
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: document.getElementById('name').value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                        query: document.getElementById('query').value
                    })
                });

                const data = await res.json();

                if (data.success) {
                    showToast('Message sent successfully!', 'success');
                    form.reset();
                } else {
                    showToast(data.message || 'Failed to send message', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Connection error. Please try again.', 'error');
            } finally {
                span.innerHTML = originalContent;
                btn.disabled = false;
                lucide.createIcons();
            }
        } else {
            showToast('Please fix the errors above', 'error');
        }
    });
}

// 4. SCROLL HIDE NAVBAR
let lastScrollY = window.scrollY;
const header = document.getElementById('main-header');

if (header) {
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
}