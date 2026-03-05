import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const status = document.getElementById("status");
const loginBtn = document.getElementById("loginBtn");

function setStatus(t){ status.textContent = t; }

loginBtn.addEventListener("click", async () => {
  setStatus("Logging in...");
  try{
    await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
    setStatus("✅ Logged in");
    window.location.href = "/home.html";
  }catch(e){
    console.error(e);
    setStatus("❌ " + (e.message || e));
  }
});
