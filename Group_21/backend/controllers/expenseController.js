import Expense from "../models/Expense.js";

export const addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date, tags, recurring, endDate, head } =
      req.body;
    if (!category || isNaN(amount) || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide value more than 0." });
    }
    const finalStartDate = new Date(date);

    const finalEndDate = endDate ? new Date(endDate) : "";
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];
    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: finalStartDate,
      tags: tagsArray,
      recurring,
      endDate: finalEndDate,
      head,
      accountId: req.account?._id,
      createdBy: req.user._id,
    });
    await newExpense.save();
    res.status(200).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const getAllExpense = async (req, res) => {
  const { range, start, end } = req.query;
  let startDate, endDate;
  const today = new Date();
  try {
    const accountId = req.account?._id;
    const { createdBy, tags } = req.query;
    const query = [];
    if (accountId) {
      query.push({ accountId });
    }
    // Legacy: include personal legacy records for personal context
    if (!accountId || (req.account && req.account.type === "personal")) {
      query.push({ accountId: { $exists: false }, userId: req.user._id });
    }
    const filter = query.length ? { $or: query } : {};
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }
    startDate = new Date();
    endDate = new Date();
    if (range) {
      switch (range) {
        case "4w":
          startDate.setDate(startDate.getDate() - 28);
          break;
        case "3m":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6m":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "12m":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          return res.status(400).json({ error: "Invalid range date" });
      }
    }
    if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
      if (endDate <= startDate) {
        return res
          .status(400)
          .json({
            message:
              "Incorrect date range. Make sure the start date is before the end date.",
          });
      }
    }

    const recurringExpenses = await Expense.find({
      ...filter,
      recurring: { $in: ["monthly", "bi-weekly"] },
      head: true,
    });
    for (const expense of recurringExpenses) {
      const lastDate = new Date(expense.date);
      let nextDate;
      if (expense.recurring === "bi-weekly") {
        nextDate = new Date(lastDate);

        nextDate.setDate(lastDate.getDate() + 14);
      } else if (expense.recurring === "monthly") {
        nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + 1);
      }
      const todayISOStr = today.toISOString().slice(0, 10);
      var nextDateISOStr = nextDate.toISOString().slice(0, 10);
      const endDateISOStr = expense.endDate
        ? expense.endDate.toISOString().slice(0, 10)
        : "";
      const limitDate =
        endDateISOStr && endDateISOStr <= todayISOStr
          ? endDateISOStr
          : todayISOStr;
      var prevDoc = expense;
      while (nextDateISOStr <= limitDate) {
        const newExpense = new Expense({
          userId: prevDoc.userId,
          icon: prevDoc.icon,
          category: prevDoc.category,
          amount: prevDoc.amount,
          date: nextDate,
          tags: prevDoc.tags,
          recurring: prevDoc.recurring,
          endDate: prevDoc.endDate,
          head: true,
          accountId: prevDoc.accountId,
          createdBy: prevDoc.userId,
        });

        await newExpense.save();
        if (prevDoc.recurring === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setDate(nextDate.getDate() + 14);
        }
        nextDateISOStr = nextDate.toISOString().slice(0, 10);
        prevDoc.head = false;
        prevDoc.recurring = "once";
        await prevDoc.save();
        prevDoc = newExpense;
      }
    }
    const expenses = await Expense.find({
      ...filter,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .populate("createdBy", "fullName email");

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Nothing to show!" });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const doc = await Expense.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Expense not found" });

    const inAccount =
      req.account &&
      doc.accountId &&
      doc.accountId.toString() === req.account._id.toString();
    const legacyPersonal =
      !doc.accountId &&
      req.account &&
      req.account.type === "personal" &&
      doc.userId.toString() === req.user._id.toString();
    if (!inAccount && !legacyPersonal)
      return res.status(403).json({ message: "Forbidden" });

    const isOwner =
      req.account && req.account.owner.toString() === req.user._id.toString();
    const isCreator =
      (doc.createdBy && doc.createdBy.toString() === req.user._id.toString()) ||
      legacyPersonal;
    if (!isOwner && !isCreator)
      return res.status(403).json({ message: "Not allowed" });

    await doc.deleteOne();
    res.status(200).json({ message: "Expense Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || error });
  }
};

export const updateExpense = async (req, res) => {
  const userId = req.user.id;
  const expenseId = req.params.id;

  try {
    const { icon, category, amount, date, tags, recurring, endDate, head } =
      req.body;
    const finalEndDate = endDate ? new Date(endDate) : "";

    if (!category || isNaN(amount) || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide value more than 0." });
    }

    const existing = await Expense.findById(expenseId);
    if (!existing)
      return res.status(404).json({ message: "expense not found" });

    // Check account membership and scope
    const inAccount =
      req.account &&
      existing.accountId &&
      existing.accountId.toString() === req.account._id.toString();
    const legacyPersonal =
      !existing.accountId &&
      req.account &&
      req.account.type === "personal" &&
      existing.userId.toString() === req.user._id.toString();
    if (!inAccount && !legacyPersonal)
      return res.status(403).json({ message: "Forbidden" });

    // Permission: owner can edit any; member can edit own
    const isOwner =
      req.account && req.account.owner.toString() === req.user._id.toString();
    const isCreator =
      (existing.createdBy &&
        existing.createdBy.toString() === req.user._id.toString()) ||
      legacyPersonal;
    if (!isOwner && !isCreator)
      return res.status(403).json({ message: "Not allowed" });

    // Process tags: convert comma-separated string to array, trim whitespace
    // Process tags
    const tagsArray = tags
      ? Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
      : [];

    existing.icon = icon;
    existing.category = category;
    existing.amount = amount;
    existing.recurring = recurring;
    existing.endDate = finalEndDate;
    existing.head = head;

    existing.date = new Date(date);
    existing.tags = tagsArray;
    await existing.save();
    res.status(200).json(existing);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getUpcomingExpenses = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const { createdBy, tags, range } = req.query;
    const query = [];
    let endDate;
    const today = new Date();
    if (accountId) {
      query.push({ accountId });
    }

    if (!accountId || (req.account && req.account.type === "personal")) {
      query.push({ accountId: { $exists: false }, userId: req.user._id });
    }
    const filter = query.length ? { $or: query } : {};
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    endDate = new Date();
    switch (range) {
      case "4w":
        endDate.setDate(endDate.getDate() + 28);
        break;
      case "3m":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "6m":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "12m":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid range date" });
    }
    const recurringExpenses = await Expense.find({
      $and: [
        filter,
        {recurring: { $in: ["monthly", "bi-weekly"] }},
        {head: true},
        {
          $or: [
            { endDate: { $gte: today } }, 
            { endDate: "" }
          ]
        },
      ]
    });

    const upcomingExpenses = [];
    for (const expense of recurringExpenses) {
      const lastDate = new Date(expense.date);
      let nextDate;
      if (expense.recurring === "bi-weekly") {
        nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 14);
      } else if (expense.recurring === "monthly") {
        nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + 1);
      }

      var nextDateISOStr = nextDate.toISOString().slice(0, 10);
      const endDateISOStr = expense.endDate
        ? expense.endDate.toISOString().slice(0, 10)
        : "";
      const endRangeDateStr = endDate.toISOString().slice(0, 10);
      const limitDate =
        endDateISOStr && endDateISOStr <= endRangeDateStr
          ? endDateISOStr
          : endRangeDateStr;

      while (nextDateISOStr <= limitDate) {
        const newExpense = new Expense({
          userId: expense.userId,
          icon: expense.icon,
          category: expense.category,
          amount: expense.amount,
          date: new Date(nextDate),
          tags: expense.tags,
          recurring: expense.recurring,
          endDate: expense.endDate,
          head: true,
          accountId: expense.accountId,
          createdBy: expense.userId,
        });
        upcomingExpenses.push(newExpense);

        if (expense.recurring === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setDate(nextDate.getDate() + 14);
        }
        nextDateISOStr = nextDate.toISOString().slice(0, 10);
      }
    }

    res.status(200).json(upcomingExpenses);
  } catch (error) {
    res.status(500).json({ message: "Nothing to show!" });
  }
};
