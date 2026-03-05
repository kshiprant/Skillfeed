import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const peopleList = document.getElementById("peopleList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");

let allUsers = [];

function safeText(v) {
  return (v ?? "").toString();
}

function renderUsers(users) {
  if (!peopleList) return;

  if (users.length === 0) {
    peopleList.innerHTML = `
      <div class="card">
        <p>No profiles found. Try different search keywords.</p>
      </div>
    `;
    return;
  }

  peopleList.innerHTML = users.map(u => {
    const name = safeText(u.name) || "Unnamed";
    const skills = safeText(u.skills) || "-";
    const location = safeText(u.location) || "-";
    const startup = safeText(u.startup) || "-";
    const bio = safeText(u.bio) || "-";
    const level = safeText(u.level) || "-";

    return `
      <div class="card">
        <h3>${name} <span style="font-size:12px; opacity:.8;">(Level ${level})</span></h3>
        <p><b>Skills:</b> ${skills}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Startup Interest:</b> ${startup}</p>
        <p style="opacity:.9;"><b>Bio:</b> ${bio}</p>
        <button onclick="connectTo('${name.replace(/'/g, "\\'")}')">Connect</button>
      </div>
    `;
  }).join("");
}

// Placeholder connect action (we’ll make real connections next)
window.connectTo = function(name){
  alert("Connection request sent to " + name + " (demo)");
};

async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));
  allUsers = [];
  snap.forEach(doc => {
    allUsers.push({ id: doc.id, ...doc.data() });
  });
  renderUsers(allUsers);
}

function applySearch() {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) {
    renderUsers(allUsers);
    return;
  }

  const filtered = allUsers.filter(u => {
    const hay = [
      u.name, u.skills, u.location, u.startup, u.bio, u.level
    ].map(v => safeText(v).toLowerCase()).join(" ");
    return hay.includes(q);
  });

  renderUsers(filtered);
}

if (searchBtn) searchBtn.addEventListener("click", applySearch);
if (clearBtn) clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  renderUsers(allUsers);
});
if (searchInput) searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") applySearch();
});

// Auth guard: only logged-in users can view People page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  loadUsers().catch(err => {
    console.error(err);
    peopleList.innerHTML = `
      <div class="card">
        <p>Could not load profiles. Check Firestore rules / console logs.</p>
      </div>
    `;
  });
});
