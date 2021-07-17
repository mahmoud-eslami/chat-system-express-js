const sequelize = require('./database');
const User = require('./models/User');
const Group = require('./models/Group');
const Channel = require('./models/Channel');
const Entity = require('./models/Entity');
const Message = require('./models/Message');

// check data base every time to implement new changes
syncDatabase();
// check database for authentication
checkDb();

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