// const express = require('express');
// const sequelize = require('sequelize');
// const mysql = require('mysql');
// const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');

// const accessTokenSecret = 'asdjkqgwuiehbu1h23aujhbd';

// const app = express();
// const port = 8080;
// app.use(bodyParser.json());


// // const connection = mysql.createConnection({
// //     host: 'localhost',
// //     user: 'root',
// //     password: '',
// // });

// const users = [{
//     username: 'john',
//     password: 'password123admin',
//     role: 'admin'
// }, {
//     username: 'anna',
//     password: 'password123member',
//     role: 'member'
// }];

// const books = [{
//         "author": "Chinua Achebe",
//         "country": "Nigeria",
//         "language": "English",
//         "pages": 209,
//         "title": "Things Fall Apart",
//         "year": 1958
//     },
//     {
//         "author": "Hans Christian Andersen",
//         "country": "Denmark",
//         "language": "Danish",
//         "pages": 784,
//         "title": "Fairy tales",
//         "year": 1836
//     },
//     {
//         "author": "Dante Alighieri",
//         "country": "Italy",
//         "language": "Italian",
//         "pages": 928,
//         "title": "The Divine Comedy",
//         "year": 1315
//     },
// ];

// const sequelizeInstance = new sequelize('database', 'root', '', {
//     host: 'localhost',
//     dialect: 'mysql',
// }, {
//     logging: (...msg) => console.log(msg),
// });

// // connection.connect((err) => {
// //     if (err) throw err;
// //     console.log('connected !');
// // });

// checkDataBaseConnection();

// app.listen(port, () => {
//     console.log('app is listen on ' + port);
// });

// async function checkDataBaseConnection() {
//     try {
//         await sequelizeInstance.authenticate;
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }

// // authenticate method
// const authenticateJWT = (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (authHeader) {
//         const token = authHeader.split(' ')[1];

//         jwt.verify(token, accessTokenSecret, (err, user) => {
//             if (err) {
//                 return res.sendStatus(403);
//             }
//             req.user = user;
//             next();
//         });
//     } else {
//         res.sendStatus(401);
//     }
// };


// // routes
// app.get('/', (req, res) => {
//     res.send('selam');
// });
// app.get('/getAllChats', (req, res) => {
//     res.send('chats!');
// });
// app.post('/login', (req, res) => {
//     // Read username and password from request body
//     const { username, password } = req.body;

//     // Filter user from the users array by username and password
//     const user = users.find(u => { return u.username === username && u.password === password });

//     if (user) {
//         // Generate an access token
//         const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret, { expiresIn: "20s" });

//         res.json({
//             accessToken
//         });
//     } else {
//         res.send('Username or password incorrect');
//     }
// });
// app.get('/books', authenticateJWT, (req, res) => {
//     res.json(books);
// });