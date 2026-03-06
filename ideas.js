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

const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));

onSnapshot(
  q,
  async (snap) => {
    if (count) count.textContent = snap.size;
    if (!ideasList) return;

    if (snap.empty) {
      ideasList.innerHTML = `<div class="card">No ideas yet. Post the first one.</div>`;
      return;
    }

    ideasList.innerHTML = "";

    for (const d of snap.docs) {
      const idea = d.data();
      const commentsQ = query(
        collection(db, "idea_comments"),
        orderBy("createdAt", "asc")
      );

      const div = document.createElement("div");
      div.className = "person";

      div.innerHTML = `
        <h3>${idea.title || "Untitled"} <span class="badge">Idea</span></h3>
        <p>${idea.desc || ""}</p>
        <p style="margin-top:8px;"><b>By:</b> ${idea.ownerEmail || "Unknown"}</p>
        <div class="hr"></div>

        <button class="btn secondary join-btn"
          data-id="${d.id}"
          data-owner="${idea.ownerUid}">
          Join Project
        </button>

        <div class="hr"></div>
        <div class="comments-box" id="comments-${d.id}">Loading comments...</div>

        <div style="margin-top:10px;">
          <input class="comment-input" id="comment-input-${d.id}" placeholder="Write a comment...">
          <button class="btn secondary comment-btn" data-id="${d.id}" data-owner="${idea.ownerUid}">
            Comment
          </button>
        </div>
      `;

      ideasList.appendChild(div);

      onSnapshot(commentsQ, (commentSnap) => {
        const commentsEl = document.getElementById(`comments-${d.id}`);
        if (!commentsEl) return;

        const related = commentSnap.docs.filter(
          (c) => c.data().ideaId === d.id
        );

        if (related.length === 0) {
          commentsEl.innerHTML = `<p class="small">No comments yet.</p>`;
          return;
        }

        commentsEl.innerHTML = related
          .map((c) => {
            const cm = c.data();
            return `<p><b>${cm.userEmail || "User"}:</b> ${cm.text || ""}</p>`;
          })
          .join("");
      });
    }
  },
  (error) => {
    console.error("Ideas snapshot error:", error);
    if (ideasList) {
      ideasList.innerHTML = `<div class="card">❌ Failed to load ideas: ${error.message}</div>`;
    }
    setStatus("❌ Failed to load ideas.");
  }
);

document.addEventListener("click", async (e) => {
  const user = auth.currentUser;
  if (!user) return;

  if (e.target.classList.contains("join-btn")) {
    const ideaId = e.target.dataset.id;
    const ownerUid = e.target.dataset.owner;

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

      await addDoc(collection(db, "notifications"), {
        userUid: ownerUid,
        type: "join_request",
        text: `${user.email || "Someone"} wants to join your project`,
        createdAt: serverTimestamp(),
        read: false
      });

      alert("✅ Request sent to project owner!");
    } catch (err) {
      console.error("Join request error:", err);
      alert("❌ Error sending request.");
    }
  }

  if (e.target.classList.contains("comment-btn")) {
    const ideaId = e.target.dataset.id;
    const ownerUid = e.target.dataset.owner;
    const input = document.getElementById(`comment-input-${ideaId}`);
    const text = input?.value.trim();

    if (!text) {
      alert("Write a comment first.");
      return;
    }

    try {
      await addDoc(collection(db, "idea_comments"), {
        ideaId,
        userUid: user.uid,
        userEmail: user.email || "",
        text,
        createdAt: serverTimestamp()
      });

      if (user.uid !== ownerUid) {
        await addDoc(collection(db, "notifications"), {
          userUid: ownerUid,
          type: "idea_comment",
          text: `${user.email || "Someone"} commented on your idea`,
          createdAt: serverTimestamp(),
          read: false
        });
      }

      input.value = "";
    } catch (err) {
      console.error(err);
      alert("❌ Failed to post comment.");
    }
  }
});
