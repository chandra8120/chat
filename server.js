import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 MANUAL USER ID → SOCKET ID MAP
const users = {};

io.on("connection", (socket) => {
  console.log("🔌 Connected socket:", socket.id);

  // ✅ REGISTER USER
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    socket.userId = userId;

    console.log("🆔 REGISTERED:", userId, "=>", socket.id);
    console.log("📦 USERS MAP:", users);
  });

  // 📞 CALL USER
  socket.on("call-user", ({ to, offer, type }) => {
    const targetSocketId = users[to];

    if (!targetSocketId) {
      console.log("❌ USER NOT FOUND:", to);
      return;
    }

    io.to(targetSocketId).emit("incoming-call", {
      from: socket.userId,
      offer,
      type,
    });

    console.log("📞 CALL SENT:", socket.userId, "→", to);
  });

  // ✅ ANSWER CALL
  socket.on("answer-call", ({ to, answer }) => {
    const targetSocketId = users[to];
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call-answered", { answer });
  });

  // ❄️ ICE CANDIDATE
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = users[to];
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("ice-candidate", { candidate });
  });

  // 💬 SEND CHAT MESSAGE
  socket.on("send-message", ({ to, message }) => {
    const targetSocketId = users[to];

    if (!targetSocketId) {
      console.log("❌ CHAT USER NOT FOUND:", to);
      return;
    }

    io.to(targetSocketId).emit("receive-message", {
      from: socket.userId,
      message,
      time: Date.now(),
    });

    console.log("💬 MESSAGE:", socket.userId, "→", to);
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    if (socket.userId) {
      delete users[socket.userId];
      console.log("❌ DISCONNECTED:", socket.userId);
    }
  });
});



server.listen(5000, () => {
  console.log("🚀 Signalling server running on port 5000");
});
