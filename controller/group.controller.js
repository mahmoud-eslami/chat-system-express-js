const { Entity, Group } = require("../models/entity.model");

exports.createGroup = async(req, res) => {
    try {
        const { name, description } = req.body;

        const new_group = await Group.create({
            name: name,
            description: description,
        });

        await Entity.create({
            gid: new_group.groupId,
        });

        res.status(200).json({ error: false, message: "group created successful" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e });
    }
};

exports.deleteGroup = async(req, res) => {
    try {
        const gId = req.body.groupId;

        await Entity.destroy({
            where: {
                gid: gId,
            },
        });

        await Group.destroy({
            where: {
                groupId: gId,
            },
        });

        res.status(200).json({ error: false, message: "group deleted successful" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e });
    }
};