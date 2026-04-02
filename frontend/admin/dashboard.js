/* frontend/admin/dashboard.js */

let categorizedEvents = { all: [], live: [], upcoming: [], scheduled: [], past: [] };
let currentTab = 'all';
let currentPage = 1;
const eventsPerPage = 9;

// --- NEW VARIABLES TO HOLD MODAL DATA ---
let currentEventBookings = [];
let currentEventStats = {};

document.addEventListener("DOMContentLoaded", () => {
    
    const organizer = JSON.parse(localStorage.getItem("organizer"));
    if (!organizer) {
        window.location.href = "login.html";
        return;
    }

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

    document.querySelectorAll('.glow-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    loadDashboard();

    async function loadDashboard() {
        try {
            const res = await fetch(`/api/events/my-events?organizerId=${organizer._id}`);
            const data = await res.json();

            if (data.success) {
                animateCounter("stat-events", data.stats.totalEvents);
                animateCounter("stat-tickets", data.stats.totalTickets);
                animateCounter("stat-revenue", data.stats.totalRevenue);

                categorizeEvents(data.events);
                document.getElementById('event-tabs').classList.remove('hidden');

                currentTab = 'all';
                window.switchTab(currentTab);
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
            const grid = document.getElementById("admin-events");
            if(grid) grid.innerHTML = `<p class="text-red-400 col-span-full text-center py-10 flex flex-col items-center justify-center gap-2"><i data-lucide="alert-triangle" class="w-6 h-6"></i> Failed to load events. Server might be down.</p>`;
            lucide.createIcons();
        }
    }

    function categorizeEvents(events) {
        categorizedEvents = { all: [], live: [], upcoming: [], scheduled: [], past: [] };
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        events.forEach(ev => {
            categorizedEvents.all.push(ev);
            const evDate = new Date(ev.date);
            const evDateOnly = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());
            const bookingStart = new Date(ev.bookingStartTime || ev.createdAt);

            if (evDateOnly < today) categorizedEvents.past.push(ev);
            else if (evDateOnly.getTime() === today.getTime()) categorizedEvents.live.push(ev);
            else if (now < bookingStart) categorizedEvents.scheduled.push(ev);
            else categorizedEvents.upcoming.push(ev);
        });
    }

    function animateCounter(id, target) {
        const el = document.getElementById(id);
        if(!el) return;
        let start = 0; const duration = 1500; const stepTime = 20; const steps = duration / stepTime; const increment = target / steps;
        if(target === 0) { el.innerText = id === "stat-revenue" ? "₹0" : "0"; return; }

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                el.innerText = id === "stat-revenue" ? `₹${target}` : target;
                clearInterval(timer);
            } else {
                el.innerText = id === "stat-revenue" ? `₹${Math.ceil(start)}` : Math.ceil(start);
            }
        }, stepTime);
    }
});

window.switchTab = function(tabName) {
    currentTab = tabName;
    currentPage = 1; 
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const tabId = btn.id.replace('tab-', '');
        const count = categorizedEvents[tabId].length;
        const labelText = tabId.charAt(0).toUpperCase() + tabId.slice(1);
        
        let activeClasses = "tab-btn px-4 py-2 rounded-full text-xs font-medium transition-colors bg-white/10 text-white whitespace-nowrap flex items-center gap-1.5";
        let inactiveClasses = "tab-btn px-4 py-2 rounded-full text-xs font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/5 bg-transparent whitespace-nowrap flex items-center gap-1.5";

        btn.className = (tabId === tabName) ? activeClasses : inactiveClasses;
        let liveIndicator = (tabId === 'live' && count > 0) ? '<span class="relative flex h-1.5 w-1.5 mr-0.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>' : '';
        let badgeClass = (tabId === tabName) ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500';
        btn.innerHTML = `${liveIndicator} ${labelText} <span class="${badgeClass} px-1.5 py-0.5 rounded-full text-[10px] ml-1 font-bold">${count}</span>`;
    });
    
    renderEvents(categorizedEvents[tabName]);
}

window.goToPage = function(pageNumber) {
    currentPage = pageNumber;
    renderEvents(categorizedEvents[currentTab]);
    const tabsElement = document.getElementById('event-tabs');
    if(tabsElement) window.scrollTo({ top: tabsElement.offsetTop - 100, behavior: 'smooth' });
}

function renderEvents(allEventsForTab) {
    const grid = document.getElementById("admin-events");
    const paginationContainer = document.getElementById("pagination-controls");
    if(!grid) return;
    grid.innerHTML = "";

    if (allEventsForTab.length === 0) {
        if (paginationContainer) paginationContainer.innerHTML = ""; 
        let emptyMessage = "No events found.";
        let iconName = "calendar";
        
        if (currentTab === 'live') { emptyMessage = "No events happening today."; iconName = "radio"; }
        else if (currentTab === 'upcoming') { emptyMessage = "No upcoming events open for booking."; iconName = "calendar-days"; }
        else if (currentTab === 'scheduled') { emptyMessage = "No scheduled events waiting to open."; iconName = "clock"; }
        else if (currentTab === 'past') { emptyMessage = "No past events."; iconName = "history"; }
        
        grid.innerHTML = `
        <div class="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-[24px] border-dashed">
            <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <i data-lucide="${iconName}" class="w-8 h-8 text-gray-500"></i>
            </div>
            <p class="text-gray-400 text-center font-medium">${emptyMessage}</p>
        </div>`;
        lucide.createIcons();
        return;
    }

    const totalPages = Math.ceil(allEventsForTab.length / eventsPerPage);
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const paginatedEvents = allEventsForTab.slice(startIndex, endIndex);

    paginatedEvents.forEach(event => {
        const card = document.createElement("div");
        
        const pausedOpacity = event.isBookingPaused ? 'opacity-80 grayscale-[20%]' : '';
        card.className = `group relative flex flex-col h-full bg-[#0d0d14] border border-white/5 rounded-[24px] overflow-hidden hover:border-violet-500/30 hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.15)] transition-all duration-500 ${pausedOpacity}`;
        
        const dateObj = new Date(event.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const priceDisplay = event.isPaid ? '₹' + event.price : 'Free';
        const priceClass = event.isPaid ? 'text-white' : 'text-gray-300';
        const bannerImg = event.bannerUrl || "../assets/image.jpg"; 

        const cap = event.maxCapacity || 100; 
        const sold = event.ticketsSold || 0;
        const percentSold = event.maxCapacity ? Math.min(Math.round((sold / cap) * 100), 100) : 0;

        const pauseIcon = event.isBookingPaused ? 'play' : 'pause';
        const pauseTitle = event.isBookingPaused ? 'Resume Bookings' : 'Pause Bookings';
        const pauseColor = event.isBookingPaused ? 'hover:bg-green-500 text-yellow-400' : 'hover:bg-yellow-500 text-gray-300';
        const pauseBadge = event.isBookingPaused ? `<div class="absolute top-4 left-24 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md z-10 flex items-center gap-1"><i data-lucide="pause-circle" class="w-3 h-3"></i> Paused</div>` : '';

        card.innerHTML = `
            <div class="relative h-48 w-full overflow-hidden shrink-0">
                <img src="${bannerImg}" alt="${event.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/20 to-transparent"></div>
                
                <div class="absolute top-4 left-4 flex gap-2 z-10">
                    <div class="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                        ${event.category}
                    </div>
                </div>
                ${pauseBadge}

                <div class="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-0 md:-translate-y-2 md:group-hover:translate-y-0 z-20">
                    <button onclick="togglePauseEvent('${event._id}')" class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md ${pauseColor} border border-white/10 shadow-lg flex items-center justify-center transition-all hover:text-white" title="${pauseTitle}">
                        <i data-lucide="${pauseIcon}" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="editEvent('${event._id}')" class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-gray-300 hover:text-white hover:bg-violet-600 border border-white/10 shadow-lg flex items-center justify-center transition-all" title="Edit Event">
                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteEvent('${event._id}')" class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-gray-300 hover:text-white hover:bg-red-500 border border-white/10 shadow-lg flex items-center justify-center transition-all" title="Delete Event">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>

            <div class="p-6 flex flex-col flex-grow relative z-10 -mt-2">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold text-violet-400 tracking-wide">${dateStr} • ${event.startTime}</span>
                    </div>
                    <div class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium ${priceClass} flex items-center gap-1">
                        ${priceDisplay}
                    </div>
                </div>
                
                <h3 class="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-300 transition-colors">${event.title}</h3>
                <p class="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed flex-grow">${event.description}</p>
                
                <div class="mb-5">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-xs font-medium text-gray-400">Tickets Sold</span>
                        <span class="text-sm font-bold text-white">${sold} <span class="text-xs text-gray-500 font-medium">/ ${event.maxCapacity || "∞"}</span></span>
                    </div>
                    ${event.maxCapacity ? `
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r ${event.isBookingPaused ? 'from-yellow-500 to-orange-500' : 'from-violet-600 to-fuchsia-500'} rounded-full transition-all duration-1000" style="width: ${percentSold}%"></div>
                    </div>` : ''}
                </div>

                <div class="grid grid-cols-2 gap-3 mt-auto">
                    <button onclick="openParticipantsModal('${event._id}')" class="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-colors border border-white/5 flex items-center justify-center gap-2">
                        <i data-lucide="users" class="w-4 h-4"></i> Participants
                    </button>
                    <button onclick="openModal('${event._id}')" class="py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2">
                        Details <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });

    renderPaginationControls(totalPages);
    lucide.createIcons();
}

function renderPaginationControls(totalPages) {
    const container = document.getElementById("pagination-controls");
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.className = `w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${currentPage === 1 ? 'border-white/5 bg-transparent text-gray-600 cursor-not-allowed' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white hover:border-violet-500/50'}`;
    prevBtn.innerHTML = `<i data-lucide="chevron-left" class="w-5 h-5"></i>`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if(currentPage > 1) goToPage(currentPage - 1); };
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        const isActive = i === currentPage;
        
        pageBtn.className = `w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-violet-500/50 scale-110' : 'bg-transparent border border-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5'}`;
        pageBtn.innerText = i;
        pageBtn.onclick = () => goToPage(i);
        container.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.className = `w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${currentPage === totalPages ? 'border-white/5 bg-transparent text-gray-600 cursor-not-allowed' : 'border-white/10 bg-white/5 hover:bg-white/10 text-white hover:border-violet-500/50'}`;
    nextBtn.innerHTML = `<i data-lucide="chevron-right" class="w-5 h-5"></i>`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if(currentPage < totalPages) goToPage(currentPage + 1); };
    container.appendChild(nextBtn);
}

window.togglePauseEvent = async function(id) {
    try {
        const res = await fetch(`/api/events/${id}/toggle-pause`, { method: "PATCH" });
        const data = await res.json();
        if (data.success) {
            const eventIndex = categorizedEvents.all.findIndex(e => e._id === id);
            if (eventIndex > -1) {
                categorizedEvents.all[eventIndex].isBookingPaused = data.isBookingPaused;
                ['live', 'upcoming', 'scheduled', 'past'].forEach(tab => {
                    const idx = categorizedEvents[tab].findIndex(e => e._id === id);
                    if (idx > -1) categorizedEvents[tab][idx].isBookingPaused = data.isBookingPaused;
                });
                renderEvents(categorizedEvents[currentTab]); 
            }
        } else { alert("Failed to update status"); }
    } catch (err) { alert("An error occurred"); }
}

const modal = document.getElementById("detailsModal"); 

window.openModal = async function(eventId) {
    try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.success) {
            const ev = data.event;
            document.getElementById("detailTitle").innerText = ev.title;
            document.getElementById("detailImg").src = ev.bannerUrl || "../assets/image.jpg";
            document.getElementById("detailDate").innerText = new Date(ev.date).toDateString();
            document.getElementById("detailVenue").innerText = ev.venue;
            document.getElementById("detailDesc").innerText = ev.description;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        }
    } catch (err) { console.error(err); }
}

window.closeModal = function() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

const participantsModal = document.getElementById("participantsModal");

window.openParticipantsModal = async function(eventId) {
    const list = document.getElementById("participantsList");
    list.innerHTML = `<p class="text-gray-400 text-center text-sm py-4">Loading...</p>`;
    participantsModal.classList.remove("hidden");
    participantsModal.classList.add("flex");

    // Hide tabs initially while loading
    if(document.getElementById("participantTabs")) {
        document.getElementById("participantTabs").classList.add("hidden");
    }

    try {
        const res = await fetch(`/api/bookings/event/${eventId}`);
        const data = await res.json();

        if (data.success) {
            currentEventBookings = data.bookings;
            currentEventStats = data.eventStats;

            document.getElementById("modalTitle").innerText = data.eventStats.title;
            document.getElementById("modalRevenue").innerText = `₹${data.eventStats.revenue}`;

            // Show tabs once data loads
            if(document.getElementById("participantTabs")) {
                document.getElementById("participantTabs").classList.remove("hidden");
            }

            // Trigger the "All" tab by default to render the list
            filterParticipants('all');
        } else {
            list.innerHTML = `<p class="text-red-400 text-center text-sm">Failed to load data</p>`;
        }
    } catch (err) {
        list.innerHTML = `<p class="text-red-400 text-center text-sm">Server Error</p>`;
    }
}

// --- NEW FUNCTION TO HANDLE TAB CLICKS AND FILTERING ---
window.filterParticipants = function(filterType) {
    // 1. Update Tab Styles
    ['all', 'scanned', 'pending'].forEach(tab => {
        const btn = document.getElementById(`ptab-${tab}`);
        if (btn) {
            if (tab === filterType) {
                btn.className = "text-white border-b-2 border-violet-500 pb-3 transition-all";
            } else {
                btn.className = "text-gray-400 hover:text-white border-b-2 border-transparent pb-3 transition-all";
            }
        }
    });

    const list = document.getElementById("participantsList");

    // 2. Filter the Data
    let filteredBookings = currentEventBookings;
    
    if (filterType === 'scanned') {
        filteredBookings = currentEventBookings.filter(b => 
            (b.status || "").toUpperCase() === 'CHECKED_IN' || 
            (b.status || "").toUpperCase() === 'SCANNED'
        );
    } else if (filterType === 'pending') {
        filteredBookings = currentEventBookings.filter(b => 
            (b.status || "").toUpperCase() === 'CONFIRMED'
        );
    }

    // 3. Count for tabs
    const allCount = currentEventBookings.length;
    const scannedCount = currentEventBookings.filter(b => (b.status || "").toUpperCase() === 'CHECKED_IN' || (b.status || "").toUpperCase() === 'SCANNED').length;
    const pendingCount = currentEventBookings.filter(b => (b.status || "").toUpperCase() === 'CONFIRMED').length;

    if (document.getElementById("count-all")) document.getElementById("count-all").innerText = allCount;
    if (document.getElementById("count-scanned")) document.getElementById("count-scanned").innerText = scannedCount;
    if (document.getElementById("count-pending")) document.getElementById("count-pending").innerText = pendingCount;

    // Update Subtitle summary
    document.getElementById("modalSubtitle").innerText = `${scannedCount} Scanned / ${pendingCount} Pending`;

    // 4. Render the List
    if (filteredBookings.length === 0) {
        list.innerHTML = `<p class="text-gray-500 text-center py-6 text-sm">No tickets found for this category.</p>`;
        return;
    }

    list.innerHTML = filteredBookings.map((b, i) => {
        const paid = b.amountPaid !== undefined ? b.amountPaid : currentEventStats.price;
        const priceDisplay = paid > 0 ? `₹${paid}` : "Free";
        const statusUpper = (b.status || "").toUpperCase();

        let statusBadge = '';
        let opacityClass = '';
        let timeInfo = '';
        let displayStatus = statusUpper;

        // Visual rules for Scanned vs Pending
        if (statusUpper === 'CHECKED_IN' || statusUpper === 'SCANNED') {
            displayStatus = 'SCANNED';
            statusBadge = 'bg-emerald-500/20 text-emerald-400';
            
            // Format Scan Time
            const dateObj = new Date(b.checkedInAt || b.scannedAt || b.updatedAt);
            const timeStr = isNaN(dateObj) ? "Unknown Time" : dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});
            
            timeInfo = `<div class="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                            <i data-lucide="check-circle-2" class="w-3 h-3"></i> Scanned at ${timeStr}
                        </div>`;
        } 
        else if (statusUpper === 'CANCELLED') {
            statusBadge = 'bg-red-500/20 text-red-400';
            opacityClass = 'opacity-50 grayscale';
        } 
        else {
            // Pending (CONFIRMED)
            displayStatus = 'PENDING';
            statusBadge = 'bg-yellow-500/20 text-yellow-400';
            timeInfo = `<div class="text-[10px] text-yellow-500/50 flex items-center gap-1 mt-1">
                            <i data-lucide="circle-dashed" class="w-3 h-3"></i> Not Scanned Yet
                        </div>`;
        }

        return `
        <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition ${opacityClass}">
            <div class="flex items-center gap-3">
                <span class="text-gray-500 font-mono text-xs w-6 text-center">${i + 1}</span>
                <div>
                    <p class="text-white font-medium text-sm ${statusUpper === 'CANCELLED' ? 'line-through text-gray-400' : ''}">${b.user?.name || "Unknown"}</p>
                    <p class="text-xs text-gray-400">${b.user?.email || ""}</p>
                    ${timeInfo}
                </div>
            </div>
            <div class="text-right flex flex-col items-end gap-1.5">
                 <span class="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider ${statusBadge}">
                    ${displayStatus}
                 </span>
                 <span class="text-[10px] font-medium text-gray-400 bg-black/20 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                    Paid: <strong class="${paid > 0 ? 'text-green-400' : 'text-gray-300'}">${priceDisplay}</strong>
                 </span>
            </div>
        </div>
    `}).join("");
    
    // Re-initialize icons inside the dynamically injected HTML
    lucide.createIcons();
}

window.deleteEvent = async function(id) {
    if(!confirm("Are you sure? This will delete all bookings associated with this event.")) return;

    try {
        const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
            alert("Event Deleted successfully");
            location.reload(); 
        } else {
            alert("Failed to delete event");
        }
    } catch (err) { alert("An error occurred while deleting the event."); }
}

window.editEvent = function(eventId) { window.location.href = `create-event.html?id=${eventId}`; }

window.onclick = function(event) {
    if (event.target == modal) closeModal();
    if (event.target == participantsModal) participantsModal.classList.add("hidden");
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