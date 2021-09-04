const group = require("../controller/group.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.post("/create/group", group.createGroup);
    app.delete("/delete/group", group.deleteGroup);
    app.post("/join/group", group.joinGroup);
    app.post("/left/group", group.leftGroup);
    app.post("/update/group", group.updateGroupInfo);
    app.post("/addAdmin/group", group.addAdminForGroup);
    app.get("/group/members", group.getGroupMember);
    app.post("/group/remove/member", group.removeMemberFromGroup);
    app.get("/group/search", group.searchGroup);
    app.post("/group/pin/message", group.pinMessage);
    app.post("/group/unpin/message", group.unpinMessage);
};