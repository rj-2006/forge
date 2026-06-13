const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:5070/api/chatrooms/1/ws');
ws.on('open', () => {
  console.log('Connected directly to backend!');
  ws.send(JSON.stringify({ type: 'send_message', content: 'hello' }));
});
ws.on('message', (data) => console.log('Received:', data.toString()));
ws.on('close', (code, reason) => console.log('Closed:', code, reason.toString()));
ws.on('error', (err) => console.error('Error:', err));
