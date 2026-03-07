// Get all chat cards
const chats = document.querySelectorAll(".chatCard");

// Loop through chats
chats.forEach((chat, index) => {

  chat.addEventListener("click", () => {

    // Example chat data (later this will come from Firebase)
    const chatData = {
      id: index,
      name: chat.querySelector("h3").innerText,
      role: chat.querySelector(".role").innerText
    };

    // Store chat data temporarily
    sessionStorage.setItem("currentChat", JSON.stringify(chatData));

    // Open chat page
    window.location.href = "chat.html";

  });

});
