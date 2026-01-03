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
  "/": () => {
    renderVillas();
    initSearch();
  },
  "/details": () => renderVillaDetail(),
  "/couple-villas": () => {
    renderVillas("Couple Villa");
    initSearch();
  },
  "/family-villas": () => {
    renderVillas("Family Villa");
    initSearch();
  },
  "/promo-villas": () => {
    renderVillas("promo");
    initSearch();
  },
  "/compare": () =>
    typeof window.initCompare === "function" && window.initCompare(),
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
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      const parentLi = link.parentElement;
      parentLi.classList.remove("active");

      const currentPath = hash.split("?")[0];
      if (link.getAttribute("href") === currentPath) {
        parentLi.classList.add("active");
        const subMenu = link.closest(".sub-menu");
        if (subMenu) {
          subMenu.classList.add("show");
          const dropdownBtn = subMenu.previousElementSibling;
          if (dropdownBtn) dropdownBtn.classList.add("rotate");
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}

window.addEventListener("hashchange", redirect);
window.addEventListener("load", redirect);
