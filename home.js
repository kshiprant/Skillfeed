import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ideasList = document.getElementById("ideasList");
const count = document.getElementById("count");

const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));

onSnapshot(q, (snap) => {
  if (count) count.textContent = snap.size;

  if (!ideasList) return;

  if (snap.empty) {
    ideasList.innerHTML = `<div class="card">No ideas yet. Post the first one.</div>`;
    return;
  }

  ideasList.innerHTML = "";

  snap.forEach((d) => {
    const idea = d.data();

    const div = document.createElement("div");
    div.className = "person";

    div.innerHTML = `
      <h3>${idea.title || "Untitled"} <span class="badge">Idea</span></h3>
      <p>${idea.desc || ""}</p>
      <p style="margin-top:8px;"><b>By:</b> ${idea.ownerEmail || "Unknown"}</p>
      <div class="hr"></div>
      <button class="btn secondary" type="button" onclick="alert('Join requests next!')">Join Project</button>
    `;

    ideasList.appendChild(div);
  });
});
