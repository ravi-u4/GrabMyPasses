/* frontend/admin/create-event.js */

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Auth Check
    const organizer = JSON.parse(localStorage.getItem("organizer"));
    if (!organizer) {
        window.location.href = "login.html";
        return;
    } 

    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // --- Scheduled Booking UI Logic ---
    const bookingDateInput = document.getElementById('bookingStartDate');
    if (bookingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        bookingDateInput.setAttribute('min', today);
    }

    const immediateRadio = document.querySelector('input[name="bookingStartType"][value="immediate"]');
    const scheduleRadio = document.querySelector('input[name="bookingStartType"][value="schedule"]');
    const bookingScheduleContainer = document.getElementById('bookingScheduleContainer');
    const bookingStartTimeInput = document.getElementById('bookingStartTime');

    function toggleBookingSchedule() {
        if (scheduleRadio && scheduleRadio.checked) {
            if(bookingScheduleContainer) bookingScheduleContainer.classList.remove('hidden');
            if(bookingDateInput) bookingDateInput.required = true;
            if(bookingStartTimeInput) bookingStartTimeInput.required = true;
        } else {
            if(bookingScheduleContainer) bookingScheduleContainer.classList.add('hidden');
            if(bookingDateInput) bookingDateInput.required = false;
            if(bookingStartTimeInput) bookingStartTimeInput.required = false;
        }
    }

    if(immediateRadio && scheduleRadio) {
        immediateRadio.addEventListener('change', toggleBookingSchedule);
        scheduleRadio.addEventListener('change', toggleBookingSchedule);
    }

    // --- Page Mode (Create vs Edit) ---
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdToEdit = urlParams.get('id');
    const isEditMode = !!eventIdToEdit;

    const pageTitle = document.querySelector('h1');
    const submitBtn = document.querySelector("button[type='submit'] span");
    const bannerLabel = document.querySelector("label[for='bannerImage']");
    const bannerInput = document.getElementById("bannerImage");

    if (isEditMode) {
        if(pageTitle) pageTitle.innerHTML = `Update <span class="italic text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">Event</span>`;
        if(submitBtn) submitBtn.innerHTML = `Update Event <i data-lucide="check-circle" class="w-5 h-5 ml-2"></i>`;
        if(bannerLabel) bannerLabel.textContent = "Change Banner (Optional)";
        if(bannerInput) bannerInput.required = false; 
        
        await fetchEventDetails(eventIdToEdit);
    } else {
        if(organizer.college) {
            const orgByInput = document.getElementById('organizedBy');
            if(orgByInput) {
                orgByInput.value = organizer.college;
                orgByInput.dispatchEvent(new Event('input', { bubbles: true })); // Float label
            }
        }
    }

    // --- Team / Solo Logic ---
    const soloRadio = document.querySelector('input[name="participationType"][value="Solo"]');
    const teamRadio = document.querySelector('input[name="participationType"][value="Team"]');
    const teamSizeContainer = document.getElementById('teamSizeContainer');
    const teamSizeInput = document.getElementById('teamSize');

    if (teamSizeInput) {
        teamSizeInput.setAttribute('max', '15');
        teamSizeInput.addEventListener('input', () => {
            if (parseInt(teamSizeInput.value) > 15) {
                teamSizeInput.value = 15;
                showToast("Maximum team size is 15", "warning");
            }
        });
    }

    function toggleTeamSize() {
        if (teamRadio && teamRadio.checked) {
            if(teamSizeContainer) teamSizeContainer.classList.remove('hidden');
            if(teamSizeInput) teamSizeInput.required = true;
        } else {
            if(teamSizeContainer) teamSizeContainer.classList.add('hidden');
            if(teamSizeInput) teamSizeInput.required = false;
        }
    }

    if(soloRadio && teamRadio) {
        soloRadio.addEventListener('change', toggleTeamSize);
        teamRadio.addEventListener('change', toggleTeamSize);
    }

    // --- Contacts UI Logic ---
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            const hiddenRow = document.querySelector('.contact-row.hidden');
            if (hiddenRow) {
                hiddenRow.classList.remove('hidden');
                hiddenRow.style.opacity = '0';
                hiddenRow.style.transform = 'translateY(-10px)';
                requestAnimationFrame(() => {
                    hiddenRow.style.transition = 'all 0.3s ease';
                    hiddenRow.style.opacity = '1';
                    hiddenRow.style.transform = 'translateY(0)';
                });
                if (!document.querySelector('.contact-row.hidden')) addContactBtn.style.display = 'none';
            }
        });
    }

    // --- Fetch Details (BULLETPROOF) ---
    async function fetchEventDetails(id) {
        try {
            const res = await fetch(`http://localhost:5000/api/events/${id}`);
            
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }

            const data = await res.json();
            
            if (data.success) {
                const ev = data.event;
                console.log("Fetched Data:", ev);
                
                // Helper function to safely set values and trigger CSS labels
                const setVal = (elementId, value) => {
                    if (value === undefined || value === null) return;
                    const el = document.getElementById(elementId);
                    if (el) {
                        el.value = value;
                        el.dispatchEvent(new Event('input', { bubbles: true })); 
                    }
                };
                
                try { setVal('title', ev.title); } catch(e){}
                try { setVal('category', ev.category); } catch(e){}
                try { setVal('venue', ev.venue); } catch(e){}
                try { setVal('description', ev.description); } catch(e){}
                try { setVal('organizedBy', ev.organizedBy || ev.college); } catch(e){}
                try { setVal('organizerDetails', ev.organizerDetails); } catch(e){}
                try { setVal('locationDetails', ev.locationDetails); } catch(e){}
                try { setVal('startTime', ev.startTime); } catch(e){}
                try { setVal('endTime', ev.endTime); } catch(e){}
                try { setVal('maxCapacity', ev.maxCapacity); } catch(e){}

                // Setup Date
                try {
                    if (ev.date) {
                        const d = new Date(ev.date);
                        const day = ("0" + d.getDate()).slice(-2);
                        const month = ("0" + (d.getMonth() + 1)).slice(-2);
                        setVal('date', `${d.getFullYear()}-${month}-${day}`);
                    }
                } catch(e){}

                // Setup Scheduled Booking
                try {
                    if (ev.bookingStartTime) {
                        const bDate = new Date(ev.bookingStartTime);
                        const createdDate = new Date(ev.createdAt || Date.now());
                        
                        if (!isNaN(bDate) && bDate.getTime() - createdDate.getTime() > 60000) {
                            if(scheduleRadio) scheduleRadio.checked = true;
                            toggleBookingSchedule();
                            
                            const day = ("0" + bDate.getDate()).slice(-2);
                            const month = ("0" + (bDate.getMonth() + 1)).slice(-2);
                            setVal('bookingStartDate', `${bDate.getFullYear()}-${month}-${day}`);
                            setVal('bookingStartTime', ("0" + bDate.getHours()).slice(-2) + ":" + ("0" + bDate.getMinutes()).slice(-2));
                        } else {
                            if(immediateRadio) immediateRadio.checked = true;
                            toggleBookingSchedule();
                        }
                    }
                } catch(e){}

                // Setup Teams
                try {
                    if (ev.participationType === 'Team') {
                        if(teamRadio) teamRadio.checked = true;
                        setVal('teamSize', ev.teamSize);
                    } else {
                        if(soloRadio) soloRadio.checked = true;
                    }
                    toggleBookingSchedule(); // Re-trigger UI
                    toggleTeamSize(); // Re-trigger UI
                } catch(e){}

                // Setup Contacts (Robust string-to-JSON parsing)
                try {
                    let cList = ev.contacts;
                    if (typeof cList === 'string') {
                        try { cList = JSON.parse(cList); } catch(err) { cList = []; }
                    }
                    if (Array.isArray(cList) && cList.length > 0) {
                        cList.forEach((contact, index) => {
                            const i = index + 1; 
                            if (i <= 4 && contact) {
                                const row = document.getElementById(`contact-row-${i}`);
                                if (row) row.classList.remove('hidden');
                                setVal(`contactName${i}`, contact.name || "");
                                setVal(`contactNumber${i}`, contact.number || "");
                            }
                        });
                        if (cList.length >= 4 && addContactBtn) addContactBtn.style.display = 'none';
                    }
                } catch(e){}

                // Setup Social Links (Robust string-to-JSON parsing)
                try {
                    let sLinks = ev.socialLinks;
                    if (typeof sLinks === 'string') {
                        try { sLinks = JSON.parse(sLinks); } catch(err) { sLinks = {}; }
                    }
                    if (sLinks && typeof sLinks === 'object') {
                        setVal('instagram', sLinks.instagram);
                        setVal('facebook', sLinks.facebook);
                        setVal('xLink', sLinks.x || sLinks.twitter);
                        setVal('website', sLinks.website);
                    }
                } catch(e){}

                // Setup Pricing
                try {
                    if (ev.isPaid) {
                        const toggle = document.getElementById('isPaidToggle');
                        const priceContainer = document.getElementById('priceContainer');
                        
                        if(toggle) toggle.checked = true;
                        if(priceContainer) priceContainer.style.gridTemplateRows = '1fr';
                        setVal('priceInput', ev.price);
                        if (document.getElementById('priceInput')) document.getElementById('priceInput').required = true;
                    }
                } catch(e){}

            } else {
                showToast(data.message || "Failed to fetch event data.", "error");
            }
        } catch (err) {
            console.error("Fetch Event Details Error:", err);
            // This will show EXACTLY what failed on the screen so we can see it
            showToast(`Error: ${err.message}. Backend running?`, "error");
        }
    }

    // --- UI Listeners & Navbar ---
    const orgBtn = document.getElementById("org-menu-btn");
    const orgNameEl = document.getElementById("nav-org-name");
    const orgDrop = document.getElementById("org-dropdown");

    if(orgBtn) orgBtn.textContent = organizer.name ? organizer.name.substring(0,2).toUpperCase() : "OR";
    if(orgNameEl) orgNameEl.textContent = organizer.name || "Organizer";

    if(orgBtn && orgDrop) {
        orgBtn.addEventListener("click", (e) => { e.stopPropagation(); orgDrop.classList.toggle("hidden"); });
        document.addEventListener("click", (e) => { if(!orgDrop.contains(e.target) && !orgBtn.contains(e.target)) orgDrop.classList.add("hidden"); });
    }

    let lastScrollY = window.scrollY;
    const header = document.querySelector('header');
    if(header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('header-hidden', window.scrollY > lastScrollY && window.scrollY > 50);
            lastScrollY = window.scrollY;
        });
    }

    lucide.createIcons();

    const toggle = document.getElementById('isPaidToggle');
    const priceContainer = document.getElementById('priceContainer');
    const priceInput = document.getElementById('priceInput');

    if(toggle && priceContainer && priceInput) {
        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                priceContainer.style.gridTemplateRows = '1fr';
                priceInput.required = true;
                setTimeout(() => priceInput.focus(), 300); 
            } else {
                priceContainer.style.gridTemplateRows = '0fr';
                priceInput.required = false;
                priceInput.value = '';
            }
        });
    }

    // ==========================================
    // AI Description Generator Logic
    // ==========================================
    const aiDescBtn = document.getElementById('aiDescBtn');
    const aiPromptBox = document.getElementById('aiPromptBox');
    const closeAiBtn = document.getElementById('closeAiBtn');
    const generateAiBtn = document.getElementById('generateAiBtn');
    const aiPromptInput = document.getElementById('aiPromptInput');
    const descriptionInput = document.getElementById('description');

    if (aiDescBtn && aiPromptBox) {
        // 1. Toggle the prompt box when Sparkles is clicked
        aiDescBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aiPromptBox.classList.toggle('hidden');
            if (!aiPromptBox.classList.contains('hidden')) {
                aiPromptInput.focus();
            }
        });

        // 2. Close button logic
        closeAiBtn.addEventListener('click', () => {
            aiPromptBox.classList.add('hidden');
            aiPromptInput.value = ''; // Clear input on close
        });

        // 3. Generate button logic (Calls Backend API)
        generateAiBtn.addEventListener('click', async () => {
            const prompt = aiPromptInput.value.trim();
            
            if (!prompt) {
                showToast("Please enter a prompt for the AI.", "warning");
                return;
            }

            // Show loading state on the button
            const originalBtnHtml = generateAiBtn.innerHTML;
            generateAiBtn.disabled = true;
            generateAiBtn.classList.add('opacity-70', 'cursor-not-allowed');
            generateAiBtn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Generating...`;
            lucide.createIcons();

            try {
                // Send request to your local backend
                const response = await fetch('http://localhost:5000/api/events/generate-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: prompt })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Populate the main description textarea
                    descriptionInput.value = data.description;
                    
                    // Retrigger the input event so the floating label moves up
                    descriptionInput.dispatchEvent(new Event('input', { bubbles: true })); 
                    
                    // Close the box and clear the prompt
                    aiPromptBox.classList.add('hidden');
                    aiPromptInput.value = '';
                    
                    showToast("Description generated successfully!", "success");
                } else {
                    throw new Error(data.message || "Failed to generate description");
                }
            } catch (error) {
                console.error("AI Generation Error:", error);
                showToast(error.message || "Failed to connect to AI server.", "error");
            } finally {
                // Restore button state
                generateAiBtn.disabled = false;
                generateAiBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                generateAiBtn.innerHTML = originalBtnHtml;
                lucide.createIcons();
            }
        });
    }


    // --- Form Submit ---
    document.getElementById("createEventForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector("button[type='submit']");
        const originalContent = btn.innerHTML;
        
        const fileInput = document.getElementById('bannerImage');
        if (fileInput && fileInput.files.length > 0) {
            if ((fileInput.files[0].size / 1024) > 500) return showToast("Image too large! Max size is 500KB.", "error");
        }

        if (teamRadio && teamRadio.checked) {
            const size = parseInt(teamSizeInput.value);
            if (!size || size < 2) return showToast("Team size must be at least 2", "error");
            if (size > 15) return showToast("Maximum team size is 15", "error");
        }
        
        btn.disabled = true;
        btn.innerHTML = `<span class="flex items-center justify-center gap-2"><i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> ${isEditMode ? 'Updating...' : 'Uploading...'}</span>`;
        lucide.createIcons();

        const formData = new FormData(e.target); 
        formData.append("organizerId", organizer._id);
        formData.append("college", organizer.college || "Campus Event");
        
        const isPaid = toggle ? toggle.checked : false;
        formData.append("isPaid", isPaid);
        if(!isPaid) formData.set("price", 0); 

        formData.set("participationType", (teamRadio && teamRadio.checked) ? "Team" : "Solo");
        formData.set("teamSize", (teamRadio && teamRadio.checked) ? teamSizeInput.value : 1);

        // Map Booking Schedule Data
        if (scheduleRadio && scheduleRadio.checked) {
            const bDate = bookingDateInput.value;
            const bTime = bookingStartTimeInput.value;
            if (bDate && bTime) formData.append('bookingStartTimeStr', new Date(`${bDate}T${bTime}`).toISOString());
        } else {
            formData.append('bookingStartTimeStr', new Date().toISOString());
        }

        // Map Contacts Data
        const contacts = [];
        for (let i = 1; i <= 4; i++) {
            const nameEl = document.getElementById(`contactName${i}`);
            const numEl = document.getElementById(`contactNumber${i}`);
            if (nameEl && numEl && nameEl.value.trim() && numEl.value.trim()) {
                contacts.push({ name: nameEl.value.trim(), number: numEl.value.trim() });
            }
        }
        formData.append('contacts', JSON.stringify(contacts));

        // Map Socials Data
        const socialLinks = {
            instagram: document.getElementById('instagram') ? document.getElementById('instagram').value.trim() : "",
            facebook: document.getElementById('facebook') ? document.getElementById('facebook').value.trim() : "",
            x: document.getElementById('xLink') ? document.getElementById('xLink').value.trim() : "",
            website: document.getElementById('website') ? document.getElementById('website').value.trim() : ""
        };
        formData.append('socialLinks', JSON.stringify(socialLinks));

        try {
            const url = isEditMode ? `http://localhost:5000/api/events/${eventIdToEdit}` : "http://localhost:5000/api/events";
            const res = await fetch(url, { method: isEditMode ? "PUT" : "POST", body: formData });
            const result = await res.json();
            
            if (result.success) {
                showToast(isEditMode ? "Event updated successfully!" : "Event published successfully!", "success");
                setTimeout(() => window.location.href = "dashboard.html", 1500);
            } else {
                showToast(result.message || "Failed to save event", "error");
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

    document.querySelectorAll('.glow-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconName = type === 'success' ? 'check-circle' : type === 'warning' ? 'alert-circle' : 'x-circle'; 
        toast.innerHTML = `<div class="toast-icon"><i data-lucide="${iconName}" class="w-5 h-5"></i></div><p class="text-sm font-medium">${message}</p>`;
        container.appendChild(toast);
        lucide.createIcons();

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500); 
        }, 3000);
    }
});

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

window.removeContact = function(index) {
    const row = document.getElementById(`contact-row-${index}`);
    const nameInput = document.getElementById(`contactName${index}`);
    const numInput = document.getElementById(`contactNumber${index}`);
    const addBtn = document.getElementById('addContactBtn');
    
    if(nameInput) nameInput.value = '';
    if(numInput) numInput.value = '';
    if(row) row.classList.add('hidden');
    if(addBtn) addBtn.style.display = 'flex';
};