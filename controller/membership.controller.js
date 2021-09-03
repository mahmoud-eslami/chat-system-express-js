const { Entity } = require("../models/entity.model");
const Membership = require("../models/membership.model");

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