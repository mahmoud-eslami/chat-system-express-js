const { Entity } = require("../models/entity.model");
const Membership = require("../models/membership.model");
const jwt = require("jsonwebtoken");
const { seenMessage, Message } = require("../models/message.model");

function getUserId(token) {
    let payload = jwt.decode(token);

    let uid = payload["userId"];

    return uid;
}

function getEid(token) {
    let payload = jwt.decode(token);

    let eid = payload["eid"];

    return eid;
}

exports.createUserMembership = async(req, res) => {
    try {
        const e_receiver = req.body.e_receiver;
        const token = req.headers["x-access-token"];
        const payload = jwt.decode(token);

        const e_sender = payload["eid"];

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
        const token = req.headers["x-access-token"];
        const userId = getUserId(token);
        const eid = getEid(token);

        let temp_user_entity = await Entity.findOne({ where: { uid: userId } });

        let user_membership_first = await Membership.findAll({
            where: { eid1: temp_user_entity.entityId },
        });

        let user_membership_second = await Membership.findAll({
            where: { eid2: temp_user_entity.entityId },
        });

        let full_list = user_membership_first.concat(user_membership_second);
        let final_list = [];

        for (const item of full_list) {
            let seenCount = await getSeenCount(item.eid2, eid);
            final_list.push({
                id: item.id,
                Role: item.Role,
                LastVisitDate: item.LastVisitDate,
                createdAt: item.createdAt,
                eid1: item.eid1,
                eid2: item.eid2,
                unreadMessage: seenCount,
            });
        }

        res.status(200).json({
            error: false,
            message: final_list,
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

async function getSeenCount(receiver_id, eid) {
    let list = [];
    let seens = [];
    let entity_receiver = await Entity.findOne({
        where: { entityId: receiver_id },
    });
    if (entity_receiver.type === "U") {
        let messages = await Message.findAll({
            where: {
                eid_receiver: receiver_id,
            },
        });
        let messages_reverse = await Message.findAll({
            where: {
                eid_sender: receiver_id,
            },
        });

        list = messages.concat(messages_reverse);
    } else {
        let messages = await Message.findAll({
            where: {
                eid_receiver: receiver_id,
            },
        });

        list = messages;
    }

    for (const item of list) {
        let seen_item = await seenMessage.findOne({
            where: { eid: eid, mid: item.messageId },
        });

        if (seen_item) {
            seens.push(seen_item);
        }
    }

    let seenCount = list.length - seens.length;
    return seenCount;
}