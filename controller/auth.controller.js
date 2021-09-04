const { Entity, User, Group, Channel } = require("../models/entity.model");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
const bcrypt = require("bcrypt");
const redisClient = require("../config/redis.config");
const nodemailer = require("nodemailer");
const twilio = require("twilio")(
    config.supportNumberSid,
    config.supportNumberAuthToken
);

exports.getLoginVerifyCode = async(req, res) => {
    try {
        const verification_mode = req.body.verificationMode;
        const username = req.body.username;

        let user = await User.findOne({ where: { username: username } });

        // generate code
        var generatedCode = Math.floor(Math.random() * 10000) + 90000;

        // add generated code to redis
        redisClient.set(
            user.userId + user.username,
            generatedCode,
            function(err, reply) {
                redisClient.expire(user.userId + user.username, 120, function(e, r) {
                    console.log(e);
                    console.log(r + " expire time added");
                });
                console.log(err);
                console.log(reply + " generate code saved in redis!"); // OK
            }
        );

        if (user) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: config.supportEmail,
                    pass: config.supportEmailPassword,
                },
            });

            const mailOptions = {
                from: "Chat Service",
                to: user.email,
                subject: "Verification Code",
                text: "Code is : " + generatedCode,
            };

            if (verification_mode === "email") {
                transporter.sendMail(mailOptions, (err, info) => {
                    console.log(err);
                    console.log(info);
                });
            } else if (verification_mode === "phone") {
                // await twilio.messages.create({
                //     body: "Verification code : " + generatedCode,
                //     from: config.supportNumber,
                //     to: user.phoneNumber,
                // });
            }

            res.status(200).json({
                error: false,
                message: "verification code sent",
            });
        } else {
            res.status(404).json({
                error: true,
                message: "user not found !",
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

exports.searchUsers = async(req, res) => {
    try {
        const query = req.body.query.toLowerCase();
        let final_users = [];

        let users = await User.findAll({
            where: {
                username: {
                    [Op.like]: "%" + query + "%",
                },
            },
        });

        for (const item of users) {
            let temp_entity = await Entity.findOne({
                where: { uid: item.userId },
            });
            final_users.push({
                userId: item.userId,
                entityId: temp_entity.entityId,
                name: item.name,
                phoneNumber: item.phoneNumber,
                email: item.email,
                username: item.username,
                createdAt: item.createdAt,
            });
        }

        res.status(200).json({
            error: true,
            message: final_users,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

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
                        type: "U",
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
                        type: "G",
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
                        type: "C",
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
        const { username, password, code } = req.body;

        const temp_user = await User.findOne({
            where: {
                username: username,
            },
        });

        if (temp_user === null) {
            res.status(404).json({
                error: true,
                message: "User not exist!",
            });
        } else {
            redisClient.get(
                temp_user.userId + temp_user.username,
                async function(err, reply) {
                    if (reply === code) {
                        const valid_password = await bcrypt.compare(
                            password,
                            temp_user.password
                        );

                        if (valid_password === false) {
                            res.status(403).json({
                                error: true,
                                message: "Wrong username or password!",
                            });
                        } else {
                            let entity = await Entity.findOne({
                                where: { uid: temp_user.userId },
                            });

                            const token = jwt.sign({
                                    userId: temp_user.userId,
                                    eid: entity.entityId,
                                    username: temp_user.username,
                                },
                                config.secret, {
                                    expiresIn: config.tokenLife,
                                }
                            );
                            const refreshToken = jwt.sign({
                                    userId: temp_user.userId,
                                    eid: entity.entityId,
                                    username: temp_user.username,
                                },
                                config.secret, {
                                    expiresIn: config.refreshTokenLife,
                                }
                            );
                            // add refresh token to redis

                            redisClient.set(
                                temp_user.userId,
                                refreshToken,
                                function(err, reply) {
                                    console.log(reply); // OK
                                }
                            );

                            res.status(200).json({
                                error: false,
                                message: {
                                    token: token,
                                    refreshToken: refreshToken,
                                },
                            });
                        }
                    } else {
                        res.status(403).json({
                            error: true,
                            message: "Wrong verification code!",
                        });
                    }
                }
            );
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
        const { refreshToken } = req.body;

        let payload = jwt.decode(refreshToken);

        let uid = payload["userId"];
        let eid = payload["eid"];
        let username = payload["username"];

        redisClient.get(uid, function(err, reply) {
            if (reply === refreshToken) {
                const token = jwt.sign({
                        userId: uid,
                        eid: eid,
                        username: username,
                    },
                    config.secret, {
                        expiresIn: config.tokenLife,
                    }
                );
                const refToken = jwt.sign({
                        userId: uid,
                        eid: eid,
                        username: username,
                    },
                    config.secret, {
                        expiresIn: config.refreshTokenLife,
                    }
                );

                res.status(200).json({
                    error: false,
                    message: {
                        token: token,
                        refreshToken: refToken,
                    },
                });
            } else {
                res.status(404).json({
                    error: true,
                    message: "token is invalid !",
                });
            }
        });
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