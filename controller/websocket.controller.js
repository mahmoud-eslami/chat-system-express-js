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
                    let temp_sender_Entity = Entity.findOne({
                        uid: connection.userId,
                    });
                    let temp_recieve_Entity = Entity.findOne({
                        uid: jsonMessage.target_userId,
                    });

                    let temp_membership = await Membership.findOne({
                        eid1: temp_sender_Entity.entityId,
                        eid2: temp_recieve_Entity.entityId,
                    });

                    if (temp_membership) {} else {}
                    break;
                }
            case "seenMessage":
                {
                    connection.send("seen message called");
                    break;
                }
            case "deleteMessage":
                {
                    connection.send("delete message called");
                    break;
                }
            case "editMessage":
                {
                    connection.send("edit message called");
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

module.exports = wss;