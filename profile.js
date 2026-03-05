import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

let currentUser = null;

function setStatus(msg) {
  if (statusEl) statusEl.innerText = msg;
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in → send to login
    window.location.href = "/";
    return;
  }
  currentUser = user;
});

saveBtn.addEventListener("click", async () => {
  try {
    if (!currentUser) {
      setStatus("Not logged in. Redirecting...");
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
      setStatus("Please enter your name.");
      return;
    }

    setStatus("Saving...");

    await setDoc(doc(db, "users", currentUser.uid), {
      name,
      skills,
      location,
      startup,
      bio,
      level,
      email: currentUser.email || "",
      updatedAt: Date.now()
    }, { merge: true });

    setStatus("✅ Profile saved!");
    // Go to people page to see yourself
    window.location.href = "/people.html";

  } catch (err) {
    console.error(err);
    setStatus("❌ Error: " + (err?.message || "Unknown error"));
    alert(err?.message || "Failed to save profile");
  }
});
