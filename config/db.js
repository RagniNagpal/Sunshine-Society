const mongoose = require('mongoose');

function connectToDB() {
    mongoose.connect('mongodb://127.0.0.1:27017/sunshine-society')
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
    });
}

module.exports = connectToDB;