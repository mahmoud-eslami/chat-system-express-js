const WebSocket = require("ws");
var parse = require("url-parse");
const { Entity } = require("../models/entity.model");
const Membership = require("../models/membership.model");

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