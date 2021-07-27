const user = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

exports.login = async(req, res) => {
    try {
        // todo : unhash password for check
        const temp_user = await user.findOne({
            where: {
                username: req.body.username,
                password: req.body.password,
            }
        });

        if (temp_user === null) {
            res.status(404).json({
                error: true,
                message: "Wrong username or password!",
            });
        } else {
            const token = jwt.sign({
                userId: temp_user.userId,
                username: temp_user.username
            }, config.secret, {
                expiresIn: config.tokenLife,
            });
            res.status(200).json({
                error: false,
                message: {
                    token: token,
                }
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e
        });
    }
};
exports.refreshToken = (req, res) => {
    res.send('refresh');
};
exports.register = async(req, res) => {
    try {
        // todo : hash password
        const temp_user = await user.findOne({
            where: {
                username: req.body.username,
            }
        });
        console.log(temp_user);
        if (temp_user !== null) {
            res.status(409).json({
                error: true,
                message: "user already exist!"
            });
        } else {
            await user.create({
                name: req.body.name,
                username: req.body.username,
                password: req.body.password,
            });

            res.status(200).json({
                error: false,
                message: "user created!"
            });
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e
        });
    }

};