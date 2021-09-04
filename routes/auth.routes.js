const auth = require("../controller/auth.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.get("/login", auth.login);
    app.post("/refreshToken", auth.refreshToken);
    app.post("/register", auth.register);
    app.post("/changePasswordInside", tokenChecker, auth.changePasswordInside);
    app.get("/get/entity", tokenChecker, auth.getEntity);
    app.get("/get/username", tokenChecker, auth.getUsername);
    app.get("/search/users", tokenChecker, auth.searchUsers);
    app.get("/get/loginVerifyCode", auth.getLoginVerifyCode);
};