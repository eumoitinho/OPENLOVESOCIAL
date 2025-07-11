const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8088 });

// Map de userId para conexão WebSocket
const clients = new Map();

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'register') {
        // Usuário se registra com seu userId
        userId = data.userId;
        clients.set(userId, ws);
        ws.send(JSON.stringify({ type: 'registered', userId }));
      } else if (data.type === 'signal') {
        // Sinalização: repassa para o destinatário
        const { to, signal } = data;
        const target = clients.get(to);
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify({ type: 'signal', from: userId, signal }));
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
    }
  });
});

console.log('WebRTC signaling server running on ws://localhost:8088'); 