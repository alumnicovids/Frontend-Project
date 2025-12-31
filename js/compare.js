let currentSlot = 0;

window.initCompare = function () {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null];

  const table = document.querySelector(".luxury-compare-table");
  if (!table) return;

  const v1 = compareList[0];
  const v2 = compareList[1];

  table.querySelector("thead tr").innerHTML = `
    <th class="sticky-col label-column"></th>
    ${renderHeaderSlot(v1, 0)}
    ${renderHeaderSlot(v2, 1)}
  `;

  table.querySelector("tbody").innerHTML = `
    <tr class="section-divider"><td colspan="3">Ringkasan & Harga</td></tr>
    <tr><td class="sticky-col label-cell">Rating</td>${renderValueCell(
      v1,
      "rating"
    )}${renderValueCell(v2, "rating")}</tr>
    <tr><td class="sticky-col label-cell">Lokasi</td>${renderValueCell(
      v1,
      "location"
    )}${renderValueCell(v2, "location")}</tr>
    <tr><td class="sticky-col label-cell">Harga Per Malam</td>${renderValueCell(
      v1,
      "price"
    )}${renderValueCell(v2, "price")}</tr>
    <tr><td class="sticky-col label-cell">Promo Diskon</td>${renderValueCell(
      v1,
      "promo.disc"
    )}${renderValueCell(v2, "promo.disc")}</tr>
    <tr><td class="sticky-col label-cell">Range Harga</td>${renderValueCell(
      v1,
      "detail.priceRange"
    )}${renderValueCell(v2, "detail.priceRange")}</tr>

    <tr class="section-divider"><td colspan="3">Fasilitas & Kamar</td></tr>
    <tr><td class="sticky-col label-cell">Tipe Kamar</td>${renderValueCell(
      v1,
      "detail.roomType"
    )}${renderValueCell(v2, "detail.roomType")}</tr>
    <tr><td class="sticky-col label-cell">Kamar Tidur</td>${renderValueCell(
      v1,
      "amenities.bed"
    )}${renderValueCell(v2, "amenities.bed")}</tr>
    <tr><td class="sticky-col label-cell">Kamar Mandi</td>${renderValueCell(
      v1,
      "amenities.bathtub"
    )}${renderValueCell(v2, "amenities.bathtub")}</tr>
    <tr><td class="sticky-col label-cell">Kolam Renang</td>${renderValueCell(
      v1,
      "amenities.pool"
    )}${renderValueCell(v2, "amenities.pool")}</tr>
    <tr><td class="sticky-col label-cell">Fasilitas Detail</td>${renderValueCell(
      v1,
      "detail.facilities"
    )}${renderValueCell(v2, "detail.facilities")}</tr>

    <tr class="section-divider"><td colspan="3">Waktu & Lokasi</td></tr>
    <tr><td class="sticky-col label-cell">Check-In</td>${renderValueCell(
      v1,
      "detail.checkInTime"
    )}${renderValueCell(v2, "detail.checkInTime")}</tr>
    <tr><td class="sticky-col label-cell">Check-Out</td>${renderValueCell(
      v1,
      "detail.checkOutTime"
    )}${renderValueCell(v2, "detail.checkOutTime")}</tr>
    <tr><td class="sticky-col label-cell">Tempat Terdekat</td>${renderValueCell(
      v1,
      "detail.nearbyPlaces"
    )}${renderValueCell(v2, "detail.nearbyPlaces")}</tr>
    <tr><td class="sticky-col label-cell">Alamat</td>${renderValueCell(
      v1,
      "detail.address"
    )}${renderValueCell(v2, "detail.address")}</tr>

    <tr class="section-divider"><td colspan="3">Layanan & Kebijakan</td></tr>
    <tr><td class="sticky-col label-cell">Layanan Extra</td>${renderValueCell(
      v1,
      "detail.extraServices"
    )}${renderValueCell(v2, "detail.extraServices")}</tr>
    <tr><td class="sticky-col label-cell">Kebijakan Pembatalan</td>${renderValueCell(
      v1,
      "detail.cancellationPolicy"
    )}${renderValueCell(v2, "detail.cancellationPolicy")}</tr>
  `;
};

function renderHeaderSlot(villa, index) {
  if (!villa) {
    return `<td>
              <div class="villa-head empty" onclick="openVillaModal(${index})" style="cursor:pointer; border:2px dashed #ccc; padding:20px; text-align:center;">
                <div class="add-icon" style="font-size:2rem;">+</div>
                <p>Tambah Villa</p>
              </div>
            </td>`;
  }
  return `<td>
            <div class="villa-head" onclick="openVillaModal(${index})" style="cursor:pointer;">
              <div class="image-box"><img src="${
                villa.image[0]
              }" style="width:100%; height:150px; object-fit:cover; border-radius:8px;"></div>
              <h4>${villa.name}</h4>
              <span class="loc-tag">${villa.location}</span>
            </div>
            <button class="primary-btn compare detail">
              <a href="#/Booking?name=${encodeURIComponent(
                villa.name
              )}">Book Now</a>
            </button>
          </td>`;
}

function renderValueCell(villa, path) {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null];
  const v1 = compareList[0];
  const v2 = compareList[1];

  if (!villa) return `<td class="value-cell">-</td>`;

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
      displayValue = currentVal ? "Tersedia" : "-";
    }
  }

  if (Array.isArray(currentVal)) {
    displayValue = `<ul style="margin:0; padding-left:15px; font-size:0.85rem; text-align:left;">${currentVal
      .map((i) => `<li>${i}</li>`)
      .join("")}</ul>`;
  } else if (typeof currentVal === "boolean") {
    displayValue = currentVal ? "Tersedia" : "-";
  } else if (path === "price" && !icon) {
    displayValue = `IDR ${currentVal.toLocaleString("id-ID")}`;
  }

  return `
    <td class="value-cell ${statusClass}">
      ${displayValue || "-"} ${icon}
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
          <div class="selection-item" onclick="selectVilla('${villa.name}')" style="display:flex; gap:10px; padding:10px; border-bottom:1px solid #eee; cursor:pointer;">
            <img src="${villa.image[0]}" style="width:60px; height:45px; object-fit:cover; border-radius:4px;">
            <div class="info">
              <h5 style="margin:0;">${villa.name}</h5>
              <small>${villa.tag}</small>
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
  if (e.target.closest(".btn-secondary")) {
    localStorage.removeItem("compareList");
    initCompare();
  }
});

window.clearCompare = function () {
  localStorage.removeItem("compareList");
  initCompare();
};

window.openVillaModal = function (slot) {
  currentSlot = slot;
  const modal = document.getElementById("villaModal");
  if (!modal) return;

  modal.style.display = "flex";

  fetch("/JSON/villas.json")
    .then((res) => res.json())
    .then((data) => {
      const container = document.querySelector(".villa-selection-list");
      container.innerHTML = data
        .map(
          (villa) => `
        <div class="selection-item" onclick="selectVilla('${villa.name}')">
          <img src="${villa.image[0]}">
          <div class="info">
            <h5>${villa.name}</h5>
            <p>${villa.tag} - IDR ${villa.price.toLocaleString("id-ID")}</p>
          </div>
        </div>
      `
        )
        .join("");
    });
};
