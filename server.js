import express from "express";
import http from "http";
import { Server } from "socket.io";
//
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("call-user", ({ to, offer, type }) => {
    io.to(to).emit("incoming-call", {
      from: socket.id,
      offer,
      type,
    });
  });

  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-answered", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });
});

server.listen(5000, () =>
  console.log("Signalling server running on 5000")
);
