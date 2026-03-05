import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

let userLoaded = false;
let currentUser = null;

onAuthStateChanged(auth, (user) => {

  if (user) {
    currentUser = user;
    userLoaded = true;
  } else {
    window.location.href = "/";
  }

});

saveBtn.addEventListener("click", async () => {

  if (!userLoaded) {
    alert("User not ready yet. Try again.");
    return;
  }

  const name = document.getElementById("name").value;
  const skills = document.getElementById("skills").value;
  const location = document.getElementById("location").value;
  const startup = document.getElementById("startup").value;
  const bio = document.getElementById("bio").value;
  const level = document.getElementById("level").value;

  status.innerText = "Saving...";

  try {

    await setDoc(doc(db, "users", currentUser.uid), {
      name,
      skills,
      location,
      startup,
      bio,
      level,
      email: currentUser.email
    });

    status.innerText = "Profile saved";

    window.location.href = "/people.html";

  } catch (error) {

    console.error(error);
    status.innerText = "Error saving profile";
    alert(error.message);

  }

});
