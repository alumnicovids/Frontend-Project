const state = JSON.parse(localStorage.getItem("userProfile")) || {
  name: "Undefined",
  birth: "Undefined",
  sex: "Undefined",
  Email: "Undefined",
  Phone: "Undefined",
};

function saveState() {
  localStorage.setItem("userProfile", JSON.stringify(state));
}

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
          const hasPromo = villa.promo && villa.promo.status === "active";
          const discountPercent = hasPromo ? parseInt(villa.promo.disc) : 0;
          const discountedPrice = hasPromo
            ? villa.price * (1 - discountPercent / 100)
            : villa.price;

          return `
        <article class="card">
          <div class="card-image">
            <img src="${villa.image}" alt="${villa.name}" />
            ${
              hasPromo
                ? `<span class="promo-badge">${villa.promo.disc} OFF</span>`
                : ""
            }
            <button class="wishlist-btn">
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
            <a href="#/Detailed-Property" class="villa-title">${villa.name}</a>
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
                <button class="compare-btn" title="Compare">
                  <i class="material-symbols-outlined">compare_arrows</i>
                </button>
                <button class="book-now">Book Now</button>
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
