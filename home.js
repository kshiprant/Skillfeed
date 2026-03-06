const ideasList = document.getElementById("ideasList");
const count = document.getElementById("count");

const homeIdeaTitle = document.getElementById("homeIdeaTitle");
const homeIdeaDesc = document.getElementById("homeIdeaDesc");
const homePostIdeaBtn = document.getElementById("homePostIdeaBtn");
const homeStatus = document.getElementById("homeStatus");

function setHomeStatus(text) {
  if (homeStatus) homeStatus.textContent = text;
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

function renderHomeFeed() {
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

if (homePostIdeaBtn) {
  homePostIdeaBtn.addEventListener("click", () => {
    const user = getCurrentUser();
    const title = homeIdeaTitle?.value.trim();
    const desc = homeIdeaDesc?.value.trim();

    if (!title || !desc) {
      setHomeStatus("Please fill title and description.");
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

    homeIdeaTitle.value = "";
    homeIdeaDesc.value = "";

    setHomeStatus("✅ Idea posted!");
    setTimeout(() => setHomeStatus(""), 1200);

    renderHomeFeed();
  });
}

renderHomeFeed();
