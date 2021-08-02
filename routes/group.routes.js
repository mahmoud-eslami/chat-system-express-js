const group = require("../controller/group.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.post("/create/group", tokenChecker, group.createGroup);
    app.delete("/delete/group", tokenChecker, group.deleteGroup);
};