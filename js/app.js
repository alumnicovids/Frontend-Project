const toggleButton = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");

function toggleSidebar() {
  sidebar.classList.toggle("close");
  toggleButton.classList.toggle("rotate");

  closeAllSubMenu();
}

function toggleSubMenu(button) {
  if (!button.nextElementSibling.classList.contains("show")) {
    closeAllSubMenu();
  }

  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");

  if (sidebar.classList.contains("close")) {
    sidebar.classList.toggle("close");
    toggleButton.classList.toggle("rotate");
  }
}

function closeAllSubMenu() {
  Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
    ul.classList.remove("show");
    ul.previousElementSibling.classList.remove("rotate");
  });
}

function renderVillas(filterType = null) {
  fetch("/JSON/villas.json")
    .then((response) => response.json())
    .then((villaData) => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const container = document.querySelector(".villa-list");
      if (!container) return;

      let filteredData = villaData;
      if (filterType === "promo") {
        filteredData = villaData.filter(
          (villa) => villa.promo && villa.promo.status === "active"
        );
      } else if (filterType) {
        filteredData = villaData.filter((villa) => villa.tag === filterType);
      }

      container.innerHTML = filteredData
        .map((villa) => {
          const isWishlisted = wishlist.some(
            (item) => item.name === villa.name
          );
          const hasPromo = villa.promo && villa.promo.status === "active";
          const discountPercent = hasPromo ? parseInt(villa.promo.disc) : 0;
          const discountedPrice = hasPromo
            ? villa.price * (1 - discountPercent / 100)
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
            <button class="wishlist-btn ${isWishlisted ? "active" : ""}">
              <i class="material-symbols-outlined">favorite</i>
            </button>
          </div>
          <div class="card-content">
            <div class="card-header">
              <span class="tag">${villa.tag}</span>
              <div class="rating">
                <i class="material-symbols-outlined">star</i>
                <span>${villa.rating}</span>
              </div>
            </div>
            <a href="#/Detailed-Property?name=${encodeURIComponent(
              villa.name
            )}" class="villa-title">${villa.name}</a>
            <p class="location">
              <i class="material-symbols-outlined">location_on</i>
              ${villa.location}
            </p>
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
                    ? `<span class="original-price">IDR ${villa.price.toLocaleString(
                        "id-ID"
                      )}</span>`
                    : ""
                }
                <span class="price">IDR ${discountedPrice.toLocaleString(
                  "id-ID"
                )}</span>
                <span class="unit">/night</span>
              </div>
              <div class="action-buttons">
                <button class="secondary-btn compare" title="Compare">
                  <i class="material-symbols-outlined">compare_arrows</i>
                </button>
                <button class="primary-btn book">
                  <a href="#/Booking?name=${encodeURIComponent(
                    villa.name
                  )}" class="nav-link">Book Now</a>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
        })
        .join("");
    })
    .catch((error) => console.error("Error loading JSON:", error));
}

function renderVillaDetail() {
  const params = new URLSearchParams(window.location.hash.split("?")[1]);
  const villaName = params.get("name");
  const container = document.getElementById("villa-detail-content");

  if (!container || !villaName) return;

  fetch("/JSON/villas.json")
    .then((res) => res.json())
    .then((data) => {
      const villa = data.find((v) => v.name === villaName);

      if (villa) {
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
                (img, index) => `
            <img src="${img}" alt="${villa.name}" tabindex="0" class="${
                  index === 0 ? "active" : ""
                }">
            `
              )
              .join("")}
          </div>

          <div class="info-section">
            <div class="main-info">
              <div class="description-card">
                <h3>Deskripsi Properti</h3>
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
                <h3>Tipe Kamar & Harga</h3>
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
                        <span class="price detail">IDR ${room.price.toLocaleString(
                          "id-ID"
                        )}</span>
                        <span class="unit">/night</span>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>

              <div class="facilities-grid">
                <h3>Fasilitas</h3>
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
                <button class="primary-btn detail">
                  <a href="#/Booking?name=${encodeURIComponent(
                    villa.name
                  )}">Book Now</a>
                </button>
              </div>

              <div class="nearby-card">
                <h3>Tempat Terdekat</h3>
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
                <h3>Kebijakan</h3>
                <p><strong>Check-in:</strong> ${villa.detail.checkInTime}</p>
                <p><strong>Check-out:</strong> ${villa.detail.checkOutTime}</p>
                <p class="cancel-policy">${villa.detail.cancellationPolicy}</p>
              </div>
            </div>
          </div>
        `;
      }

      const observerOptions = {
        root: document.querySelector(".gallery-grid"),
        threshold: 0.7,
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.parentElement
              .querySelectorAll("img")
              .forEach((img) => img.classList.remove("active"));
            entry.target.classList.add("active");
          }
        });
      }, observerOptions);

      document
        .querySelectorAll(".gallery-grid img")
        .forEach((img) => observer.observe(img));
      const gallery = document.querySelector(".gallery-grid");
      if (gallery) setupInfiniteScroll(gallery);
    });
}

function setupInfiniteScroll(gallery) {
  const items = [...gallery.querySelectorAll("img")];
  if (items.length < 2) return;

  const firstClone = items[0].cloneNode(true);
  const lastClone = items[items.length - 1].cloneNode(true);

  gallery.appendChild(firstClone);
  gallery.insertBefore(lastClone, items[0]);

  const itemWidth = items[0].offsetWidth + 20;
  gallery.scrollLeft = itemWidth;

  gallery.addEventListener("scroll", () => {
    const scrollPos = gallery.scrollLeft;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;

    if (scrollPos <= 0) {
      gallery.style.scrollBehavior = "auto";
      gallery.scrollLeft =
        gallery.scrollWidth - (gallery.clientWidth + itemWidth);
    } else if (scrollPos >= maxScroll) {
      gallery.style.scrollBehavior = "auto";
      gallery.scrollLeft = itemWidth;
    } else {
      gallery.style.scrollBehavior = "smooth";
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

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".wishlist-btn");
  if (btn) {
    const card = btn.closest(".card");
    const villaName = card.querySelector(".villa-title").innerText;

    btn.classList.toggle("active");

    fetch("/JSON/villas.json")
      .then((res) => res.json())
      .then((data) => {
        const villa = data.find((v) => v.name === villaName);
        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        const index = wishlist.findIndex((item) => item.name === villa.name);

        if (index === -1) {
          wishlist.push(villa);
        } else {
          wishlist.splice(index, 1);
        }
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      });
  }
});

function renderWishlist() {
  const container = document.querySelector(".wishlist-container");
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (!container) return;

  if (wishlist.length === 0) {
    container.innerHTML = "<p>Wishlist kosong</p>";
    return;
  }

  container.innerHTML = wishlist
    .map((villa) => {
      const isWishlisted = true;
      const hasPromo = villa.promo && villa.promo.status === "active";
      const discountPercent = hasPromo ? parseInt(villa.promo.disc) : 0;
      const discountedPrice = hasPromo
        ? villa.price * (1 - discountPercent / 100)
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
          <button class="wishlist-btn ${isWishlisted ? "active" : ""}">
            <i class="material-symbols-outlined">favorite</i>
          </button>
        </div>
        <div class="card-content">
          <div class="card-header">
            <span class="tag">${villa.tag}</span>
            <div class="rating">
              <i class="material-symbols-outlined">star</i>
              <span>${villa.rating}</span>
            </div>
          </div>
          <a href="#/Detailed-Property?name=${encodeURIComponent(
            villa.name
          )}" class="villa-title">${villa.name}</a>
          <p class="location">
            <i class="material-symbols-outlined">location_on</i>
            ${villa.location}
          </p>
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
                  ? `<span class="original-price">IDR ${villa.price.toLocaleString(
                      "id-ID"
                    )}</span>`
                  : ""
              }
              <span class="price">IDR ${discountedPrice.toLocaleString(
                "id-ID"
              )}</span>
              <span class="unit">/night</span>
            </div>
            <div class="action-buttons">
              <button class="secondary-btn compare" title="Compare">
                <i class="material-symbols-outlined">compare_arrows</i>
              </button>
              <button class="primary-btn book">
                <a href="#/Booking?name=${encodeURIComponent(
                  villa.name
                )}" class="nav-link">Book Now</a>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
}

window.removeFromWishlist = function (name) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlist = wishlist.filter((item) => item.name !== name);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  renderWishlist();
};

document.addEventListener("click", (e) => {
  if (e.target.closest(".secondary-btn.compare")) {
    const card = e.target.closest(".card");
    const villaName = card.querySelector(".villa-title").innerText;

    fetch("/JSON/villas.json")
      .then((res) => res.json())
      .then((data) => {
        const villa = data.find((v) => v.name === villaName);
        let compareList = JSON.parse(localStorage.getItem("compareList")) || [];

        if (compareList.length >= 2) compareList.shift();
        compareList.push(villa);

        localStorage.setItem("compareList", JSON.stringify(compareList));
        window.location.hash = "#/compare";
      });
  }
});
