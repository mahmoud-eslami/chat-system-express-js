const sequelize = require("./config/database.config");
const User = require("./models/user.model");
const Group = require("./models/group.model");
const Channel = require("./models/channel.model");
const Entity = require("./models/entity.model");
const Message = require("./models/message.model");
const Membership = require("./models/membership.model");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const config = require("./config/config.json");

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

// include app with new routes
require("./routes/auth.routes")(app);
app.listen(config.port, () => console.log("server start listening on 5000"));

async function syncDatabase() {
    try {
        sequelize.sync({ force: true });
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