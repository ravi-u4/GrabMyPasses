/* frontend/events/detail.js */

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
  if(type === 'warning') icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  if(type === 'info') icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("event-detail");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!id) {
    container.innerHTML = `<p class="text-gray-300">Invalid event link.</p>`;
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/events/${id}`);
    const data = await res.json();

    if (!data.success || !data.event) {
      container.innerHTML = `<p class="text-gray-300">Event not found.</p>`;
      return;
    }

    const e = data.event;
    const eventDate = new Date(e.date);
    const dateShort = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const imgUrl = e.bannerUrl 
      ? e.bannerUrl 
      : `https://placehold.co/1200x400/1e1e2e/FFF?text=${encodeURIComponent(e.title)}`;

    const organizerName = e.organizedBy || e.college || "Student Council";
    const organizerInitial = organizerName.charAt(0).toUpperCase();

    const now = new Date();
    const bookingStart = e.bookingStartTime ? new Date(e.bookingStartTime) : new Date(e.createdAt);
    const isBookingOpen = now >= bookingStart;
    const isBookingPaused = e.isBookingPaused || false;

    let bookButtonHtml = '';
    
    // ✅ Bookings Paused State UI
    if (isBookingPaused) {
        bookButtonHtml = `
        <button id="detail-book-btn" disabled class="w-full relative group overflow-hidden rounded-xl bg-transparent border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 font-bold text-lg py-4 mb-3 cursor-not-allowed">
            <span class="relative z-10 flex items-center justify-center gap-2">
            Bookings Paused <i data-lucide="pause-circle" class="w-5 h-5"></i>
            </span>
        </button>`;
    } else if (isBookingOpen) {
        bookButtonHtml = `
        <button id="detail-book-btn" class="w-full relative group overflow-hidden rounded-xl bg-transparent border border-white/20 text-white font-bold text-lg py-4 transition-all hover:border-violet-500 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] mb-3">
            <span class="relative z-10 flex items-center justify-center gap-2">
            Book Now <i data-lucide="arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1"></i>
            </span>
            <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>`;
    } else {
        const formattedStart = bookingStart.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
        bookButtonHtml = `
        <button id="detail-book-btn" disabled class="w-full relative group overflow-hidden rounded-xl bg-transparent border border-white/5 bg-white/5 text-gray-500 font-bold text-sm md:text-base py-4 mb-3 cursor-not-allowed">
            <span class="relative z-10 flex items-center justify-center gap-2">
            Booking Starts ${formattedStart} <i data-lucide="lock" class="w-4 h-4"></i>
            </span>
        </button>`;
    }

    container.innerHTML = `
      <div class="col-span-full mb-4">
        <div class="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.7)] h-64 md:h-[400px] w-full relative group cursor-default border border-white/5">
          <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] via-transparent to-transparent"></div>
          <div class="absolute bottom-6 left-6 md:left-10 z-10">
             <div class="inline-block px-3 py-1 mb-3 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                ${e.category || "Event"}
             </div>
             <h1 class="text-3xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight leading-tight max-w-4xl">${e.title}</h1>
             <p class="text-gray-300 text-lg mt-2 font-medium drop-shadow-md flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-violet-400"></i> ${e.college || "College Event"}
             </p>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="glow-card p-6 md:p-8">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="info" class="w-5 h-5 text-violet-500"></i>
               About This Event
            </h2>
          <div class="text-gray-300 space-y-4 leading-relaxed whitespace-pre-line text-sm md:text-base">
            ${e.description || "Join us for an immersive experience. Details coming soon."}
          </div>
        </div>

        <div class="glow-card p-6 md:p-8">
          <h2 class="text-xl font-bold text-white mb-4">
             <i data-lucide="map-pin" class="inline w-6 h-6 mr-2 text-violet-500"></i>
             Location
          </h2>
          <p class="text-lg font-medium text-white">${e.venue || "TBA"}</p>
          ${e.locationDetails ? `<p class="text-gray-400 text-sm mt-1">${e.locationDetails}</p>` : ""}
        </div>

        ${e.contacts && e.contacts.length > 0 ? `
        <div class="glow-card p-6 md:p-8">
           <h2 class="text-xl font-bold text-white mb-4">
              <i data-lucide="phone" class="inline w-6 h-6 mr-2 text-violet-500"></i>
              Contact
           </h2>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${e.contacts.slice(0, 4).map(contact => `
              <div class="flex items-start gap-3 group">
                 <div class="w-2 h-2 mt-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:scale-125 transition-transform duration-300"></div>
                 <div>
                    <p class="text-lg font-medium text-white leading-tight group-hover:text-violet-200 transition-colors">${contact.name || "Contact"}</p>
                    <p class="text-gray-400 text-sm mt-1 tracking-wide">${contact.number || ""}</p>
                 </div>
              </div>
              `).join('')}
           </div>
        </div>
        ` : ""}

        ${e.socialLinks && (e.socialLinks.instagram || e.socialLinks.facebook || e.socialLinks.x || e.socialLinks.website) ? `
        <div class="glow-card p-6 md:p-8">
           <h2 class="text-xl font-bold text-white mb-4">
              <i data-lucide="link" class="inline w-6 h-6 mr-2 text-violet-500"></i>
              Stay in the Loop
           </h2>
           <div class="flex flex-wrap gap-4">
              ${e.socialLinks.instagram ? `
                 <a href="${e.socialLinks.instagram}" target="_blank" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all text-gray-300 hover:text-white group">
                    <i data-lucide="instagram" class="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform"></i> Instagram
                 </a>` : ""}
              ${e.socialLinks.facebook ? `
                 <a href="${e.socialLinks.facebook}" target="_blank" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-gray-300 hover:text-white group">
                    <i data-lucide="facebook" class="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform"></i> Facebook
                 </a>` : ""}
              ${e.socialLinks.x ? `
                 <a href="${e.socialLinks.x}" target="_blank" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-gray-400/50 hover:bg-white/10 transition-all text-gray-300 hover:text-white group">
                    <i data-lucide="twitter" class="w-5 h-5 text-gray-300 group-hover:scale-110 transition-transform"></i> X (Twitter)
                 </a>` : ""}
              ${e.socialLinks.website ? `
                 <a href="${e.socialLinks.website}" target="_blank" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-green-400/50 hover:bg-white/10 transition-all text-gray-300 hover:text-white group">
                    <i data-lucide="globe" class="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform"></i> Website
                 </a>` : ""}
           </div>
        </div>
        ` : ""}

        <div class="glow-card p-6 md:p-8">
           <h2 class="text-xl font-bold text-white mb-4">Organized by</h2>
           <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg">
                ${organizerInitial}
              </div>
              <div>
                 <p class="text-white font-medium">${organizerName}</p>
                 ${e.organizerDetails ? `<p class="text-gray-400 text-xs">${e.organizerDetails}</p>` : ""}
              </div>
           </div>
        </div>
      </div>

      <div class="sticky top-28 h-fit">
        <div class="glow-card p-5 border border-white/10 rounded-2xl relative z-10">
            
            <div class="relative mb-4 group cursor-default">
                <div class="relative bg-transparent rounded-[10px] px-5 py-5 flex items-center justify-between overflow-hidden border border-white/10 transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-violet-300 font-extrabold tracking-widest uppercase mb-1">Total Price</span>
                        <span class="text-4xl font-black text-white drop-shadow-sm">
                            ${e.isPaid ? "₹" + e.price : "Free"}
                        </span>
                    </div>
                    <div class="p-2 rounded-lg border border-white/20">
                        <i data-lucide="ticket" class="w-6 h-6 text-violet-400"></i>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-transparent border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:bg-white/5 cursor-default">
                    <i data-lucide="users" class="w-4 h-4 text-violet-300 mb-2"></i>
                    <span class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Capacity</span>
                    <span class="text-white font-semibold text-sm mt-0.5 truncate w-full">${e.maxCapacity || "Open"}</span>
                </div>
                <div class="bg-transparent border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:bg-white/5 cursor-default">
                    <i data-lucide="calendar" class="w-4 h-4 text-violet-300 mb-2"></i>
                    <span class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Date</span>
                    <span class="text-white font-semibold text-sm mt-0.5 truncate w-full">${dateShort}</span>
                </div>
                <div class="bg-transparent border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:bg-white/5 cursor-default">
                    <i data-lucide="clock" class="w-4 h-4 text-violet-300 mb-2"></i>
                    <span class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Time</span>
                    <span class="text-white font-semibold text-sm mt-0.5 truncate w-full">${e.startTime || "TBA"}</span>
                </div>
            </div>

            ${bookButtonHtml}

            <button id="share-btn" class="w-full border border-white/10 bg-transparent text-gray-400 font-medium py-3 rounded-xl hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-2">
            <i data-lucide="share-2" class="w-4 h-4"></i>
            <span id="share-text">Share Event</span>
            </button>
        </div>
      </div>
    `;

    const cards = container.querySelectorAll('.glow-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    });

    const bookBtn = document.getElementById("detail-book-btn");
    if(bookBtn) {
        bookBtn.addEventListener("click", async (btnEvent) => {
          if (btnEvent.currentTarget.disabled) return; 

          if (!user) {
            if(window.showToast) window.showToast("Please login to book a pass.", "info");
            else alert("Please login to book a pass.");
            setTimeout(() => window.location.href = "../login/login.html", 1500);
            return;
          }

          const conf = confirm(`Confirm booking for "${e.title}" as ${user.name}?`);
          if (!conf) return;

          await attemptBooking(false); 
        });
    }

    async function attemptBooking(forceRebook) {
        const bookBtn = document.getElementById("detail-book-btn");
        const originalText = bookBtn.innerHTML;
        bookBtn.innerHTML = `<span class="animate-pulse">Processing...</span>`;
        bookBtn.disabled = true;

        try {
            const resB = await fetch("http://localhost:5000/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, eventId: e._id, forceRebook })
            });

            const result = await resB.json();
            
            if (result.success) {
                if(window.showToast) window.showToast("Booking successful! Opening ticket...", "success");
                else alert("Booking successful!");

                setTimeout(() => {
                  window.location.href = `../ticket/ticket.html?id=${result.bookingId}`;
                }, 1500);
            } else if (result.code === "ALREADY_BOOKED") {
                showRebookModal(result.existingBookingId);
                bookBtn.innerHTML = originalText;
                bookBtn.disabled = false;
            } else if (result.code === "MAX_REBOOK_LIMIT") {
                if(window.showToast) window.showToast(result.message, "error");
                else alert(result.message);
                bookBtn.innerHTML = originalText;
                bookBtn.disabled = false;
            } else {
                if(window.showToast) window.showToast(result.message || "Booking failed", "error");
                else alert(result.message || "Booking failed");
                bookBtn.innerHTML = originalText;
                bookBtn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            if(window.showToast) window.showToast("Network error", "error");
            bookBtn.innerHTML = originalText;
            bookBtn.disabled = false;
        }
    }

    function showRebookModal(existingBookingId) {
        const modalContainer = document.createElement('div');
        modalContainer.className = "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300";
        modalContainer.id = "rebook-warning-modal";

        modalContainer.innerHTML = `
            <div class="bg-[#181825] w-full max-w-md rounded-3xl overflow-hidden border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)] relative transform scale-100 transition-all">
                <div class="p-6 md:p-8 relative z-10 text-center">
                    <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <i data-lucide="alert-triangle" class="w-8 h-8 text-red-400"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white mb-2">Already Registered</h2>
                    <p class="text-gray-400 text-sm mb-6 leading-relaxed">
                        You have already booked a pass for this event.<br><br>
                        <strong class="text-red-400">Warning:</strong> Booking again will <span class="underline">cancel your previous ticket</span> and it will not be refunded.<br>
                        (Maximum 3 rebookings allowed)
                    </p>
                    
                    <div class="flex flex-col gap-3">
                        <button id="view-pass-btn" class="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors flex items-center justify-center gap-2">
                            <i data-lucide="ticket"></i> View Existing Pass
                        </button>
                        <button id="book-again-btn" class="w-full py-3 rounded-xl bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold transition-colors flex items-center justify-center gap-2">
                            <i data-lucide="rotate-ccw"></i> Cancel Old & Book Again
                        </button>
                        <button id="cancel-rebook-btn" class="w-full py-2 mt-2 text-gray-500 hover:text-white text-sm font-medium transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalContainer);
        lucide.createIcons();

        document.getElementById('view-pass-btn').addEventListener('click', () => {
            window.location.href = `../ticket/ticket.html?id=${existingBookingId}`;
        });

        document.getElementById('book-again-btn').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
            attemptBooking(true); 
        });

        document.getElementById('cancel-rebook-btn').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
    }

    const shareBtn = document.getElementById("share-btn");
    const shareText = document.getElementById("share-text");

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
        const url = window.location.href;

        navigator.clipboard.writeText(url).then(() => {
            const originalText = shareText.textContent;
            shareText.textContent = "Copied!";
            shareBtn.classList.add("border-green-500", "text-green-500");

            if(window.showToast) window.showToast("Link copied to clipboard", "success");

            setTimeout(() => {
            shareText.textContent = originalText;
            shareBtn.classList.remove("border-green-500", "text-green-500");
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
        });
    }

    lucide.createIcons();
  } catch (err) {
    console.log(err);
    container.innerHTML = `<p class="text-gray-300">Error loading event.</p>`;
  }
});