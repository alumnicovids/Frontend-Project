function initBooking() {
  const container = document.getElementById("booking-content");
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
  const villaName = urlParams.get("name");
  let currentBooking = JSON.parse(localStorage.getItem("activeBooking"));

  if (!villaName && !currentBooking) {
    renderEmpty();
    return;
  }

  if (currentBooking) {
    renderBookingStatus(currentBooking);
  } else {
    fetchVillas(villaName);
  }
}

async function fetchVillas(name) {
  const res = await fetch("/JSON/villas.json");
  const data = await res.json();
  const villa = data.find((v) => v.name === name);
  renderBookingForm(villa);
}

function renderBookingForm(villa) {
  const container = document.getElementById("booking-content");
  container.innerHTML = `
    <div class="progress-tracker">
      <div class="step active"><div class="step-icon">1</div>Detail</div>
      <div class="step"><div class="step-icon">2</div>Payment</div>
      <div class="step"><div class="step-icon">3</div>Finish</div>
    </div>
    <div class="booking-card">
      <div class="card-header">
        <h3>${villa.name}</h3>
        <p class="text-muted">Lengkapi detail reservasi Anda di bawah ini.</p>
    </div>

      <div class="form-group">
        <label>Pilih Tipe Kamar</label>
        <select id="room-select" onchange="calculateTotal()">
          ${villa.rooms
            .map(
              (r) =>
                `<option value="${r.price}" data-name="${r.type}">${
                  r.type
                } - Rp${r.price.toLocaleString()}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Durasi Inap</label>
        <div class="date-range-container">
          <div class="date-input-wrapper">
            <small>Check-in</small>
            <input type="date" id="checkin-date" onchange="calculateTotal()">
          </div>
          <div class="date-input-wrapper">
            <small>Check-out</small>
            <input type="date" id="checkout-date" onchange="calculateTotal()">
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Layanan Tambahan (Add-on)</label>
        <div class="service-list">
          <div class="service-item">
            <label><input type="checkbox" class="addon" data-price="150000" onchange="calculateTotal()"> Sarapan</label>
            <span class="service-price">Rp150.000</span>
          </div>
          <div class="service-item">
            <label><input type="checkbox" class="addon" data-price="250000" onchange="calculateTotal()"> Jemput Bandara</label>
            <span class="service-price">Rp250.000</span>
          </div>
          <div class="service-item">
            <label><input type="checkbox" class="addon" data-price="100000" onchange="calculateTotal()"> Extra Bed</label>
            <span class="service-price">Rp100.000</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Kode Promo</label>
        <input type="text" id="promo-code" placeholder="Contoh: DISKON10" oninput="calculateTotal()">
      </div>

      <div class="form-group">
        <label>Metode Pembayaran</label>
        <div class="payment-methods">
          <button class="pay-btn" onclick="selectPay(this)" data-method="Bank Transfer">Bank Transfer</button>
          <button class="pay-btn" onclick="selectPay(this)" data-method="E-Wallet">E-Wallet / Qris</button>
        </div>
      </div>

      <div class="total-section">
        <div class="d-flex justify-between">
          <span>Durasi Menginap:</span>
          <span id="display-nights" class="font-bold">0 Malam</span>
        </div>
        <div class="d-flex justify-between mt-3 total-row">
          <span>Total Estimasi:</span>
          <span id="display-total">Rp0</span>
        </div>
      </div>

      <button class="primary-btn confirm" onclick="confirmPayment('${
        villa.name
      }')">Konfirmasi & Bayar</button>
    </div>
  `;
}

function calculateTotal() {
  const roomPrice = parseInt(document.getElementById("room-select").value);
  const checkinVal = document.getElementById("checkin-date").value;
  const checkoutVal = document.getElementById("checkout-date").value;
  const addons = document.querySelectorAll(".addon:checked");
  const promo = document.getElementById("promo-code").value;

  let nights = 0;
  if (checkinVal && checkoutVal) {
    const checkin = new Date(checkinVal);
    const checkout = new Date(checkoutVal);
    if (checkout > checkin) {
      nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
    }
  }

  let addonTotal = 0;
  addons.forEach((a) => (addonTotal += parseInt(a.dataset.price)));

  let total = roomPrice * (nights || 1) + addonTotal;

  if (promo === "DISKON10") {
    total = total * 0.9;
  }

  document.getElementById("display-nights").innerText = `${nights} Malam`;
  document.getElementById(
    "display-total"
  ).innerText = `Rp${total.toLocaleString()}`;
  return total;
}

function confirmPayment(villaName) {
  const total = calculateTotal();
  const selectedRoom = document.getElementById("room-select");
  const method = document.querySelector(".pay-btn.selected")?.dataset.method;
  const checkin = document.getElementById("checkin-date").value;
  const checkout = document.getElementById("checkout-date").value;

  if (!checkin || !checkout) return showToast("Harap pilih tanggal inap!!");
  if (new Date(checkout) <= new Date(checkin))
    return showToast("Tanggal tidak valid!!");
  if (!method) return showToast("Pilih metode pembayar!!");

  const booking = {
    villaName,
    roomType: selectedRoom.options[selectedRoom.selectedIndex].dataset.name,
    totalPrice: total,
    status: "waiting",
    deadline: new Date().getTime() + 24 * 60 * 60 * 1000,
    checkin,
    checkout,
    paymentMethod: method,
  };

  localStorage.setItem("activeBooking", JSON.stringify(booking));
  location.reload();
}

function renderBookingStatus(booking) {
  const container = document.getElementById("booking-content");

  if (booking.status === "waiting") {
    container.innerHTML = `
      <div class="progress-tracker">
        <div class="step"><div class="step-icon">1</div>Detail</div>
        <div class="step active"><div class="step-icon">2</div>Payment</div>
        <div class="step"><div class="step-icon">3</div>Finish</div>
      </div>
      <div class="timer-banner">Selesaikan pembayaran dalam: <span id="timer">--:--:--</span></div>
      <div class="booking-card status-card">
        <div class="d-flex justify-between align-center">
          <div>
            <h4 class="m-0">${booking.villaName}</h4>
            <p class="text-muted m-0">${booking.roomType}</p>
          </div>
          <span class="status-badge-booking status-waiting">Waiting</span>
        </div>
        <hr class="my-4" style="border: 0; border-top: 1px solid var(--line-clr); opacity: 0.3;">
        <div class="payment-detail-box">
          <small>Total yang harus dibayar</small>
          <h2 class="price-highlight">Rp${parseInt(
            booking.totalPrice
          ).toLocaleString()}</h2>
          <p>Metode: <strong>${booking.paymentMethod}</strong></p>
        </div>
        <div class="btn-card">
          <button class="primary-btn confirm pay" onclick="payNow()">Bayar Sekarang</button>
          <button class="secondary-btn cancel" onclick="cancelBooking()">Batalkan Pesanan</button>
        </div>
      </div>
    `;
    startTimer(booking.deadline);
  } else if (booking.status === "paid") {
    container.innerHTML = `
      <div class="progress-tracker">
        <div class="step"><div class="step-icon">1</div>Detail</div>
        <div class="step"><div class="step-icon">2</div>Payment</div>
        <div class="step active"><div class="step-icon">3</div>Finish</div>
      </div>
      <div class="booking-card text-center py-5">
        <div class="success-icon mb-4">✓</div>
        <h4>Pembayaran Berhasil!</h4>
        <p class="text-muted">Terima kasih atas reservasi Anda.<br>Silakan check-in pada <strong>${booking.checkin}</strong></p>
        <button class="primary-btn confirm" onclick="processCheckIn()">Check In Sekarang</button>
      </div>
    `;
  } else if (booking.status === "checked-in") {
    container.innerHTML = `
      <div class="booking-card text-center py-5">
        <div class="stay-icon mb-4">🏠</div>
        <h4>Selamat Menikmati Liburan</h4>
        <p class="text-muted">Anda sedang dalam masa inap di ${booking.villaName}.</p>
        <button class="primary-btn confirm" onclick="processCheckOut()">Check Out</button>
      </div>
    `;
  }
}

function startTimer(deadline) {
  const x = setInterval(() => {
    const now = new Date().getTime();
    const distance = deadline - now;
    if (distance < 0) {
      clearInterval(x);
      localStorage.removeItem("activeBooking");
      location.reload();
      return;
    }
    const h = Math.floor((distance % 86400000) / 3600000);
    const m = Math.floor((distance % 3600000) / 60000);
    const s = Math.floor((distance % 60000) / 1000);
    const timerElem = document.getElementById("timer");
    if (timerElem) timerElem.innerHTML = `${h}j ${m}m ${s}s`;
  }, 1000);
}

function payNow() {
  updateStatus("paid");
}

function cancelBooking() {
  if (confirm("Batalkan pesanan?")) {
    localStorage.removeItem("activeBooking");
    location.reload();
  }
}

function processCheckIn() {
  updateStatus("checked-in");
}

function processCheckOut() {
  let booking = JSON.parse(localStorage.getItem("activeBooking"));
  let history = JSON.parse(localStorage.getItem("myBookings")) || [];
  history.push({ ...booking, status: "completed", id: Date.now() });
  localStorage.setItem("myBookings", JSON.stringify(history));
  localStorage.removeItem("activeBooking");
  showToast("Terimakasih telah berkunjung!");
  window.location.hash = "#/my-booking";
}

function updateStatus(status) {
  let booking = JSON.parse(localStorage.getItem("activeBooking"));
  booking.status = status;
  localStorage.setItem("activeBooking", JSON.stringify(booking));
  location.reload();
}

function selectPay(btn) {
  document
    .querySelectorAll(".pay-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function renderEmpty() {
  document.getElementById("booking-content").innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🛏️</div>
      <p>Belum ada villa yang dibooking</p>
      <a href="#/" class="primary-btn empty" style="text-decoration:none">Cari Villa Sekarang</a>
    </div>
  `;
}

async function renderMyBookings() {
  const container = document.getElementById("my-booking-list");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("myBookings")) || [];

  if (history.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Belum ada riwayat transaksi.</p></div>`;
    return;
  }

  try {
    const res = await fetch("/JSON/villas.json");
    const villasData = await res.json();

    container.innerHTML = history
      .slice()
      .reverse()
      .map((item, index) => {
        const villaInfo = villasData.find((v) => v.name === item.villaName);
        const villaImage =
          villaInfo?.image?.[0] || "https://via.placeholder.com/150";

        return `
      <div class="booking-card history-card" style="animation-delay: ${
        index * 0.1
      }s">
        <div class="card-content-wrapper">
          <div class="villa-image-container">
            <img src="${villaImage}" alt="${item.villaName}" class="villa-img">
          </div>
          <div class="villa-details">
            <div>
              <div>
                <h4>${item.villaName}</h4>
                <small>TRX-${String(item.id).slice(-6)}</small>
              </div>
              <span class="status-badge-booking status-${item.status}">${
          item.status
        }</span>
            </div>
            <p class="room-info">
              <span>🛏️ ${item.roomType}</span>
              <span>|</span>
              <span>📅 ${item.checkin} - ${item.checkout}</span>
            </p>
            <div>
              <div class="payment-info">
                <span class="method">${item.paymentMethod}</span>
                <span class="price">Rp${item.totalPrice.toLocaleString()}</span>
              </div>
              <div class="action-buttons">
                <button class="primary-btn togrev ${
                  item.status === "completed" ? "btn-review" : ""
                }"
                  onclick="${
                    item.status === "completed"
                      ? `showReviewPopup('${item.villaName}')`
                      : "showToast('Detail pemesanan')"
                  }">
                  ${item.status === "completed" ? "Beri Ulasan" : "Detail"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
      })
      .join("");
  } catch (error) {
    container.innerHTML = `<p>Gagal memuat riwayat.</p>`;
  }
}

window.initBooking = initBooking;
window.renderMyBookings = renderMyBookings;
