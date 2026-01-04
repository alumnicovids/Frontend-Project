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
  container.innerHTML = `
    <div class="progress-tracker">
      <div class="step active"><div class="step-icon">1</div>Detail</div>
      <div class="step"><div class="step-icon">2</div>Payment</div>
      <div class="step"><div class="step-icon">3</div>Finish</div>
    </div>
    <div class="booking-card">
      <div class="card-header">
        <h3>
          <a href="/" class="villa-title detail">
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

  if (promo === "DISCOUNT 10") {
    total = total * 0.9;
  }

  document.getElementById("display-nights").innerText = `${nights} Nights`;
  document.getElementById("display-total").innerText = formatIDR(total);
  return total;
}

function confirmPayment(villaName) {
  const total = calculateTotal();
  const selectedRoom = document.getElementById("room-select");
  const method = document.querySelector(".pay-btn.selected")?.dataset.method;
  const checkin = document.getElementById("checkin-date").value;
  const checkout = document.getElementById("checkout-date").value;

  if (!checkin || !checkout) return showToast("Please select your stay date!!");
  if (new Date(checkout) <= new Date(checkin))
    return showToast("Invalid date!!");
  if (!method) return showToast("Select payment method!!");

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
    startTimer(booking.deadline);
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
  if (confirm("Cancel Booking??")) {
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
  showToast("Thank you for visiting!");
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
      <p>No villas booked yet</p>
      <a href="#/" class="primary-btn empty" style="text-decoration:none">Search for villas now</a>
    </div>
  `;
}

async function renderMyBookings() {
  const container = document.getElementById("my-booking-list");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("myBookings")) || [];
  if (history.length === 0) {
    container.innerHTML = `<div class="empty-state myBooking"><p>There is no transaction history yet.</p></div>`;
    return;
  }

  const villasData = await getVillas();
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
