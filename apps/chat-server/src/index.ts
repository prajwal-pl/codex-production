import { WebSocketServer, WebSocket } from "ws";

import prisma from "@repo/db";

import dotenv from "dotenv";
import { User } from "./types";

dotenv.config();

const port = process.env.PORT || 443;

const wss = new WebSocketServer({ port: Number(port) });

const connectedUsers: Map<string, User> = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");
  // ws.on("message", (message) => {
  //   console.log(`Received: ${message}`);
  // });

  // payload: { type: "join", userId: "123" , room: "room1" }
});

wss.addListener("listening", () => {
  console.log(`WebSocket server is listening on port ${port}`);
});
