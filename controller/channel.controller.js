const { Entity, Channel } = require("../models/entity.model");
const Membership = require("../models/membership.model");

exports.createChannel = async(req, res) => {
    try {
        const { name, description, userId } = req.body;

        const new_channel = await Channel.create({
            name: name,
            description: description,
        });

        // get user Entity
        let user_entity = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        // create entity after create channel
        let new_channel_entity = await Entity.create({
            cid: new_channel.channelId,
        });

        // create membership for user as admin
        await Membership.create({
            Role: "A",
            LastVisitDate: Date.now(),
            eid1: user_entity.entityId,
            eid2: new_channel_entity.entityId,
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
        const { channelId, userId } = req.body;

        let user_entity = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        let channel_entity = await Entity.findOne({ where: { cid: channelId } });

        let user_membership = await Membership.findOne({
            where: {
                eid1: user_entity.entityId,
                Role: "A",
            },
        });

        let temp_channel = await Channel.findOne({
            where: {
                channelId: channelId,
            },
        });

        if (user_membership !== null && temp_channel !== null) {
            await channel_entity.destroy();

            await temp_channel.destroy();

            await user_membership.destroy();

            res
                .status(200)
                .json({ error: false, message: "channel deleted successfull!" });
        } else {
            res.status(403).json({
                error: false,
                message: "permission denied or channel not exist!",
            });
        }
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
        // get user entity
        let temp_user = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        // get channel entity
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

exports.leftChannel = async(req, res) => {
    try {
        const { userId, channelId } = req.body;

        // get user entity
        let temp_user = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        // get channel entity
        let temp_channel = await Entity.findOne({
            where: {
                cid: channelId,
            },
        });

        await Membership.destroy({
            where: {
                eid1: temp_user.entityId,
                eid2: temp_channel.entityId,
            },
        });

        res
            .status(200)
            .json({ error: false, message: "user left channel successfull!" });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e,
        });
    }
};

exports.updateChannelInfo = async(req, res) => {};