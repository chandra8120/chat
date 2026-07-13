import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔥 USER ID → { socketId, profile } MAP
const users = {};

function broadcastOnlineUsers() {
  const list = Object.entries(users).map(([id, u]) => ({
    id,
    profile: u.profile || null,
  }));
  io.emit("online-users", list);
}

io.on("connection", (socket) => {
  console.log("🔌 Connected socket:", socket.id);

  // ✅ REGISTER USER
  socket.on("register", (userId, profile) => {
    const existing = users[userId];
    if (existing && existing.socketId !== socket.id) {
      const existingSocket = io.sockets.sockets.get(existing.socketId);
      if (existingSocket && existingSocket.connected) {
        console.log("❌ ID TAKEN:", userId);
        socket.emit("id-taken", { id: userId });
        return;
      }
    }

    users[userId] = { socketId: socket.id, profile: profile || null };
    socket.userId = userId;

    console.log("🆔 REGISTERED:", userId, "=>", socket.id);
    console.log("📦 USERS MAP:", users);

    // 🟢 SEND ONLINE USERS LIST
    broadcastOnlineUsers();
  });

  // 📞 CALL USER
  socket.on("call-user", ({ to, offer, type }) => {
    if (to === socket.userId) {
      console.log("❌ SELF CALL BLOCKED:", to);
      return;
    }

    const targetSocketId = users[to]?.socketId;
    if (!targetSocketId) {
      console.log("❌ USER NOT FOUND:", to);
      socket.emit("call-failed", { to, reason: "offline" });
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
    const targetSocketId = users[to]?.socketId;
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("call-answered", { answer });
  });

  // ❄️ ICE CANDIDATE
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = users[to]?.socketId;
    if (!targetSocketId) return;

    io.to(targetSocketId).emit("ice-candidate", { candidate });
  });

  // 💬 SEND CHAT MESSAGE
  socket.on("send-message", ({ to, message }) => {
    if (to === socket.userId) return;
    if (!message || !message.trim()) return;

    const targetSocketId = users[to]?.socketId;
    if (!targetSocketId) {
      console.log("❌ MESSAGE TARGET NOT FOUND:", to);
      socket.emit("message-failed", { to, reason: "offline" });
      return;
    }

    io.to(targetSocketId).emit("receive-message", {
      from: socket.userId,
      message,
      time: Date.now(),
    });

    console.log("💬 MESSAGE:", socket.userId, "→", to);
  });

  // ❌ END CALL
  socket.on("end-call", ({ to }) => {
    if (!to || to === socket.userId) return;

    const targetSocketId = users[to]?.socketId;
    if (!targetSocketId) {
      console.log("❌ END-CALL TARGET NOT FOUND:", to);
      socket.emit("call-failed", { to, reason: "offline" });
      return;
    }

    io.to(targetSocketId).emit("call-ended", { from: socket.userId });
    console.log("📴 CALL ENDED:", socket.userId, "→", to);
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    if (socket.userId && users[socket.userId]?.socketId === socket.id) {
      delete users[socket.userId];

      console.log("❌ DISCONNECTED:", socket.userId);
      console.log("📦 USERS MAP:", users);

      // 🟢 UPDATE ONLINE USERS LIST
      broadcastOnlineUsers();
    }
  });
});

server.listen(5000, () => {
  console.log("🚀 Signalling server running on port 5000");
});
