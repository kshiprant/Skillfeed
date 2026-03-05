import { auth, db } from "./firebase.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

saveBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in.");
    window.location.href = "/";
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

    await setDoc(doc(db, "users", user.uid), {
      name,
      skills,
      location,
      startup,
      bio,
      level,
      email: user.email
    });

    status.innerText = "Profile saved";

    window.location.href = "/people.html";

  } catch (error) {

    console.error(error);
    status.innerText = "Error saving profile";
    alert(error.message);

  }

});
