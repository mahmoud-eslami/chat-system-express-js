const channel = require("../models/channel.model");
const entity = require("../models/entity.model");

exports.createChannel = async(req, res) => {
    try {
        const { name, description } = req.body;

        const new_channel = await channel.create({
            name: name,
            description: description,
        });

        // create entity after create channel
        await entity.create({
            cid: new_channel.channelId,
        });

        res
            .status(200)
            .json({ error: false, message: "channel created successfull!" });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e,
        });
    }
};