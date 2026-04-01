document.addEventListener("DOMContentLoaded", async () => {
  const card = document.getElementById("ticket-card");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    card.innerHTML = `<div class="glass-ticket p-10 text-center"><p class="text-gray-300">Invalid ticket link.</p></div>`;
    return;
  }

  try {
    const res = await fetch(`/api/bookings/${id}`);
    const data = await res.json();

    if (!data.success || !data.booking) {
      card.innerHTML = `<div class="glass-ticket p-10 text-center"><p class="text-gray-300">Ticket not found.</p></div>`;
      return;
    }

    const b = data.booking;
    const event = b.event;
    
    // Date Parsing for Calendar
    const eventDate = new Date(event.date);
    const startDateISO = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(eventDate.getTime() + (3 * 60 * 60 * 1000));
    const endDateISO = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.name || "Guest";
    const bookingID = String(b._id).slice(-8).toUpperCase();

    const statusColor =
      b.status === "confirmed"
        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        : b.status === "scanned"
        ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
        : "text-gray-400 border-gray-500/30 bg-gray-500/10";

    card.innerHTML = `
      <div class="glass-ticket group transition-all duration-500" id="ticket-content">
        <div class="flex-1 p-8 md:p-10 flex flex-col relative">
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center gap-3">
              <div class="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                <img src="/assets/only-logo.png" crossorigin="anonymous" alt="logo" class="h-6 w-auto">
              </div>
              <div>
                <h3 class="text-lg font-bold text-white leading-none">
                  GrabMy<span class="text-violet-500">Passes</span>
                </h3>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Official Pass</p>
              </div>
            </div>

            <div class="text-right hidden sm:block group/id cursor-pointer" id="copy-id-btn" title="Click to copy">
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Booking ID</p>
              <p class="font-mono text-violet-300 text-lg tracking-widest group-hover/id:text-white transition-colors flex items-center justify-end gap-2">
                <span id="booking-id-text">${bookingID}</span>
                <i data-lucide="copy" class="w-3 h-3 opacity-0 group-hover/id:opacity-100 transition-opacity"></i>
              </p>
            </div>
          </div>

          <div class="mb-8 relative z-10">
            <h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 leading-[1.1] mb-2 uppercase">
              ${event.title}
            </h1>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300">
              <span class="w-2 h-2 rounded-full bg-violet-500"></span>
              ${event.college || "College Event"}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 mt-auto pt-8 border-t border-white/10">
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Date & Time</p>
              <div class="flex items-center gap-2 text-gray-200">
                <i data-lucide="calendar-clock" class="w-4 h-4 text-violet-400"></i>
                <span class="font-semibold">${eventDate.toLocaleDateString()}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1 pl-6">${event.startTime || "10:00 AM"}</p>
            </div>

            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Location</p>
              <div class="flex items-center gap-2 text-gray-200">
                <i data-lucide="map-pin" class="w-4 h-4 text-violet-400"></i>
                <span class="font-semibold truncate max-w-[150px]">
                  ${event.venue || "TBA"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="perforation"></div>

        <div class="w-full md:w-[320px] p-8 md:p-10 bg-black/20 flex flex-col items-center justify-center relative">
          <div class="mb-6">
            <div class="px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusColor}">
              ${b.status}
            </div>
          </div>

          <div id="qr-target" class="bg-white p-2 rounded-xl shadow-2xl shadow-black/50 mb-6 inline-block overflow-hidden">
            <img
              src="${b.qrImage}"
              crossorigin="anonymous"
              alt="QR"
              class="w-40 h-40 object-contain"
              style="image-rendering: pixelated;"
            />
          </div>

          <div class="text-center mb-6">
            <p class="text-white font-bold text-lg">${userName}</p>
            <p class="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Pass Holder</p>
          </div>

          <div class="mt-auto w-full border-t border-dashed border-white/20 pt-4 flex justify-between items-center opacity-50">
            <img src="/assets/only-logo.png" crossorigin="anonymous" class="h-4 w-auto grayscale">
            <p class="font-mono text-[10px] tracking-widest">${bookingID}</p>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[850px] mx-auto" id="download-container">
        <a
          href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateISO}/${endDateISO}&details=${encodeURIComponent(
            "Ticket ID: " + bookingID
          )}&location=${encodeURIComponent(event.venue)}"
          target="_blank"
          class="flex items-center justify-center gap-2 bg-[#1e1e2e] border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-violet-300 transition-all active:scale-95"
        >
          <i data-lucide="calendar-plus" class="w-4 h-4"></i> Add to Calendar
        </a>

        <button
          id="download-btn"
          class="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-lg active:scale-95"
        >
          <i data-lucide="qr-code" class="w-4 h-4"></i> Download QR
        </button>

        <button
          id="share-btn"
          class="flex items-center justify-center gap-2 bg-[#1e1e2e] border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600/20 hover:border-emerald-500/50 hover:text-emerald-300 transition-all active:scale-95"
        >
          <i data-lucide="share-2" class="w-4 h-4"></i> Share Ticket
        </button>
      </div>
    `;

    lucide.createIcons();

    // --- INTERACTIVE TILT EFFECT ---
    const ticketElement = document.getElementById("ticket-content");
    if (ticketElement) {
      ticketElement.addEventListener("mousemove", (e) => {
        const rect = ticketElement.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        ticketElement.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px) scale(1.02)`;
        ticketElement.style.transition = "transform 0.1s ease-out";
      });

      ticketElement.addEventListener("mouseleave", () => {
        ticketElement.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)";
        ticketElement.style.transition = "transform 0.5s ease-in-out";
      });
    }

    // COPY BOOKING ID
    const copyBtn = document.getElementById("copy-id-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(bookingID);

        if (window.showToast) window.showToast("Booking ID Copied!", "success");

        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <p class="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Copied!</p>
          <p class="font-mono text-white text-lg tracking-widest">${bookingID}</p>
        `;

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          lucide.createIcons();
        }, 1500);
      });
    }

    // SHARE
    const shareBtn = document.getElementById("share-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const shareData = {
          title: "GrabMyPasses Ticket",
          text: `I'm going to ${event.title}! Check out my ticket.`,
          url: window.location.href,
        };

        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            navigator.clipboard.writeText(window.location.href);
            if (window.showToast) window.showToast("Ticket link copied!", "success");
          }
        } catch (err) {
          console.log("Share canceled");
        }
      });
    }

    // DOWNLOAD QR
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        if (typeof domtoimage === "undefined") {
          if (window.showToast) window.showToast("Library not loaded. Please refresh.", "error");
          else alert("Library not loaded.");
          return;
        }

        const qrElement = document.getElementById("qr-target");
        const originalText = downloadBtn.innerHTML;

        downloadBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Saving...`;
        lucide.createIcons();
        downloadBtn.disabled = true;

        const scale = 3;
        const style = {
          transform: "scale(" + scale + ")",
          transformOrigin: "top left",
          width: qrElement.offsetWidth + "px",
          height: qrElement.offsetHeight + "px",
        };

        const param = {
          height: qrElement.offsetHeight * scale,
          width: qrElement.offsetWidth * scale,
          quality: 1,
          style: style,
        };

        domtoimage
          .toPng(qrElement, param)
          .then(function (dataUrl) {
            const link = document.createElement("a");
            const safeTitle = (event.title || "pass").replace(/[^a-z0-9]/gi, "-").toLowerCase();
            link.download = `QR-${safeTitle}.png`;
            link.href = dataUrl;
            link.click();

            if (window.showToast) window.showToast("QR Saved Successfully!", "success");

            downloadBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-green-600"></i> Saved!`;
            lucide.createIcons();

            setTimeout(() => {
              downloadBtn.innerHTML = originalText;
              downloadBtn.disabled = false;
              lucide.createIcons();
            }, 2000);
          })
          .catch(function (error) {
            console.error("Error:", error);
            if (window.showToast) window.showToast("Error saving image.", "error");
            downloadBtn.innerHTML = "Error";
            setTimeout(() => {
              downloadBtn.disabled = false;
              downloadBtn.innerHTML = originalText;
              lucide.createIcons();
            }, 2000);
          });
      });
    }
  } catch (err) {
    console.log(err);
    card.innerHTML = `<div class="glass-ticket p-10 text-center"><p class="text-gray-300">Error loading ticket.</p></div>`;
  }
});