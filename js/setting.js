const state = JSON.parse(localStorage.getItem("userProfile")) || {
  name: "Undefined",
  birth: "Undefined",
  sex: "Undefined",
  email: "Undefined",
  phone: "Undefined",
};

function saveState() {
  localStorage.setItem("userProfile", JSON.stringify(state));
}

function loadProfile() {
  const fields = {
    profileName: state.name,
    profileBirth: state.birth,
    profileSex: state.sex,
    profileEmail: state.email,
    profileNumber: state.phone,
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
  if (emailEl) state.email = emailEl.innerText;
  if (phoneEl) state.phone = phoneEl.innerText;
  if (imgEl) state.profileImage = imgEl.src;

  saveState();
}

function attachEventListeners() {
  document.querySelectorAll(".primary-btn.edit").forEach((button) => {
    button.onclick = (e) => {
      const fieldId = e.target.id;
      if (fieldId === "changeBirth") return;

      const valueSpan = e.target.parentElement.querySelector(".value");
      if (!valueSpan) return;

      const fieldName = fieldId.replace("change", "");

      showEditModal(fieldName, valueSpan.innerText, (newValue) => {
        valueSpan.innerText = newValue;
        showToast(fieldName + " Updated successfully");
        updateProfile();
      });
    };
  });

  const birthInput = document.getElementById("profileBirth");
  const birthBtn = document.getElementById("changeBirth");
  if (birthBtn && birthInput) {
    birthBtn.onclick = () => {
      updateProfile();
      showToast("Date of birth updated successfully");
    };
  }

  const selectPhotoBtn = document.querySelector(".secondary-btn.setting");
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
          showToast("File is too large or format is not correct");
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
