import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 MANUAL ID → SOCKET ID MAP
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
    console.log("📞 CALL REQUEST TO:", to);
    console.log("📦 CURRENT USERS:", users);

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

    console.log("✅ CALL SENT TO:", to);
  });

  socket.on("answer-call", ({ to, answer }) => {
    const targetSocketId = users[to];
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call-answered", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = users[to];
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      delete users[socket.userId];
      console.log("❌ DISCONNECTED:", socket.userId);
    }
  });
});

server.listen(5000, () =>
  console.log("🚀 Signalling server running on port 5000")
);
