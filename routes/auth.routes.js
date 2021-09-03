const auth = require("../controller/auth.controller");

module.exports = (app) => {
    app.get("/login", auth.login);
    app.post("/refreshToken", auth.refreshToken);
    app.post("/register", auth.register);
    app.post("/changePasswordInside", auth.changePasswordInside);
    app.get("/get/entity", auth.getEntity);
    app.get("/get/username", auth.getUsername);
    app.get("/search/users", auth.searchUsers);
};