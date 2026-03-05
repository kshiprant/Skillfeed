import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const card = document.getElementById("profileCard");

function safe(v){ return (v ?? "").toString(); }

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      card.innerHTML = `
        <p>No profile found yet.</p>
        <a href="/create-profile.html">Create your profile</a>
      `;
      return;
    }

    const p = snap.data();

    card.innerHTML = `
      <h3>${safe(p.name) || "Unnamed"} <span style="font-size:12px;opacity:.8;">(Level ${safe(p.level)})</span></h3>
      <p><b>Email:</b> ${safe(p.email) || safe(user.email)}</p>
      <p><b>Skills:</b> ${safe(p.skills) || "-"}</p>
      <p><b>Location:</b> ${safe(p.location) || "-"}</p>
      <p><b>Startup Interest:</b> ${safe(p.startup) || "-"}</p>
      <p><b>Bio:</b> ${safe(p.bio) || "-"}</p>
      <a href="/create-profile.html">Edit profile</a>
    `;
  } catch (e) {
    console.error(e);
    card.innerText = "Error loading profile: " + (e?.message || e);
  }
});
