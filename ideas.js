import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ideaTitle = document.getElementById("ideaTitle");
const ideaDesc = document.getElementById("ideaDesc");
const postIdeaBtn = document.getElementById("postIdeaBtn");
const status = document.getElementById("status");
const ideasList = document.getElementById("ideasList");
const count = document.getElementById("count");

function setStatus(t) {
  if (status) status.textContent = t;
}

/* ---------------- POST IDEA ---------------- */

if (postIdeaBtn) {
  postIdeaBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      setStatus("❌ Please login again.");
      window.location.href = "/index.html";
      return;
    }

    const title = ideaTitle?.value.trim();
    const desc = ideaDesc?.value.trim();

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
      console.error("Post idea error:", e);
      setStatus("❌ " + (e.message || e));
    }
  });
}

/* ---------------- LIVE IDEA FEED ---------------- */

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
        <button 
          class="btn secondary join-btn"
          data-id="${d.id}"
          data-owner="${idea.ownerUid}">
          Join Project
        </button>
      `;

      ideasList.appendChild(div);
    });
  },
  (error) => {
    console.error("Ideas snapshot error:", error);

    if (ideasList) {
      ideasList.innerHTML = `
        <div class="card">
          ❌ Failed to load ideas: ${error.message}
        </div>
      `;
    }

    setStatus("❌ Failed to load ideas.");
  }
);

/* ---------------- JOIN REQUEST SYSTEM ---------------- */

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("join-btn")) return;

  const ideaId = e.target.dataset.id;
  const ownerUid = e.target.dataset.owner;
  const user = auth.currentUser;

  if (!user) {
    alert("Please login again.");
    return;
  }

  if (user.uid === ownerUid) {
    alert("You cannot join your own project.");
    return;
  }

  try {
    await addDoc(collection(db, "join_requests"), {
      ideaId,
      ownerUid,
      requesterUid: user.uid,
      requesterEmail: user.email || "",
      status: "pending",
      createdAt: serverTimestamp()
    });

    alert("✅ Request sent to project owner!");
  } catch (err) {
    console.error("Join request error:", err);
    alert("❌ Error sending request.");
  }
});
