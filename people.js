import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const list = document.getElementById("list");
const status = document.getElementById("status");
const count = document.getElementById("count");

function setStatus(t){ status.textContent = t; }

(async function loadPeople(){
  setStatus("Loading people...");
  try{
    const q = query(collection(db, "users"), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);

    count.textContent = snap.size;

    if (snap.empty){
      setStatus("No profiles yet. Create yours first.");
      list.innerHTML = `<div class="card">No users found.</div>`;
      return;
    }

    setStatus("");

    list.innerHTML = "";
    snap.forEach(docu => {
      const p = docu.data();
      const div = document.createElement("div");
      div.className = "person";
      div.innerHTML = `
        <h3>${p.name || "Unnamed"} <span class="badge">Lv ${p.level || "1"}</span></h3>
        <p><b>Skills:</b> ${p.skills || "-"}</p>
        <p><b>Location:</b> ${p.location || "-"}</p>
        <p><b>Startup:</b> ${p.startup || "-"}</p>
      `;
      list.appendChild(div);
    });
  }catch(e){
    console.error(e);
    setStatus("❌ " + (e.message || e));
  }
})();
