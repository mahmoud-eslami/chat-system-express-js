const sequelize = require("./config/database.config");
const Message = require("./models/message.model");
const { Entity, Channel, User, Group } = require("./models/entity.model");
const Membership = require("./models/membership.model");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const config = require("./config/config.json");
const webSocket = require("./controller/websocket.controller");
var request = require("request");
const jsdom = require("jsdom");

// adding Helmet to enhance your API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan("combined"));

checkDb();

syncDatabase();

app.get("/splitter", (req, res) => {
    const url = req.body.url;
    request({ uri: url }, function(error, response, body) {
        const forbiddenWord = [
            "am",
            "is",
            "are",
            "a",
            "an",
            "&",
            "or",
            "and",
            "with",
            "in",
            "the",
            "to",
            "of",
            ".",
            "",
            "be",
            "in",
            "I",
            "i",
            "it",
            "for",
            "that",
            "on",
            "+",
            "you",
            "your",
            "me",
            "my",
            "our",
        ];
        let text = body
            .replace(/\n/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style[^>]*>/gi, "")
            .replace(/<head[^>]*>[\s\S]*?<\/head[^>]*>/gi, "")
            .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/gi, "")
            .replace(/<\/\s*(?:p|div)>/gi, "")
            .replace(/<br[^>]*\/?>/gi, "")
            .replace(/<[^>]*>/gi, "")
            .replace("&nbsp;", " ")
            .replace(/[^\S\r\n][^\S\r\n]+/gi, " ")
            .replace(/[0-9]/g, "")
            .replace(/\t/g, "")
            .replace(/\r/g, "");

        text = text.toLowerCase();

        let split = text.split(" ");

        forbiddenWord.forEach((element) => {
            split = split.filter(function(item) {
                return item !== element;
            });
        });

        let obj = {};
        for (var x = 0; x < split.length; x++) {
            if (obj[split[x]] === undefined) {
                obj[split[x]] = 1;
            } else {
                obj[split[x]]++;
            }
        }
        var sortable = [];
        for (var word in obj) {
            sortable.push([word, obj[word]]);
        }
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        res.status(200).json({ url: url, words: sortable, body: text });
    });
});

// include app with new routes
require("./routes/auth.routes")(app);
require("./routes/channel.routes")(app);
require("./routes/group.routes")(app);
app.listen(config.port, () => console.log("server start listening on 5000"));

async function syncDatabase() {
    try {
        sequelize.sync({ alert: true });
    } catch (err) {
        console.log(err);
    }
}

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

module.exports = app;