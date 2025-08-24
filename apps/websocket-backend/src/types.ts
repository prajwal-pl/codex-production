import { WebSocket } from "ws";

export interface User {
  socket: WebSocket;
  currentRoom: string | null;
  userId: string;
}

export interface IncomingMessage {
  type: "send-message" | "join-room" | "leave-room";
  content?: string;
  roomId: string;
  token: string;
}
