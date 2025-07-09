const BASE_URL = "https://chat-privasi-production.up.railway.app";

async function submitCode() {
  const code = document.getElementById("codeInput").value;
  const res = await fetch(`${BASE_URL}/auth`, {
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

async function initChat() {
  const res = await fetch(`${BASE_URL}/messages`);
  const messages = await res.json();
  messages.forEach(renderMessage);

  socket = io(BASE_URL);
  socket.emit("join", userId);

  socket.on("message", (msg) => {
    renderMessage(msg);
  });
}
