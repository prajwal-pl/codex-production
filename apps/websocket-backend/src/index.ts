import { WebSocketServer, WebSocket } from "ws";

import prisma from "@repo/db/client";

import dotenv from "dotenv";
import { type IncomingMessage, type User } from "./types.js";
import { validateUser } from "./validateUser.js";
import { getOrCreateRoom } from "./rooms.js";

dotenv.config();

const port = process.env.PORT || 443;

const wss = new WebSocketServer({ port: Number(port) });

const connectedUsers: Map<string, User> = new Map();

const broadcastToRoom = (
  roomId: string,
  message: string,
  excludeUserId?: string
) => {
  connectedUsers.forEach((user) => {
    if (user.currentRoom === roomId && user.userId !== excludeUserId) {
      if (user.socket.readyState === WebSocket.OPEN) {
        user.socket.send(JSON.stringify(message));
      }
    }
  });
};

wss.on("connection", (ws) => {
  console.log("Client connected");
  // ws.on("message", (message) => {
  //   console.log(`Received: ${message}`);
  // });
  ws.on("message", async (data) => {
    const message: IncomingMessage = JSON.parse(data.toString());

    if (!message.token) {
      ws.send(JSON.stringify({ type: "error", message: "Token is required" }));
      return;
    }

    const userId = validateUser(message.token);
    if (!userId) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
      return;
    }

    switch (message.type) {
      case "join-room":
        {
          if (!message.roomId) {
            ws.send(
              JSON.stringify({ type: "error", message: "Room ID is required" })
            );
            return;
          }

          try {
            const room = await getOrCreateRoom(message.roomId, userId);

            connectedUsers.set(userId, {
              socket: ws,
              currentRoom: room.id,
              userId: userId,
            });

            ws.send(JSON.stringify({ type: "joined-room", roomId: room.id }));

            broadcastToRoom(
              room.id,
              JSON.stringify({
                type: "user-joined",
                userId: userId,
                roomId: room.id,
              }),
              userId
            );
          } catch (error) {
            console.log(error);
            ws.send(
              JSON.stringify({ type: "error", message: "Failed to join room" })
            );
          }
        }
        break;

      case "send-message": {
        if (!message.content || !message.roomId) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Content and Room ID are required",
            })
          );
          return;
        }

        const user = connectedUsers.get(userId);

        if (!user || user.currentRoom !== message.roomId) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "You are not in this room",
            })
          );
          return;
        }

        try {
          const savedMessage = await prisma.message.create({
            data: {
              content: message.content,
              chatRoomId: message.roomId,
              senderId: userId,
              type: "TEXT",
            },
          });

          const messageData = {
            type: "new-message",
            content: savedMessage.content,
            roomId: savedMessage.chatRoomId,
            senderId: userId,
            messageId: savedMessage.id,
            sentAt: savedMessage.sentAt,
          };

          ws.send(JSON.stringify(messageData));

          broadcastToRoom(message.roomId, JSON.stringify(messageData), userId);
        } catch (error) {
          console.log(error);
          ws.send(
            JSON.stringify({ type: "error", message: "Failed to send message" })
          );
          return;
        }
        break;
      }
      case "leave-room": {
        const user = connectedUsers.get(userId);
        if (!user || user.currentRoom !== message.roomId) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "You are not in this room",
            })
          );
          return;
        }

        try {
          connectedUsers.delete(userId);
          ws.send(
            JSON.stringify({ type: "left-room", roomId: user.currentRoom })
          );

          broadcastToRoom(
            user.currentRoom,
            JSON.stringify({ type: "user-left", userId: userId }),
            userId
          );
          user.currentRoom = null;
        } catch (error) {
          console.log(error);
          ws.send(
            JSON.stringify({ type: "error", message: "Failed to leave room" })
          );
          return;
        }
        break;
      }

      default: {
        ws.send(
          JSON.stringify({ type: "error", message: "Unknown message type" })
        );
        return;
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    connectedUsers.forEach((user, userId) => {
      if (user.socket === ws) {
        connectedUsers.delete(userId);
        broadcastToRoom(
          user.currentRoom!,
          JSON.stringify({ type: "user-left", userId: userId }),
          userId
        );
      }
    });
  });
});

wss.addListener("listening", () => {
  console.log(`WebSocket server is listening on port ${port}`);
});
