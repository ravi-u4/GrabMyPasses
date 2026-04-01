// frontend/mypasses/mypasses.js
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("passes-container");
  const tabActive = document.getElementById("tab-active");
  const tabHistory = document.getElementById("tab-history");
  
  let activeBookings = [];
  let historyBookings = [];

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    console.error("Error parsing user data", e);
  }

  if (!user) {
    container.innerHTML = `<p class="text-gray-300 col-span-full py-10 bg-white/5 rounded-xl text-center border border-white/10">Please <a href="/login" class="text-violet-400 hover:underline font-medium">login</a> to see your passes.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/bookings/me?email=${encodeURIComponent(user.email)}`);
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `<p class="text-red-400 col-span-full py-10 text-center">Failed to load your passes.</p>`;
      return;
    }

    if (!data.bookings || data.bookings.length === 0) {
      container.innerHTML = `<div class="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-[24px] border-dashed">
            <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <i data-lucide="ticket" class="w-8 h-8 text-gray-500"></i>
            </div>
            <p class="text-gray-400 text-center font-medium">You haven't booked any events yet.</p>
        </div>`;
      lucide.createIcons();
      return;
    }

    // ✅ CATEGORIZE PASSES INTO ACTIVE vs HISTORY
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    data.bookings.forEach(b => {
        if (!b.event) return;

        const evDate = new Date(b.event.date);
        const evDateOnly = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());

        // If the event is in the past OR the ticket was explicitly cancelled
        if (evDateOnly < today || b.status === "CANCELLED") {
            historyBookings.push(b);
        } else {
            activeBookings.push(b);
        }
    });

    // Handle Tab UI Switching
    function switchTab(isHistory) {
        if (isHistory) {
            tabHistory.className = "pb-3 text-white font-semibold border-b-2 border-violet-500 transition-colors";
            tabActive.className = "pb-3 text-gray-400 font-medium hover:text-white border-b-2 border-transparent transition-colors";
            renderPasses(historyBookings, "No past booking history found.", true);
        } else {
            tabActive.className = "pb-3 text-white font-semibold border-b-2 border-violet-500 transition-colors";
            tabHistory.className = "pb-3 text-gray-400 font-medium hover:text-white border-b-2 border-transparent transition-colors";
            renderPasses(activeBookings, "You don't have any upcoming active passes.", false);
        }
    }

    tabActive.addEventListener("click", () => switchTab(false));
    tabHistory.addEventListener("click", () => switchTab(true));

    // Render Function
    function renderPasses(bookingsToRender, emptyMsg, isHistoryTab) {
        container.innerHTML = "";

        if (bookingsToRender.length === 0) {
            container.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-[24px] border-dashed">
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <i data-lucide="history" class="w-8 h-8 text-gray-500"></i>
                </div>
                <p class="text-gray-400 text-center font-medium">${emptyMsg}</p>
            </div>`;
            lucide.createIcons();
            return;
        }

        bookingsToRender.forEach(b => {
            const event = b.event;
            const dateObj = new Date(event.date);
            const dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "Date TBA";
            const timeStr = event.startTime || (!isNaN(dateObj) ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Time TBA");
            const isPast = dateObj < today;

            // STATUS BADGE LOGIC
            let displayStatus = b.status;
            let badgeColor = "bg-green-500/10 text-green-400 border-green-500/30"; // Default Confirmed
            let cardOpacity = ""; // Default Active Card Style
            
            if (b.status === "CANCELLED") {
                displayStatus = "CANCELLED";
                badgeColor = "bg-red-500/10 text-red-400 border-red-500/30";
                cardOpacity = "opacity-70 grayscale-[30%]";
            } else if (isPast) {
                if (b.status === "CHECKED_IN") {
                    displayStatus = "ATTENDED";
                    badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                } else {
                    displayStatus = "EXPIRED";
                    badgeColor = "bg-gray-500/10 text-gray-400 border-gray-500/30";
                    cardOpacity = "opacity-60";
                }
            } else {
                if (b.status === "CHECKED_IN") {
                    displayStatus = "CHECKED IN";
                    badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                }
            }

            const card = document.createElement("div");
            card.className = `glow-card p-6 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 ${cardOpacity}`;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
            });

            card.innerHTML = `
                <div class="absolute top-0 right-0 p-4 opacity-70 group-hover:opacity-100 transition-opacity">
                   <span class="text-[10px] uppercase tracking-widest font-bold border px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md ${badgeColor}">
                     ${displayStatus}
                   </span>
                </div>

                <div class="mb-5">
                  <h2 class="text-xl font-bold text-white mb-1 group-hover:text-violet-300 transition-colors pr-24 line-clamp-1">
                    ${event.title || "Untitled Event"}
                  </h2>
                  <p class="text-sm text-violet-400 mb-4 font-medium">${event.college || "College Event"}</p>
                  
                  <div class="space-y-2 text-sm text-gray-400">
                    <div class="flex items-center">
                      <i data-lucide="calendar" class="w-4 h-4 mr-2 text-gray-500"></i>
                      <span>${dateStr}</span>
                    </div>
                    <div class="flex items-center">
                      <i data-lucide="clock" class="w-4 h-4 mr-2 text-gray-500"></i>
                      <span>${timeStr}</span>
                    </div>
                    <div class="flex items-center">
                       <i data-lucide="map-pin" class="w-4 h-4 mr-2 text-gray-500"></i>
                       <span class="truncate">${event.venue || "TBA"}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 mt-auto pt-4 border-t border-gray-800/50">
                  <button class="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 open-ticket-btn">
                    <i data-lucide="qr-code" class="w-4 h-4"></i>
                    ${b.status === 'CANCELLED' ? 'View Details' : 'View Pass'}
                  </button>
                  
                  <a href="/events/detail.html?id=${event._id}" class="px-3 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors" title="View Event Page">
                    <i data-lucide="external-link" class="w-4 h-4"></i>
                  </a>
                </div>
            `;

            const btn = card.querySelector(".open-ticket-btn");
            if(btn) {
                btn.addEventListener("click", () => {
                  window.location.href = `/ticket?id=${b._id}`;
                });
            }

            container.appendChild(card);
        });

        lucide.createIcons();
    }

    // Initialize with Active Passes
    switchTab(false);

  } catch (err) {
    console.error("MY PASSES ERROR:", err);
    container.innerHTML = `<p class="text-red-400 col-span-full text-center">Error loading passes. Please refresh.</p>`;
  }
});