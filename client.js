let socket;
let userId;

async function submitCode() {
  const code = document.getElementById("codeInput").value;
  const res = await fetch("https://chat-privasi.up.railway.app/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (data.success) {
    userId = data.userId;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
    initChat();
  } else {
    document.getElementById("authMessage").innerText = data.error;
  }
}

function renderMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(msg.sender === userId ? "you" : "other");
  div.textContent = msg.text;
  document.getElementById("messages").appendChild(div);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

async function initChat() {
  const res = await fetch("https://chat-privasi.up.railway.app/messages");
  const messages = await res.json();
  messages.forEach(renderMessage);

  socket = io("https://chat-privasi.up.railway.app");
  socket.emit("join", userId);

  socket.on("message", (msg) => {
    renderMessage(msg);
  });
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value;
  if (!text.trim()) return;

  const msg = {
    text,
    sender: userId,
  };
  socket.emit("message", msg);
  input.value = "";
}
