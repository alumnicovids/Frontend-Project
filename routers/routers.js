const routes = {
  "/": "/pages/home.html",
  "/couple-villas": "/pages/couple.html",
  "/family-villas": "/pages/family.html",
  "/promo-villas": "/pages/promo.html",
  "/Detailed-Property": "/pages/detail.html",
  "/Booking": "/pages/booking.html",
  "/my-booking": "/pages/my-booking.html",
  "/setting": "/pages/setting.html",
  "/wishlist": "/pages/wishlist.html",
  "/compare": "/pages/compare.html",
};

async function redirect() {
  const hash = window.location.hash || "#/";
  const pathWithQuery = hash.slice(1);
  const path = pathWithQuery.split("?")[0];
  const route = routes[path] || routes["/"];

  try {
    const response = await fetch(route);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();

    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = html;
      window.scrollTo(0, 0);

      if (path === "/" || path === "") {
        if (typeof renderVillas === "function") renderVillas();
      }

      if (path === "/couple-villas") {
        if (typeof renderVillas === "function") renderVillas("Couple Villa");
      }

      if (path === "/family-villas") {
        if (typeof renderVillas === "function") renderVillas("Family Villa");
      }

      if (path === "/promo-villas") {
        if (typeof renderVillas === "function") renderVillas("promo");
      }

      if (path === "/Detailed-Property") {
        if (typeof renderVillaDetail === "function") renderVillaDetail();
      }

      if (path === "/compare") {
        if (typeof window.initCompare === "function") {
          setTimeout(() => window.initCompare(), 50);
        }
      }

      if (path === "/Booking") {
        if (typeof initBooking === "function") {
          setTimeout(() => initBooking(), 50);
        }
      }

      if (path === "/my-booking") {
        if (typeof renderMyBookings === "function") {
          setTimeout(() => renderMyBookings(), 50);
        }
      }

      if (path === "/setting") {
        if (typeof initSetting === "function") initSetting();
      }

      if (path === "/wishlist") {
        renderWishlist();
      }
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      const parentLi = link.parentElement;
      parentLi.classList.remove("active");

      if (link.getAttribute("href") === hash.split("?")[0]) {
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
    console.error("Routing error:", error);
    const contentDiv = document.getElementById("content");
    if (contentDiv) contentDiv.innerHTML = "<h2>404 - Page Not Found</h2>";
  }
}

window.addEventListener("hashchange", redirect);
window.addEventListener("load", redirect);

export { redirect };
