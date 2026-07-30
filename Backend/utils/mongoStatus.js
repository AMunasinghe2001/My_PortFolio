const mongoose = require("mongoose");

const isMongoReady = () => mongoose.connection.readyState === 1;

module.exports = { isMongoReady };