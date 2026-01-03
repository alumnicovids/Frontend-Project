const toggleButton = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");
const searchInput = document.getElementById("search-input");
let currentSearchQuery = "";

function toggleSidebar() {
  sidebar.classList.toggle("close");
  toggleButton.classList.toggle("rotate");
  closeAllSubMenu();
}

function toggleSubMenu(button) {
  if (!button.nextElementSibling.classList.contains("show")) closeAllSubMenu();
  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");
  if (sidebar.classList.contains("close")) {
    sidebar.classList.remove("close");
    toggleButton.classList.remove("rotate");
  }
}

function closeAllSubMenu() {
  Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
    ul.classList.remove("show");
    ul.previousElementSibling.classList.remove("rotate");
  });
}

async function getVillas() {
  const response = await fetch("/JSON/villas.json");
  return await response.json();
}

function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function createVillaCard(villa, wishlist) {
  const isWishlisted = wishlist.some((item) => item.name === villa.name);
  const hasPromo = villa.promo && villa.promo.status === "active";
  const discountedPrice = hasPromo
    ? villa.price * (1 - parseInt(villa.promo.disc) / 100)
    : villa.price;

  return `
    <article class="card">
      <div class="card-image">
        <img src="${villa.image[0]}" alt="${villa.name}" />
        ${
          hasPromo
            ? `<span class="promo-badge">${villa.promo.disc} OFF</span>`
            : ""
        }
        <button class="wishlist-btn ${
          isWishlisted ? "active" : ""
        }" data-name="${villa.name}">
          <i class="material-symbols-outlined">favorite</i>
        </button>
      </div>
      <div class="card-content">
        <div class="card-header">
          <span class="tag">${villa.tag}</span>
          <div class="rating"><i class="material-symbols-outlined">star</i><span>${
            villa.rating
          }</span></div>
        </div>
        <a href="#/details?name=${encodeURIComponent(
          villa.name
        )}" class="villa-title">${villa.name}</a>
        <p class="location"><i class="material-symbols-outlined">location_on</i>${
          villa.location
        }</p>
        <div class="amenities">
          <span><i class="material-symbols-outlined">bed</i> ${
            villa.amenities.bed
          }</span>
          <span><i class="material-symbols-outlined">bathtub</i> ${
            villa.amenities.bathtub
          }</span>
          <span><i class="material-symbols-outlined">pool</i> ${
            villa.amenities.pool ? "Yes" : "No"
          }</span>
        </div>
        <div class="card-footer">
          <div class="price-container">
            ${
              hasPromo
                ? `<span class="original-price">${formatIDR(
                    villa.price
                  )}</span>`
                : ""
            }
            <span class="price">${formatIDR(discountedPrice)}</span>
            <span class="unit">/night</span>
          </div>
          <div class="action-buttons">
            <button class="secondary-btn compare" title="Compare" onclick="addToCompare('${
              villa.name
            }')">
              <i class="material-symbols-outlined">compare_arrows</i>
            </button>
            <button class="primary-btn book">
              <a href="#/booking?name=${encodeURIComponent(
                villa.name
              )}" class="nav-link">Book Now</a>
            </button>
          </div>
        </div>
      </div>
    </article>`;
}

async function renderVillaDetail() {
  const hash = window.location.hash;
  const queryString = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(queryString);
  const villaName = params.get("name");
  const container = document.getElementById("villa-detail-content");

  if (!container || !villaName) return;

  const data = await getVillas();
  const villa = data.find((v) => v.name === decodeURIComponent(villaName));

  if (!villa) {
    container.innerHTML = "<p>Villa not found.</p>";
    return;
  }

  const images = Array.isArray(villa.image) ? villa.image : [villa.image];

  container.innerHTML = `
    <div class="header-section">
      <h2>${villa.name}</h2>
      <div class="location detail">
        <i class="material-symbols-outlined">location_on</i>
        <span class="location detail">${villa.detail.address}</span>
      </div>
    </div>

    <div class="gallery-grid">
      ${images
        .map(
          (img, i) => `
        <img src="${img}" alt="${villa.name}" tabindex="0" class="${
            i === 0 ? "active" : ""
          }">
      `
        )
        .join("")}
    </div>

    <div class="info-section">
      <div class="main-info">
        <div class="description-card">
          <h3>Property Description</h3>
          <p>${villa.detail.description}</p>
          <div class="amenities-summary">
            <span><i class="material-symbols-outlined">bed</i> ${
              villa.amenities.bed
            } Bed</span>
            <span><i class="material-symbols-outlined">bathtub</i> ${
              villa.amenities.bathtub
            } Bath</span>
            ${
              villa.amenities.pool
                ? '<span><i class="material-symbols-outlined">pool</i> Private Pool</span>'
                : ""
            }
          </div>
        </div>

        <div class="rooms-section">
          <h3>Room Type & Price</h3>
          <div class="rooms-grid">
            ${villa.rooms
              .map(
                (room) => `
              <div class="room-item-card">
                <div class="room-info">
                  <h4>${room.type}</h4>
                  <p>${room.description}</p>
                </div>
                <div class="room-price">
                  <span class="price detail">${formatIDR(room.price)}</span>
                  <span class="unit">/night</span>
                </div>
              </div>`
              )
              .join("")}
          </div>
        </div>

        <div class="facilities-grid">
          <h3>Facility</h3>
          <ul>
            ${villa.detail.facilities
              .map(
                (f) => `
              <li><i class="material-symbols-outlined">check_circle</i> ${f}</li>
            `
              )
              .join("")}
          </ul>
        </div>
      </div>

      <div class="sidebar-info">
        <div class="price-card">
          <span class="price-range">${villa.detail.priceRange}</span>
          <p class="room-type">${villa.detail.roomType}</p>
          <button class="primary-btn detail confirm">
            <a href="#/Booking?name=${encodeURIComponent(
              villa.name
            )}">Book Now</a>
          </button>
        </div>
        <div class="nearby-card">
          <h3>Nearby Places</h3>
          <ul>
            ${villa.detail.nearbyPlaces
              .map(
                (p) => `
              <li><i class="material-symbols-outlined">explore</i> ${p}</li>
            `
              )
              .join("")}
          </ul>
        </div>
        <div class="policy-card">
          <h3>Policy</h3>
          <p><strong>Check-in:</strong> ${villa.detail.checkInTime}</p>
          <p><strong>Check-out:</strong> ${villa.detail.checkOutTime}</p>
          <p class="cancel-policy">${villa.detail.cancellationPolicy}</p>
        </div>
      </div>
    </div>`;

  const gallery = document.querySelector(".gallery-grid");
  if (gallery) setupInfiniteScroll(gallery);
}

function setupInfiniteScroll(gallery) {
  const items = [...gallery.querySelectorAll("img")];
  if (items.length < 2) return;

  gallery.querySelectorAll(".clone").forEach((el) => el.remove());
  const firstClone = items[0].cloneNode(true);
  const lastClone = items[items.length - 1].cloneNode(true);
  firstClone.classList.add("clone");
  lastClone.classList.add("clone");

  gallery.appendChild(firstClone);
  gallery.insertBefore(lastClone, items[0]);

  const gap = 20;
  const itemWidth = items[0].offsetWidth + gap;
  gallery.scrollLeft = itemWidth;

  let isResetting = false;
  gallery.addEventListener("scroll", () => {
    if (isResetting) return;
    const scrollPos = gallery.scrollLeft;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth - 5;

    if (scrollPos <= 0) {
      isResetting = true;
      gallery.style.scrollBehavior = "auto";
      gallery.scrollLeft =
        gallery.scrollWidth - gallery.clientWidth - itemWidth;
      setTimeout(() => {
        gallery.style.scrollBehavior = "smooth";
        isResetting = false;
      }, 50);
    } else if (scrollPos >= maxScroll) {
      isResetting = true;
      gallery.style.scrollBehavior = "auto";
      gallery.scrollLeft = itemWidth;
      setTimeout(() => {
        gallery.style.scrollBehavior = "smooth";
        isResetting = false;
      }, 50);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gallery
            .querySelectorAll("img")
            .forEach((img) => img.classList.remove("active"));
          entry.target.classList.add("active");
        }
      });
    },
    { root: gallery, threshold: 0.6 }
  );

  gallery.querySelectorAll("img").forEach((img) => observer.observe(img));
}

function initSearch(filterType) {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.value = currentSearchQuery;

  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.toLowerCase();
    renderVillas(filterType, currentSearchQuery);
  });
}

async function renderVillas(filterType = null, searchQuery = "") {
  const villaData = await getVillas();
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const container = document.querySelector(".villa-list");

  if (!container) return;

  let filtered = villaData;

  if (filterType === "promo") {
    filtered = villaData.filter((v) => v.promo?.status === "active");
  } else if (filterType) {
    filtered = villaData.filter((v) => v.tag === filterType);
  }

  if (searchQuery) {
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(searchQuery) ||
        v.location.toLowerCase().includes(searchQuery) ||
        v.tag.toLowerCase().includes(searchQuery)
    );
  }

  container.innerHTML = filtered.length
    ? filtered.map((v) => createVillaCard(v, wishlist)).join("")
    : `<div>
        <p>Vila tidak ditemukan.</p>
      </div>`;
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.toLowerCase();

    const hash = window.location.hash || "#/";
    const path = hash.split("?")[0].replace("#", "");

    let filterType = null;
    if (path === "/promo-villas") filterType = "promo";
    else if (path === "/couple-villas") filterType = "Couple Villa";
    else if (path === "/family-villas") filterType = "Family Villa";

    renderVillas(filterType, currentSearchQuery);
  });
}

window.addToCompare = async function (name) {
  const data = await getVillas();
  const villa = data.find((v) => v.name === name);
  if (villa) {
    let list = JSON.parse(localStorage.getItem("compareList")) || [null, null];
    list[0] = list[1];
    list[1] = villa;
    localStorage.setItem("compareList", JSON.stringify(list));
    window.location.hash = "#/compare";
  }
};

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".wishlist-btn");
  if (!btn) return;

  const name = btn.dataset.name;
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const index = wishlist.findIndex((v) => v.name === name);

  if (index === -1) {
    const data = await getVillas();
    const villa = data.find((v) => v.name === name);
    if (villa) wishlist.push(villa);
    btn.classList.add("active");
  } else {
    wishlist.splice(index, 1);
    btn.classList.remove("active");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));

  if (window.location.hash.includes("/wishlist")) {
    renderWishlist();
  }
});

function renderWishlist() {
  const container = document.querySelector(".wishlist-container");
  if (!container) return;

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (wishlist.length === 0) {
    container.innerHTML = "<p>Wishlist is empty</p>";
    return;
  }

  container.innerHTML = wishlist
    .map((v) => createVillaCard(v, wishlist))
    .join("");
}
