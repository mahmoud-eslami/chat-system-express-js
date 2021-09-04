const channel = require("../controller/channel.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.post("/create/channel", channel.createChannel);
    app.delete("/delete/channel", channel.deleteChannel);
    app.post("/join/channel", channel.joinChannel);
    app.post("/left/channel", channel.leftChannel);
    app.post("/update/channel", channel.updateChannelInfo);
    app.post("/addAdmin/channel", channel.addAdminForChannel);
    app.post("/channel/pin/message", channel.pinMessage);
    app.post("/channel/unpin/message", channel.unpinMessage);
    app.get("/channel/members", channel.getChannelMember);
    app.post("/channel/remove/member", channel.removeMemberFromChannel);
    app.get("/search/channel", channel.seachChannel);
};