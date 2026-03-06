import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const requestList = document.getElementById("requestList");
const connectionsList = document.getElementById("connectionsList");
const notificationsList = document.getElementById("notificationsList");

const reqCount = document.getElementById("reqCount");
const connCount = document.getElementById("connCount");
const notifCount = document.getElementById("notifCount");

async function loadConnectionRequests() {
  const user = auth.currentUser;
  if (!user || !requestList) return;

  const q = query(
    collection(db, "connection_requests"),
    where("toUid", "==", user.uid),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  if (reqCount) reqCount.textContent = snap.size;

  if (snap.empty) {
    requestList.innerHTML = `<div class="card">No connection requests.</div>`;
    return;
  }

  requestList.innerHTML = "";

  snap.forEach((d) => {
    const r = d.data();
    const div = document.createElement("div");
    div.className = "person";
    div.innerHTML = `
      <h3>${r.fromEmail || "Unknown user"}</h3>
      <p>Wants to connect with you.</p>
      <div class="hr"></div>
      <button class="btn accept-req" data-id="${d.id}" data-from="${r.fromUid}">Accept</button>
      <button class="btn secondary reject-req" data-id="${d.id}">Reject</button>
    `;
    requestList.appendChild(div);
  });
}

async function loadConnections() {
  const user = auth.currentUser;
  if (!user || !connectionsList) return;

  const q = query(collection(db, "connections"), where("users", "array-contains", user.uid));
  const snap = await getDocs(q);

  if (connCount) connCount.textContent = snap.size;

  if (snap.empty) {
    connectionsList.innerHTML = `<div class="card">No connections yet.</div>`;
    return;
  }

  connectionsList.innerHTML = "";

  snap.forEach((d) => {
    const c = d.data();
    const otherEmail =
      c.user1Uid === user.uid ? (c.user2Email || "Unknown") : (c.user1Email || "Unknown");

    const div = document.createElement("div");
    div.className = "person";
    div.innerHTML = `
      <h3>${otherEmail}</h3>
      <p>Connected</p>
    `;
    connectionsList.appendChild(div);
  });
}

async function loadNotifications() {
  const user = auth.currentUser;
  if (!user || !notificationsList) return;

  const q = query(
    collection(db, "notifications"),
    where("userUid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  if (notifCount) notifCount.textContent = snap.size;

  if (snap.empty) {
    notificationsList.innerHTML = `<div class="card">No notifications yet.</div>`;
    return;
  }

  notificationsList.innerHTML = "";

  snap.forEach((d) => {
    const n = d.data();
    const div = document.createElement("div");
    div.className = "person";
    div.innerHTML = `
      <h3>${n.type || "Notification"}</h3>
      <p>${n.text || ""}</p>
    `;
    notificationsList.appendChild(div);
  });
}

document.addEventListener("click", async (e) => {
  const user = auth.currentUser;
  if (!user) return;

  if (e.target.classList.contains("accept-req")) {
    const requestId = e.target.dataset.id;
    const fromUid = e.target.dataset.from;

    try {
      const reqRef = doc(db, "connection_requests", requestId);
      await updateDoc(reqRef, { status: "accepted" });

      await addDoc(collection(db, "connections"), {
        users: [user.uid, fromUid],
        user1Uid: user.uid,
        user1Email: user.email || "",
        user2Uid: fromUid,
        user2Email: "",
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "notifications"), {
        userUid: fromUid,
        type: "connection_accepted",
        text: `${user.email || "Someone"} accepted your connection request`,
        createdAt: serverTimestamp(),
        read: false
      });

      await loadConnectionRequests();
      await loadConnections();
      await loadNotifications();
    } catch (err) {
      console.error(err);
      alert("Failed to accept request.");
    }
  }

  if (e.target.classList.contains("reject-req")) {
    const requestId = e.target.dataset.id;

    try {
      const reqRef = doc(db, "connection_requests", requestId);
      await updateDoc(reqRef, { status: "rejected" });

      await loadConnectionRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to reject request.");
    }
  }
});

auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  await loadConnectionRequests();
  await loadConnections();
  await loadNotifications();
});
