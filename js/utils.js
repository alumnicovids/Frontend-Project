let villaCache = null;

async function getVillas() {
  if (villaCache) return villaCache;
  const res = await fetch("/JSON/villas.json");
  villaCache = await res.json();
  return villaCache;
}

function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function showEditModal(fieldName, currentValue, callback) {
  const overlay = document.createElement("div");
  overlay.className = "review-overlay";
  overlay.innerHTML = `
    <div class="review-popup">
      <div class="popup-header"><h4>Ubah ${fieldName}</h4></div>
      <input type="text" id="modal-input" value="${currentValue}">
      <div class="popup-actions">
        <button class="secondary-btn cancel" onclick="this.closest('.review-overlay').remove()">Batal</button>
        <button class="primary-btn confirm" id="modal-save">Simpan</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector("#modal-save").onclick = () => {
    callback(overlay.querySelector("#modal-input").value);
    overlay.remove();
  };
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3000);
}

function showReviewPopup(villaName) {
  const overlay = document.createElement("div");
  overlay.className = "review-overlay";
  overlay.innerHTML = `
    <div class="review-popup">
      <h4>Ulasan untuk ${villaName}</h4>
      <div class="star-rating">
        <input type="radio" name="rating" id="star5" value="5"><label for="star5">★</label>
        <input type="radio" name="rating" id="star4" value="4"><label for="star4">★</label>
        <input type="radio" name="rating" id="star3" value="3"><label for="star3">★</label>
        <input type="radio" name="rating" id="star2" value="2"><label for="star2">★</label>
        <input type="radio" name="rating" id="star1" value="1"><label for="star1">★</label>
      </div>
      <textarea id="review-text" placeholder="Ceritakan pengalaman Anda..."></textarea>
      <div class="popup-actions">
        <button class="secondary-btn cancel" onclick="this.closest('.review-overlay').remove()">Batal</button>
        <button class="primary-btn confirm" onclick="submitReview('${villaName}')">Kirim</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function submitReview(villaName) {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const comment = document.getElementById("review-text").value;

  if (!rating) return showToast("Pilih rating bintang terlebih dahulu!");

  showToast(
    `Terima kasih! Ulasan bintang ${rating} untuk ${villaName} telah terkirim.`
  );
  document.querySelector(".review-overlay").remove();
}
