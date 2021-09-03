const { Entity, User, Group, Channel } = require("../models/entity.model");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
const bcrypt = require("bcrypt");

// todo : should use redis to store refresh token
const refreshTokenList = [];

exports.getEntity = async(req, res) => {
    try {
        const eid = req.body.eid;

        let temp_entity = await Entity.findOne({
            where: { entityId: eid },
        });

        if (temp_entity) {
            if (temp_entity.type === "U") {
                let temp_user = await User.findOne({
                    where: { userId: temp_entity.uid },
                });

                res.status(200).json({
                    error: false,
                    message: {
                        userId: temp_user.userId,
                        entityId: temp_entity.entityId,
                        name: temp_user.name,
                        phoneNumber: temp_user.phoneNumber,
                        email: temp_user.email,
                        username: temp_user.username,
                        createdAt: temp_user.createdAt,
                    },
                });
            } else if (temp_entity.type === "G") {
                let temp_gp = await Group.findOne({
                    where: { groupId: temp_entity.gid },
                });

                res.status(200).json({
                    error: false,
                    message: {
                        entityId: temp_entity.entityId,
                        groupId: temp_gp.groupId,
                        name: temp_gp.name,
                        description: temp_gp.description,
                        mid: temp_gp.mid,
                    },
                });
            } else if (temp_entity.type === "C") {
                let temp_channel = await Channel.findOne({
                    where: { channelId: temp_entity.cid },
                });

                res.status(200).json({
                    error: false,
                    message: {
                        entityId: temp_entity.entityId,
                        channelId: temp_channel.channelId,
                        name: temp_channel.name,
                        description: temp_channel.description,
                        mid: temp_channel.mid,
                    },
                });
            }
        } else {
            res.status(404).json({
                error: true,
                message: "User not found!",
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

exports.getUsername = async(req, res) => {
    try {
        const username = req.body.username;

        let temp_user = await User.findOne({ where: { username: username } });

        if (temp_user) {
            let user_entity = await Entity.findOne({
                where: { uid: temp_user.userId },
            });
            res.status(200).json({
                error: false,
                message: {
                    userId: temp_user.userId,
                    entityId: user_entity.entityId,
                    name: temp_user.name,
                    phoneNumber: temp_user.phoneNumber,
                    email: temp_user.email,
                    username: temp_user.username,
                    createdAt: temp_user.createdAt,
                },
            });
        } else {
            res.status(404).json({
                error: true,
                message: "User not found!",
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
        const { username, password, name, email, phone_number } = req.body;
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
            created_user = await User.create({
                name: name,
                username: username,
                password: hashed_password,
                email: email,
                phoneNumber: phone_number,
            });

            // create entity after create user
            await Entity.create({
                uid: created_user.userId,
                type: "U",
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

            res.status(200).json({ error: false, message: "password changed!" });
        } else {
            res.status(403).json({ error: true, message: "worng password!" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};