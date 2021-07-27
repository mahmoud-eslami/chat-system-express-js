const auth = require("../controller/auth.controller");
const tokenChecker = require("../middleware/tokenChecker");

module.exports = (app) => {
    app.get("/login", auth.login);
    app.post("/refreshToken", tokenChecker, auth.refreshToken);
    app.post("/register", auth.register);
    app.post("/changePasswordInside", auth.changePasswordInside);
};