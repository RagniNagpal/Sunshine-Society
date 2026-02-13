const express = require('express');
const http = require('http'); 
const path = require('path');

const { initWebSocket } = require('./utils/wsManager');
const { connectRedis } = require('./config/redis');
const connectToDB = require('./config/db');

const authRoutes = require('./routes/auth');
const noticeRoutes = require('./routes/notices');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/user');

const app = express();
const server = http.createServer(app); 

const PORT = 5000;

connectToDB(); 
connectRedis().then(() => {
    initWebSocket(server);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
