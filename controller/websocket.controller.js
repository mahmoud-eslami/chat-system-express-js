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
    CLIENT.push(connection);

    connection.on("message", (message) => {
        connection.send("gari");
    });

    connection.send("yay you joined to web socket!");
});

function sendAll(message) {
    CLIENT.forEach((element) => {
        element.send(message);
    });
}

module.exports = wss;