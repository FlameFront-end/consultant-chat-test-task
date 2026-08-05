const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    setTimeout(() => {
      if (ws.readyState === 1) {
        ws.send(message.toString());
      }
    }, 300);
  });

  setTimeout(() => {
    ws.terminate();
  }, 25000 + Math.random() * 10000);
});

console.log('WebSocket echo server started on ws://localhost:8081');
