import Account from "../models/Account.js";
import User from "../models/User.js";

export const createSharedAccount = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const account = await Account.create({
      type: "shared",
      name,
      owner: req.user._id,
      members: [req.user._id],
    });
    return res.status(201).json({ account });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyAccounts = async (req, res) => {
  try {
    // personal (create if not exists handled by accountContext on other routes; here we'll ensure as well)
    let personal = await Account.findOne({
      owner: req.user._id,
      type: "personal",
      deletedAt: null,
    });
    if (!personal) {
      personal = await Account.create({
        type: "personal",
        name: "Personal",
        owner: req.user._id,
        members: [req.user._id],
      });
    }
    const shared = await Account.find({
      members: req.user._id,
      type: "shared",
      deletedAt: null,
    });
    return res.json({ personal, shared });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const listMembers = async (req, res) => {
  try {
    const account = req.account; // provided by accountContext
    // Ensure owner is included in the list, even if members array is missing it
    const uniqueIds = Array.from(
      new Set(
        [
          ...account.members.map((m) => m.toString()),
          account.owner?.toString(),
        ].filter(Boolean),
      ),
    );
    const users = await User.find({ _id: { $in: uniqueIds } }).select(
      "fullName email",
    );
    const result = users.map((u) => ({
      userId: u._id,
      fullName: u.fullName,
      email: u.email,
      role: account.owner.toString() === u._id.toString() ? "owner" : "member",
    }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const account = req.account; // ownerOnly already checked
    const { userId } = req.params;
    if (account.owner.toString() === userId) {
      return res.status(400).json({ message: "Owner cannot be removed" });
    }
    account.members = account.members.filter((m) => m.toString() !== userId);
    await account.save();
    return res.json({ message: "Member removed", members: account.members });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const account = req.account; // ownerOnly checked
    if (account.type !== "shared")
      return res
        .status(400)
        .json({ message: "Cannot delete personal account" });
    // Ensure consistency: owner must be part of members
    if (
      !account.members.some((m) => m.toString() === account.owner.toString())
    ) {
      account.members.push(account.owner);
    }
    account.deletedAt = new Date();
    await account.save();
    return res.json({ message: "Account deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
