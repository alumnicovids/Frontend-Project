let currentSlot = 0;

window.initCompare = function () {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null];

  const table = document.querySelector(".luxury-compare-table");
  if (!table) return;

  const v1 = compareList[0];
  const v2 = compareList[1];

  table.querySelector("thead tr").innerHTML = `
    ${renderHeaderSlot(v1, 0)}
    ${renderHeaderSlot(v2, 1)}
  `;

  table.querySelector("tbody").innerHTML = `
    <tr class="section-divider"><td colspan="2">Summary & Pricing</td></tr>
    <tr>
        ${renderValueCell(v1, "rating", "Rating")}
        ${renderValueCell(v2, "rating", "Rating")}
    </tr>
    <tr>
        ${renderValueCell(v1, "location", "Location")}
        ${renderValueCell(v2, "location", "Location")}
    </tr>
    <tr>
        ${renderValueCell(v1, "price", "Price Per Night")}
        ${renderValueCell(v2, "price", "Price Per Night")}
    </tr>
    <tr>
        ${renderValueCell(v1, "promo.disc", "Discount Promo")}
        ${renderValueCell(v2, "promo.disc", "Discount Promo")}
    </tr>
    <tr>
        ${renderValueCell(v1, "detail.priceRange", "Price Range")}
        ${renderValueCell(v2, "detail.priceRange", "Price Range")}
    </tr>

    <tr class="section-divider"><td colspan="2">Facilities & Rooms</td></tr>
    <tr>
        ${renderValueCell(v1, "detail.roomType", "Room Type")}
        ${renderValueCell(v2, "detail.roomType", "Room Type")}
    </tr>
    <tr>
        ${renderValueCell(v1, "amenities.bed", "Bedroom")}
        ${renderValueCell(v2, "amenities.bed", "Bedroom")}
    </tr>
    <tr>
        ${renderValueCell(v1, "amenities.bathtub", "Bathroom")}
        ${renderValueCell(v2, "amenities.bathtub", "Bathroom")}
    </tr>
    <tr>
        ${renderValueCell(v1, "amenities.pool", "Swiming Pool")}
        ${renderValueCell(v2, "amenities.pool", "Swiming Pool")}
    </tr>
    <tr>
        ${renderValueCell(v1, "detail.facilities", "Facilities Details")}
        ${renderValueCell(v2, "detail.facilities", "Facilities Details")}
    </tr>

    <tr class="section-divider"><td colspan="2">Times & Location</td></tr>
    <tr>
        ${renderValueCell(v1, "detail.checkInTime", "Check-In")}
        ${renderValueCell(v2, "detail.checkInTime", "Check-In")}
    </tr>
    <tr>
        ${renderValueCell(v1, "detail.checkOutTime", "Check-Out")}
        ${renderValueCell(v2, "detail.checkOutTime", "Check-Out")}
    </tr>
    <tr>
        ${renderValueCell(v1, "detail.nearbyPlaces", "Nearby Place")}
        ${renderValueCell(v2, "detail.nearbyPlaces", "Nearby Place")}
    </tr>
    <tr>
        ${renderValueCell(v1, "detail.address", "Address")}
        ${renderValueCell(v2, "detail.address", "Address")}
    </tr>

    <tr class="section-divider"><td colspan="2">Services & Policies</td></tr>
    <tr>
        ${renderValueCell(v1, "detail.extraServices", "Extra Services")}
        ${renderValueCell(v2, "detail.extraServices", "Extra Services")}
    </tr>
    <tr>
        ${renderValueCell(
          v1,
          "detail.cancellationPolicy",
          "Cancellation Policy"
        )}
        ${renderValueCell(
          v2,
          "detail.cancellationPolicy",
          "Cancellation Policy"
        )}
    </tr>
  `;
};

function renderHeaderSlot(villa, index) {
  if (!villa) {
    return `<td>
              <div class="villa-head empty" onclick="openVillaModal(${index})">
                <div class="add-icon">+</div>
                <p>Add Villa</p>
              </div>
            </td>`;
  }
  return `<td>
            <div class="villa-head" onclick="openVillaModal(${index})">
              <div class="image-box"><img src="${villa.image[0]}" alt="${
    villa.name
  }"></div>
              <h4>${villa.name}</h4>
              <span class="loc-tag">${villa.location}</span>
            </div>
            <button class="primary-btn confirm compare detail">
              <a href="#/booking?name=${encodeURIComponent(
                villa.name
              )}">Book Now</a>
            </button>
          </td>`;
}

function renderValueCell(villa, path, label) {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null];
  const v1 = compareList[0];
  const v2 = compareList[1];

  const labelHtml = label ? `<span class="inner-label">${label}</span>` : "";

  if (!villa) return `<td class="value-cell">${labelHtml}-</td>`;

  const getVal = (obj, p) =>
    p.split(".").reduce((acc, part) => acc && acc[part], obj);
  const currentVal = getVal(villa, path);

  let statusClass = "";
  let icon = "";
  let displayValue = currentVal;

  if (v1 && v2) {
    const val1 = getVal(v1, path);
    const val2 = getVal(v2, path);

    if (path === "price") {
      if (currentVal === Math.min(val1, val2) && val1 !== val2) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">check_circle</i>';
      } else if (currentVal === Math.max(val1, val2) && val1 !== val2) {
        statusClass = "price-lose";
        icon = '<i class="material-symbols-outlined">close</i>';
      }
      displayValue = `IDR ${currentVal.toLocaleString("id-ID")}`;
    } else if (
      path === "rating" ||
      path === "amenities.bed" ||
      path === "amenities.bathtub"
    ) {
      if (currentVal === Math.max(val1, val2) && val1 !== val2) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">star</i>';
      }
      displayValue = path === "rating" ? currentVal : `${currentVal} Unit`;
    } else if (path === "amenities.pool") {
      if (currentVal && !(val1 && val2)) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">pool</i>';
      }
      displayValue = currentVal ? "Available" : "-";
    }
  }

  if (Array.isArray(currentVal)) {
    displayValue = `<ul style="margin:0; padding-left:0; list-style:none; font-size:0.9rem;">${currentVal
      .map((i) => `<li style="margin-bottom:4px;">• ${i}</li>`)
      .join("")}</ul>`;
  } else if (typeof currentVal === "boolean") {
    displayValue = currentVal ? "Available" : "-";
  } else if (path === "price" && !icon) {
    displayValue = `IDR ${currentVal.toLocaleString("id-ID")}`;
  }

  return `
    <td class="value-cell ${statusClass}">
      ${labelHtml}
      <div>${displayValue || "-"} ${icon}</div>
    </td>`;
}

window.openVillaModal = function (slot) {
  currentSlot = slot;
  const modal = document.getElementById("villaModal");
  if (modal) {
    modal.style.display = "flex";
    fetch("/JSON/villas.json")
      .then((res) => res.json())
      .then((data) => {
        const container = document.querySelector(".villa-selection-list");
        container.innerHTML = data
          .map(
            (villa) => `
          <div class="selection-item" onclick="selectVilla('${
            villa.name
          }')" style="display:flex; gap:10px; padding:10px; border-bottom:1px solid #eee; cursor:pointer;">
            <img src="${
              villa.image[0]
            }" style="width:60px; height:45px; object-fit:cover; border-radius:4px;">
            <div class="info">
              <h5 style="margin:0;">${villa.name}</h5>
              <small>${villa.tag} - IDR ${villa.price.toLocaleString()}</small>
            </div>
          </div>
        `
          )
          .join("");
      });
  }
};

window.selectVilla = function (name) {
  fetch("/JSON/villas.json")
    .then((res) => res.json())
    .then((data) => {
      const villa = data.find((v) => v.name === name);
      let list = JSON.parse(localStorage.getItem("compareList")) || [
        null,
        null,
      ];
      list[currentSlot] = villa;
      localStorage.setItem("compareList", JSON.stringify(list));
      document.getElementById("villaModal").style.display = "none";
      initCompare();
    });
};

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("close-modal")) {
    document.getElementById("villaModal").style.display = "none";
  }
});

window.clearCompare = function () {
  localStorage.removeItem("compareList");
  initCompare();
};
