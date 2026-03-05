import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.logout = async function logout(){
  await signOut(auth);
  window.location.href = "/index.html";
};

// If a page has <body data-protected="1"> then require login
const protectedPage = document.body?.dataset?.protected === "1";

if (protectedPage) {
  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "/index.html";
  });
}
