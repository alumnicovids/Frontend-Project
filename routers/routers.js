const routes = {
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
  const hash = window.location.hash || "#/";
  const [path] = hash.slice(1).split("?");
  const route = routes[path] || routes["/"];

  try {
    const response = await fetch(route);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();

    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = html;
      window.scrollTo(0, 0);
      if (routeInits[path]) routeInits[path]();
      if (
        typeof initSearch === "function" &&
        document.getElementById("search-input")
      ) {
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

window.addEventListener("hashchange", redirect);
window.addEventListener("load", redirect);
