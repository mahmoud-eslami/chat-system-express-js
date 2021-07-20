module.exports = app => {
    app.get('/', (req, res) => {
        res.send({ asdasd: "asdasd" });
    });
    app.get('/1', (req, res) => {
        res.send([{ number: 1 }]);
    });
};