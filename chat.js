const chatBody = document.getElementById("chatBody");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

function goBack() {
  window.location.href = "connect.html";
}

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}

function createMessage(text, type = "sent") {
  const row = document.createElement("div");
  row.className = `messageRow ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "messageBubble";
  bubble.innerHTML = `
    ${text}
    <span class="time">${getCurrentTime()}</span>
  `;

  row.appendChild(bubble);
  return row;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const sentMessage = createMessage(text, "sent");
  chatBody.appendChild(sentMessage);

  messageInput.value = "";
  scrollToBottom();

  // Demo auto-reply for UI preview
  setTimeout(() => {
    const reply = createMessage("Got it. Let’s build this properly.", "received");
    chatBody.appendChild(reply);
    scrollToBottom();
  }, 900);
}

function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

window.addEventListener("load", scrollToBottom);
