const auth = require('../controller/auth.controller');

module.exports = app => {
    app.get('/login', auth.login);
    app.get('/refreshToken', auth.refreshToken);
    app.get('/register', auth.register);
};