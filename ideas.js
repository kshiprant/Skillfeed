import { auth, db } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ideaTitle = document.getElementById("ideaTitle");
const ideaDesc = document.getElementById("ideaDesc");
const postIdeaBtn = document.getElementById("postIdeaBtn");
const status = document.getElementById("status");
const ideasList = document.getElementById("ideasList");
const count = document.getElementById("count");

function setStatus(t){ status.textContent = t; }

postIdeaBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    setStatus("❌ Please login again.");
    window.location.href = "/index.html";
    return;
  }

  const title = ideaTitle.value.trim();
  const desc = ideaDesc.value.trim();

  if (!title || !desc) {
    setStatus("Please fill title and description.");
    return;
  }

  setStatus("Posting...");

  try {
    await addDoc(collection(db, "ideas"), {
      title,
      desc,
      ownerUid: user.uid,
      ownerEmail: user.email || "",
      createdAt: serverTimestamp()
    });

    ideaTitle.value = "";
    ideaDesc.value = "";
    setStatus("✅ Idea posted!");
    setTimeout(() => setStatus(""), 1200);

  } catch (e) {
    console.error(e);
    setStatus("❌ " + (e.message || e));
  }
});

// Live list of ideas
const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));

onSnapshot(q, (snap) => {
  count.textContent = snap.size;

  if (snap.empty) {
    ideasList.innerHTML = `<div class="card">No ideas yet. Post the first one.</div>`;
    return;
  }

  ideasList.innerHTML = "";
  snap.forEach((d) => {
    const idea = d.data();

    const div = document.createElement("div");
    div.className = "person"; // reuse existing card style

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
