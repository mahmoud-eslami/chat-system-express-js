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
        res.status(500).json({ error: true, message: e });
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
        res.status(500).json({ error: true, message: e });
    }
};