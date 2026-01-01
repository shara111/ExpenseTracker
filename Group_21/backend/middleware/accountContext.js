import Account from "../models/Account.js";
import mongoose from "mongoose";

// Resolves req.account based on X-Account-Id header or defaults to user's personal account.
// Ensures the requesting user is a member of the account.
export const accountContext = async (req, res, next) => {
  try {
    const headerId = req.headers["x-account-id"]; // case-insensitive
    const paramId = req.params?.id || req.params?.accountId;
    const queryId = req.query?.accountId;
    const bodyId = req.body?.accountId;
    const incomingId = headerId || paramId || queryId || bodyId;

    let account;
    if (incomingId) {
      if (!mongoose.Types.ObjectId.isValid(incomingId)) {
        return res.status(400).json({ message: "Invalid account ID" });
      }
      account = await Account.findOne({ _id: incomingId, deletedAt: null });
      if (!account) {
        return res
          .status(404)
          .json({ message: "Account not found or has been deleted" });
      }
    } else {
      // Find or create personal account
      account = await Account.findOne({
        owner: req.user._id,
        type: "personal",
        deletedAt: null,
      });
      if (!account) {
        account = await Account.create({
          type: "personal",
          name: "Personal",
          owner: req.user._id,
          members: [req.user._id],
        });
      }
    }

    // membership check (treat owner as member and self-heal if missing)
    const uid = (req.user?._id || req.user?.id)?.toString();
    const isOwner = account.owner?.toString() === uid;
    let isMember = account.members.some((m) => m.toString() === uid);

    // Self-heal: ensure owner is always part of members array
    if (isOwner && !isMember) {
      account.members.push(req.user._id);
      try {
        await account.save();
        isMember = true;
      } catch (err) {
        console.error("Failed to add owner to members:", err);
        // Still allow access since they're the owner
        isMember = true;
      }
    }

    if (!isMember) {
      return res.status(403).json({
        message:
          "You are not a member of this account. Please check your account access or accept any pending invitations.",
      });
    }

    req.account = account;
    next();
  } catch (err) {
    console.error("Account context error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const ownerOnly = async (req, res, next) => {
  try {
    if (!req.account) {
      return res
        .status(500)
        .json({ message: "Account context missing. Please try again." });
    }

    const uid = (req.user?._id || req.user?.id)?.toString();
    const isOwner = req.account.owner?.toString() === uid;

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the account owner can perform this action",
      });
    }

    next();
  } catch (err) {
    console.error("Owner check error:", err);
    return res.status(500).json({ message: err.message });
  }
};
