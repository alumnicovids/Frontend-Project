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
    if (!response.ok) throw new Error();
    const html = await response.text();
    document.getElementById("content").innerHTML = html;

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.parentElement.classList.remove("active");
      if (link.getAttribute("href") === hash) {
        link.parentElement.classList.add("active");
      }
    });
  } catch (error) {
    document.getElementById("content").innerHTML =
      "<h2>404</h2><p>Page not found.</p>";
  }
}

window.addEventListener("hashchange", redirect);
window.addEventListener("DOMContentLoaded", redirect);
