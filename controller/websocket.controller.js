const WebSocket = require("ws");
var parse = require("url-parse");
const { Entity, User } = require("../models/entity.model");
const Membership = require("../models/membership.model");
const { Message, seenMessage } = require("../models/message.model");
const config = require("../config/config.json");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const Op = Sequelize.Op;

const wss = new WebSocket.Server({
    port: config.webSocketPort,
    verifyClient: function(info, cb) {
        // check token exist or not
        var token = info.req.headers.token;
        if (!token) cb(false, 401, "Unauthorized");
        else {
            // veridy token
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    cb(false, 401, "Unauthorized");
                } else {
                    // if token is valid let user connect to websocket
                    cb(true);
                }
            });
        }
    },
});

CLIENT = [];
wss.on("connection", (connection, request) => {
    const parameters = parse(request.url, true);
    let token = request.headers.token;
    let payload = jwt.decode(token);

    let uid = payload["userId"];
    let eid = payload["eid"];

    connection.userId = uid;
    connection.eid = eid;

    CLIENT.push(connection);

    connection.on("message", async(message) => {
        var jsonMessage = JSON.parse(message);
        switch (jsonMessage.key) {
            case "forwardMessage":
                {
                    const message_id = jsonMessage.message_id;
                    const eid_receiver = jsonMessage.eid_receiver;
                    let users = [];
                    const eid_sender = connection.eid;

                    let message_instance = await Message.findOne({
                        where: { messageId: message_id },
                    });

                    let receiver_entity = await Entity.findOne({
                        where: {
                            entityId: eid_receiver,
                        },
                    });

                    let new_message = await Message.create({
                        viewCount: 0,
                        Text: messageStruct(
                            message_instance.Text["content"],
                            message_instance.eid_sender
                        ),
                        selfDelete: 0,
                        eid_sender: eid_sender,
                        eid_receiver: eid_receiver,
                    });

                    users = await determindRelatedUsers(receiver_entity);

                    sendForSpecificUsers(
                        users,
                        JSON.stringify({ key: jsonMessage.key, message: new_message })
                    );

                    break;
                }
            case "replyMessage":
                {
                    const mId = jsonMessage.mId;
                    const mContent = jsonMessage.mContent;
                    const eid_receiver = jsonMessage.eid_receiver;
                    var users = [];
                    const eid_sender = connection.eid;

                    let new_message = await Message.create({
                        viewCount: 0,
                        Text: messageStruct(mContent, null),
                        selfDelete: 0,
                        eid_sender: eid_sender,
                        eid_receiver: eid_receiver,
                        replay_mid: mId,
                    });

                    let entity_receiver = await Entity.findOne({
                        where: { entityId: eid_receiver },
                    });

                    users = await determindRelatedUsers(entity_receiver);

                    sendForSpecificUsers(
                        users,
                        JSON.stringify({ key: jsonMessage.key, message: new_message })
                    );

                    break;
                }
            case "getMembershipMessage":
                {
                    const receiver_id = jsonMessage.receiver_id;
                    const date = jsonMessage.date;
                    const pageSize = jsonMessage.pageSize;
                    let limit = pageSize;

                    let data = [];

                    let entity_receiver = await Entity.findOne({
                        where: { entityId: receiver_id },
                    });

                    if (entity_receiver.type === "U") {
                        let messages = await Message.findAll({
                            where: {
                                eid_receiver: receiver_id,
                                createdAt: {
                                    [Op.gte]: date,
                                },
                            },
                            order: [
                                ["createdAt", "DESC"]
                            ],
                            limit: limit,
                        });

                        let messages_reverse = await Message.findAll({
                            where: {
                                eid_sender: receiver_id,
                                createdAt: {
                                    [Op.gte]: date,
                                },
                            },
                            order: [
                                ["createdAt", "DESC"]
                            ],
                            limit: limit,
                        });

                        // add all two list
                        let all_messages = messages.concat(messages_reverse);

                        for (const message of all_messages) {
                            let entity_sender = await Entity.findOne({
                                where: { entityId: message.eid_sender },
                            });

                            let sender_user = await User.findOne({
                                where: { userId: entity_sender.uid },
                            });

                            data.push({
                                messageId: message.messageId,
                                viewCount: message.viewCount,
                                Text: message.Text,
                                createdAt: message.createdAt,
                                eid_sender: message.eid_sender,
                                eid_receiver: message.eid_receiver,
                                replay_mid: message.replay_mid,
                                membershipId: message.membershipId,
                                senderInfo: {
                                    userId: sender_user.userId,
                                    name: sender_user.name,
                                },
                            });
                        }
                    } else {
                        let messages = await Message.findAll({
                            where: {
                                eid_receiver: receiver_id,
                                createdAt: {
                                    [Op.gte]: date,
                                },
                            },
                            order: [
                                ["createdAt", "DESC"]
                            ],
                            limit: limit,
                        });

                        for (const message of messages) {
                            let entity_sender = await Entity.findOne({
                                where: { entityId: message.eid_sender },
                            });

                            let sender_user = await User.findOne({
                                where: { userId: entity_sender.uid },
                            });

                            data.push({
                                messageId: message.messageId,
                                viewCount: message.viewCount,
                                Text: message.Text,
                                createdAt: message.createdAt,
                                eid_sender: message.eid_sender,
                                eid_receiver: message.eid_receiver,
                                replay_mid: message.replay_mid,
                                membershipId: message.membershipId,
                                senderInfo: {
                                    userId: sender_user.userId,
                                    name: sender_user.name,
                                },
                            });
                        }
                    }

                    connection.send(
                        JSON.stringify({
                            key: jsonMessage.key,
                            message: data,
                        })
                    );
                    break;
                }
            case "addMessage":
                {
                    const eid_receiver = jsonMessage.eid_receiver;
                    const msg_content = jsonMessage.msg_content;
                    let users = [];
                    const eid_sender = connection.eid;

                    let receiver_entity = await Entity.findOne({
                        where: {
                            entityId: eid_receiver,
                        },
                    });

                    let created_message = await Message.create({
                        viewCount: 0,
                        Text: messageStruct(msg_content, null),
                        selfDelete: 0,
                        eid_sender: eid_sender,
                        eid_receiver: eid_receiver,
                    });

                    users = await determindRelatedUsers(receiver_entity);

                    sendForSpecificUsers(
                        users,
                        JSON.stringify({ key: jsonMessage.key, message: created_message })
                    );

                    break;
                }
            case "seenMessage":
                {
                    const mId = jsonMessage.mId;

                    let entity = await Entity.findOne({
                        where: { uid: connection.userId },
                    });

                    let seen_instance = await seenMessage.findOne({
                        where: {
                            mid: mId,
                            eid: entity.entityId,
                        },
                    });

                    if (!seen_instance) {
                        await seenMessage.create({
                            mid: mId,
                            eid: entity.entityId,
                        });

                        await Message.increment("viewCount", {
                            by: 1,
                            where: { messageId: mId },
                        });
                    }

                    connection.send(
                        JSON.stringify({
                            key: jsonMessage.key,
                            message: mId,
                        })
                    );

                    break;
                }
            case "deleteMessage":
                {
                    const mId = jsonMessage.mId;

                    let message_instance = await Message.findOne({
                        where: {
                            messageId: mId,
                        },
                    });

                    let user_entity = await Entity.findOne({
                        where: { uid: connection.userId },
                    });

                    if (user_entity.entityId == message_instance.eid_sender) {
                        let receiver_entity = await Entity.findOne({
                            where: {
                                entityId: message_instance.eid_receiver,
                            },
                        });

                        let users = [];

                        users = await determindRelatedUsers(receiver_entity);

                        await message_instance.destroy();

                        sendForSpecificUsers(
                            users,
                            JSON.stringify({
                                key: jsonMessage.key,
                                message: mId,
                            })
                        );
                    } else {
                        connection.send(
                            JSON.stringify({ key: jsonMessage.key, message: "denied!" })
                        );
                    }

                    break;
                }

            case "selfDeleteMessage":
                {
                    const mId = jsonMessage.mId;

                    let message_instance = await Message.findOne({
                        where: {
                            messageId: mId,
                        },
                    });

                    if (message_instance.eid_sender === connection.eid) {
                        await message_instance.update({ selfDelete: 1 });
                        connection.send(
                            JSON.stringify({ key: jsonMessage.key, message: mId })
                        );
                    } else {
                        connection.send(
                            JSON.stringify({ key: jsonMessage.key, message: "denied!" })
                        );
                    }

                    break;
                }
        }
    });
});

async function determindRelatedUsers(receiver_entity) {
    let users = [];
    if (receiver_entity.type === "U") {
        users.push(connection.userId);
        users.push(receiver_entity.uid);
    } else if (receiver_entity.type === "C") {
        let memberships = await Membership.findAll({
            where: {
                eid2: receiver_entity.entityId,
            },
        });

        // add uid of entities to users array
        for (const item of memberships) {
            let temp_entity = await Entity.findOne({
                where: {
                    entityId: item.eid1,
                },
            });

            users.push(temp_entity.uid);
        }
    } else if (receiver_entity.type === "G") {
        let memberships = await Membership.findAll({
            where: {
                eid2: receiver_entity.entityId,
            },
        });

        // add uid of entities to users array
        for (const item of memberships) {
            let temp_entity = await Entity.findOne({
                where: {
                    entityId: item.eid1,
                },
            });

            users.push(temp_entity.uid);
        }
    }
    return users;
}

function messageStruct(messageContent, eid_original) {
    return {
        content: messageContent,
        eid_original: eid_original,
    };
}

function sendAll(message) {
    CLIENT.forEach((element) => {
        element.send(message);
    });
}

function sendForSpecificUsers(userIdArray, message) {
    userIdArray.forEach((userId) => {
        CLIENT.forEach((client) => {
            if (client.userId == userId) {
                client.send(message);
            }
        });
    });
}

module.exports = wss;

module.exports = wss;