const { Entity } = require("../models/entity.model");
const Membership = require("../models/membership.model");

exports.getMembershipOfUser = async(req, res) => {
    try {
        const userId = req.body.userId;

        let temp_user_entity = await Entity.findOne({ where: { uid: userId } });

        let user_membership = await Membership.findAll({
            where: { eid1: temp_user_entity.entityId },
        });

        res.status(200).json({ error: false, message: user_membership });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};