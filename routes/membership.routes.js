const tokenChecker = require("../middleware/tokenChecker");
const membership = require("../controller/membership.controller");

module.exports = (app) => {
    app.get("/get/membership", membership.getMembershipOfUser);
    app.delete("/remove/membership", membership.removeSpecificMembership);
    app.post("/create/userMembership", membership.createUserMembership);
};