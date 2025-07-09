const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");
const cors = require("cors");
const serviceAccount = require("./serviceAccountKey.json"); // Ganti dengan file key milikmu

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const VALID_CODE = "cincong2025";
let connectedUsers = [];

app.post("/auth", (req, res) => {
  const { code } = req.body;
  if (code === VALID_CODE) {
    if (connectedUsers.length < 2) {
      const userId = Date.now().toString();
      connectedUsers.push(userId);
      return res.json({ success: true, userId });
    } else {
      return res.json({ success: false, error: "Room penuh." });
    }
  } else {
    return res.json({ success: false, error: "Kode salah." });
  }
});

app.get("/messages", async (req, res) => {
  const snapshot = await db.collection("chats").orderBy("timestamp").get();
  const messages = snapshot.docs.map((doc) => doc.data());
  res.json(messages);
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.userId = userId;
  });

  socket.on("message", async (msg) => {
    const messageData = {
      text: msg.text,
      sender: msg.sender,
      timestamp: new Date(),
    };
    await db.collection("chats").add(messageData);
    io.emit("message", messageData);
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers = connectedUsers.filter((id) => id !== socket.userId);
    }
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
