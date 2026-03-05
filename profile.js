import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, setLogLevel } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

setLogLevel("debug");

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

let currentUser = null;

function setStatus(msg) {
  if (status) status.innerText = msg;
}

window.addEventListener("error", (e) => {
  setStatus("JS Error: " + (e?.message || e));
});

window.addEventListener("unhandledrejection", (e) => {
  setStatus("Promise Error: " + (e?.reason?.message || e?.reason || e));
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

function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Firestore not responding in " + ms / 1000 + "s")), ms)
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
      set
