let currentSlot = 0;

// Mengambil data dari LocalStorage dan menyusun tabel perbandingan secara dinamis
window.initCompare = function () {
  const compareData = localStorage.getItem("compareList");
  let compareList = compareData ? JSON.parse(compareData) : [null, null]; // Default: Array dengan 2 slot kosong (null)
  const table = document.querySelector(".luxury-compare-table");
  if (!table) return;

  const [v1, v2] = compareList;

  // 1. Render Header: Menampilkan foto/nama villa atau tombol "+" jika kosong
  table.querySelector("thead tr").innerHTML = `
    ${renderHeaderSlot(v1, 0)}
    ${renderHeaderSlot(v2, 1)}
  `;

  // 2. Render Body: Memetakan data properti villa ke dalam baris tabel (Rating, Harga, Fasilitas, dll)
  table.querySelector("tbody").innerHTML = `
    <tr class="section-divider"><td colspan="2">Summary & Pricing</td></tr>
    <tr>${renderValueCell(v1, "rating", "Rating")}${renderValueCell(
    v2,
    "rating",
    "Rating"
  )}</tr>
    <tr>${renderValueCell(v1, "location", "Location")}${renderValueCell(
    v2,
    "location",
    "Location"
  )}</tr>
    <tr>${renderValueCell(v1, "price", "Price Per Night")}${renderValueCell(
    v2,
    "price",
    "Price Per Night"
  )}</tr>
    <tr>${renderValueCell(v1, "promo.disc", "Discount Promo")}${renderValueCell(
    v2,
    "promo.disc",
    "Discount Promo"
  )}</tr>

    <tr class="section-divider"><td colspan="2">Facilities & Rooms</td></tr>
    <tr>${renderValueCell(v1, "detail.roomType", "Room Type")}${renderValueCell(
    v2,
    "detail.roomType",
    "Room Type"
  )}</tr>
    <tr>${renderValueCell(v1, "amenities.bed", "Bedroom")}${renderValueCell(
    v2,
    "amenities.bed",
    "Bedroom"
  )}</tr>
    <tr>${renderValueCell(
      v1,
      "amenities.bathtub",
      "Bathroom"
    )}${renderValueCell(v2, "amenities.bathtub", "Bathroom")}</tr>
    <tr>${renderValueCell(
      v1,
      "amenities.pool",
      "Swimming Pool"
    )}${renderValueCell(v2, "amenities.pool", "Swimming Pool")}</tr>

    <tr class="section-divider"><td colspan="2">Times & Location</td></tr>
    <tr>${renderValueCell(
      v1,
      "detail.checkInTime",
      "Check-In"
    )}${renderValueCell(v2, "detail.checkInTime", "Check-In")}</tr>
    <tr>${renderValueCell(
      v1,
      "detail.checkOutTime",
      "Check-Out"
    )}${renderValueCell(v2, "detail.checkOutTime", "Check-Out")}</tr>
    <tr>${renderValueCell(v1, "detail.address", "Address")}${renderValueCell(
    v2,
    "detail.address",
    "Address"
  )}</tr>
  `;
};

// Menghasilkan HTML untuk kolom atas tabel (Foto Villa & Tombol Booking)
function renderHeaderSlot(villa, index) {
  if (!villa) {
    // Tampilan jika slot belum dipilih (tombol tambah)
    return `<td>
              <div class="villa-head empty" onclick="openVillaModal(${index})">
                <div class="add-icon">+</div>
                <p>Add Villa</p>
              </div>
            </td>`;
  }
  // Tampilan jika villa sudah dipilih
  return `<td>
            <div class="villa-head" onclick="openVillaModal(${index})">
              <div class="image-box"><img src="${villa.image[0]}" alt="${
    villa.name
  }"></div>
              <h4>${villa.name}</h4>
              <span class="loc-tag">${villa.location}</span>
            </div>
            <button class="primary-btn confirm detail">
              <a href="#/booking?name=${encodeURIComponent(
                villa.name
              )}">Book Now</a>
            </button>
          </td>`;
}

function renderValueCell(villa, path, label) {
  const compareList = JSON.parse(localStorage.getItem("compareList")) || [
    null,
    null,
  ];
  const [v1, v2] = compareList;
  const labelHtml = label ? `<span class="inner-label">${label}</span>` : "";

  if (!villa) return `<td class="value-cell">${labelHtml}-</td>`;

  // Fungsi rekursif/split untuk mengambil value dari objek bersarang (misal: 'promo.disc')
  const getVal = (obj, p) =>
    p.split(".").reduce((acc, part) => acc && acc[part], obj);
  const currentVal = getVal(villa, path);
  let statusClass = "",
    icon = "",
    displayValue = currentVal;

  // Logika komparasi: Memberikan highlight (class 'price-win') pada harga termurah atau fasilitas (bed/rating) yang jumlahnya lebih banyak
  if (v1 && v2) {
    const val1 = getVal(v1, path),
      val2 = getVal(v2, path);
    if (path === "price") {
      if (currentVal === Math.min(val1, val2) && val1 !== val2) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">check_circle</i>';
      }
      displayValue = formatIDR(currentVal);
    } else if (
      ["rating", "amenities.bed", "amenities.bathtub"].includes(path)
    ) {
      if (currentVal === Math.max(val1, val2) && val1 !== val2) {
        statusClass = "price-win";
        icon = '<i class="material-symbols-outlined">star</i>';
      }
      displayValue = path === "rating" ? currentVal : `${currentVal} Unit`;
    }
  }

  if (Array.isArray(currentVal)) {
    displayValue = `<ul class="compare-list">${currentVal
      .map((i) => `<li>• ${i}</li>`)
      .join("")}</ul>`;
  } else if (typeof currentVal === "boolean") {
    displayValue = currentVal ? "Available" : "-";
  } else if (path === "price" && !statusClass) {
    displayValue = formatIDR(currentVal);
  }

  return `<td class="value-cell ${statusClass}">${labelHtml}<div>${
    displayValue || "-"
  } ${icon}</div></td>`;
}

// Membuka daftar pilihan villa untuk dimasukkan ke dalam slot perbandingan
window.openVillaModal = async function (slot) {
  currentSlot = slot; // Menyimpan index slot (0 atau 1) yang sedang diincar
  const modal = document.getElementById("villaModal");
  if (!modal) return;

  modal.style.display = "flex";
  const data = await getVillas(); // Mengambil data villa terbaru
  const container = document.querySelector(".villa-selection-list");

  // Menampilkan daftar villa di dalam modal
  container.innerHTML = data
    .map(
      (villa) => `
    <div class="selection-item" onclick="selectVilla('${villa.name}')">
      <img src="${villa.image[0]}" alt="${villa.name}">
      <div class="info">
        <h5>${villa.name}</h5>
        <small>${villa.tag} - ${formatIDR(villa.price)}</small>
      </div>
    </div>
  `
    )
    .join("");
};

// Mengupdate LocalStorage dengan villa yang dipilih dan merefresh tabel
window.selectVilla = async function (name) {
  const data = await getVillas();
  const villa = data.find((v) => v.name === name);
  let list = JSON.parse(localStorage.getItem("compareList")) || [null, null]; // Menyimpan pilihan villa ke Slot 1 atau Slot 2 di LocalStorage
  list[currentSlot] = villa; // Masukkan data villa ke slot yang sesuai
  localStorage.setItem("compareList", JSON.stringify(list));
  document.getElementById("villaModal").style.display = "none";
  initCompare(); // Memanggil ulang initCompare untuk memperbarui UI tanpa reload halaman
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
