document.addEventListener("DOMContentLoaded", () => {
  const profileView = document.getElementById("profile-view");
  const profileEdit = document.getElementById("profile-edit");

  const editBtn = document.getElementById("edit-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const saveBtn = document.getElementById("save-profile-btn");

  const nameInput = document.getElementById("name");
  const skillsInput = document.getElementById("skills");
  const locationInput = document.getElementById("location");
  const interestInput = document.getElementById("interest");
  const bioInput = document.getElementById("bio");
  const levelInput = document.getElementById("level");

  const profileName = document.getElementById("profile-name");
  const profileLocation = document.getElementById("profile-location");
  const profileLevel = document.getElementById("profile-level");
  const profileBio = document.getElementById("profile-bio");
  const profileSkills = document.getElementById("profile-skills");
  const profileInterest = document.getElementById("profile-interest");
  const profileAvatar = document.getElementById("profile-avatar");

  function getProfileData() {
    return {
      name: localStorage.getItem("sf_name") || "",
      skills: localStorage.getItem("sf_skills") || "",
      location: localStorage.getItem("sf_location") || "",
      interest: localStorage.getItem("sf_interest") || "",
      bio: localStorage.getItem("sf_bio") || "",
      level: localStorage.getItem("sf_level") || "Level 1 - Learner"
    };
  }

  function saveProfileData(data) {
    localStorage.setItem("sf_name", data.name);
    localStorage.setItem("sf_skills", data.skills);
    localStorage.setItem("sf_location", data.location);
    localStorage.setItem("sf_interest", data.interest);
    localStorage.setItem("sf_bio", data.bio);
    localStorage.setItem("sf_level", data.level);
  }

  function createTag(text) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = text.trim();
    return span;
  }

  function renderProfile() {
    const data = getProfileData();

    profileName.textContent = data.name || "Your Name";
    profileLocation.textContent = data.location || "Your Location";
    profileLevel.textContent = data.level || "Level 1 - Learner";
    profileBio.textContent = data.bio || "Add a short bio to tell people what you do.";
    profileInterest.textContent = data.interest || "No startup interest added yet.";

    const firstLetter = (data.name || "S").trim().charAt(0).toUpperCase();
    profileAvatar.textContent = firstLetter || "S";

    profileSkills.innerHTML = "";
    if (data.skills.trim()) {
      data.skills.split(",").forEach(skill => {
        if (skill.trim()) {
          profileSkills.appendChild(createTag(skill));
        }
      });
    } else {
      profileSkills.innerHTML = `<p class="empty-text">No skills added yet.</p>`;
    }

    nameInput.value = data.name;
    skillsInput.value = data.skills;
    locationInput.value = data.location;
    interestInput.value = data.interest;
    bioInput.value = data.bio;
    levelInput.value = data.level;
  }

  function showEditMode() {
    profileView.style.display = "none";
    profileEdit.style.display = "block";
  }

  function showViewMode() {
    profileView.style.display = "block";
    profileEdit.style.display = "none";
  }

  editBtn.addEventListener("click", showEditMode);

  cancelBtn.addEventListener("click", () => {
    renderProfile();
    showViewMode();
  });

  saveBtn.addEventListener("click", () => {
    const data = {
      name: nameInput.value.trim(),
      skills: skillsInput.value.trim(),
      location: locationInput.value.trim(),
      interest: interestInput.value.trim(),
      bio: bioInput.value.trim(),
      level: levelInput.value
    };

    saveProfileData(data);
    renderProfile();
    showViewMode();
  });

  renderProfile();
  showViewMode();
});
