import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

  let currentUser = null;
  let currentProfileData = {
    name: "",
    username: "",
    skills: "",
    location: "",
    interest: "",
    bio: "",
    level: "Level 1 - Learner"
  };

  function createTag(text) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = text.trim();
    return span;
  }

  function renderProfile(data) {
    profileName.textContent = data.name || "Your Name";
    profileLocation.textContent = data.location || "Your Location";
    profileLevel.textContent = data.level || "Level 1 - Learner";
    profileBio.textContent = data.bio || "Add a short bio to tell people what you do.";
    profileInterest.textContent = data.interest || "No startup interest added yet.";

    const firstLetter = (data.name || "S").trim().charAt(0).toUpperCase();
    profileAvatar.textContent = firstLetter || "S";

    profileSkills.innerHTML = "";
    if ((data.skills || "").trim()) {
      data.skills.split(",").forEach((skill) => {
        if (skill.trim()) {
          profileSkills.appendChild(createTag(skill));
        }
      });
    } else {
      profileSkills.innerHTML = `<p class="empty-text">No skills added yet.</p>`;
    }

    nameInput.value = data.name || "";
    skillsInput.value = data.skills || "";
    locationInput.value = data.location || "";
    interestInput.value = data.interest || "";
    bioInput.value = data.bio || "";
    levelInput.value = data.level || "Level 1 - Learner";
  }

  function showEditMode() {
    if (profileView) profileView.style.display = "none";
    if (profileEdit) profileEdit.style.display = "block";
  }

  function showViewMode() {
    if (profileView) profileView.style.display = "block";
    if (profileEdit) profileEdit.style.display = "none";
  }

  async function loadProfile() {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        currentProfileData = {
          name: data.name || "",
          username: data.username || "",
          skills: data.skills || "",
          location: data.location || "",
          interest: data.interest || data.startup || "",
          bio: data.bio || "",
          level: data.level || "Level 1 - Learner"
        };
      } else {
        currentProfileData = {
          name: "",
          username: currentUser.email ? currentUser.email.split("@")[0] : "",
          skills: "",
          location: "",
          interest: "",
          bio: "",
          level: "Level 1 - Learner"
        };
      }

      renderProfile(currentProfileData);
      showViewMode();
    } catch (e) {
      console.error("Load profile error:", e);
    }
  }

  async function saveProfile() {
    if (!currentUser) return;

    const data = {
      name: nameInput.value.trim(),
      username: currentUser.email ? currentUser.email.split("@")[0] : currentUser.uid,
      skills: skillsInput.value.trim(),
      location: locationInput.value.trim(),
      interest: interestInput.value.trim(),
      startup: interestInput.value.trim(),
      bio: bioInput.value.trim(),
      level: levelInput.value,
      email: currentUser.email || "",
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
      currentProfileData = data;
      renderProfile(currentProfileData);
      showViewMode();
    } catch (e) {
      console.error("Save profile error:", e);
      alert("❌ Failed to save profile.");
    }
  }

  if (editBtn) {
    editBtn.addEventListener("click", showEditMode);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      renderProfile(currentProfileData);
      showViewMode();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", saveProfile);
  }

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "/index.html";
      return;
    }

    currentUser = user;
    loadProfile();
  });
});
