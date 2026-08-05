// @ts-check

import { WebSocket, WebSocketServer } from "ws";

const WEBSOCKET_PORT = Number(process.env.PORT) || 8081;
const MAX_PAYLOAD_BYTES = 16 * 1024;
const ECHO_DELAY_MS = 300;
const MIN_DISCONNECT_DELAY_MS = 25000;
const DISCONNECT_JITTER_MS = 10000;

const webSocketServer = new WebSocketServer({
  port: WEBSOCKET_PORT,
  maxPayload: MAX_PAYLOAD_BYTES,
});

webSocketServer.on("connection", (socket) => {
  socket.on("message", (message) => {
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message.toString());
      }
    }, ECHO_DELAY_MS);
  });

  const disconnectTimer = setTimeout(
    () => {
      socket.terminate();
    },
    MIN_DISCONNECT_DELAY_MS + Math.random() * DISCONNECT_JITTER_MS,
  );

  socket.once("close", () => {
    clearTimeout(disconnectTimer);
  });
});

webSocketServer.on("error", (error) => {
  console.error("WebSocket echo server error", error);
});

console.log(`WebSocket echo server started on ws://localhost:${WEBSOCKET_PORT}`);
