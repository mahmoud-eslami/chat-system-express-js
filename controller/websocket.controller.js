const WebSocket = require("ws");
var parse = require("url-parse");
const { Entity, User } = require("../models/entity.model");
const Membership = require("../models/membership.model");
const Message = require("../models/message.model");

const wss = new WebSocket.Server({ port: 8080 });

// todo
/*in debug mode we store data
 in array but we should use
  redis in production */
CLIENT = [];
wss.on("connection", (connection, request) => {
    // add every new connection to array
    const parameters = parse(request.url, true);
    connection.userId = parameters.query.userId;
    CLIENT.push(connection);

    connection.on("message", async(message) => {
        var jsonMessage = JSON.parse(message);
        switch (jsonMessage.key) {
            case "getMembershipMessage":
                {
                    const membershipId = jsonMessage.membershipId;

                    let data = [];
                    let messages = await Message.findAll({
                        where: { membershipId: membershipId },
                    });

                    for (const message of messages) {
                        let entity_sender = await Entity.findOne({
                            where: { uid: message.eid_sender },
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
                            message: data,
                        })
                    );
                    break;
                }
            case "addMessage":
                {
                    connection.send("waiting to add message...");
                    const userIdOrig = jsonMessage.userIdOrig;
                    let userIds = [];
                    let temp_orig_Entity = null;

                    if (userIdOrig != null) {
                        temp_orig_Entity = await Entity.findOne({
                            where: { uid: userIdOrig },
                        });
                        console.log(temp_orig_Entity);
                    }

                    let temp_sender_Entity = Entity.findOne({
                        where: {
                            uid: connection.userId,
                        },
                    });

                    console.log(temp_sender_Entity);

                    let temp_recieve_Entity = Entity.findOne({
                        where: {
                            uid: jsonMessage.target_userId,
                        },
                    });

                    console.log(temp_recieve_Entity);

                    // let temp_membership = await Membership.findOne({
                    //     where: {
                    //         eid1: temp_sender_Entity.entityId,
                    //         eid2: temp_recieve_Entity.entityId,
                    //     },
                    // });

                    let createdMessage = await Message.create({
                        Text: JSON.stringify({
                            content: jsonMessage.content,
                            eid_orig: temp_orig_Entity,
                        }),
                        viewCount: 0,
                        eid_sender: 1,
                        eid_receiver: 1,
                        membershipId: 1,
                    });

                    console.log(createdMessage);

                    if (temp_membership) {
                        sendForSpecificUsers(
                            [1, 2],
                            JSON.stringify({
                                key: jsonMessage.key,
                                message: createdMessage,
                            })
                        );
                    }
                    break;
                }
            case "seenMessage":
                {
                    const mId = jsonMessage.mId;
                    connection.send("jaja");
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

                    break;
                }
            case "replayMessage":
                {
                    const mId = jsonMessage.mId;
                    const mContent = jsonMessage.mContent;
                    const eid_sender = jsonMessage.eid_sender;
                    const eid_receiver = jsonMessage.eid_receiver;
                    const membershipId = jsonMessage.membershipId;

                    let new_message = await Message.create({
                        viewCount: 0,
                        Text: mContent,
                        selfDelete: 0,
                        eid_sender: eid_sender,
                        eid_receiver: eid_receiver,
                        replay_mid: mId,
                        membershipId: membershipId,
                    });

                    connection.send(
                        JSON.stringify({ key: jsonMessage.key, message: new_message })
                    );

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