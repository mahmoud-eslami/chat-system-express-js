const channel = require("../controller/channel.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.post("/create/channel", tokenChecker, channel.createChannel);
    app.delete("/delete/channel", tokenChecker, channel.deleteChannel);
    app.post("/join/channel", tokenChecker, channel.joinChannel);
    app.post("/left/channel", tokenChecker, channel.leftChannel);
};