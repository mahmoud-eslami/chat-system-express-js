const sequelize = require('./config/database.config');
const User = require('./models/user.model');
const Group = require('./models/group.model');
const Channel = require('./models/channel.model');
const Entity = require('./models/entity.model');
const Message = require('./models/message.model');
const Membership = require('./models/membership.model');

checkDb();
syncDatabase();

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