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
    if (el) el.innerText = value;
  }
}

function updateProfile() {
  const nameEl = document.getElementById("profileName");
  const birthEl = document.getElementById("profileBirth");
  const sexEl = document.getElementById("profileSex");
  const emailEl = document.getElementById("profileEmail");
  const phoneEl = document.getElementById("profileNumber");

  if (nameEl) state.name = nameEl.innerText;
  if (birthEl) state.birth = birthEl.innerText;
  if (sexEl) state.sex = sexEl.innerText;
  if (emailEl) state.Email = emailEl.innerText;
  if (phoneEl) state.Phone = phoneEl.innerText;

  saveState();
}

function attachEventListeners() {
  document.querySelectorAll(".edit-link").forEach((button) => {
    button.onclick = (e) => {
      const valueSpan = e.target.parentElement.querySelector(".value");
      if (!valueSpan) return;

      const fieldName = e.target.id.replace("change", "");
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
}

function initSetting() {
  loadProfile();
  attachEventListeners();
}
