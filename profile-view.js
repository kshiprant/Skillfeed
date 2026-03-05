import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const card = document.getElementById("profileCard");
const status = document.getElementById("status");

function setStatus(t){ status.textContent = t; }

(async function load(){
  const user = auth.currentUser;
  if (!user) return; // auth.js will redirect

  try{
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()){
      card.innerHTML = `
        <div class="row">
          <div>
            <b>No profile found.</b>
            <div class="small" style="text-align:left;">Create your profile to appear on Find People.</div>
          </div>
        </div>
        <div class="hr"></div>
        <button class="btn" onclick="window.location.href='/create-profile.html'">Create Profile</button>
      `;
      return;
    }

    const p = snap.data();
    card.innerHTML = `
      <div class="row">
        <div>
          <div style="font-weight:900;font-size:16px;">${p.name || "Unnamed"}</div>
          <div class="small" style="text-align:left;">${p.email || user.email || ""}</div>
        </div>
        <span class="badge">Level ${p.level || "1"}</span>
      </div>
      <div class="hr"></div>
      <div class="grid">
        <div><b>Skills:</b> <span class="small">${p.skills || "-"}</span></div>
        <div><b>Location:</b> <span class="small">${p.location || "-"}</span></div>
        <div><b>Startup Interest:</b> <span class="small">${p.startup || "-"}</span></div>
        <div><b>Bio:</b> <span class="small">${p.bio || "-"}</span></div>
      </div>
      <div class="hr"></div>
      <button class="btn secondary" onclick="window.location.href='/create-profile.html'">Edit Profile</button>
    `;
  }catch(e){
    console.error(e);
    setStatus("❌ " + (e.message || e));
    card.textContent = "Failed to load profile.";
  }
})();
