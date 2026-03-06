import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ideasList = document.getElementById("ideasList");
const count = document.getElementById("count");

const homeIdeaTitle = document.getElementById("homeIdeaTitle");
const homeIdeaDesc = document.getElementById("homeIdeaDesc");
const homePostIdeaBtn = document.getElementById("homePostIdeaBtn");
const homeStatus = document.getElementById("homeStatus");

function setHomeStatus(text) {
  if (homeStatus) homeStatus.textContent = text;
}

if (homePostIdeaBtn) {
  homePostIdeaBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      setHomeStatus("❌ Please login again.");
      window.location.href = "/index.html";
      return;
    }

    const title = homeIdeaTitle.value.trim();
    const desc = homeIdeaDesc.value.trim();

    if (!title || !desc) {
      setHomeStatus("Please fill title and description.");
      return;
    }

    setHomeStatus("Posting...");

    try {
      await addDoc(collection(db, "ideas"), {
        title,
        desc,
        ownerUid: user.uid,
        ownerEmail: user.email || "",
        createdAt: serverTimestamp()
      });

      homeIdeaTitle.value = "";
      homeIdeaDesc.value = "";
      setHomeStatus("✅ Idea posted!");
      setTimeout(() => setHomeStatus(""), 1200);
    } catch (e) {
      console.error("Home post error:", e);
      setHomeStatus("❌ " + (e.message || e));
    }
  });
}

const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));

onSnapshot(
  q,
  (snap) => {
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
  },
  (error) => {
    console.error("Feed load error:", error);
    if (ideasList) {
      ideasList.innerHTML = `<div class="card">❌ Failed to load posts: ${error.message}</div>`;
    }
  }
);
