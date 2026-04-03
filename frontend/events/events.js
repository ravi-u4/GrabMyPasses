/* frontend/events/events.js */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("events-container");
  const filterContainer = document.getElementById("category-filters");
  const paginationContainer = document.getElementById("pagination-controls");
  
  let currentCategory = 'All';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 15;
  let searchTimeout; // For debouncing search requests

  // 1. Fetch Events from Backend API
  async function fetchEvents() {
    // Show Loading Skeletons
    container.innerHTML = Array(6).fill(0).map(() => `
      <div class="rounded-2xl bg-gray-900/60 border border-gray-800 overflow-hidden flex flex-col h-[340px]">
        <div class="h-44 w-full skeleton animate-pulse bg-gray-800"></div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div class="space-y-3">
             <div class="flex justify-between">
                <div class="h-4 w-20 bg-gray-800 rounded-full animate-pulse"></div>
                <div class="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
             </div>
             <div class="h-6 w-3/4 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div class="mt-4 space-y-2">
             <div class="h-4 w-1/2 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    `).join('');

    try {
      // Build API URL with parameters
      const url = new URL(window.location.origin + "/api/events");
      url.searchParams.append("page", currentPage);
      url.searchParams.append("limit", itemsPerPage);
      
      if (currentCategory !== 'All') {
        url.searchParams.append("category", currentCategory);
      }
      if (searchQuery.trim() !== '') {
        url.searchParams.append("search", searchQuery);
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        container.innerHTML = `<p class="text-gray-400 col-span-full text-center py-10">Failed to load events. Please try again.</p>`;
        return;
      }

      renderEvents(data.events);
      
      // Only re-render categories if we are on page 1 and not searching (prevents buttons from disappearing)
      if (currentPage === 1 && searchQuery === '') {
          renderCategoryFilters(data.categories || ['All']);
      }
      
      renderPagination(data.pagination);

    } catch (err) {
      console.error(err);
      container.innerHTML = `<p class="text-gray-400 col-span-full text-center py-10">Error loading events.</p>`;
    }
  }

  // 2. Render Events Card
  function renderEvents(list) {
    if (!list || list.length === 0) {
      container.innerHTML = `<p class="text-gray-400 col-span-full text-center py-10">No events found matching your criteria.</p>`;
      return;
    }

    container.innerHTML = "";
    
    list.forEach(event => {
      const eventDate = new Date(event.date);
      const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
      const day = eventDate.getDate();

      const imgUrl = event.bannerUrl 
        ? event.bannerUrl 
        : `https://placehold.co/600x400/1e1e2e/FFF?text=${encodeURIComponent(event.title)}`;
      
      const priceTag = event.isPaid ? `₹${event.price}` : "Free";

      const card = document.createElement("div");
      card.className =
        "rounded-2xl bg-gray-900/60 border border-gray-800 overflow-hidden flex flex-col " +
        "transition-transform duration-300 hover:-translate-y-1 hover:border-violet-500/60 " +
        "hover:shadow-[0_18px_40px_rgba(88,28,135,.65)] cursor-pointer group relative";

      card.innerHTML = `
        <div class="relative h-48 w-full overflow-hidden">
          <img src="${imgUrl}" alt="${event.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          
          <div class="absolute top-3 left-3 flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg text-white z-10">
             <span class="text-[10px] font-bold tracking-widest uppercase opacity-80">${month}</span>
             <span class="text-xl font-black leading-none">${day}</span>
          </div>

          <div class="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30 z-10 shadow-lg">
            ${priceTag}
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <div class="flex items-center gap-2 mb-3">
             <div class="w-6 h-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
               <i data-lucide="building-2" class="w-3 h-3"></i>
             </div>
             <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">
               ${event.college || "Organizer"}
             </span>
          </div>

          <h2 class="text-xl font-bold mb-3 text-white leading-tight group-hover:text-violet-300 transition-colors line-clamp-2">
            ${event.title}
          </h2>

          <div class="mt-auto space-y-3 pt-4 border-t border-gray-800/50">
             <div class="flex items-center gap-2 text-sm text-gray-400">
                <i data-lucide="map-pin" class="w-4 h-4 text-violet-500 shrink-0"></i>
                <span class="truncate">${event.venue || "To be announced"}</span>
             </div>
             <div class="flex items-center gap-2 text-sm text-gray-400">
                <i data-lucide="clock" class="w-4 h-4 text-violet-500 shrink-0"></i>
                <span>${event.startTime || "10:00 AM"}</span>
             </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `/events/detail.html?id=${event._id}`;
      });

      container.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // 3. Render Category Buttons
  function renderCategoryFilters(categories) {
    if (!filterContainer) return;
    
    filterContainer.innerHTML = categories.map(cat => {
      const activeClass = "bg-violet-600/20 border-violet-500 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]";
      const inactiveClass = "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]";

      return `
        <button 
          class="filter-btn px-5 py-2 rounded-full border text-sm transition-all duration-300 whitespace-nowrap cursor-pointer select-none
          ${cat === currentCategory ? activeClass : inactiveClass}"
          data-category="${cat}"
        >
          ${cat}
        </button>
      `;
    }).join('');

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        currentPage = 1; // Reset to page 1 on category change
        updateActiveFilterBtn();
        fetchEvents(); // Fetch from server
      });
    });
  }

  function updateActiveFilterBtn() {
    if (!filterContainer) return;
    const activeClass = "filter-btn px-5 py-2 rounded-full border text-sm transition-all duration-300 whitespace-nowrap cursor-pointer select-none bg-violet-600/20 border-violet-500 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]";
    const inactiveClass = "filter-btn px-5 py-2 rounded-full border text-sm transition-all duration-300 whitespace-nowrap cursor-pointer select-none bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]";

    const btns = filterContainer.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
      btn.className = (btn.dataset.category === currentCategory) ? activeClass : inactiveClass;
    });
  }

  // 4. Render Server-Side Pagination Controls
  function renderPagination(paginationData) {
    if (!paginationContainer || !paginationData) return;
    
    const { totalPages, currentPage: current } = paginationData;
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const createBtn = (label, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement("button");
        btn.className = `w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
          ${isActive 
            ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-violet-500" 
            : "bg-gray-800/50 text-gray-400 border border-white/10 hover:bg-violet-600/20 hover:text-white hover:border-violet-500/50"}
          ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
        `;
        
        if (label === 'Prev') btn.innerHTML = `<i data-lucide="chevron-left" class="w-4 h-4"></i>`;
        else if (label === 'Next') btn.innerHTML = `<i data-lucide="chevron-right" class="w-4 h-4"></i>`;
        else btn.textContent = label;

        if (!isDisabled && !isActive) {
            btn.addEventListener("click", () => {
                currentPage = page;
                fetchEvents(); // Fetch new page from server
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        return btn;
    };

    paginationContainer.appendChild(createBtn('Prev', current - 1, false, current === 1));

    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
       paginationContainer.appendChild(createBtn('1', 1, current === 1));
       if (startPage > 2) {
           const span = document.createElement("span");
           span.className = "text-gray-500 px-1";
           span.textContent = "...";
           paginationContainer.appendChild(span);
       }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createBtn(i, i, current === i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const span = document.createElement("span");
            span.className = "text-gray-500 px-1";
            span.textContent = "...";
            paginationContainer.appendChild(span);
        }
        paginationContainer.appendChild(createBtn(totalPages, totalPages, current === totalPages));
    }

    paginationContainer.appendChild(createBtn('Next', current + 1, false, current === totalPages));
    
    if (window.lucide) window.lucide.createIcons();
  }

  // 5. Global Search Listener with Debouncing
  document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "globalSearch") {
      clearTimeout(searchTimeout); // Clear previous timer
      
      // Wait 400ms after user stops typing before calling backend
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        currentPage = 1; // Reset to page 1 on new search
        fetchEvents();
      }, 400); 
    }
  });

  // Initial Data Load
  fetchEvents();
});