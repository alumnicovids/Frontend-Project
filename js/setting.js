function getProfileState() {
  return (
    JSON.parse(localStorage.getItem("userProfile")) || {
      name: "Undefined",
      birth: "",
      sex: "Undefined",
      email: "Undefined",
      phone: "Undefined",
      profileImage: "Media/photo-profile.jpg",
    }
  );
}

function saveState(state) {
  // Persistensi data profil menggunakan LocalStorage (Name, Email, Phone, Profile Image)
  localStorage.setItem("userProfile", JSON.stringify(state));
}

function loadProfile() {
  const state = getProfileState();
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
  // Mengambil semua data dari elemen input/span lalu disimpan ke state global
  const state = getProfileState();
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

  saveState(state); // Update property state
}

function attachEventListeners() {
  const container = document.querySelector(".profile-edit-container");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".primary-btn.edit");
    if (!editBtn || editBtn.id === "changeBirth") return;

    const valueSpan = editBtn.parentElement.querySelector(".value");
    if (!valueSpan) return;

    const fieldName = editBtn.id.replace("change", "");
    showEditModal(fieldName, valueSpan.innerText, (newValue) => {
      valueSpan.innerText = newValue;
      updateProfile();
      showToast(`${fieldName} updated successfully`);
    });
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
          // Menggunakan FileReader API untuk mengubah file gambar yang diupload menjadi Base64 string agar bisa disimpan langsung di LocalStorage
          reader.onload = (event) => {
            document.getElementById("profile-img").src = event.target.result;
            updateProfile();
            showToast("Profile photo updated");
          };
          reader.readAsDataURL(file);
        } else {
          showToast("File too large (max 5MB)");
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
