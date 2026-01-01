import Finance from "../models/Finance.js";
import Year from "../models/Year.js";
import Month from "../models/Month.js";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";

// NOTE: These are skeleton handlers. Implement logic in Step 3+.
// Expect req.user.id from auth middleware (or replace with explicit userId param during local testing).

// ----- Years -----
export const getYears = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const query = accountId ? { accountId } : { userId };
    const finance = await Finance.findOne(query).populate({
      path: "years",
      select: "year",
      options: { sort: { year: 1 } },
    });

    if (!finance) return res.json({ years: [] });
    const years = finance.years.map((y) => y.year);
    return res.json({ years });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addYear = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    const { year } = req.body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    if (!year || Number.isNaN(parseInt(year)))
      return res.status(400).json({ message: "Invalid year" });

    const query = accountId ? { accountId } : { userId };
    let finance = await Finance.findOne(query);
    if (!finance) {
      finance = await Finance.create({
        ...(accountId ? { accountId } : { userId }),
        years: [],
      });
    }

    // Check if year already exists for this user
    const existingYear = await Year.findOne({
      _id: { $in: finance.years },
      year: parseInt(year),
    });
    if (existingYear) {
      return res
        .status(200)
        .json({
          message: "Year already exists",
          year: existingYear.year,
          id: existingYear._id,
        });
    }

    // Create 12 months (0-11)
    const months = await Month.insertMany(
      Array.from({ length: 12 }, (_, idx) => ({ index: idx })),
    );

    const newYear = await Year.create({
      year: parseInt(year),
      months: months.map((m) => m._id),
    });
    finance.years.push(newYear._id);
    await finance.save();

    return res
      .status(201)
      .json({ message: "Year created", year: newYear.year, id: newYear._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteYear = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    const { year } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    if (!year || Number.isNaN(parseInt(year)))
      return res.status(400).json({ message: "Invalid year" });
    const query = accountId ? { accountId } : { userId };
    const finance = await Finance.findOne(query);
    if (!finance) return res.status(404).json({ message: "Finance not found" });

    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: parseInt(year),
    });
    if (!yearDoc) return res.status(404).json({ message: "Year not found" });

    // Delete months and pull references
    if (yearDoc.months?.length) {
      await Month.deleteMany({ _id: { $in: yearDoc.months } });
    }

    finance.years = finance.years.filter(
      (id) => id.toString() !== yearDoc._id.toString(),
    );
    await finance.save();

    await Year.deleteOne({ _id: yearDoc._id });

    return res.json({ message: "Year deleted", year: parseInt(year) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ----- Year data (income/expense by year) -----
export const getIncomeByYear = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    const { year } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    if (!year || Number.isNaN(parseInt(year)))
      return res.status(400).json({ message: "Invalid year" });
    const query = accountId ? { accountId } : { userId };
    const finance = await Finance.findOne(query);
    if (!finance) return res.json({});

    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: parseInt(year),
    })
      .populate({ path: "months", populate: { path: "incomes" } })
      .lean();

    if (!yearDoc) return res.json({});

    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const result = {};
    for (const m of yearDoc.months || []) {
      const name = MONTHS[m.index] ?? `M${m.index}`;
      const arr = Array.isArray(m.incomes) ? m.incomes : [];
      // Include both keys for frontend compatibility
      result[name] = { income: arr, expenses: [] };
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getExpenseByYear = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    const { year } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    if (!year || Number.isNaN(parseInt(year)))
      return res.status(400).json({ message: "Invalid year" });
    const query = accountId ? { accountId } : { userId };
    const finance = await Finance.findOne(query);
    if (!finance) return res.json({});

    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: parseInt(year),
    })
      .populate({ path: "months", populate: { path: "expenses" } })
      .lean();

    if (!yearDoc) return res.json({});

    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const result = {};
    for (const m of yearDoc.months || []) {
      const name = MONTHS[m.index] ?? `M${m.index}`;
      const arr = Array.isArray(m.expenses) ? m.expenses : [];
      // Include both keys; 'income' for current ExpenseByYear.jsx compatibility
      result[name] = { income: arr, expenses: arr };
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ----- Month-scoped Income CRUD -----
export const createIncome = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    const { year, month } = req.params; // month 0-11 expected
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const mi = parseInt(month);
    const yi = parseInt(year);
    if (Number.isNaN(yi) || Number.isNaN(mi) || mi < 0 || mi > 11)
      return res.status(400).json({ message: "Invalid year/month" });

    const finance = await Finance.findOne(
      accountId ? { accountId } : { userId },
    );
    if (!finance) return res.status(404).json({ message: "Finance not found" });
    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: yi,
    }).populate("months");
    if (!yearDoc) return res.status(404).json({ message: "Year not found" });
    const monthDoc = yearDoc.months.find((m) => m.index === mi);
    if (!monthDoc) return res.status(404).json({ message: "Month not found" });

    const { icon, source, amount, date, recurring, startDate } = req.body;
    const created = await Income.create({
      userId,
      icon,
      source,
      amount,
      date,
      recurring,
      startDate,
      accountId,
      createdBy: req.user._id,
    });
    await Month.updateOne(
      { _id: monthDoc._id },
      { $addToSet: { incomes: created._id } },
    );
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const { incomeId } = req.params;
    const update = req.body;
    const updated = await Income.findByIdAndUpdate(incomeId, update, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Income not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const { year, month, incomeId } = req.params;
    const yi = parseInt(year);
    const mi = parseInt(month);
    const income = await Income.findById(incomeId);
    if (!income) return res.status(404).json({ message: "Income not found" });

    const finance = await Finance.findOne({ userId: income.userId });
    if (!finance) return res.status(404).json({ message: "Finance not found" });
    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: yi,
    }).populate("months");
    if (!yearDoc) return res.status(404).json({ message: "Year not found" });
    const monthDoc = yearDoc.months.find((m) => m.index === mi);
    if (!monthDoc) return res.status(404).json({ message: "Month not found" });

    await Month.updateOne(
      { _id: monthDoc._id },
      { $pull: { incomes: income._id } },
    );
    await Income.deleteOne({ _id: income._id });
    return res.json({ message: "Income deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ----- Month-scoped Expense CRUD -----
export const createExpense = async (req, res) => {
  try {
    const accountId = req.account?._id;
    const userId = req.user?._id;
    const { year, month } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const mi = parseInt(month);
    const yi = parseInt(year);
    if (Number.isNaN(yi) || Number.isNaN(mi) || mi < 0 || mi > 11)
      return res.status(400).json({ message: "Invalid year/month" });

    const finance = await Finance.findOne(
      accountId ? { accountId } : { userId },
    );
    if (!finance) return res.status(404).json({ message: "Finance not found" });
    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: yi,
    }).populate("months");
    if (!yearDoc) return res.status(404).json({ message: "Year not found" });
    const monthDoc = yearDoc.months.find((m) => m.index === mi);
    if (!monthDoc) return res.status(404).json({ message: "Month not found" });

    const { icon, category, amount, date, recurring, startDate } = req.body;
    const created = await Expense.create({
      userId,
      icon,
      category,
      amount,
      date,
      recurring,
      startDate,
      accountId,
      createdBy: req.user._id,
    });
    await Month.updateOne(
      { _id: monthDoc._id },
      { $addToSet: { expenses: created._id } },
    );
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const update = req.body;
    const updated = await Expense.findByIdAndUpdate(expenseId, update, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { year, month, expenseId } = req.params;
    const yi = parseInt(year);
    const mi = parseInt(month);
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const finance = await Finance.findOne({ userId: expense.userId });
    if (!finance) return res.status(404).json({ message: "Finance not found" });
    const yearDoc = await Year.findOne({
      _id: { $in: finance.years },
      year: yi,
    }).populate("months");
    if (!yearDoc) return res.status(404).json({ message: "Year not found" });
    const monthDoc = yearDoc.months.find((m) => m.index === mi);
    if (!monthDoc) return res.status(404).json({ message: "Month not found" });

    await Month.updateOne(
      { _id: monthDoc._id },
      { $pull: { expenses: expense._id } },
    );
    await Expense.deleteOne({ _id: expense._id });
    return res.json({ message: "Expense deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
