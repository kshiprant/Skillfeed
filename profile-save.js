import { auth, db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

function setStatus(t){ status.textContent = t; }

saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    setStatus("❌ Not logged in. Please login again.");
    window.location.href = "/index.html";
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

  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email || "",
      name,
      skills,
      location,
      startup,
      bio,
      level,
      updatedAt: Date.now()
    }, { merge: true });

    setStatus("✅ Saved! Redirecting...");
    setTimeout(() => window.location.href = "/profile.html", 700);
  } catch (e) {
    console.error(e);
    setStatus("❌ " + (e.message || e));
  }
});
