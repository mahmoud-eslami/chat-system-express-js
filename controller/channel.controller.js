const { Entity, Channel } = require("../models/entity.model");

exports.createChannel = async(req, res) => {
    try {
        const { name, description } = req.body;

        const new_channel = await Channel.create({
            name: name,
            description: description,
        });

        // create entity after create channel
        await Entity.create({
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

exports.deleteChannel = async(req, res) => {
    try {
        const channelId = req.body.channelId;
        await Entity.destroy({
            where: {
                cid: channelId,
            },
        });

        await Channel.destroy({
            where: {
                channelId: channelId,
            },
        });

        res
            .status(200)
            .json({ error: false, message: "channel deleted successfull!" });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e,
        });
    }
};

// todo : add membership
exports.joinChannel = async(req, res) => {};

// todo : remove membership
exports.leftChannel = async(req, res) => {};