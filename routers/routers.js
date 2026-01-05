const routes = {
  // ... mapping path URL ke file fisik HTML di folder pages
  "/": "/pages/home.html",
  "/couple-villas": "/pages/couple.html",
  "/family-villas": "/pages/family.html",
  "/promo-villas": "/pages/promo.html",
  "/details": "/pages/detail.html",
  "/booking": "/pages/booking.html",
  "/my-booking": "/pages/my-booking.html",
  "/setting": "/pages/setting.html",
  "/wishlist": "/pages/wishlist.html",
  "/compare": "/pages/compare.html",
};

const routeInits = {
  // Mapping fungsi inisialisasi yang dijalankan setelah HTML berhasil dimuat
  "/": () => renderVillas(),
  "/details": () => renderVillaDetail(),
  "/couple-villas": () => renderVillas("Couple Villa"),
  "/family-villas": () => renderVillas("Family Villa"),
  "/promo-villas": () => renderVillas("promo"),
  "/compare": () => typeof initCompare === "function" && initCompare(),
  "/booking": () => typeof initBooking === "function" && initBooking(),
  "/my-booking": () =>
    typeof renderMyBookings === "function" && renderMyBookings(),
  "/setting": () => typeof initSetting === "function" && initSetting(),
  "/wishlist": () => renderWishlist(),
};

async function redirect() {
  // Mengambil hash (misal: #/details) dan memisahkan parameter query (?name=...)
  const hash = window.location.hash || "#/";
  const [path] = hash.slice(1).split("?");
  const route = routes[path] || routes["/"];

  try {
    // Ajax fetch untuk memuat konten HTML secara dinamis tanpa reload halaman (SPA)
    const response = await fetch(route);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();

    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = html;
      window.scrollTo(0, 0);

      // Menjalankan fungsi JS khusus untuk halaman tersebut (misal: rendervillas())
      if (routeInits[path]) {
        routeInits[path]();
      }

      // Re-inisialisasi pencarian jika input search ada di halaman baru
      if (document.getElementById("search-input")) {
        initSearch();
      }
    }

    updateActiveNavLink(hash);
  } catch (error) {
    console.error(error);
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = `<div class="error-state"><p>Failed to load page. Please try again.</p></div>`;
    }
  }
}

function updateActiveNavLink(hash) {
  const currentPath = hash.split("?")[0];

  document.querySelectorAll(".nav-link").forEach((link) => {
    const parentLi = link.parentElement;
    const isMatch = link.getAttribute("href") === currentPath;

    parentLi.classList.toggle("active", isMatch);

    if (isMatch) {
      const subMenu = link.closest(".sub-menu");
      if (subMenu) {
        subMenu.classList.add("show");
        const dropdownBtn = subMenu.previousElementSibling;
        if (dropdownBtn) dropdownBtn.classList.add("rotate");
      }
    }
  });
}

// Event listener untuk mendeteksi perubahan URL (hash) atau saat refresh
window.addEventListener("hashchange", redirect);
window.addEventListener("load", redirect);
