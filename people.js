const list = document.getElementById("list");
const status = document.getElementById("status");
const count = document.getElementById("count");
const searchUser = document.getElementById("searchUser");

let allUsers = [];

function setStatus(t) {
  if (status) status.textContent = t;
}

function renderUsers(users) {
  if (!list) return;

  if (users.length === 0) {
    list.innerHTML = `<div class="card">No users found.</div>`;
    return;
  }

  list.innerHTML = "";

  users.forEach((p) => {
    const div = document.createElement("div");
    div.className = "person";

    div.innerHTML = `
      <h3>${p.name || "Unnamed"} <span class="badge">Lv ${p.level || "1"}</span></h3>
      <p><b>Username:</b> ${p.username || "-"}</p>
      <p><b>Skills:</b> ${p.skills || "-"}</p>
      <p><b>Location:</b> ${p.location || "-"}</p>
      <p><b>Startup:</b> ${p.startup || "-"}</p>
    `;

    list.appendChild(div);
  });
}

(function loadPeople() {
  setStatus("Loading people...");

  try {
    allUsers = JSON.parse(localStorage.getItem("skillfeed_users") || "[]");

    if (count) count.textContent = allUsers.length;

    if (allUsers.length === 0) {
      setStatus("No profiles yet. Create yours first.");
      if (list) list.innerHTML = `<div class="card">No users found.</div>`;
      return;
    }

    setStatus("");
    renderUsers(allUsers);
  } catch (e) {
    console.error(e);
    setStatus("❌ " + (e.message || e));
  }
})();

if (searchUser) {
  searchUser.addEventListener("input", () => {
    const queryText = searchUser.value.toLowerCase().trim();

    const filtered = allUsers.filter((user) =>
      (user.username || "").toLowerCase().includes(queryText) ||
      (user.name || "").toLowerCase().includes(queryText) ||
      (user.skills || "").toLowerCase().includes(queryText) ||
      (user.startup || "").toLowerCase().includes(queryText)
    );

    renderUsers(filtered);
  });
}
