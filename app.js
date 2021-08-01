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
const webSocket = require("./controller/websocket.controller");

// adding Helmet to enhance your API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan("combined"));

checkDb();

// entity associate
Group.hasOne(Entity, { foreignKey: { name: "gid", allowNull: true } });
Entity.belongsTo(Group, { foreignKey: { name: "gid", allowNull: true } });
Channel.hasOne(Entity, { foreignKey: { name: "cid", allowNull: true } });
Entity.belongsTo(Channel, { foreignKey: { name: "cid", allowNull: true } });
User.hasOne(Entity, { foreignKey: { name: "uid", allowNull: true } });
Entity.belongsTo(User, { foreignKey: { name: "uid", allowNull: true } });

// memberShip associate
Entity.hasOne(Membership, { foreignKey: { name: "eid1", allowNull: true } });
Membership.belongsTo(Entity, { foreignKey: { name: "eid1", allowNull: true } });
Entity.hasOne(Membership, { foreignKey: { name: "eid2", allowNull: true } });
Membership.belongsTo(Entity, { foreignKey: { name: "eid2", allowNull: true } });

// message associate
Entity.hasOne(Message, {
    foreignKey: { name: "eid_sender", allowNull: false },
});
Message.belongsTo(Entity, {
    foreignKey: { name: "eid_sender", allowNull: false },
});
Entity.hasOne(Message, {
    foreignKey: { name: "eid_receiver", allowNull: false },
});
Message.belongsTo(Entity, {
    foreignKey: { name: "eid_receiver", allowNull: false },
});

Message.hasOne(Message, {
    foreignKey: { name: "replay_mid", allowNull: true },
});
Message.belongsTo(Message, {
    foreignKey: { name: "replay_mid", allowNull: true },
});

// group associate
// Message.hasOne(Group, { foreignKey: { name: "mid", allowNull: true } });
// Group.belongsTo(Message, { foreignKey: { name: "mid", allowNull: true } });

// channel associate
// Message.hasOne(Channel, { foreignKey: { name: "mid", allowNull: true } });
// Channel.belongsTo(Message, { foreignKey: { name: "mid", allowNull: true } });

syncDatabase();

// include app with new routes
require("./routes/auth.routes")(app);
require("./routes/channel.routes")(app);
require("./routes/group.routes")(app);
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