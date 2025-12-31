function showEditModal(fieldName, currentValue, callback) {
  const overlay = document.createElement("div");
  overlay.className = "review-overlay";
  overlay.innerHTML = `
    <div class="review-popup">
      <div class="popup-header">
        <h4>Change ${fieldName}</h4>
      </div>
      <input type="text" id="modal-input" value="${currentValue}">
      <div class="popup-actions">
        <button class="secondary-btn cancel" onclick="this.closest('.review-overlay').remove()">Batal</button>
        <button class="primary-btn confirm" id="modal-save">Simpan</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const saveBtn = overlay.querySelector("#modal-save");
  const input = overlay.querySelector("#modal-input");
  const modal = overlay.querySelector(".review-popup");

  saveBtn.addEventListener("mousedown", (e) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    saveBtn.appendChild(ripple);
    const rect = saveBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  saveBtn.onclick = () => {
    const newValue = input.value;
    if (newValue && newValue.trim() !== "") {
      callback(newValue);
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s ease";
      setTimeout(() => overlay.remove(), 300);
    } else {
      modal.classList.remove("shake");
      void modal.offsetWidth;
      modal.classList.add("shake");
    }
  };

  input.focus();
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveBtn.click();
    else if (e.key === "Escape") overlay.remove();
  });
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
      <div class="popup-header">
        <h4>Berikan Ulasan</h4>
        <p>${villaName}</p>
      </div>
      <div class="star-rating">
        <input type="radio" name="rating" id="star5" value="5"><label for="star5">★</label>
        <input type="radio" name="rating" id="star4" value="4"><label for="star4">★</label>
        <input type="radio" name="rating" id="star3" value="3"><label for="star3">★</label>
        <input type="radio" name="rating" id="star2" value="2"><label for="star2">★</label>
        <input type="radio" name="rating" id="star1" value="1"><label for="star1">★</label>
      </div>
      <textarea id="review-text" placeholder="Ceritakan pengalaman Anda..."></textarea>
      <div class="popup-actions">
        <button class="secondary-btn cancel review" onclick="this.closest('.review-overlay').remove()">Batal</button>
        <button class="primary-btn review confirm" onclick="submitReview('${villaName}')">Kirim Ulasan</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function closeReviewPopup() {
  const overlay = document.querySelector(".review-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }
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
