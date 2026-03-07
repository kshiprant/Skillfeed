const chatList = document.getElementById("chatList");
const emptyState = document.getElementById("emptyState");

const chats = [];

function renderChats() {
  if (!chats.length) {
    chatList.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  chatList.style.display = "flex";

  chatList.innerHTML = chats.map((chat, index) => `
    <div class="chatCard" data-index="${index}">
      <img src="${chat.image}" alt="${chat.name}">
      <div class="chatInfo">
        <h3>${chat.name}</h3>
        <p class="role">${chat.role}</p>
        <p class="preview">${chat.preview}</p>
      </div>
      <div class="meta">
        <span>${chat.time}</span>
        ${chat.unread ? '<div class="dot"></div>' : ''}
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".chatCard").forEach(card => {
    card.addEventListener("click", () => {
      const index = card.dataset.index;
      sessionStorage.setItem("currentChat", JSON.stringify(chats[index]));
      window.location.href = "/chat.html";
    });
  });
}

renderChats();
