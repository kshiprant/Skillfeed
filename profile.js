import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  currentUser = user;
});

saveBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Login required. Please login again.");
    window.location.href = "/";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const skills = document.getElementById("skills").value.trim();
  const location = document.getElementById("location").value.trim();
  const startup = document.getElementById("startup").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const level = document.getElementById("level").value;

  if (!name) {
    status.innerText = "Please enter your name.";
    return;
  }

  status.innerText = "Saving...";

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      name, skills, location, startup, bio, level,
      email: currentUser.email || "",
      updatedAt: Date.now()
    }, { merge: true });

    status.innerText = "✅ Profile saved!";
    setTimeout(() => {
      window.location.href = "/profile.html"; // reflect immediately
    }, 600);

  } catch (e) {
    console.error(e);
    status.innerText = "❌ " + (e?.message || "Failed to save");
    alert(e?.message || "Failed to save profile");
  }
});
