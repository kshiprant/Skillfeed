import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const status = document.getElementById("status");
const registerBtn = document.getElementById("registerBtn");

function setStatus(t){ status.textContent = t; }

registerBtn.addEventListener("click", async () => {
  setStatus("Creating account...");
  try{
    await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
    setStatus("✅ Account created");
    window.location.href = "/home.html";
  }catch(e){
    console.error(e);
    setStatus("❌ " + (e.message || e));
  }
});
