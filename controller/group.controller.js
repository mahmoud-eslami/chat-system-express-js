const { Entity, Group } = require("../models/entity.model");
const Membership = require("../models/membership.model");

exports.createGroup = async(req, res) => {
    try {
        const { name, description, userId } = req.body;

        const new_group = await Group.create({
            name: name,
            description: description,
        });

        // get user Entity
        let user_entity = await Entity.findOne({
            where: {
                uid: userId,
            },
        });
        // create entity after create group
        let group_entity = await Entity.create({
            gid: new_group.groupId,
        });

        // create membership for user as admin
        await Membership.create({
            Role: "A",
            LastVisitDate: Date.now(),
            eid1: user_entity.entityId,
            eid2: group_entity.entityId,
        });

        res.status(200).json({ error: false, message: "group created successful" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.deleteGroup = async(req, res) => {
    try {
        const { groupId, userId } = req.body;

        let user_entity = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        let group_entity = await Entity.findOne({ where: { gid: groupId } });

        let user_membership = await Membership.findOne({
            where: {
                eid1: user_entity.entityId,
                Role: "A",
            },
        });

        let temp_group = await Group.findOne({
            where: {
                groupId: groupId,
            },
        });

        if (user_membership !== null && temp_group !== null) {
            await group_entity.drstroy();

            await temp_group.destroy();

            await user_membership.destroy();

            res
                .status(200)
                .json({ error: false, message: "group deleted successful" });
        } else {
            res.status(403).json({
                error: false,
                message: "permission denied or group is not exist!",
            });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.joinGroup = async(req, res) => {
    try {
        const { userId, groupId } = req.body;

        let user_entity = await Entity.findOne({
            uid: userId,
        });

        let group_entity = await Entity.findOne({
            gid: groupId,
        });

        await Membership.create({
            Role: "U",
            LastVisitDate: Date.now(),
            eid1: user_entity.entityId,
            eid2: group_entity.entityId,
        });

        res
            .status(200)
            .json({ error: false, message: "user joined group successfull!" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.leftGroup = async(req, res) => {
    try {
        const { userId, groupId } = req.body;

        let user_entity = await Entity.findOne({
            uid: userId,
        });

        let group_entity = await Entity.findOne({
            gid: groupId,
        });

        await Membership.destroy({
            where: {
                eid1: user_entity.entityId,
                eid2: group_entity.entityId,
            },
        });

        res
            .status(200)
            .json({ error: false, message: "user left group successfull!" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.updateGroupInfo = async(req, res) => {
    try {
        const { new_name, new_description, groupId } = req.body;

        let temp_group = await Group.findOne({
            groupId: groupId,
        });

        if (new_name !== undefined && new_description === undefined) {
            await temp_group.update({ name: new_name });
        } else if (new_name === undefined && new_description !== undefined) {
            await temp_group.update({ description: new_description });
        } else if (new_name !== undefined && new_description !== undefined) {
            await temp_group.update({
                description: new_description,
                name: new_name,
            });
        } else {
            res.status(403).json({
                error: false,
                message: "please enter new name or description to update group!",
            });
        }
        res.status(200).json({
            error: false,
            message: "Channel info updated!",
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.addAdminForGroup = async(req, res) => {
    try {
        const { currentUserId, target_userId, groupId } = req.body;

        let group_entity = await Entity.findOne({
            gid: groupId,
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
                eid2: group_entity.entityId,
            },
        });

        if (current_user_membership) {
            await target_user_membership.update({ Role: "A" });
            res.status(200).json({
                error: true,
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