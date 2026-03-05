import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const status = document.getElementById("status");
const saveBtn = document.getElementById("saveBtn");

function setStatus(msg) {
  if (status) status.innerText = msg;
}

// PROOF the script loaded
setStatus("profile.js loaded ✅");

if (!saveBtn) {
  setStatus("ERROR: Save button not found (id=saveBtn)");
  throw new Error("Save button not found");
}

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    setStatus("Not logged in. Redirecting...");
    window.location.href = "/";
    return;
  }
  currentUser = user;
  setStatus("Logged in ✅ (" + (user.email || "unknown") + ")");
});

saveBtn.addEventListener("click", async () => {
  try {
    if (!currentUser) {
      setStatus("User not ready yet. Try again.");
      return;
    }
    if (!db) {
      setStatus("DB not initialized. Check firebase.js");
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

    // IMPORTANT: Your Firestore collection is "Users" (capital U)
    await setDoc(doc(db, "Users", currentUser.uid), {
      name, skills, location, startup, bio, level,
      email: currentUser.email || "",
      updatedAt: Date.now()
    }, { merge: true });

    setStatus("✅ Saved! Redirecting...");
    setTimeout(() => (window.location.href = "/profile.html"), 700);

  } catch (e) {
    console.error(e);
    setStatus("❌ Save failed: " + (e?.message || e));
    alert("Save failed: " + (e?.message || e));
  }
});
