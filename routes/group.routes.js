const group = require("../controller/group.controller");

module.exports = (app) => {
    app.post("/create/group", group.createGroup);
};