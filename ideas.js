const ideaTitle = document.getElementById("ideaTitle");
const ideaDesc = document.getElementById("ideaDesc");
const postIdeaBtn = document.getElementById("postIdeaBtn");
const status = document.getElementById("status");
const ideasList = document.getElementById("ideasList");
const count = document.getElementById("count");

function setStatus(t) {
  if (status) status.textContent = t;
}

function getIdeas() {
  return JSON.parse(localStorage.getItem("skillfeed_ideas") || "[]");
}

function saveIdeas(ideas) {
  localStorage.setItem("skillfeed_ideas", JSON.stringify(ideas));
}

function getCurrentUser() {
  return {
    uid: localStorage.getItem("skillfeed_uid") || "local-user",
    email: localStorage.getItem("skillfeed_email") || "localuser@skillfeed.com"
  };
}

function renderIdeas() {
  const ideas = getIdeas();

  if (count) count.textContent = ideas.length;

  if (!ideasList) return;

  if (ideas.length === 0) {
    ideasList.innerHTML = `<div class="card">No ideas yet. Post the first one.</div>`;
    return;
  }

  ideasList.innerHTML = "";

  ideas.slice().reverse().forEach((idea) => {
    const div = document.createElement("div");
    div.className = "person";

    div.innerHTML = `
      <h3>${idea.title || "Untitled"} <span class="badge">Idea</span></h3>
      <p>${idea.desc || ""}</p>
      <p style="margin-top:8px;"><b>By:</b> ${idea.ownerEmail || "Unknown"}</p>
      <div class="hr"></div>
      <button class="btn secondary" type="button">Join Project</button>
    `;

    ideasList.appendChild(div);
  });
}

if (postIdeaBtn) {
  postIdeaBtn.addEventListener("click", () => {
    const user = getCurrentUser();
    const title = ideaTitle?.value.trim();
    const desc = ideaDesc?.value.trim();

    if (!title || !desc) {
      setStatus("Please fill title and description.");
      return;
    }

    const ideas = getIdeas();

    ideas.push({
      id: Date.now().toString(),
      title,
      desc,
      ownerUid: user.uid,
      ownerEmail: user.email,
      createdAt: new Date().toISOString()
    });

    saveIdeas(ideas);

    ideaTitle.value = "";
    ideaDesc.value = "";

    setStatus("✅ Idea posted!");
    setTimeout(() => setStatus(""), 1200);

    renderIdeas();
  });
}

renderIdeas();
