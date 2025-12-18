document.addEventListener("click", (e) => {
  const link = e.target.closest(".nav-link");
  if (link) {
    e.preventDefault();
    const href = link.getAttribute("href");
    window.history.pushState({}, "", href);
    redirect();
  }
});

const routes = {
  "/": "/pages/home.html",
  "/luxury-villas": "/pages/luxury.html",
  "/family-villas": "/pages/family.html",
  "/promo-villas": "/pages/promo.html",
  "/Detailed-Property": "/pages/detail.html",
  "/Booking": "/pages/booking.html",
  "/my-booking": "/pages/my-booking.html",
  "/setting": "/pages/setting.html",
  "/wishlist": "/pages/whislist.html",
};

async function redirect() {
  const path = window.location.pathname;
  const route = routes[path] || routes["/"];

  try {
    const response = await fetch(route);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();
    document.getElementById("content").innerHTML = html;
  } catch (error) {
    document.getElementById("content").innerHTML =
      "<h2>404</h2><p>Page not found.</p>";
  }
}

window.onpopstate = redirect;
window.addEventListener("DOMContentLoaded", redirect);
