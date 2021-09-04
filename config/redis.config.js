const redis = require("redis");
const config = require("./config.json");

const redisClient = redis.createClient(config.redisPort, config.host);

redisClient.on("connect", function() {
    console.log("redis connected !");
});

module.exports = redisClient;