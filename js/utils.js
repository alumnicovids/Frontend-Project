const isGithub = window.location.hostname.includes("github.io");
const basePath = isGithub ? "/Frontend-Project/" : "/";
const bgPath = isGithub
  ? "/Frontend-Project/Media/background-photo.jpg"
  : "/Media/background-photo.jpg";

const toggleButton = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");
let villaCache = null; // Cache global agar tidak fetch JSON berulang kali

function toggleSidebar() {
  sidebar.classList.toggle("close");
  toggleButton.classList.toggle("rotate");
  closeAllSubMenu();
}

function toggleSubMenu(button) {
  const subMenu = button.nextElementSibling;
  const isOpen = subMenu.classList.contains("show");

  closeAllSubMenu();

  if (!isOpen) {
    subMenu.classList.add("show");
    button.classList.add("rotate");
  }

  if (sidebar.classList.contains("close")) {
    sidebar.classList.remove("close");
    toggleButton.classList.remove("rotate");
  }
}

function closeAllSubMenu() {
  Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
    ul.classList.remove("show");
    ul.previousElementSibling.classList.remove("rotate");
  });
}

async function getVillas() {
  if (villaCache) return villaCache;
  try {
    // Mengambil data sumber dari file JSON lokal
    const res = await fetch(`${basePath}JSON/villas.json`);
    if (!res.ok) throw new Error("Failed to fetch");
    villaCache = await res.json();
    return villaCache;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function formatIDR(amount) {
  // Formatter standar untuk mata uang Rupiah
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function createOverlay(content) {
  const overlay = document.createElement("div");
  overlay.className = "review-overlay";
  overlay.innerHTML = content;
  document.body.appendChild(overlay);
  return overlay;
}

function showToast(message) {
  // Notifikasi pop-up singkat yang otomatis hilang setelah 3 detik
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerText = message;
  document.body.appendChild(toast);

  // ... logic transisi
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3000);
}

function showEditModal(fieldName, currentValue, callback) {
  const content = `
    <div class="review-popup">
      <div class="popup-header"><h4>Change ${fieldName}</h4></div>
      <input type="text" id="modal-input" value="${currentValue}">
      <div class="popup-actions">
        <button class="secondary-btn cancel">Cancel</button>
        <button class="primary-btn confirm" id="modal-save">Save</button>
      </div>
    </div>
  `;
  const overlay = createOverlay(content);

  overlay.querySelector(".cancel").onclick = () => overlay.remove();
  overlay.querySelector("#modal-save").onclick = () => {
    callback(overlay.querySelector("#modal-input").value);
    overlay.remove();
  };
}

function showReviewPopup(villaName) {
  const content = `
    <div class="review-popup">
      <h4>Review for ${villaName}</h4>
      <div class="star-rating">
        ${[5, 4, 3, 2, 1]
          .map(
            (num) => `
          <input type="radio" name="rating" id="star${num}" value="${num}">
          <label for="star${num}">★</label>
        `
          )
          .join("")}
      </div>
      <textarea id="review-text" placeholder="Tell us about your experience..."></textarea>
      <div class="popup-actions">
        <button class="secondary-btn cancel">Cancel</button>
        <button class="primary-btn confirm">Send</button>
      </div>
    </div>
  `;
  const overlay = createOverlay(content);

  overlay.querySelector(".cancel").onclick = () => overlay.remove();
  overlay.querySelector(".confirm").onclick = () => {
    const rating = overlay.querySelector('input[name="rating"]:checked')?.value;
    if (!rating) return showToast("Choose a star rating first!");

    showToast(`Your review for ${villaName} has been submitted.`);
    overlay.remove();
  };
}

document.body.style.backgroundImage = `linear-gradient(rgba(245, 245, 220, 0.255), rgba(245, 245, 220, 0.255)), url('${bgPath}')`;
