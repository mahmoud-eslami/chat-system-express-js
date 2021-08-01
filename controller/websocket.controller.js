const WebSocket = require("ws");
var parse = require("url-parse");

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

    connection.on("message", (message) => {
        var jsonMessage = JSON.parse(message);
        switch (jsonMessage.key) {
            case "addMessage":
                {
                    connection.send("waiting to add message...");

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