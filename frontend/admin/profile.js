/* frontend/admin/profile.js */

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Auth Check
    const organizer = JSON.parse(localStorage.getItem("organizer"));
    if (!organizer || !organizer._id) {
        window.location.href = "login.html";
        return;
    } 

    lucide.createIcons();

    // --- Toast Helper Function (Fixed: Single Toast Only) ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        // FIX: Remove existing toasts to prevent stacking
        container.innerHTML = '';

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconName = type === 'success' ? 'check-circle' : 'alert-triangle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <p class="text-sm font-medium">${message}</p>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500); 
        }, 3000);
    }

    // --- Navbar Logic ---
    const orgBtn = document.getElementById("org-menu-btn");
    const orgNameEl = document.getElementById("nav-org-name");
    const orgDrop = document.getElementById("org-dropdown");

    if(orgBtn) orgBtn.textContent = organizer.name ? organizer.name.substring(0,2).toUpperCase() : "OR";
    if(orgNameEl) orgNameEl.textContent = organizer.name || "Organizer";

    if(orgBtn && orgDrop) {
        orgBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            orgDrop.classList.toggle("hidden");
        });
        document.addEventListener("click", (e) => {
            if(!orgDrop.contains(e.target) && !orgBtn.contains(e.target)) {
                orgDrop.classList.add("hidden");
            }
        });
    }

    // FIX: Navbar Hide on Scroll Logic Added
    let lastScrollY = window.scrollY;
    const header = document.querySelector('header');
    if(header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 50) {
                header.classList.add('header-hidden'); // Ensure this class exists in your CSS
            } else {
                header.classList.remove('header-hidden');
            }
            lastScrollY = window.scrollY;
        });
    }

    // --- Fetch and Display Profile Data ---
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const collegeInput = document.getElementById("college");
    const mobileInput = document.getElementById("mobile");
    const rollNoInput = document.getElementById("rollNo");
    const genderInput = document.getElementById("gender");
    const dobInput = document.getElementById("dob");
    const courseInput = document.getElementById("course");

    try {
        const res = await fetch(`http://localhost:5000/api/organizer/${organizer._id}`);
        const data = await res.json();

        if (data.success) {
            const org = data.organizer;
            
            nameInput.value = org.name || "";
            emailInput.value = org.email || "";
            collegeInput.value = org.college || "";
            mobileInput.value = org.mobile || "";
            rollNoInput.value = org.rollNo || ""; 
            courseInput.value = org.course || "";
            genderInput.value = org.gender || "";
            
            if (org.dob) {
                const date = new Date(org.dob);
                const formattedDate = date.toISOString().split('T')[0];
                dobInput.value = formattedDate;
            }
            
            const updatedLocal = { ...organizer, ...org };
            localStorage.setItem("organizer", JSON.stringify(updatedLocal));
        }
    } catch (err) {
        console.error("Failed to fetch profile", err);
        showToast("Failed to load profile data", "error");
    }

    // --- Update Profile Logic ---
    document.getElementById("profileForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector("button[type='submit']");
        const originalContent = btn.innerHTML;
        
        // FIX: Added 'justify-center' to center the loading icon
        btn.disabled = true;
        btn.innerHTML = `<span class="flex items-center justify-center gap-2"><i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Saving...</span>`;
        lucide.createIcons();

        const formData = new FormData(e.target);
        
        const payload = {
            name: formData.get("name"),
            college: formData.get("college"),
            mobile: formData.get("mobile"),
            rollNo: formData.get("rollNo"),
            gender: formData.get("gender"),
            dob: formData.get("dob"),
            course: formData.get("course"),
            password: formData.get("password")
        };

        try {
            const res = await fetch(`http://localhost:5000/api/organizer/${organizer._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            
            if (result.success) {
                showToast("Profile updated successfully!", "success");

                const newOrgData = { ...organizer, ...payload };
                delete newOrgData.password; 
                localStorage.setItem("organizer", JSON.stringify(newOrgData));

                setTimeout(() => { 
                    window.location.reload(); 
                }, 1500);

            } else {
                showToast(result.message || "Failed to update profile", "error");
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            showToast("Server Error. Please try again.", "error");
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    });

    // Spotlight Effect
    const container = document.querySelector('.glow-container');
    if (container) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            container.style.setProperty('--mouse-x', `${x}px`);
            container.style.setProperty('--mouse-y', `${y}px`);
        });
    }
});

// Delete Modal Functions
window.showDeleteModal = function() {
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("hidden");
    modal.querySelector('div').classList.add('scale-100');
    modal.querySelector('div').classList.remove('scale-95');
}

window.hideDeleteModal = function() {
    const modal = document.getElementById("deleteModal");
    modal.classList.add("hidden");
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');
}

window.confirmDeleteAccount = async function() {
    const organizer = JSON.parse(localStorage.getItem("organizer"));
    if (!organizer || !organizer._id) return;

    try {
        const res = await fetch(`http://localhost:5000/api/organizer/${organizer._id}`, {
            method: "DELETE"
        });
        const data = await res.json();

        if (data.success) {
            localStorage.removeItem("organizer");
            window.location.href = "/";
        } else {
            alert("Failed to delete: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Server error.");
    }
}

window.logoutAdmin = function() {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('organizer');
        window.location.href = 'login.html';
    }
}

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
}