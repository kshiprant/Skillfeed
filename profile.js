import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, setLogLevel } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

setLogLevel("debug"); // helps when you open console later (optional)

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

let currentUser = null;

function setStatus(msg) {
  status.innerText = msg;
}

window.addEventListener("error", (e) => {
  setStatus("JS Error: " + (e.message || e));
});

window.addEventListener("unhandledrejection", (e) => {
  setStatus("Promise Error: " + (e.reason?.message || e.reason || e));
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    setStatus("Not logged in. Redirecting...");
    window.location.href = "/";
    return;
  }
  currentUser = user;
  setStatus("Logged in as: " + (user.email || "unknown"));
});

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Firestore not responding in " + ms/1000 + "s")), ms)
    ),
  ]);
}

saveBtn.addEventListener("click", async () => {
  try {
    if (!currentUser) {
      setStatus("User not ready yet. Try again.");
      return;
    }
    if (!db) {
      setStatus("DB not initialized (db is undefined). Check firebase.js export.");
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

    setStatus("Step 1/3: Preparing write...");

    const ref = doc(db, "users", currentUser.uid);

    setStatus("Step 2/3: Writing to Firestore...");

    await withTimeout(
      setDoc(ref, {
        name, skills, location, startup, bio, level,
        email: currentUser.email || "",
        updatedAt: Date.now()
      }, { merge: true }),
      8000
    );

    setStatus("Step 3/3: ✅ Saved! Redirecting...");
    setTimeout(() => (window.location.href = "/profile.html"), 700);

  } catch (e) {
    console.error(e);
    setStatus("❌ Save failed: " + (e?.message || e));
    alert("Save failed: " + (e?.message || e));
  }
});
