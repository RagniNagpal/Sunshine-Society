const { createClient } = require('redis');

const redisClient = createClient ({
    url : 'redis://localhost:6379' 
});

const subClient = redisClient.duplicate();

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error:', err));

async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Connected to Publisher');
    }
    if (!subClient.isOpen) {
        await subClient.connect();
        console.log('Connected to Subscriber');
    }
}

module.exports = { redisClient, subClient, connectRedis };