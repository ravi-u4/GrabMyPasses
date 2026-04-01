/* landing-page/script.js */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // PRELOADER LOGIC
  // =========================================
  const preloader = document.getElementById("preloader");
  if (preloader) {
    const minTime = 800; 
    const start = Date.now();

    window.addEventListener("load", () => {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, minTime - elapsed);

      setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.pointerEvents = "none";
        setTimeout(() => preloader.remove(), 500); 
      }, delay);
    });
    
    setTimeout(() => {
       if(document.body.contains(preloader)) {
         preloader.style.opacity = "0";
         preloader.style.pointerEvents = "none";
         setTimeout(() => preloader.remove(), 500);
       }
    }, 3000);
  }

  // =========================================
  // AUTH CHECK & REDIRECT LOGIC
  // =========================================
  let user = null;
  let organizer = null;
  
  try { user = JSON.parse(localStorage.getItem("user")); } catch (e) { localStorage.removeItem("user"); }
  try { organizer = JSON.parse(localStorage.getItem("organizer")); } catch (e) { localStorage.removeItem("organizer"); }

  // --- FORCE REDIRECT FOR ORGANIZER ---
  if (organizer) {
      window.location.href = "/admin/dashboard"; 
      return; 
  }

  // =========================================
  // DOM ELEMENTS
  // =========================================
  const authArea = document.getElementById("auth-area");
  const navLinks = document.getElementById("nav-links");
  const navSearch = document.getElementById("nav-search");
  const navLogo = document.getElementById("nav-logo"); 
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  
  const heroBrowseBtn = document.getElementById("hero-browse-btn");
  const homeEventsSection = document.getElementById("home-events-section");
  const homeEventsSubtitle = document.getElementById("home-events-subtitle");
  const viewAllBtn = document.getElementById("view-all-events-btn");
  const homeGrid = document.getElementById("home-events-grid");
  const heroSectionContainer = document.querySelector("section.relative .reveal-on-scroll");

  // =========================================
  // 1. LANDING PAGE SPECIFIC LOGIC
  // =========================================
  if (user) {
    if (heroBrowseBtn) heroBrowseBtn.style.display = "none";
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));

  if (heroSectionContainer) {
      if (!document.querySelector('.blinking-arrow')) {
          const arrowDiv = document.createElement('div');
          arrowDiv.className = "blinking-arrow";
          arrowDiv.innerHTML = `<i data-lucide="chevron-down" class="w-10 h-10"></i>`;
          heroSectionContainer.appendChild(arrowDiv);
      }
  }

  // =========================================
  // 2. NAVBAR LOGIC
  // =========================================
  if (navLinks && navLogo) {
    
    // --- USER LOGGED IN ---
    if (user) {
      navLinks.classList.add("hidden", "md:flex"); 
      
      navLinks.innerHTML = `
        <a href="/" class="nav-item hover:text-white transition-colors">Home</a>
        <a href="/events" class="nav-item hover:text-white transition-colors">Events</a>
        <a href="/mypasses" class="nav-item hover:text-white transition-colors">My Passes</a>
      `;

      navLogo.classList.add("mr-auto");
      navLogo.classList.remove("absolute", "left-1/2", "top-1/2", "transform", "-translate-x-1/2", "-translate-y-1/2", "md:absolute", "md:left-1/2", "md:top-1/2", "md:transform", "md:-translate-x-1/2", "md:-translate-y-1/2");

      // Logged In Mobile Menu
      if (mobileMenu) {
        const searchHTML = (window.location.pathname.includes("events")) 
           ? `<div class="mb-4 relative">
                <input id="mobileSearch" type="text" placeholder="Search events..." class="w-full bg-gray-800 rounded-full px-4 py-2 text-white border border-gray-700 focus:outline-none focus:border-violet-500 text-sm">
                <i data-lucide="search" class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"></i>
              </div>` 
           : '';

        mobileMenu.innerHTML = searchHTML + `
          <a href="/" class="block text-gray-300 hover:text-white py-2">Home</a>
          <a href="/events" class="block text-gray-300 hover:text-white py-2">Events</a>
          <a href="/mypasses" class="block text-gray-300 hover:text-white py-2">My Passes</a>
          <button id="mobile-manage-btn" class="block w-full text-left text-gray-300 hover:text-white py-2">Manage Account</button>
          <button id="mobile-logout-btn" class="block w-full text-left text-red-400 hover:text-red-300 py-2 mt-2 border-t border-white/10 pt-2">Sign Out</button>
        `;
        
        setTimeout(() => {
           const mbLogout = document.getElementById("mobile-logout-btn");
           if(mbLogout) mbLogout.addEventListener("click", () => { localStorage.removeItem("user"); location.href = "/"; });

           const mbSearch = document.getElementById("mobileSearch");
           if(mbSearch) {
              mbSearch.addEventListener("input", (e) => {
                  const globalInput = document.getElementById("globalSearch");
                  if(globalInput) {
                      globalInput.value = e.target.value;
                      globalInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
              });
           }
        }, 0);
      }

      if (authArea) {
        const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";
        authArea.innerHTML = `
          <div class="relative">
            <button id="user-menu-btn" class="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white font-bold hover:bg-violet-500 transition border-2 border-transparent focus:border-violet-300">
              ${initials}
            </button>
            <div id="user-dropdown" class="hidden absolute right-0 mt-3 w-64 bg-[#181624] border border-gray-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="px-4 py-3 border-b border-gray-700 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold shrink-0">${initials}</div>
                <div class="overflow-hidden">
                  <p class="text-white font-semibold text-sm truncate">${user.name}</p>
                  <p class="text-gray-400 text-xs truncate">${user.email}</p>
                </div>
              </div>
              <div class="py-1">
                <a href="/mypasses" class="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition flex items-center gap-3">
                  <i data-lucide="ticket" class="w-4 h-4 text-gray-500"></i> My Tickets
                </a>
                <button id="manage-account-btn" class="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition flex items-center gap-3">
                  <i data-lucide="settings" class="w-4 h-4 text-gray-500"></i> Manage Account
                </button>
              </div>
              <div class="border-t border-gray-700 mt-1 pt-1">
                <button id="logout-btn" class="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-400 transition flex items-center gap-3">
                  <i data-lucide="log-out" class="w-4 h-4 text-gray-500"></i> Sign out
                </button>
              </div>
            </div>
          </div>
        `;
        const dropdownBtn = document.getElementById("user-menu-btn");
        const dropdown = document.getElementById("user-dropdown");
        const logoutBtn = document.getElementById("logout-btn");
        
        if(dropdownBtn) dropdownBtn.addEventListener("click", (e) => { e.stopPropagation(); dropdown.classList.toggle("hidden"); });
        document.addEventListener("click", (e) => { if (dropdown && !dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) dropdown.classList.add("hidden"); });
        if(logoutBtn) logoutBtn.addEventListener("click", () => { localStorage.removeItem("user"); location.href = "/"; });
      }
    } 
    // --- GUEST ---
    else {
      navLinks.innerHTML = "";
      navLinks.classList.add("hidden");
      navLinks.classList.remove("md:flex"); 

      navLogo.classList.remove("mr-auto"); 
      navLogo.classList.remove("absolute", "left-1/2", "top-1/2", "transform", "-translate-x-1/2", "-translate-y-1/2"); 
      navLogo.classList.add("md:absolute", "md:left-1/2", "md:top-1/2", "md:transform", "md:-translate-x-1/2", "md:-translate-y-1/2"); 

      if (mobileMenu) {
        mobileMenu.innerHTML = `
          <a href="/" class="block text-gray-300 hover:text-white py-2">Home</a>
          <a href="/#faq" class="block text-gray-300 hover:text-white py-2">FAQ</a>
          <a href="/contact" class="block text-gray-300 hover:text-white py-2">Contact Us</a>
          <div class="border-t border-white/10 mt-2 pt-2 flex flex-col gap-2">
               <a href="/login" class="block text-gray-300 hover:text-white py-2">Login</a>
               <a href="/signup" class="block text-violet-400 hover:text-violet-300 py-2">Register</a>
          </div>
        `;
      }

      if (authArea) {
        authArea.innerHTML = `
          <a href="/login" class="text-gray-300 hover:text-white font-medium transition-colors text-sm px-2">Login</a>
          <a href="/signup" class="bg-white text-gray-900 font-semibold py-2 px-6 rounded-full hover:bg-gray-200 transition-all text-sm hidden md:block">Register</a>
        `;
      }
    }
  }

  // =========================================
  // 3. LOAD HOME EVENTS (INFINITE 3D CAROUSEL)
  // =========================================
  if (homeGrid && !organizer) {
     if(user) {
        document.getElementById("home-events-subtitle").textContent = "Curated experiences just for you.";
        if(viewAllBtn) viewAllBtn.style.display = "inline-flex";
        
        const leftBtn = document.getElementById("scroll-left-btn");
        const rightBtn = document.getElementById("scroll-right-btn");

        const scrollCarousel = (amount) => {
            homeGrid.scrollBy({ left: amount, behavior: 'smooth' });
        };

        if(leftBtn && rightBtn) {
           leftBtn.addEventListener("click", () => scrollCarousel(-340));
           rightBtn.addEventListener("click", () => scrollCarousel(340));
        }
        
        fetch("http://localhost:5000/api/events").then(r=>r.json()).then(d => {
            if(d.success && d.events) {
               homeGrid.innerHTML = "";
               
               // ✅ FILTER OUT PAST / EXPIRED EVENTS
               const now = new Date();
               const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

               const validEvents = d.events.filter(e => {
                   const evDate = new Date(e.date);
                   const evDateOnly = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());
                   return evDateOnly >= today; // Keep only today and future events
               });

               if (validEvents.length === 0) {
                   homeGrid.innerHTML = `
                      <div class="w-full text-center py-10 flex flex-col justify-center items-center h-48 border border-white/5 bg-white/5 rounded-2xl border-dashed">
                        <i data-lucide="calendar-x" class="w-8 h-8 text-gray-500 mb-2"></i>
                        <p class="text-gray-400 font-medium">No upcoming events at the moment.</p>
                      </div>`;
                   if (leftBtn) leftBtn.style.display = 'none';
                   if (rightBtn) rightBtn.style.display = 'none';
                   lucide.createIcons();
                   return;
               }

               const events = validEvents;
               let displayEvents = events;
               
               while (displayEvents.length < 5) {
                   displayEvents = [...displayEvents, ...events];
               }
               
               const infiniteEvents = [...displayEvents, ...displayEvents, ...displayEvents];

               const padding = document.createElement("div");
               padding.style.flex = "0 0 35%"; 
               homeGrid.appendChild(padding);

               infiniteEvents.forEach((e, index) => {
                  const img = e.bannerUrl ? e.bannerUrl : `https://placehold.co/600x800/1e1e2e/FFF?text=${encodeURIComponent(e.title)}`;
                  const priceTag = e.isPaid ? `₹${e.price}` : "Free";
                  
                  const card = document.createElement("div");
                  card.className = "modern-card"; 
                  card.dataset.index = index; 
                  
                  // ✅ Added text-green-400 and removed border if needed, to make price green
                  card.innerHTML = `
                    <div class="card-price-tag !text-green-400 !border-green-500/30 font-bold tracking-wide">${priceTag}</div>
                    <img src="${img}" class="card-bg-img" alt="${e.title}">
                    <div class="card-overlay">
                        <div class="card-content">
                            <div class="card-college">${e.college || "Campus Event"}</div>
                            <h3>${e.title}</h3>
                            <div class="card-meta">
                                <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4 text-violet-400"></i> ${new Date(e.date).toLocaleDateString()}</span>
                                <span class="book-btn">
                                   Book <i data-lucide="arrow-right" class="w-3 h-3"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                  `;
                    
                  card.addEventListener("click", () => window.location.href=`/events/detail.html?id=${e._id}`);
                  homeGrid.appendChild(card);
               });

               const paddingEnd = document.createElement("div");
               paddingEnd.style.flex = "0 0 35%";
               homeGrid.appendChild(paddingEnd);

               setTimeout(() => {
                   const cardEl = homeGrid.querySelector('.modern-card');
                   if (!cardEl) return;
                   
                   const cardWidth = cardEl.offsetWidth + 20; 
                   const singleSetWidth = cardWidth * displayEvents.length;
                   
                   homeGrid.scrollTo({ left: singleSetWidth, behavior: 'auto' });
                   
                   let isResetting = false;
                   let autoScrollInterval = null;

                   const startAutoScroll = () => {
                       if (autoScrollInterval) return; 
                       autoScrollInterval = setInterval(() => {
                           scrollCarousel(cardWidth); 
                       }, 3000); 
                   };

                   const stopAutoScroll = () => {
                       if (autoScrollInterval) {
                           clearInterval(autoScrollInterval);
                           autoScrollInterval = null;
                       }
                   };

                   homeGrid.addEventListener('scroll', () => {
                       if (isResetting) return;

                       const currentScroll = homeGrid.scrollLeft;
                       
                       if (currentScroll >= singleSetWidth * 2) {
                           isResetting = true;
                           homeGrid.scrollTo({ left: currentScroll - singleSetWidth, behavior: 'auto' });
                           setTimeout(() => isResetting = false, 50);
                       }
                       else if (currentScroll <= 50) { 
                           isResetting = true;
                           homeGrid.scrollTo({ left: currentScroll + singleSetWidth, behavior: 'auto' });
                           setTimeout(() => isResetting = false, 50);
                       }

                       const center = homeGrid.scrollLeft + (homeGrid.offsetWidth / 2);
                       const cards = document.querySelectorAll('.modern-card');
                       let closest = null;
                       let minDiff = Infinity;

                       cards.forEach(card => {
                           const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                           const diff = Math.abs(center - cardCenter);
                           card.classList.remove('active');
                           if(diff < minDiff) {
                               minDiff = diff;
                               closest = card;
                           }
                       });
                       
                       if(closest) {
                           closest.classList.add('active');
                       }
                   });

                   startAutoScroll();
                   if (typeof lucide !== "undefined") lucide.createIcons();

               }, 100); 
            }
         });
     } else {
        document.getElementById("home-events-subtitle").textContent = "Login to see personalized events from your campus.";
        if(viewAllBtn) viewAllBtn.style.display = "none";
        homeGrid.style.display = "none";
        const btns = document.querySelectorAll('.carousel-btn');
        btns.forEach(b => b.style.display = 'none');

        const loginLink = document.createElement("a");
        loginLink.href = "/login";
        loginLink.className = "login-to-view-link";
        loginLink.innerHTML = "Login to view and book events.";
        homeEventsSubtitle.parentNode.appendChild(loginLink);
     }
  }

  // =========================================
  // 4. MANAGE ACCOUNT MODAL (User Only)
  // =========================================
  if (user) {
    const modalHTML = `
      <div id="accountModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Manage Account</h2>
            <button id="closeModal" class="modal-close"><i data-lucide="x"></i></button>
          </div>
          
          <div class="modal-tabs">
            <div class="tab-btn active" data-tab="profile">Profile</div>
            <div class="tab-btn" data-tab="billing">Billing History</div>
            <div class="tab-btn text-red-400 hover:text-red-300" data-tab="security">Settings</div>
          </div>

          <div class="modal-body">
            <div id="tab-profile" class="tab-content">
              <div id="profile-loader" class="text-center py-10 text-gray-400 flex flex-col items-center">
                  <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-2"></i> Loading profile...
              </div>
              <div id="profile-data" class="profile-grid hidden"></div>
            </div>
            <div id="tab-billing" class="tab-content hidden">
               <div id="billing-loader" class="text-center py-10 text-gray-400 flex flex-col items-center">
                  <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-2"></i> Loading transactions...
               </div>
               <div id="billing-list"></div>
            </div>
            <div id="tab-security" class="tab-content hidden">
               <div class="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center">
                 <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                 </div>
                 <h3 class="text-white font-semibold text-lg mb-2">Delete Account</h3>
                 <p class="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Once you delete your account, there is no going back. All your personal data and booking history will be permanently removed.
                 </p>
                 <button id="btn-delete-init" class="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-lg shadow-red-900/20">
                   Delete My Account
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div id="deletePopup" class="delete-popup">
        <div class="p-2 mb-4 bg-red-900/30 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-red-500">
          <i data-lucide="alert-octagon" class="w-6 h-6"></i>
        </div>
        <h3>Are you absolutely sure?</h3>
        <p>This action cannot be undone. We are not liable for any loss of ticket data once deleted.</p>
        <div class="delete-actions">
          <button id="btn-cancel-delete" class="btn-cancel">Cancel</button>
          <button id="btn-confirm-delete" class="btn-confirm-delete">Yes, Delete Account</button>
        </div>
      </div>`;

    if (!document.getElementById("accountModal")) {
      document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    const modal = document.getElementById("accountModal");
    const manageBtn = document.getElementById("manage-account-btn");
    const mobileManageBtn = document.getElementById("mobile-manage-btn"); 
    
    // Function to open modal
    const openModal = () => {
        document.getElementById("user-dropdown").classList.add("hidden");
        // Also close mobile menu if open
        if(mobileMenu && !mobileMenu.classList.contains("hidden")) mobileMenu.classList.add("hidden");
        modal.classList.add("open");
        loadProfile();
    };

    if(manageBtn) manageBtn.addEventListener("click", openModal);
    if(mobileManageBtn) mobileManageBtn.addEventListener("click", openModal);
    
    if(modal) {
      document.getElementById("closeModal").addEventListener("click", () => modal.classList.remove("open"));
      modal.addEventListener("click", (e) => { if(e.target===modal) modal.classList.remove("open"); });

      const tabs = document.querySelectorAll(".tab-btn");
      const contents = document.querySelectorAll(".tab-content");
      tabs.forEach(tab => {
          tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.add("hidden"));
            tab.classList.add("active");
            document.getElementById(`tab-${tab.dataset.tab}`).classList.remove("hidden");
            if(tab.dataset.tab === "billing") loadBilling();
          });
      });

      const deleteInit = document.getElementById("btn-delete-init");
      const deletePopup = document.getElementById("deletePopup");
      const confirmDel = document.getElementById("btn-confirm-delete");
      const cancelDel = document.getElementById("btn-cancel-delete");

      if (deleteInit && deletePopup) {
        deleteInit.addEventListener("click", () => { modal.classList.remove("open"); deletePopup.classList.add("open"); });
        cancelDel.addEventListener("click", () => { deletePopup.classList.remove("open"); modal.classList.add("open"); });
        confirmDel.addEventListener("click", async () => {
           confirmDel.innerText = "Deleting...";
           confirmDel.disabled = true;
           try {
             const res = await fetch("http://localhost:5000/api/profile", { 
                 method: "DELETE", 
                 headers: {"Content-Type":"application/json"}, 
                 body: JSON.stringify({email: user.email}) 
             });
             const data = await res.json();
             if(data.success) {
                 localStorage.removeItem("user");
                 window.location.href="/";
             } else {
                 alert(data.message || "Failed to delete account");
                 confirmDel.innerText = "Yes, Delete Account";
                 confirmDel.disabled = false;
             }
           } catch(e) { 
               alert("Server error");
               confirmDel.innerText = "Yes, Delete Account";
               confirmDel.disabled = false;
           }
        });
      }
    }
  }

  // =========================================
  // 5. HELPER FUNCTIONS
  // =========================================
  async function loadProfile() {
       const loader = document.getElementById("profile-loader");
       const container = document.getElementById("profile-data");
       
       if(loader) loader.classList.remove("hidden");
       if(container) {
         container.classList.add("hidden");
         container.innerHTML = ""; 
       }

       if (!user || !user.email) {
          if(container) container.innerHTML = `<p class="col-span-full text-center text-red-400">User not found. Please login again.</p>`;
          if(loader) loader.classList.add("hidden");
          if(container) container.classList.remove("hidden");
          return;
       }

       try {
         const res = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`);
         if (!res.ok) throw new Error(`Server returned ${res.status}`);

         const data = await res.json();
         
         if(data.success && data.user) {
            const u = data.user;
            const dob = u.dob ? new Date(u.dob).toLocaleDateString() : "-";
            const fields = [
              { label: "Full Name", value: u.name }, 
              { label: "College", value: u.college },
              { label: "Email", value: u.email }, 
              { label: "Mobile", value: u.mobile },
              { label: "Roll Number", value: u.roll }, 
              { label: "Course", value: u.course },
              { label: "Semester", value: u.semester }, 
              { label: "Gender", value: u.gender },
              { label: "Date of Birth", value: dob },
            ];
            
            if(container) {
                container.innerHTML = fields.map(f => `
                    <div class="profile-field">
                        <label>${f.label}</label>
                        <div class="truncate" title="${f.value || ''}">${f.value || "-"}</div>
                    </div>
                `).join("");
            }
         } else {
             if(container) container.innerHTML = `<p class="col-span-full text-center text-red-400">${data.message || "Failed to load profile."}</p>`;
         }
       } catch(e) {
          console.error(e);
          if(container) container.innerHTML = `<p class="col-span-full text-center text-red-400">Error loading data.</p>`;
       } finally {
          if(loader) loader.classList.add("hidden");
          if(container) container.classList.remove("hidden");
       }
  }

  async function loadBilling() {
       const loader = document.getElementById("billing-loader");
       const list = document.getElementById("billing-list");
       
       if(loader) loader.classList.remove("hidden");
       if(list) {
         list.classList.add("hidden");
         list.innerHTML = "";
       }

       if (!user || !user.email) return;

       try {
         const res = await fetch(`/api/bookings/me?email=${encodeURIComponent(user.email)}`);
         const data = await res.json();
         
         if(data.success && data.bookings.length > 0) {
           data.bookings.forEach(b => {
             if(!b.event) return;
             const paid = b.amountPaid !== undefined ? b.amountPaid : (b.event.price || 0);
             const price = paid > 0 ? `₹${paid}` : "Free";
             
             const date = new Date(b.createdAt).toLocaleDateString();
             const item = document.createElement("div");
             item.className = "billing-item";
             item.innerHTML = `
                <div class="billing-info">
                    <h4>${b.event.title}</h4>
                    <p>${date} • ID: ${String(b._id).slice(-6).toUpperCase()}</p>
                </div>
                <div class="billing-amount ${paid > 0 ? 'paid' : ''}">${price}</div>
             `;
             list.appendChild(item);
           });
         } else { 
            if(list) list.innerHTML = `<p class="text-gray-500 text-center py-6">No booking history found.</p>`; 
         }
       } catch(e) {
          if(list) list.innerHTML = `<p class="text-red-400 text-center">Error loading history.</p>`;
       } finally {
          if(loader) loader.classList.add("hidden");
          if(list) list.classList.remove("hidden");
       }
  }

  // =========================================
  // 6. SCROLL & UI LOGIC
  // =========================================
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;
  if (header) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        header.classList.remove('header-hidden');
        lastScrollY = 0;
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        header.classList.add('header-hidden');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
      } else {
        header.classList.remove('header-hidden');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  if (navSearch && user && window.location.pathname.includes("events")) {
    navSearch.innerHTML = `<div class="relative"><input id="globalSearch" type="text" placeholder="Search events..." class="w-full bg-gray-800/50 border border-gray-600/50 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 transition placeholder-gray-500"/><i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500"></i></div>`;
  }

  if (heroBrowseBtn) heroBrowseBtn.addEventListener("click", () => window.location.href = user ? "/events" : "/login");
  if (mobileBtn && mobileMenu) mobileBtn.onclick = () => mobileMenu.classList.toggle("hidden");

  // Typewriter
  const textFinal = "One Pass";
  const el2 = document.getElementById("type-h1-2");
  let typeInterval;

  if (el2) {
    const typeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el2.textContent = "";
          clearTimeout(typeInterval);
          
          let i = 0;
          function type() {
            if (i < textFinal.length) {
              el2.textContent += textFinal.charAt(i++);
              typeInterval = setTimeout(type, 100); 
            } else {
              el2.innerHTML += `<span class="blink">.</span>`;
            }
          }
          type();
        } else {
          clearTimeout(typeInterval);
          el2.textContent = ""; 
        }
      });
    }, { threshold: 0.1 });

    typeObserver.observe(el2);
  }

  if (typeof lucide !== "undefined") lucide.createIcons();
});

// Spotlight Effect
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.glow-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// FAQ ACCORDION LOGIC
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const toggle = item.querySelector('.faq-toggle');
  const content = item.querySelector('.faq-content');
  toggle.addEventListener('click', () => {
    faqItems.forEach(other => {
      if(other !== item) {
        other.classList.remove('active');
        other.querySelector('.faq-content').style.gridTemplateRows = '0fr';
      }
    });
    item.classList.toggle('active');
    content.style.gridTemplateRows = item.classList.contains('active') ? '1fr' : '0fr';
  });
});

// SCROLL PROGRESS BAR
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (scrollTop / scrollHeight) * 100;
  const progressBar = document.getElementById('scroll-progress');
  if(progressBar) progressBar.style.width = scrolled + "%";
});

// --- GLOBAL TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };
    toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/* --- FIX: FORCE VIDEO LOOP --- */
document.addEventListener("DOMContentLoaded", () => {
    const bgVideo = document.querySelector("video");
    if (bgVideo) {
        bgVideo.play().catch(e => console.log("Autoplay prevented:", e));
        bgVideo.addEventListener("pause", () => {
            if (!document.hidden) {
                console.log("Video paused unexpectedly. Restarting...");
                bgVideo.play();
            }
        });
        setInterval(() => {
            if (bgVideo.paused && !document.hidden) bgVideo.play();
        }, 5000);
    }
});