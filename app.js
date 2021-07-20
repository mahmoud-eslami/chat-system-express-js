const sequelize = require('./config/database.config');
const User = require('./models/user.model');
const Group = require('./models/group.model');
const Channel = require('./models/channel.model');
const Entity = require('./models/entity.model');
const Message = require('./models/message.model');
const Membership = require('./models/membership.model');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');


app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));


checkDb();
syncDatabase();

app.listen(5000, () => console.log('server start listening on 5000'));


async function syncDatabase() {
    try {
        sequelize.sync({ alter: true });
    } catch (err) {
        console.log(err);
    }
}

async function checkDb() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}