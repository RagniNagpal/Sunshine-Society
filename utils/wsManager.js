const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { subClient } = require('../config/redis'); 

const JWT_SECRET = 'sunshine_secret_key';
const NOTIFICATION_CHANNEL = 'SOCIETY_UPDATES';

let io;

function initWebSocket(httpServer) {
    io = new Server(httpServer, { cors: { origin: "*" } });

    if (subClient.isOpen) {
        subClient.subscribe(NOTIFICATION_CHANNEL, (message) => {
    const data = JSON.parse(message);

    if (data.payload?.userId) {
        io.to(`user_${data.payload.userId}`).emit('new_update', data);
    }

    io.to('admin_room').emit('new_update', data);
});
}

io.on('connection', (socket) => {
    const token = socket.handshake.query.token;
    if (!token) return socket.disconnect();
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.id;
            
        socket.join(`user_${decoded.id}`);
        if (decoded.role === 'admin') {
            socket.join('admin_room');
        }
            
        console.log(`[Socket] User Connected: ${decoded.id} in Room: user_${decoded.id}`);
    } catch (e) { 
        console.log("[Socket] Auth Error");
        socket.disconnect(); 
    }
});
}

module.exports = { initWebSocket };