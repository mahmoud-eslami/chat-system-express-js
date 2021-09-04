const { Entity, Channel, User } = require("../models/entity.model");
const Membership = require("../models/membership.model");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.unpinMessage = async(req, res) => {
    try {
        const cid = req.body.cid;

        let channel = await Channel.findOne({ where: { channelId: cid } });

        channel.update({ mid: null });

        res.status(200).json({
            error: false,
            message: "Message unpinned!",
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.pinMessage = async(req, res) => {
    try {
        const mid = req.body.mid;
        const cid = req.body.cid;

        let channel = await Channel.findOne({ where: { channelId: cid } });

        channel.update({ mid: mid });

        res.status(200).json({
            error: false,
            message: "Message pinned!",
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.seachChannel = async(req, res) => {
    try {
        const query = req.body.query.toLowerCase();
        let final_channels = [];

        let channels = await Channel.findAll({
            where: {
                name: {
                    [Op.like]: "%" + query + "%",
                },
            },
        });

        for (const item of channels) {
            let temp_entity = await Entity.findOne({
                where: { cid: item.channelId },
            });
            final_channels.push({
                channelId: item.channelId,
                entityId: temp_entity.entityId,
                name: item.name,
                description: item.description,
                mid: item.mid,
                createdAt: item.createdAt,
            });
        }

        res.status(200).json({
            error: true,
            message: final_channels,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

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
            type: "C",
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
            message: e.toString(),
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
            message: e.toString(),
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
            message: e.toString(),
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
            message: e.toString(),
        });
    }
};

exports.updateChannelInfo = async(req, res) => {
    try {
        const { new_name, new_description, channelId } = req.body;

        let temp_channel = await Channel.findOne({
            channelId: channelId,
        });

        if (new_name !== undefined && new_description === undefined) {
            await temp_channel.update({ name: new_name });
        } else if (new_name === undefined && new_description !== undefined) {
            await temp_channel.update({ description: new_description });
        } else if (new_name !== undefined && new_description !== undefined) {
            await temp_channel.update({
                description: new_description,
                name: new_name,
            });
        } else {
            res.status(403).json({
                error: false,
                message: "please enter new name or description to update channel!",
            });
        }
        res.status(200).json({
            error: false,
            message: "Channel info updated!",
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.addAdminForChannel = async(req, res) => {
    try {
        const { currentUserId, target_userId, channelId } = req.body;

        let channel_entity = await Entity.findOne({
            cid: channelId,
        });

        let current_user_entity = await Entity.findOne({
            where: {
                uid: currentUserId,
            },
        });

        let target_user_entity = await Entity.findOne({
            where: {
                uid: target_userId,
            },
        });

        let current_user_membership = await Membership.findOne({
            where: {
                Role: "A",
                eid1: current_user_entity.entityId,
            },
        });

        let target_user_membership = await Membership.findOne({
            where: {
                eid1: target_user_entity.entityId,
                eid2: channel_entity.entityId,
            },
        });

        if (target_user_membership) {
            await target_user_membership.update({ Role: "A" });
            res.status(200).json({
                error: false,
                message: "user promoted to admin!",
            });
        } else {
            res.status(403).json({
                error: true,
                message: "just admin can promot users to admin!",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.getChannelMember = async(req, res) => {
    try {
        let all_data = [];

        const channelId = req.body.channelId;

        let gp_entity = await Entity.findOne({ where: { cid: channelId } });

        let channelMembers = await Membership.findAll({
            where: { eid2: gp_entity.entityId },
        });

        for (const element of channelMembers) {
            let element_entity = await Entity.findOne({
                where: {
                    entityId: element.eid1,
                },
            });
            let user_info = await User.findOne({
                where: {
                    userId: element_entity.uid,
                },
            });
            const data = {
                id: element.id,
                Role: element.Role,
                LastVisitDate: element.LastVisitDate,
                createdAt: element.createdAt,
                user: {
                    userId: user_info.userId,
                    eid: element_entity.entityId,
                    name: user_info.name,
                    phoneNumber: user_info.phoneNumber,
                    email: user_info.email,
                    username: user_info.username,
                    createdAt: user_info.createdAt,
                },
            };

            all_data.push(data);
        }

        res.status(200).json({
            error: false,
            message: all_data,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.removeMemberFromChannel = async(req, res) => {
    try {
        const { currentUserId, targetUserId, channelId } = req.body;

        let current_user_entity = await Entity.findOne({
            where: { uid: currentUserId },
        });
        let target_user_entity = await Entity.findOne({
            where: { uid: targetUserId },
        });
        let channel_entity = await Entity.findOne({
            where: { cid: channelId },
        });

        let current_user_membership = await Membership.findOne({
            Role: "A",
            eid1: current_user_entity.entityId,
        });

        let target_user_membership = await Membership.findOne({
            where: {
                eid1: target_user_entity.entityId,
                eid2: channel_entity.entityId,
            },
        });

        if (!target_user_membership) {
            res.status(404).json({
                error: true,
                message: "User Not found!",
            });
        }

        if (current_user_membership) {
            await target_user_membership.destroy();
            res.status(200).json({
                error: false,
                message: "user deleted successfull!",
            });
        } else {
            res.status(403).json({
                error: false,
                message: "You can't remove a user!",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};