const { Entity } = require("../models/entity.model");
const Membership = require("../models/membership.model");

exports.createUserMembership = async(req, res) => {
    try {
        const e_sender = req.body.e_sender;
        const e_receiver = req.body.e_receiver;

        let membership1 = await Membership.findOne({
            where: { eid1: e_sender, eid2: e_receiver },
        });
        let membership2 = await Membership.findOne({
            where: { eid1: e_receiver, eid2: e_sender },
        });

        if (membership1) {
            res.status(200).json({ error: false, message: membership1 });
        } else if (membership2) {
            res.status(200).json({ error: false, message: membership2 });
        } else {
            let membership = await Membership.create({
                Role: "U",
                LastVisitDate: Date.now(),
                eid1: e_sender,
                eid2: e_receiver,
            });
            res.status(200).json({ error: false, message: membership });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.getMembershipOfUser = async(req, res) => {
    try {
        const userId = req.body.userId;

        let temp_user_entity = await Entity.findOne({ where: { uid: userId } });

        let user_membership_first = await Membership.findAll({
            where: { eid1: temp_user_entity.entityId },
        });

        let user_membership_second = await Membership.findAll({
            where: { eid2: temp_user_entity.entityId },
        });

        res.status(200).json({
            error: false,
            message: user_membership_first.concat(user_membership_second),
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.removeSpecificMembership = async(req, res) => {
    try {
        const membershipId = req.body.membershipId;

        let temp_membership = await Membership.findOne({
            where: {
                id: membershipId,
            },
        });

        if (temp_membership) {
            await temp_membership.destroy({});
            res
                .status(200)
                .json({ error: false, message: "membership deleted successful!" });
        } else {
            res.status(404).json({ error: false, message: "membership not found" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};