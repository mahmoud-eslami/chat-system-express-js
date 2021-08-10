const tokenChecker = require("../middleware/tokenChecker");
const membership = require("../controller/membership.controller");

module.exports = (app) => {
    app.get("/get/membership", tokenChecker, membership.getMembershipOfUser);
};