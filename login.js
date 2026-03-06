import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const status = document.getElementById("status");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

function setStatus(t) {
  if (status) status.textContent = t;
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "/home.html";
  }
});

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const emailValue = email?.value.trim();
    const passwordValue = password?.value;

    if (!emailValue || !passwordValue) {
      setStatus("Please enter email and password.");
      return;
    }

    setStatus("Logging in...");

    try {
      await signInWithEmailAndPassword(auth, emailValue, passwordValue);
      setStatus("✅ Logged in");
      window.location.href = "/home.html";
    } catch (e) {
      console.error(e);
      setStatus("❌ " + (e.message || e));
    }
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const emailValue = email?.value.trim();
    const passwordValue = password?.value;

    if (!emailValue || !passwordValue) {
      setStatus("Please enter email and password.");
      return;
    }

    if (passwordValue.length < 6) {
      setStatus("Password should be at least 6 characters.");
      return;
    }

    setStatus("Creating account...");

    try {
      await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      setStatus("✅ Account created");
      window.location.href = "/home.html";
    } catch (e) {
      console.error(e);
      setStatus("❌ " + (e.message || e));
    }
  });
}
