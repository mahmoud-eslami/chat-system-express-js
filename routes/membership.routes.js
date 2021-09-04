const tokenChecker = require("../middleware/tokenChecker");
const membership = require("../controller/membership.controller");

module.exports = (app) => {
    app.get("/get/membership", tokenChecker, membership.getMembershipOfUser);
    app.delete(
        "/remove/membership",
        tokenChecker,
        membership.removeSpecificMembership
    );
    app.post(
        "/create/userMembership",
        tokenChecker,
        membership.createUserMembership
    );
};