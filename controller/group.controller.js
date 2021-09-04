const { Entity, Group, User } = require("../models/entity.model");
const Membership = require("../models/membership.model");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");

function getUserId(token) {
    let payload = jwt.decode(token);

    let uid = payload["userId"];

    return uid;
}

exports.unpinMessage = async(req, res) => {
    try {
        const gid = req.body.gid;

        let group = await Group.findOne({ where: { groupId: gid } });

        group.update({ mid: null });

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
        const gid = req.body.gid;

        let group = await Group.findOne({ where: { groupId: gid } });

        group.update({ mid: mid });

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

exports.searchGroup = async(req, res) => {
    try {
        const query = req.body.query.toLowerCase();
        let final_Groups = [];

        let groups = await Group.findAll({
            where: {
                name: {
                    [Op.like]: "%" + query + "%",
                },
            },
        });

        for (const item of groups) {
            let temp_entity = await Entity.findOne({
                where: { gid: item.groupId },
            });
            final_Groups.push({
                groupId: item.groupId,
                entityId: temp_entity.entityId,
                name: item.name,
                description: item.description,
                mid: item.mid,
                createdAt: item.createdAt,
            });
        }

        res.status(200).json({
            error: true,
            message: final_Groups,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.createGroup = async(req, res) => {
    try {
        const { name, description } = req.body;
        const token = req.headers["x-access-token"];
        const userId = getUserId(token);
        console.log(userId);

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
            type: "G",
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
        const { groupId } = req.body;
        const token = req.headers["x-access-token"];
        const userId = getUserId(token);
        console.log(userId);

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

        if (
            user_membership !== null &&
            temp_group !== null &&
            group_entity !== null
        ) {
            await group_entity.destroy();

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
        const groupId = req.body.groupId;
        const token = req.headers["x-access-token"];
        const userId = getUserId(token);
        console.log(userId);

        let user_entity = await Entity.findOne({
            where: {
                uid: userId,
                type: "U",
            },
        });

        let group_entity = await Entity.findOne({
            where: {
                gid: groupId,
                type: "G",
            },
        });

        if (!user_entity) {
            res.status(404).json({ error: true, message: "User not found!" });
        }
        if (!group_entity) {
            res.status(404).json({ error: true, message: "Group not found!" });
        }

        let old_membership = await Membership.findOne({
            where: {
                Role: "U",
                eid1: user_entity.entityId,
                eid2: group_entity.entityId,
            },
        });

        if (old_membership) {
            res.status(403).json({ error: true, message: "User joined before!" });
        } else {
            await Membership.create({
                Role: "U",
                LastVisitDate: Date.now(),
                eid1: user_entity.entityId,
                eid2: group_entity.entityId,
            });

            res
                .status(200)
                .json({ error: false, message: "user joined group successfull!" });
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: true, message: e.toString() });
    }
};

exports.leftGroup = async(req, res) => {
    try {
        const groupId = req.body.groupId;
        const token = req.headers["x-access-token"];
        const userId = getUserId(token);
        console.log(userId);

        let user_entity = await Entity.findOne({
            where: {
                uid: userId,
            },
        });

        let group_entity = await Entity.findOne({
            where: {
                gid: groupId,
            },
        });

        if (!user_entity) {
            res.status(404).json({ error: true, message: "user not exist!" });
        }
        if (!group_entity) {
            res.status(404).json({ error: true, message: "gp not exist!" });
        }

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
        const token = req.headers["x-access-token"];
        const userId = getUserId(token);
        console.log(userId);

        let temp_group = await Group.findOne({
            where: {
                groupId: groupId,
            },
        });

        if (!temp_group) {
            res.status(403).json({
                error: true,
                message: "group not exist!",
            });
        }

        let gp_entity = await Entity.findOne({
            where: { gid: groupId },
        });
        let user_entity = await Entity.findOne({ where: { uid: userId } });

        let membership = await Membership.findOne({
            where: {
                eid1: user_entity.entityId,
                eid2: gp_entity.entityId,
                Role: "A",
            },
        });

        if (membership) {
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
                    error: true,
                    message: "please enter new name or description to update group!",
                });
            }
            res.status(200).json({
                error: false,
                message: "Group info updated!",
            });
        } else {
            res.status(403).json({
                error: false,
                message: "Just admin can change on gp info",
            });
        }
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

exports.getGroupMember = async(req, res) => {
    try {
        let all_data = [];

        const groupId = req.body.groupId;

        let gp_entity = await Entity.findOne({ where: { gid: groupId } });

        if (!gp_entity) {
            res.status(404).json({
                error: true,
                message: "gp not exist!",
            });
        } else {
            let groupMembers = await Membership.findAll({
                where: { eid2: gp_entity.entityId },
            });

            for (const element of groupMembers) {
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
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({
            error: true,
            message: e.toString(),
        });
    }
};

exports.removeMemberFromGroup = async(req, res) => {
    try {
        const { targetUserId, groupId } = req.body;
        const token = req.headers["x-access-token"];
        const currentUserId = getUserId(token);

        let current_user_entity = await Entity.findOne({
            where: { uid: currentUserId },
        });

        let target_user_entity = await Entity.findOne({
            where: { uid: targetUserId },
        });
        let group_entity = await Entity.findOne({
            where: { gid: groupId },
        });

        if (targetUserId === currentUserId) {
            res.status(403).json({
                error: true,
                message: "target id and user id can't be same",
            });
        }

        if (!current_user_entity) {
            res.status(404).json({
                error: true,
                message: "current user not found!",
            });
        }
        if (!target_user_entity) {
            res.status(403).json({
                error: true,
                message: "target user not found!",
            });
        }
        if (!group_entity) {
            res.status(403).json({
                error: true,
                message: "gp not found!",
            });
        }

        let current_user_membership = await Membership.findOne({
            Role: "A",
            eid1: current_user_entity.entityId,
        });

        let target_user_membership = await Membership.findOne({
            where: {
                eid1: target_user_entity.entityId,
                eid2: group_entity.entityId,
            },
        });

        if (current_user_membership) {
            await target_user_membership.destroy();
            res.status(200).json({
                error: false,
                message: "user deleted successfull!",
            });
        } else {
            res.status(403).json({
                error: true,
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