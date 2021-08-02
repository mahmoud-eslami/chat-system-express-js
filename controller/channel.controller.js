const { Entity, Channel } = require("../models/entity.model");
const Membership = require("../models/membership.model");

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

        // todo : create member ship for user as admin

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

        // todo : delete member ship for user as admin

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

exports.joinChannel = async(req, res) => {
    try {
        const { userId, channelId } = req.body;
        // get entity
        let temp_user = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        let temp_channel = await Entity.findOne({
            where: {
                cid: channelId,
            },
        });

        // create member ship
        await Membership.create({
            Role: "U",
            LastVisitDate: Date.now(),
            eid1: temp_user.entityId,
            eid2: temp_channel.entityId,
        });

        res
            .status(200)
            .json({ error: false, message: "user joined channel successfull!" });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e,
        });
    }
};

// todo : remove membership
exports.leftChannel = async(req, res) => {};