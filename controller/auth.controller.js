const user = require('../models/user.model');

exports.login = (req, res) => {
    res.send('login');
};
exports.refreshToken = (req, res) => {
    res.send('refresh');
};
exports.register = async(req, res) => {
    try {
        const temp_user = await user.findOne({
            where: {
                username: req.body.username,
            }
        });
        console.log(temp_user);
        if (temp_user !== null) {
            res.json({ "error": true, "message": "username duplicated!" });
        } else {
            await user.create({
                name: req.body.name,
                username: req.body.username,
                password: req.body.password,
            });

            res.json({ "error": false, "message": "user created!" });
        }

    } catch (error) {
        console.log(error);
        res.json({ "error": true, "message": error });
    }

};