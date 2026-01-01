import Income from "../models/Income.js";

export const addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date, tags, recurring, endDate, head } =
      req.body;
    if (!source || isNaN(amount) || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide value more than 0." });
    }
    const finalStartDate = new Date(date);

    // Process tags: convert comma-separated string to array, trim whitespace
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    const finalEndDate = endDate ? new Date(endDate) : "";
    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: finalStartDate,
      tags: tagsArray,
      recurring,
      endDate: finalEndDate,
      head,
      accountId: req.account?._id,
      createdBy: req.user._id,
    });
    await newIncome.save();
    res.status(200).json(newIncome);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const getAllIncome = async (req, res) => {
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
    // Add tag filtering
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
    /*
      Check for income that is reoccurring monthly or bi-weekly. To avoid creating
      duplicates, only select documents that have a true "head" flag. Once it is duplicated
      with a new date, assign the current income.head = false and set the newIncome.head = true. 
    */
    const recurringIncomes = await Income.find({
      ...filter,
      recurring: { $in: ["monthly", "bi-weekly"] },
      head: true,
    });
    for (const income of recurringIncomes) {
      // get the date of when the most recent document was added.
      const lastDate = new Date(income.date);
      let nextDate;
      if (income.recurring === "bi-weekly") {
        // if its bi-weekly, get the next bi-weekly date by using the last date.
        nextDate = new Date(lastDate);

        nextDate.setDate(lastDate.getDate() + 14);
      } else if (income.recurring === "monthly") {
        nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + 1);
      }
      const todayISOStr = today.toISOString().slice(0, 10);
      var nextDateISOStr = nextDate.toISOString().slice(0, 10);
      const endDateISOStr = income.endDate
        ? income.endDate.toISOString().slice(0, 10)
        : "";
      const limitDate =
        endDateISOStr && endDateISOStr <= todayISOStr
          ? endDateISOStr
          : todayISOStr;
      var prevDoc = income;
      while (nextDateISOStr <= limitDate) {
        const newIncome = new Income({
          userId: prevDoc.userId,
          icon: prevDoc.icon,
          source: prevDoc.source,
          amount: prevDoc.amount,
          date: nextDate,
          tags: prevDoc.tags,
          recurring: prevDoc.recurring,
          endDate: prevDoc.endDate,
          head: true,
          accountId: prevDoc.accountId,
          createdBy: prevDoc.userId,
        });
        await newIncome.save();
        if (prevDoc.recurring === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setDate(nextDate.getDate() + 14);
        }

        nextDateISOStr = nextDate.toISOString().slice(0, 10);

        prevDoc.head = false;
        prevDoc.recurring = "once";
        await prevDoc.save();

        // store a reference to the most recently created document
        // for manipulation if another loop is needed.
        prevDoc = newIncome;
      }
    }
    const incomes = await Income.find({
      ...filter,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .populate("createdBy", "fullName email");
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Nothing to show!" });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const doc = await Income.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Income not found" });

    // Check account ownership: record must belong to current account (or legacy personal)
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

    // Permission: owner can delete any; member can delete own only
    const isOwner =
      req.account && req.account.owner.toString() === req.user._id.toString();
    const isCreator =
      (doc.createdBy && doc.createdBy.toString() === req.user._id.toString()) ||
      legacyPersonal;
    if (!isOwner && !isCreator)
      return res.status(403).json({ message: "Not allowed" });

    await doc.deleteOne();
    res.status(200).json({ message: "Income Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || error });
  }
};

export const updateIncome = async (req, res) => {
  const userId = req.user.id;
  const incomeId = req.params.id;

  try {
    const { icon, source, amount, date, tags, recurring, endDate, head } =
      req.body;
    const finalEndDate = endDate ? new Date(endDate) : "";

    if (!source || isNaN(amount) || !date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide value more than 0." });
    }

    const existing = await Income.findById(incomeId);
    if (!existing) return res.status(404).json({ message: "Income not found" });

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
    const tagsArray = tags
      ? Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
      : [];

    existing.icon = icon;
    existing.source = source;
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

export const getUpcomingIncome = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const { createdBy, tags, range } = req.query;
    const query = [];
    let endDate;
    const today = new Date();
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
    // Add tag filtering
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
    const recurringIncomes = await Income.find({
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

    /*
      loop through the recurring incomes. Create new income objects for each one up until the
      endDate (range) or until the income.endDate is reached
    */
    const upcomingIncomes = [];
    for (const income of recurringIncomes) {
      const lastDate = new Date(income.date);
      let nextDate;
      if (income.recurring === "bi-weekly") {
        nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 14);
      } else if (income.recurring === "monthly") {
        nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + 1);
      }

      var nextDateISOStr = nextDate.toISOString().slice(0, 10);
      const endDateISOStr = income.endDate
        ? income.endDate.toISOString().slice(0, 10)
        : "";
      const endRangeDateStr = endDate.toISOString().slice(0, 10);
      const limitDate =
        endDateISOStr && endDateISOStr <= endRangeDateStr
          ? endDateISOStr
          : endRangeDateStr;

      while (nextDateISOStr <= limitDate) {
        const newIncome = new Income({
          userId: income.userId,
          icon: income.icon,
          source: income.source,
          amount: income.amount,
          date: new Date(nextDate),
          tags: income.tags,
          recurring: income.recurring,
          endDate: income.endDate,
          head: true,
          accountId: income.accountId,
          createdBy: income.userId,
        });
        upcomingIncomes.push(newIncome);

        if (income.recurring === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
          nextDate.setDate(nextDate.getDate() + 14);
        }
        nextDateISOStr = nextDate.toISOString().slice(0, 10);
      }
    }

    res.status(200).json(upcomingIncomes);
  } catch (error) {
    res.status(500).json({ message: "Nothing to show!" });
  }
};
