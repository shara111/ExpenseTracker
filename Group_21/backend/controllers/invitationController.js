import Invitation from "../models/Invitation.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createInvitation = async (req, res) => {
  try {
    const account = req.account; // ownerOnly checked upstream
    const { email, message } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ message: "Invitee not found" });

    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.type !== "shared") {
      return res
        .status(400)
        .json({
          message:
            "Cannot invite to a personal account. Create a shared account first.",
        });
    }

    // Prevent inviting existing members
    const alreadyMember = account.members.some(
      (m) => m.toString() === invitee._id.toString(),
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User is already a member" });

    // Prevent duplicate pending invitation for same account/invitee
    const existing = await Invitation.findOne({
      account: account._id,
      invitee: invitee._id,
      status: "pending",
    });
    if (existing)
      return res
        .status(200)
        .json({ invitation: existing, message: "Invitation already pending" });

    const invitation = await Invitation.create({
      account: account._id,
      inviter: req.user._id,
      invitee: invitee._id,
      inviteeEmail: email,
      message,
    });
    return res.status(201).json({ invitation });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const listInvitationsForMe = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitee: req.user._id,
      status: "pending",
    })
      .populate("account", "name type owner")
      .populate("inviter", "fullName email");
    return res.json({ invitations });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const inv = await Invitation.findOne({
      _id: invitationId,
      invitee: req.user._id,
      status: "pending",
    });

    if (!inv) {
      return res
        .status(404)
        .json({ message: "Invitation not found or already responded to" });
    }

    // Add member to account FIRST before updating invitation status
    const Account = (await import("../models/Account.js")).default;
    const account = await Account.findById(inv.account);

    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or has been deleted" });
    }

    if (account.type !== "shared") {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Check if already a member (shouldn't happen, but safety check)
    const alreadyMember = account.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );

    if (!alreadyMember) {
      account.members.push(req.user._id);
      await account.save();
    }

    // Now update invitation status
    inv.status = "accepted";
    inv.respondedAt = new Date();
    await inv.save();

    // Notify owner that invitation was accepted
    await Notification.create({
      user: account.owner,
      type: "invitation-accepted",
      data: {
        accountId: account._id,
        accountName: account.name,
        inviteeId: req.user._id,
        inviteeName: req.user.fullName,
        inviteeEmail: req.user.email,
      },
    });

    return res.json({
      message:
        "Invitation accepted successfully. You are now a member of this shared account.",
      accountId: account._id,
      accountName: account.name,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const inv = await Invitation.findOne({
      _id: invitationId,
      invitee: req.user._id,
      status: "pending",
    });

    if (!inv) {
      return res
        .status(404)
        .json({ message: "Invitation not found or already responded to" });
    }

    inv.status = "declined";
    inv.respondedAt = new Date();
    await inv.save();

    // Get account details for notification
    const Account = (await import("../models/Account.js")).default;
    const account = await Account.findById(inv.account);

    // Notify owner that invitation was declined
    await Notification.create({
      user: inv.inviter,
      type: "invitation-declined",
      data: {
        accountId: inv.account,
        accountName: account?.name || "Shared Account",
        inviteeId: req.user._id,
        inviteeName: req.user.fullName,
        inviteeEmail: req.user.email,
      },
    });

    return res.json({ message: "Invitation declined" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const NotificationModel = Notification;
    const notifs = await NotificationModel.find({
      user: req.user._id,
      readAt: null,
    }).sort({ createdAt: -1 });
    return res.json({ notifications: notifs });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notif)
      return res.status(404).json({ message: "Notification not found" });
    notif.readAt = new Date();
    await notif.save();
    return res.json({ message: "Notification marked as read" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
