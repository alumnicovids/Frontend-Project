function initBooking() {
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
  const data = await getVillas();
  const villa = data.find((v) => v.name === name);
  renderBookingForm(villa);
}

function renderBookingForm(villa) {
  const container = document.getElementById("booking-content");
  // Me-render struktur HTML formulir ke dalam container
  container.innerHTML = `
    <div class="progress-tracker">
      <div class="step active"><div class="step-icon">1</div>Detail</div>
      <div class="step"><div class="step-icon">2</div>Payment</div>
      <div class="step"><div class="step-icon">3</div>Finish</div>
    </div>
    <div class="booking-card">
      <div class="card-header">
        <h3>
          <a href="#/" class="villa-title detail">
            <i class="material-symbols-outlined">keyboard_double_arrow_left</i>
            ${villa.name}
          <a></h3>
        <p class="text-muted">Complete your reservation details below.</p>
      </div>

      <div class="form-group">
        <label>Select Room Type</label>
        <select id="room-select" onchange="calculateTotal()">
          ${villa.rooms
            .map((r) => {
              // Logika Diskon: Jika villa sedang promo, harga kamar di dropdown langsung dipotong
              const hasPromo = villa.promo?.status === "active";
              const discountedPrice = hasPromo
                ? r.price * (1 - parseInt(villa.promo.disc) / 100)
                : r.price;

              return `
                <option value="${discountedPrice}" data-name="${r.type}">
                  ${r.type} - ${formatIDR(discountedPrice)}
                  ${hasPromo ? `(Promo ${villa.promo.disc} OFF)` : ""}
                </option>`;
            })
            .join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Duration of Stay</label>
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
        <label>Additional Services</label>
        <div class="service-list">
          <div class="service-item">
            <label><input type="checkbox" class="addon" data-price="150000" onchange="calculateTotal()"> Breakfast</label>
            <span class="service-price">IDR 150.000</span>
          </div>
          <div class="service-item">
            <label><input type="checkbox" class="addon" data-price="250000" onchange="calculateTotal()"> Airport Pick Up</label>
            <span class="service-price">IDR 250.000</span>
          </div>
          <div class="service-item">
            <label><input type="checkbox" class="addon" data-price="100000" onchange="calculateTotal()"> Extra Bed</label>
            <span class="service-price">IDR 100.000</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Kode Promo</label>
        <input type="text" id="promo-code" placeholder="Example: DISCOUNT 10" oninput="calculateTotal()">
      </div>

      <div class="form-group">
        <label>Payment Method</label>
        <div class="payment-methods">
          <button class="pay-btn" onclick="selectPay(this)" data-method="Bank Transfer">Bank Transfer</button>
          <button class="pay-btn" onclick="selectPay(this)" data-method="E-Wallet">E-Wallet / Qris</button>
        </div>
      </div>

      <div class="total-section">
        <div>
          <span>Duration of Stay:</span>
          <span id="display-nights">0 Nights</span>
        </div>
        <div class="total-row">
          <span>Total Estimate:</span>
          <span id="display-total">${formatIDR(0)}</span>
        </div>
      </div>

      <button class="primary-btn confirm detailed" onclick="confirmPayment('${
        villa.name
      }')">Confirm & Pay</button>
    </div>
  `;
}

function calculateTotal() {
  // Kalkulasi otomatis: (Harga Kamar * Durasi) + Addons - Diskon Promo
  const roomPrice = parseInt(document.getElementById("room-select").value);
  const checkinVal = document.getElementById("checkin-date").value;
  const checkoutVal = document.getElementById("checkout-date").value;
  const addons = document.querySelectorAll(".addon:checked");
  const promo = document.getElementById("promo-code").value.trim();

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

  // Hardcoded promo check
  if (promo === "DISCOUNT 10") {
    total = total * 0.9;
  }

  document.getElementById("display-nights").innerText = `${nights} Nights`;
  document.getElementById("display-total").innerText = formatIDR(total);
  return total;
}

// Validasi input pengguna dan penyimpanan data ke LocalStorage
function confirmPayment(villaName) {
  const total = calculateTotal();
  const selectedRoom = document.getElementById("room-select");
  const method = document.querySelector(".pay-btn.selected")?.dataset.method;
  const checkin = document.getElementById("checkin-date").value;
  const checkout = document.getElementById("checkout-date").value;

  if (!checkin || !checkout) return showToast("Please select your stay date!!"); // Memastikan tanggal dan metode pembayaran sudah diisi
  // Memastikan tanggal check-out tidak mendahului check-in
  if (new Date(checkout) <= new Date(checkin))
    return showToast("Invalid date!!");
  if (!method) return showToast("Select payment method!!");

  // Membuat data booking dengan status awal 'waiting'
  const booking = {
    villaName,
    roomType: selectedRoom.options[selectedRoom.selectedIndex].dataset.name,
    totalPrice: total,
    status: "waiting",
    // Deadline pembayaran: Waktu sekarang + 24 jam (dalam milidetik)
    deadline: new Date().getTime() + 24 * 60 * 60 * 1000,
    checkin,
    checkout,
    paymentMethod: method,
  };

  localStorage.setItem("activeBooking", JSON.stringify(booking)); // Simpan data pemesanan aktif ke LocalStorage
  location.reload(); // Reload halaman untuk memicu render status terbaru (renderBookingStatus)
}

// Mengubah tampilan halaman berdasarkan alur transaksi (Waiting -> Paid -> Checked-in)
function renderBookingStatus(booking) {
  const container = document.getElementById("booking-content");

  // KONDISI 1: Menunggu Pembayaran
  if (booking.status === "waiting") {
    container.innerHTML = `
      <div class="progress-tracker">
        <div class="step"><div class="step-icon">1</div>Detail</div>
        <div class="step active"><div class="step-icon">2</div>Payment</div>
        <div class="step"><div class="step-icon">3</div>Finish</div>
      </div>
      <div class="timer-banner">Complete your payment in: <span id="timer">--:--:--</span></div>
      <div class="booking-card status-card">
        <div>
          <div>
            <h4>${booking.villaName}</h4>
            <p>${booking.roomType}</p>
          </div>
          <span class="status-badge-booking status-waiting">Waiting</span>
        </div>
        <hr>
        <div class="payment-detail-box">
          <small>Total to be paid</small>
          <h2 class="price-highlight">${formatIDR(booking.totalPrice)}</h2>
          <p>Method <strong>${booking.paymentMethod}</strong></p>
        </div>
        <div class="btn-card">
          <button class="primary-btn confirm pay" onclick="payNow()">Pay Now</button>
          <button class="secondary-btn cancel" onclick="cancelBooking()">Cancel Booking</button>
        </div>
      </div>
    `;
    startTimer(booking.deadline); // Menjalankan fungsi hitung mundur berdasarkan deadline yang disimpan

    // KONDISI 2: Pembayaran Berhasil (Menunggu Check-in)
  } else if (booking.status === "paid") {
    container.innerHTML = `
      <div class="progress-tracker">
        <div class="step"><div class="step-icon">1</div>Detail</div>
        <div class="step"><div class="step-icon">2</div>Payment</div>
        <div class="step active"><div class="step-icon">3</div>Finish</div>
      </div>
      <div class="booking-card">
        <div class="success-icon">✓</div>
        <h4>Payment Successful!</h4>
        <p>Thank you for your reservation.<br> Please check in at <strong>${booking.checkin}</strong></p>
        <button class="primary-btn confirm" onclick="processCheckIn()">Check In Now</button>
      </div>
    `;

    // KONDISI 3: Sedang Menginap (Stay in progress)
  } else if (booking.status === "checked-in") {
    container.innerHTML = `
      <div class="booking-card">
        <div class="stay-icon">🏠</div>
        <h4>Have a good holiday</h4>
        <p>You are currently staying in ${booking.villaName}.</p>
        <button class="primary-btn confirm" onclick="processCheckOut()">Check Out</button>
      </div>
    `;
  }
}

function startTimer(deadline) {
  // Hitung mundur 24 jam untuk batas pembayaran menggunakan setInterval
  const x = setInterval(() => {
    const now = new Date().getTime();
    const distance = deadline - now;
    if (distance < 0) {
      clearInterval(x);
      localStorage.removeItem("activeBooking"); // Hapus booking jika kadaluarsa
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
  const booking = JSON.parse(localStorage.getItem("activeBooking")); // Mengambil data booking yang sedang aktif dari storage
  const isCard = booking.paymentMethod === "Bank Transfer";

  // LOGIKA MODAL: Menampilkan form kartu kredit ATAU QRIS sesuai metode terpilih
  const content = isCard
    ? `
    <div class="review-popup payment-modal-card">
      <div class="popup-header"><h4>Credit Card Payment</h4></div>
      <input type="text" class="payment-input" placeholder="Card Number">
      <div class="card-row">
        <input type="text" class="payment-input" placeholder="MM/YY">
        <input type="text" class="payment-input" placeholder="CVV">
      </div>
      <span class="payment-total-label">Total: ${formatIDR(
        booking.totalPrice
      )}</span>
      <div class="popup-actions">
        <button class="secondary-btn cancel">Cancel</button>
        <button class="primary-btn confirm" id="confirm-pay">Pay Now</button>
      </div>
    </div>
  `
    : `
    <div class="review-popup qris-container">
      <div class="popup-header"><h4>Scan QRIS to Pay</h4></div>
      <div class="qris-image-wrapper">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-${
          booking.totalPrice
        }">
      </div>
      <span class="payment-total-label">Total: ${formatIDR(
        booking.totalPrice
      )}</span>
      <div class="popup-actions">
        <button class="secondary-btn cancel">Cancel</button>
        <button class="primary-btn confirm" id="confirm-pay">I Have Paid</button>
      </div>
    </div>
  `;

  const overlay = createOverlay(content);
  overlay.querySelector(".cancel").onclick = () => overlay.remove();
  overlay.querySelector("#confirm-pay").onclick = () => {
    overlay.remove();
    updateStatus("paid"); // Mengubah status menjadi berbayar
  };
}

// Menghapus data booking aktif dan refresh halaman
function cancelBooking() {
  if (confirm("Cancel Booking??")) {
    localStorage.removeItem("activeBooking");
    location.reload();
  }
}

// Mengubah status dari 'paid' menjadi 'checked-in'
function processCheckIn() {
  updateStatus("checked-in");
}

// LOGIKA CHECK-OUT & HISTORY
function processCheckOut() {
  let booking = JSON.parse(localStorage.getItem("activeBooking"));
  let history = JSON.parse(localStorage.getItem("myBookings")) || [];
  history.push({ ...booking, status: "completed", id: Date.now() }); // Memindahkan data dari booking aktif ke riwayat (myBookings) dengan status 'completed'
  localStorage.setItem("myBookings", JSON.stringify(history));
  localStorage.removeItem("activeBooking"); // Membersihkan booking aktif
  showToast("Thank you for visiting!");
  window.location.hash = "#/my-booking"; // Arahkan user ke halaman riwayat
}

// Fungsi pembantu untuk memperbarui properti 'status' di LocalStorage
function updateStatus(status) {
  let booking = JSON.parse(localStorage.getItem("activeBooking"));
  booking.status = status;
  localStorage.setItem("activeBooking", JSON.stringify(booking));
  location.reload();
}

// Logika UI untuk memilih tombol metode pembayaran
function selectPay(btn) {
  document
    .querySelectorAll(".pay-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

// Menampilkan UI jika tidak ada aktivitas pemesanan yang sedang berjalan
function renderEmpty() {
  document.getElementById("booking-content").innerHTML = `
    <div class="empty-state booking-cont">
      <div class="empty-icon">🛏️</div>
      <p>No villas booked yet</p>
      <a href="#/" class="primary-btn empty" style="text-decoration:none">Search for villas now</a>
    </div>
  `;
}

// Menampilkan daftar transaksi yang sudah selesai dari LocalStorage
async function renderMyBookings() {
  const container = document.getElementById("my-booking-list");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("myBookings")) || []; // 1. Mengambil data riwayat dari key 'myBookings'

  // Jika riwayat kosong, tampilkan pesan status kosong khusus histori
  if (history.length === 0) {
    container.innerHTML = `<div class="empty-state myBooking"><p>There is no transaction history yet.</p></div>`;
    return;
  }

  const villasData = await getVillas(); // 2. Mengambil data referensi villa untuk mendapatkan gambar terbaru

  // 3. Me-render list: Dibalik (.reverse) agar transaksi terbaru muncul paling atas
  container.innerHTML = history
    .slice()
    .reverse()
    .map((item, index) => {
      // Mencari info gambar villa berdasarkan nama di riwayat
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
              <h4>${item.villaName}</h4>
              <small>TRX-${String(item.id).slice(-6)}</small>
              <span class="status-badge-booking status-${item.status}">${
        item.status
      }</span>
            </div>
            <p class="room-info">
              <span>🛏️ ${item.roomType}</span> | <span>📅 ${item.checkin} - ${
        item.checkout
      }</span>
            </p>
            <div class="payment-info">
              <span class="method">${item.paymentMethod}</span>
              <span class="price">${formatIDR(item.totalPrice)}</span>
            </div>
            <div class="action-buttons">
              <button class="primary-btn togrev confirm ${
                item.status === "completed" ? "btn-review" : ""
              }"
                onclick="${
                  // JIKA SUDAH SELESAI: Tombol memicu popup ulasan (Review)
                  // JIKA BELUM: Tombol hanya menampilkan toast ID transaksi
                  item.status === "completed"
                    ? `showReviewPopup('${item.villaName}')`
                    : `showToast('Detail TRX-${String(item.id).slice(-6)}')`
                }">
                ${item.status === "completed" ? "Leave a Review" : "Detail"}
              </button>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

window.initBooking = initBooking;
window.renderMyBookings = renderMyBookings;
