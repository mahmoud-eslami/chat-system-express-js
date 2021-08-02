const { entity, group } = require("../models/entity.model");

exports.createGroup = async(req, res) => {
    try {
        const { name, description } = req.body;

        const new_group = await group.create({
            name: name,
            description: description,
        });

        await entity.create({
            gid: new_group.groupId,
        });

        res.status(200).json({ error: false, message: "group created successful" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e });
    }
};