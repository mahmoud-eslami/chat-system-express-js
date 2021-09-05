const WebSocket = require("ws");
var parse = require("url-parse");
const { Entity, User } = require("../models/entity.model");
const Membership = require("../models/membership.model");
const { Message, seenMessage } = require("../models/message.model");
const config = require("../config/config.json");

const wss = new WebSocket.Server({ port: config.webSocketPort });

CLIENT = [];
wss.on("connection", (connection, request) => {
    // add every new connection to array
    const parameters = parse(request.url, true);
    connection.userId = parameters.query.userId;
    CLIENT.push(connection);

    connection.on("message", async(message) => {
        var jsonMessage = JSON.parse(message);
        switch (jsonMessage.key) {
            case "forwardMessage":
                {
                    const message_id = jsonMessage.message_id;
                    const eid_sender = jsonMessage.eid_sender;
                    const eid_receiver = jsonMessage.eid_receiver;
                    const membership_id = jsonMessage.membership_id;
                    let users = [];

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
                        membershipId: membership_id,
                    });

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
                    const eid_sender = jsonMessage.eid_sender;
                    const eid_receiver = jsonMessage.eid_receiver;
                    const membershipId = jsonMessage.membershipId;
                    var users = [];

                    let new_message = await Message.create({
                        viewCount: 0,
                        Text: messageStruct(mContent, null),
                        selfDelete: 0,
                        eid_sender: eid_sender,
                        eid_receiver: eid_receiver,
                        replay_mid: mId,
                        membershipId: membershipId,
                    });

                    let entity_receiver = await Entity.findOne({
                        where: { entityId: eid_receiver },
                    });

                    if (entity_receiver.type === "U") {
                        users.push(connection.userId);
                        users.push(entity_receiver.uid);
                    } else if (entity_receiver.type === "C") {
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
                    } else if (entity_receiver.type === "G") {
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

                    sendForSpecificUsers(
                        users,
                        JSON.stringify({ key: jsonMessage.key, message: new_message })
                    );

                    break;
                }
            case "getMembershipMessage":
                {
                    const membershipId = jsonMessage.membershipId;
                    const page = jsonMessage.page;
                    const pageSize = jsonMessage.pageSize;
                    let offset = page * pageSize;
                    let limit = pageSize;

                    let data = [];
                    let messages = await Message.findAll({
                        where: { membershipId: membershipId },
                        offset: offset,
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

                    connection.send(
                        JSON.stringify({
                            key: jsonMessage.key,
                            currentPage: page,
                            message: data,
                        })
                    );
                    break;
                }
            case "addMessage":
                {
                    const eid_sender = jsonMessage.eid_sender;
                    const eid_receiver = jsonMessage.eid_receiver;
                    const msg_content = jsonMessage.msg_content;
                    const membership_id = jsonMessage.membership_id;
                    let users = [];

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
                        membershipId: membership_id,
                    });

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

                        let entity_subscriber = [];

                        if (receiver_entity.type == "C") {
                            // here we should get all channel member and send message to each one

                            let temp_memberships = await Membership.findAll({
                                where: {
                                    eid2: receiver_entity.entityId,
                                },
                            });

                            for (const item of temp_memberships) {
                                let temp_entity = await Entity.findOne({
                                    where: { entityId: item.eid1 },
                                });

                                entity_subscriber.push(temp_entity.uid);
                            }
                        } else if (receiver_entity.type == "G") {
                            // here we should get all group member and send message to each one

                            let temp_memberships = await Membership.findAll({
                                where: {
                                    eid2: receiver_entity.entityId,
                                },
                            });

                            for (const item of temp_memberships) {
                                let temp_entity = await Entity.findOne({
                                    where: { entityId: item.eid1 },
                                });

                                entity_subscriber.push(temp_entity.uid);
                            }
                        } else if (receiver_entity.type == "U") {
                            // here we should get user and send message

                            entity_subscriber.push(receiver_entity.uid);
                        }

                        await message_instance.destroy();

                        sendForSpecificUsers(
                            entity_subscriber,
                            JSON.stringify({
                                key: jsonMessage.key,
                                message: mId,
                            })
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

                    await message_instance.update({ selfDelete: 1 });

                    connection.send(JSON.stringify({ key: jsonMessage.key, message: mId }));

                    break;
                }
        }
    });
});

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