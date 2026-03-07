const chats = document.querySelectorAll(".chatCard");

chats.forEach(chat => {

chat.addEventListener("click", () => {

window.location.href = "chat.html";

});

});
