const routes = {
  "/": "/pages/home.html",
  "/couple-villas": "/pages/couple.html",
  "/family-villas": "/pages/family.html",
  "/promo-villas": "/pages/promo.html",
  "/Detailed-Property": "/pages/detail.html",
  "/Booking": "/pages/booking.html",
  "/my-booking": "/pages/my-booking.html",
  "/setting": "/pages/setting.html",
  "/wishlist": "/pages/whislist.html",
  "/compare": "/pages/compare.html",
};

async function redirect() {
  const hash = window.location.hash || "#/";
  const path = hash.slice(1);
  const route = routes[path] || routes["/"];

  try {
    const response = await fetch(route);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();

    const contentDiv = document.getElementById("content");
    if (contentDiv) {
      contentDiv.innerHTML = html;

      if (path === "/" || path === "") {
        if (typeof renderVillas === "function") {
          renderVillas();
        }
      }
      if (path === "/couple-villas") {
        if (typeof renderVillas === "function") {
          renderVillas("Couple Villa");
        }
      }
      if (path === "/family-villas") {
        if (typeof renderVillas === "function") {
          renderVillas("Family Villa");
        }
      }
      if (path === "/promo-villas") {
        if (typeof renderVillas === "function") {
          renderVillas("promo");
        }
      }
      if (path === "/setting") {
        if (typeof initSetting === "function") {
          initSetting();
        }
      }
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      const parentLi = link.parentElement;
      parentLi.classList.remove("active");

      if (link.getAttribute("href") === hash) {
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
    document.getElementById("content").innerHTML =
      "<h2>404</h2><p>Page not found.</p>";
  }
}

window.addEventListener("hashchange", redirect);
window.addEventListener("DOMContentLoaded", redirect);
