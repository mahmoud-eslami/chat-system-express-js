const channel = require("../controller/channel.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.post("/create/channel", tokenChecker, channel.createChannel);
    app.delete("/delete/channel", tokenChecker, channel.deleteChannel);
};