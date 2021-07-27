const auth = require('../controller/auth.controller');
const tokenChecker = require('../middleware/tokenChecker')

module.exports = app => {
    app.get('/login', auth.login);
    app.get('/refreshToken', tokenChecker, auth.refreshToken);
    app.get('/register', auth.register);
};