import http from 'http';
import { WebSocketServer } from 'ws';

const createSocketServer = () => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hello World' }));
    });

    const wss = new WebSocketServer({ noServer: true });
    const clients = new Map();

    wss.on('connection', (ws) => {
        console.log('A new client connected!');

        ws.on('message', (message) => {
            console.log(`Received: ${message}`);
            const data = JSON.parse(message);

            if (data.type === 'join_conversation') {
                const { conversationId, username, role, workerPictureUrl, customerPictureUrl } = data;

                if (!clients.has(conversationId)) {
                    clients.set(conversationId, []);
                }
                // Store the user's information including the picture URL
                clients.get(conversationId).push({ ws, username, role, workerPictureUrl, customerPictureUrl });

                const joinMessage = {
                    type: 'worker_joined',
                    message: `${username} has joined the conversation.`,
                    conversationId: conversationId,
                };

                // Notify all clients in the conversation
                clients.get(conversationId).forEach(client => {
                    client.ws.send(JSON.stringify(joinMessage));
                });
            } else if (data.type === 'message') {
                const { conversationId, content, username } = data;

                if (clients.has(conversationId)) {
                    const sender = clients.get(conversationId).find(client => client.username === username);
                    const pic = sender ? (sender.role === 'worker' ? sender.workerPictureUrl : sender.customerPictureUrl) : '';

                    const messageToSend = {
                        type: 'message',
                        conversationId,
                        content,
                        username,
                        pic,
                        timestamp: new Date().toISOString(),
                    };

                    // Send the message to all clients in the conversation
                    clients.get(conversationId).forEach(client => {
                        client.ws.send(JSON.stringify(messageToSend));
                    });
                }
            } else if (data.type === 'close_chat') {
                const { conversationId } = data;

                if (clients.has(conversationId)) {
                    const closeMessage = {
                        type: 'chat_closed',
                        conversationId,
                    };

                    // Notify all clients in the conversation
                    clients.get(conversationId).forEach(client => {
                        client.ws.send(JSON.stringify(closeMessage));
                    });
                }
            }
        });

        ws.on('close', () => {
            console.log('A client disconnected.');
            clients.forEach((clientGroup, conversationId) => {
                clients.set(conversationId, clientGroup.filter(client => client.ws !== ws));
                if (clients.get(conversationId).length === 0) {
                    clients.delete(conversationId);
                }
            });
        });
    });

    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    return server;
};

export default createSocketServer;





