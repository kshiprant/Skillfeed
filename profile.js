import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
  let currentProfile = {
    name: "",
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
    if (data.skills && data.skills.trim()) {
      data.skills.split(",").forEach(skill => {
        if (skill.trim()) profileSkills.appendChild(createTag(skill));
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
    profileView.style.display = "none";
    profileEdit.style.display = "block";
  }

  function showViewMode() {
    profileView.style.display = "block";
    profileEdit.style.display = "none";
  }

  async function loadProfile(uid) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      currentProfile = {
        name: snap.data().name || "",
        skills: snap.data().skills || "",
        location: snap.data().location || "",
        interest: snap.data().startup || snap.data().interest || "",
        bio: snap.data().bio || "",
        level: snap.data().level || "Level 1 - Learner"
      };
    }

    renderProfile(currentProfile);
    showViewMode();
  }

  editBtn.addEventListener("click", showEditMode);

  cancelBtn.addEventListener("click", () => {
    renderProfile(currentProfile);
    showViewMode();
  });

  saveBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please login first.");
      window.location.href = "/index.html";
      return;
    }

    const data = {
      uid: currentUser.uid,
      email: currentUser.email || "",
      name: nameInput.value.trim(),
      skills: skillsInput.value.trim(),
      location: locationInput.value.trim(),
      startup: interestInput.value.trim(),
      bio: bioInput.value.trim(),
      level: levelInput.value,
      updatedAt: Date.now()
    };

    try {
      await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });

      currentProfile = {
        name: data.name,
        skills: data.skills,
        location: data.location,
        interest: data.startup,
        bio: data.bio,
        level: data.level
      };

      renderProfile(currentProfile);
      showViewMode();
      alert("Profile saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  });

  window.logout = async function () {
    await signOut(auth);
    window.location.href = "/index.html";
  };

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "/index.html";
      return;
    }
    currentUser = user;
    await loadProfile(user.uid);
  });
});
