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
      <h3>${villa.name}</h3>
      <div class="form-group">
        <label>Pilih Kamar</label>
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
        <div class="d-flex gap-2">
          <input type="date" id="checkin-date" onchange="calculateTotal()">
          <input type="date" id="checkout-date" onchange="calculateTotal()">
        </div>
      </div>
      <div class="form-group">
        <label>Add-on Services</label>
        <div class="service-item"><label><input type="checkbox" class="addon" data-price="150000" onchange="calculateTotal()"> Sarapan</label><span>Rp150.000</span></div>
        <div class="service-item"><label><input type="checkbox" class="addon" data-price="250000" onchange="calculateTotal()"> Jemput Bandara</label><span>Rp250.000</span></div>
        <div class="service-item"><label><input type="checkbox" class="addon" data-price="100000" onchange="calculateTotal()"> Extra Bed</label><span>Rp100.000</span></div>
      </div>
      <div class="form-group">
        <label>Promo Code</label>
        <input type="text" id="promo-code" placeholder="Gunakan 'DISKON10' untuk 10%" oninput="calculateTotal()">
      </div>
      <div class="payment-methods mb-3">
        <label class="d-block mb-2">Metode Pembayaran</label>
        <div class="d-flex gap-2">
          <button class="pay-btn" onclick="selectPay(this)" data-method="Bank Transfer">Bank</button>
          <button class="pay-btn" onclick="selectPay(this)" data-method="E-Wallet">E-Wallet</button>
        </div>
      </div>
      <div class="total-section card-summary p-3 mb-3" style="background: #f9f9f9; border-radius: 8px;">
        <div class="d-flex justify-between"><span>Durasi:</span> <span id="display-nights">0 Malam</span></div>
        <div class="d-flex justify-between font-bold mt-2" style="font-size: 1.2em; color: var(--accent-clr);">
          <span>Total Estimasi:</span>
          <span id="display-total">Rp0</span>
        </div>
      </div>
      <button class="book-btn w-100" onclick="confirmPayment('${
        villa.name
      }')">Confirm Payment</button>
    </div>
  `;
}

function calculateTotal() {
  const roomPrice = parseInt(document.getElementById("room-select").value);
  const checkin = new Date(document.getElementById("checkin-date").value);
  const checkout = new Date(document.getElementById("checkout-date").value);
  const addons = document.querySelectorAll(".addon:checked");
  const promo = document.getElementById("promo-code").value;

  let nights = 0;
  if (checkin && checkout && checkout > checkin) {
    nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
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

  if (!method) return alert("Pilih metode pembayaran!");

  const booking = {
    villaName,
    roomType: selectedRoom.options[selectedRoom.selectedIndex].dataset.name,
    totalPrice: total,
    status: "waiting",
    deadline: new Date().getTime() + 24 * 60 * 60 * 1000,
    checkin: document.getElementById("checkin-date").value,
    checkout: document.getElementById("checkout-date").value,
    paymentMethod: method,
  };

  localStorage.setItem("activeBooking", JSON.stringify(booking));
  location.reload();
}

function confirmPayment(villaName) {
  const total = calculateTotal();
  const selectedRoom = document.getElementById("room-select");
  const method = document.querySelector(".pay-btn.selected")?.dataset.method;
  const checkin = document.getElementById("checkin-date").value;
  const checkout = document.getElementById("checkout-date").value;

  if (!checkin || !checkout) {
    alert("Harap pilih tanggal check-in dan check-out!");
    return;
  }

  if (new Date(checkout) <= new Date(checkin)) {
    alert("Tanggal check-out harus setelah tanggal check-in!");
    return;
  }

  if (!method) {
    alert("Harap pilih metode pembayaran!");
    return;
  }

  const booking = {
    villaName,
    roomType: selectedRoom.options[selectedRoom.selectedIndex].dataset.name,
    totalPrice: total,
    status: "waiting",
    deadline: new Date().getTime() + 24 * 60 * 60 * 1000,
    checkin: checkin,
    checkout: checkout,
    paymentMethod: method,
  };

  localStorage.setItem("activeBooking", JSON.stringify(booking));
  location.reload();
}

function renderBookingStatus(booking) {
  const container = document.getElementById("booking-content");
  const now = new Date().getTime();
  const timeLeft = booking.deadline - now;

  if (booking.status === "waiting") {
    container.innerHTML = `
    <div class="timer-banner">Selesaikan pembayaran dalam: <span id="timer"></span></div>
    <div class="booking-card">
        <div class="d-flex justify-between">
            <h4>${booking.villaName}</h4>
            <span class="status-badge waiting">Waiting for Payment</span>
        </div>
    <p>Total Bayar: Rp${parseInt(booking.totalPrice).toLocaleString()}</p>
    <button class="book-btn w-100" onclick="payNow()">Pay Now</button>
    <button class="book-btn w-100 mt-2" onclick="cancelBooking()">Cancel Booking</button>
    </div>
    `;
    startTimer(booking.deadline);
  } else if (booking.status === "paid") {
    container.innerHTML = `
      <div class="booking-card text-center">
        <h4>Pembayaran Berhasil!</h4>
        <p>Silahkan check-in pada tanggal ${booking.checkin}</p>
        <button class="book-btn" onclick="processCheckIn()">Check In</button>
      </div>
    `;
  } else if (booking.status === "checked-in") {
    container.innerHTML = `
      <div class="booking-card text-center">
        <h4>Anda sedang menginap</h4>
        <button class="book-btn" onclick="processCheckOut()">Check Out</button>
      </div>
    `;
  }
}

function startTimer(deadline) {
  const x = setInterval(() => {
    const now = new Date().getTime();
    const distance = deadline - now;
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(
      "timer"
    ).innerHTML = `${hours}j ${minutes}m ${seconds}s`;

    if (distance < 0) {
      clearInterval(x);
      localStorage.removeItem("activeBooking");
      location.reload();
    }
  }, 1000);
}

function payNow() {
  updateStatus("paid");
}

function cancelBooking() {
  if (confirm("Apakah Anda yakin ingin membatalkan booking ini?")) {
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
  history.push({ ...booking, status: "completed" });
  localStorage.setItem("myBookings", JSON.stringify(history));
  localStorage.removeItem("activeBooking");
  alert("Transaksi Selesai!");
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
    <div class="empty-booking">
      <p>Belum ada villa yang dibooking</p>
      <a href="#/" class="book-btn">Cari Villa</a>
    </div>
  `;
}

function renderMyBookings() {
  const container = document.getElementById("my-booking-list");
  const history = JSON.parse(localStorage.getItem("myBookings")) || [];

  if (history.length === 0) {
    container.innerHTML = `<p class="text-center">Belum ada riwayat transaksi.</p>`;
    return;
  }

  const sortedHistory = [...history].reverse();

  container.innerHTML = sortedHistory
    .map(
      (item) => `
    <div class="booking-card mb-3">
      <div class="d-flex justify-between">
        <strong>${item.villaName}</strong>
        <span class="status-badge success">${item.status}</span>
      </div>
      <p style="font-size: 0.9em; color: #666;">
        ${item.roomType} | ${item.checkin} - ${item.checkout}
      </p>
      <div class="d-flex justify-between mt-2">
        <span>Metode: ${item.paymentMethod}</span>
        <strong style="color: var(--accent-clr);">Rp${item.totalPrice.toLocaleString()}</strong>
      </div>
    </div>
  `
    )
    .join("");
}

window.initBooking = initBooking;
window.renderMyBookings = renderMyBookings;
