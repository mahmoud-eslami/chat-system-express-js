const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
const bcrypt = require("bcrypt");

exports.login = async(req, res) => {
    try {
        const temp_user = await user.findOne({
            where: {
                username: req.body.username,
            },
        });

        if (temp_user === null) {
            res.status(404).json({
                error: true,
                message: "User not exist!",
            });
        } else {
            const valid_password = await bcrypt.compare(
                req.body.password,
                temp_user.password
            );

            if (valid_password === false) {
                res.status(403).json({
                    error: true,
                    message: "Wrong username or password!",
                });
            } else {
                const token = jwt.sign({
                        userId: temp_user.userId,
                        username: temp_user.username,
                    },
                    config.secret, {
                        expiresIn: config.tokenLife,
                    }
                );
                res.status(200).json({
                    error: false,
                    message: {
                        token: token,
                    },
                });
            }
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e,
        });
    }
};

exports.refreshToken = (req, res) => {
    res.send("refresh");
};

exports.register = async(req, res) => {
    try {
        const salt = await bcrypt.genSalt(config.saltRound);
        let hashed_password = await bcrypt.hash(req.body.password, salt);

        const temp_user = await user.findOne({
            where: {
                username: req.body.username,
            },
        });
        console.log(temp_user);
        if (temp_user !== null) {
            res.status(409).json({
                error: true,
                message: "user already exist!",
            });
        } else {
            await user.create({
                name: req.body.name,
                username: req.body.username,
                password: hashed_password,
            });

            res.status(200).json({
                error: false,
                message: "user created!",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e,
        });
    }
};

exports.changePasswordInside = async(req, res) => {
    try {
        const { oldPassword, newPassword, userId } = req.body;
        const temp_user = await user.findOne({
            where: {
                userId: userId,
            },
        });
        const valid_password = await bcrypt.compare(
            oldPassword,
            temp_user.password
        );
        if (valid_password) {
            // todo : change password here
            res.status(200).json({ error: true, message: "password changed!" });
        } else {
            res.status(403).json({ error: true, message: "worng password!" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e });
    }
};