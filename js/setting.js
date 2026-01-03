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

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      el.tagName === "INPUT" ? (el.value = value) : (el.innerText = value);
    }
  });

  const imgEl = document.getElementById("profile-img");
  if (imgEl && state.profileImage) imgEl.src = state.profileImage;
}

function updateProfile() {
  const getValue = (id, isInput = false) => {
    const el = document.getElementById(id);
    return el ? (isInput ? el.value : el.innerText) : "Undefined";
  };

  state.name = getValue("profileName");
  state.birth = getValue("profileBirth", true);
  state.sex = getValue("profileSex");
  state.email = getValue("profileEmail");
  state.phone = getValue("profileNumber");
  state.profileImage = document.getElementById("profile-img")?.src;

  saveState();
}

function attachEventListeners() {
  document.querySelectorAll(".primary-btn.edit").forEach((button) => {
    button.onclick = (e) => {
      if (e.target.id === "changeBirth") return;

      const valueSpan = e.target.parentElement.querySelector(".value");
      if (!valueSpan) return;

      const fieldName = e.target.id.replace("change", "");

      showEditModal(fieldName, valueSpan.innerText, (newValue) => {
        valueSpan.innerText = newValue;
        updateProfile();
        showToast(`${fieldName} updated successfully`);
      });
    };
  });

  const birthBtn = document.getElementById("changeBirth");
  if (birthBtn) {
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
        if (file && file.size <= 5000000) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById("profile-img").src = event.target.result;
            updateProfile();
            showToast("Profile photo updated");
          };
          reader.readAsDataURL(file);
        } else {
          showToast("File too large (max 5MB) or invalid format");
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
