/* frontend/events/events.js */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("events-container");
  const filterContainer = document.getElementById("category-filters");
  const paginationContainer = document.getElementById("pagination-controls");
  
  let events = [];
  let currentCategory = 'All';
  let searchQuery = '';
  
  // Pagination State
  let currentPage = 1;
  const itemsPerPage = 15;

  // 1. Render Events Card
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
          <img src="${imgUrl}" alt="${event.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          
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

    lucide.createIcons();
  }

  // 2. Logic to generate category buttons dynamically
  function renderCategoryFilters(allEvents) {
    const categories = ['All', ...new Set(allEvents.map(e => e.category).filter(Boolean))];
    
    if (filterContainer) {
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
          currentPage = 1; 
          updateActiveFilterBtn();
          applyFilters();
        });
      });
    }
  }

  function updateActiveFilterBtn() {
    if (!filterContainer) return;
    const activeClass = "filter-btn px-5 py-2 rounded-full border text-sm transition-all duration-300 whitespace-nowrap cursor-pointer select-none bg-violet-600/20 border-violet-500 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]";
    const inactiveClass = "filter-btn px-5 py-2 rounded-full border text-sm transition-all duration-300 whitespace-nowrap cursor-pointer select-none bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-violet-500/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]";

    const btns = filterContainer.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
      if (btn.dataset.category === currentCategory) {
        btn.className = activeClass;
      } else {
        btn.className = inactiveClass;
      }
    });
  }

  // 3. Render Pagination Controls
  function renderPagination(totalItems) {
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
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

        if (!isDisabled) {
            btn.addEventListener("click", () => {
                currentPage = page;
                applyFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        return btn;
    };

    paginationContainer.appendChild(createBtn('Prev', currentPage - 1, false, currentPage === 1));

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
       paginationContainer.appendChild(createBtn('1', 1, currentPage === 1));
       if (startPage > 2) {
           const span = document.createElement("span");
           span.className = "text-gray-500 px-1";
           span.textContent = "...";
           paginationContainer.appendChild(span);
       }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createBtn(i, i, currentPage === i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const span = document.createElement("span");
            span.className = "text-gray-500 px-1";
            span.textContent = "...";
            paginationContainer.appendChild(span);
        }
        paginationContainer.appendChild(createBtn(totalPages, totalPages, currentPage === totalPages));
    }

    paginationContainer.appendChild(createBtn('Next', currentPage + 1, false, currentPage === totalPages));
    
    lucide.createIcons();
  }

  // 4. Central Filter & Pagination Logic
  function applyFilters() {
    let filtered = events;

    if (currentCategory !== 'All') {
      filtered = filtered.filter(e => e.category === currentCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.college || "").toLowerCase().includes(q) ||
        (e.venue || "").toLowerCase().includes(q)
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > totalPages) currentPage = 1;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = filtered.slice(startIndex, startIndex + itemsPerPage);

    renderEvents(paginatedEvents);
    renderPagination(totalItems);
  }

  function handleSearch(query) {
    searchQuery = query;
    currentPage = 1; 
    applyFilters();
  }

  try {
    container.innerHTML = Array(6).fill(0).map(() => `
      <div class="rounded-2xl bg-gray-900/60 border border-gray-800 overflow-hidden flex flex-col h-[340px]">
        <div class="h-44 w-full skeleton"></div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div class="space-y-3">
             <div class="flex justify-between">
                <div class="h-4 w-20 skeleton rounded-full"></div>
                <div class="h-4 w-24 skeleton"></div>
             </div>
             <div class="h-6 w-3/4 skeleton"></div>
          </div>
          <div class="mt-4 space-y-2">
             <div class="h-4 w-1/2 skeleton"></div>
             <div class="h-4 w-1/3 skeleton"></div>
          </div>
        </div>
      </div>
    `).join('');

    const res = await fetch("/api/events");
    const data = await res.json();

    if (!data.success || !data.events) {
      container.innerHTML = `<p class="text-gray-400">Failed to load events.</p>`;
      return;
    }

    // ✅ FILTER OUT PAST / EXPIRED EVENTS SO THEY DON'T SHOW PUBLICLY
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    events = data.events.filter(e => {
      const evDate = new Date(e.date);
      const evDateOnly = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());
      return evDateOnly >= today; // Keep only events happening today or in the future
    });
    
    renderCategoryFilters(events);
    applyFilters();

    document.addEventListener("input", (e) => {
      if (e.target && e.target.id === "globalSearch") {
        handleSearch(e.target.value);
      }
    });
  } catch (err) {
    console.log(err);
    container.innerHTML = `<p class="text-gray-400">Error loading events.</p>`;
  }
});