const { Entity, User } = require("../models/entity.model");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
const bcrypt = require("bcrypt");

// todo : should use redis to store refresh token
const refreshTokenList = [];

exports.login = async(req, res) => {
    try {
        const temp_user = await User.findOne({
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
                const refreshToken = jwt.sign({
                        userId: temp_user.userId,
                        username: temp_user.username,
                    },
                    config.secret, {
                        expiresIn: config.refreshTokenLife,
                    }
                );
                // add refresh token to list
                // todo : should use redis to store refresh token
                refreshTokenList.push(refreshToken);

                res.status(200).json({
                    error: false,
                    message: {
                        token: token,
                        refreshToken: refreshToken,
                    },
                });
            }
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.refreshToken = (req, res) => {
    try {
        console.log(refreshTokenList);
        const { token, refreshToken } = req.body;

        if (refreshTokenList.includes(refreshToken)) {
            res.status(200).json({
                error: false,
                message: "Ok",
            });
        } else {
            res.status(404).json({
                error: true,
                message: "token is invalid !",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.register = async(req, res) => {
    try {
        const { username, password, name, email, isEmailAuth, phone_number } =
        req.body;
        const salt = await bcrypt.genSalt(config.saltRound);
        let hashed_password = await bcrypt.hash(password, salt);

        const temp_user = await User.findOne({
            where: {
                username: username,
            },
        });
        console.log(temp_user);
        if (temp_user !== null) {
            res.status(409).json({
                error: true,
                message: "user already exist!",
            });
        } else {
            let created_user;
            if (isEmailAuth === true) {
                // todo : send email for authentication
                created_user = await User.create({
                    name: name,
                    username: username,
                    password: hashed_password,
                    email: email,
                });
            } else {
                // todo : send sms for authentication
                created_user = await User.create({
                    name: name,
                    username: username,
                    password: hashed_password,
                    phoneNumber: phone_number,
                });
            }
            // create entity after create user
            await Entity.create({
                uid: created_user.userId,
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
            message: e.toString(),
        });
    }
};

exports.changePasswordInside = async(req, res) => {
    try {
        const { oldPassword, newPassword, userId } = req.body;
        const temp_user = await User.findOne({
            where: {
                userId: userId,
            },
        });
        const valid_password = await bcrypt.compare(
            oldPassword,
            temp_user.password
        );
        if (valid_password) {
            const salt = await bcrypt.genSalt(config.saltRound);
            let hashed_password = await bcrypt.hash(newPassword, salt);

            await temp_user.update({ password: hashed_password });

            res.status(200).json({ error: true, message: "password changed!" });
        } else {
            res.status(403).json({ error: true, message: "worng password!" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};