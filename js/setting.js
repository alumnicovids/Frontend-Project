function loadProfile() {
  const fields = {
    profileName: state.name,
    profileBirth: state.birth,
    profileSex: state.sex,
    profileEmail: state.Email,
    profileNumber: state.Phone,
  };

  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === "INPUT") {
        el.value = value;
      } else {
        el.innerText = value;
      }
    }
  }

  const imgEl = document.getElementById("profile-img");
  if (imgEl && state.profileImage) {
    imgEl.src = state.profileImage;
  }
}

function updateProfile() {
  const nameEl = document.getElementById("profileName");
  const birthEl = document.getElementById("profileBirth");
  const sexEl = document.getElementById("profileSex");
  const emailEl = document.getElementById("profileEmail");
  const phoneEl = document.getElementById("profileNumber");
  const imgEl = document.getElementById("profile-img");

  if (nameEl) state.name = nameEl.innerText;
  if (birthEl) state.birth = birthEl.value;
  if (sexEl) state.sex = sexEl.innerText;
  if (emailEl) state.Email = emailEl.innerText;
  if (phoneEl) state.Phone = phoneEl.innerText;
  if (imgEl) state.profileImage = imgEl.src;

  saveState();
}

function attachEventListeners() {
  document.querySelectorAll(".edit-link").forEach((button) => {
    button.onclick = (e) => {
      const fieldId = e.target.id;
      if (fieldId === "changeBirth") return;

      const valueSpan = e.target.parentElement.querySelector(".value");
      if (!valueSpan) return;

      const fieldName = fieldId.replace("change", "");
      const newValue = prompt(
        `Masukkan ${fieldName} baru:`,
        valueSpan.innerText
      );

      if (newValue !== null && newValue.trim() !== "") {
        valueSpan.innerText = newValue;
        updateProfile();
      }
    };
  });

  const birthInput = document.getElementById("profileBirth");
  const birthBtn = document.getElementById("changeBirth");
  if (birthBtn && birthInput) {
    birthBtn.onclick = () => {
      updateProfile();
      alert("Tanggal lahir berhasil diperbarui");
    };
  }

  const selectPhotoBtn = document.querySelector(".btn-select-photo");
  if (selectPhotoBtn) {
    selectPhotoBtn.onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".jpg,.jpeg,.png";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 10000000) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById("profile-img").src = event.target.result;
            updateProfile();
          };
          reader.readAsDataURL(file);
        } else {
          alert("File terlalu besar atau format tidak sesuai");
        }
      };
      input.click();
    };
  }
}

function initSetting() {
  loadProfile();
  attachEventListeners();
}
