let currentSlot = 0;

window.initCompare = function () {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null];

  const table = document.querySelector(".luxury-compare-table");
  if (!table) return;

  const v1 = compareList[0];
  const v2 = compareList[1];

  table.querySelector("thead tr").innerHTML = `
    <th class="sticky-col label-column"></th> ${renderHeaderSlot(v1, 0)}
    ${renderHeaderSlot(v2, 1)}
  `;

  table.querySelector("tbody").innerHTML = `
    <tr class="section-divider"><td colspan="3">Informasi Harga</td></tr>
    <tr>
      <td class="sticky-col label-cell">Harga Per Malam</td>
      ${renderValueCell(v1, "price", true)}
      ${renderValueCell(v2, "price", true)}
    </tr>
    <tr class="section-divider"><td colspan="3">Fasilitas Utama</td></tr>
    <tr>
      <td class="sticky-col label-cell">Kamar Tidur</td>
      ${renderValueCell(v1, "bed")}
      ${renderValueCell(v2, "bed")}
    </tr>
    <tr>
      <td class="sticky-col label-cell">Kamar Mandi</td>
      ${renderValueCell(v1, "bathtub")}
      ${renderValueCell(v2, "bathtub")}
    </tr>
    <tr>
      <td class="sticky-col label-cell">Kolam Renang</td>
      ${renderValueCell(v1, "pool")}
      ${renderValueCell(v2, "pool")}
    </tr>
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
              <div class="image-box"><img src="${villa.image[0]}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;"></div>
              <h4>${villa.name}</h4>
              <span class="loc-tag">${villa.location}</span>
            </div>
          </td>`;
}

function renderValueCell(villa, key, isPrice = false) {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null];
  const v1 = compareList[0];
  const v2 = compareList[1];

  if (!villa) return `<td class="value-cell">-</td>`;

  let statusClass = "";
  let icon = "";
  let displayValue = "";

  if (v1 && v2) {
    const val1 = key === "price" ? v1[key] : v1.amenities[key];
    const val2 = key === "price" ? v2[key] : v2.amenities[key];
    const currentVal = key === "price" ? villa[key] : villa.amenities[key];

    if (key === "price") {
      if (currentVal === Math.min(val1, val2) && val1 !== val2) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">check_circle</i>';
      } else if (currentVal === Math.max(val1, val2) && val1 !== val2) {
        statusClass = "price-lose";
        icon = '<i class="material-symbols-outlined">close</i>';
      }
      displayValue = `IDR ${villa.price.toLocaleString("id-ID")}`;
    } else if (key === "bed" || key === "bathtub") {
      if (currentVal === Math.max(val1, val2) && val1 !== val2) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">star</i>';
      } else if (currentVal === Math.min(val1, val2) && val1 !== val2) {
        statusClass = "price-lose";
      }
      displayValue = `${currentVal} Unit`;
    } else if (key === "pool") {
      if (currentVal && !(val1 && val2)) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">pool</i>';
      }
      displayValue = currentVal ? "Tersedia" : "-";
    }
  } else {
    if (key === "price")
      displayValue = `IDR ${villa.price.toLocaleString("id-ID")}`;
    else if (key === "pool")
      displayValue = villa.amenities.pool ? "Tersedia" : "-";
    else displayValue = `${villa.amenities[key]} Unit`;
  }

  return `
    <td class="value-cell ${statusClass}">
      ${displayValue} ${icon}
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
