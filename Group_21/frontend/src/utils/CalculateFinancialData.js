export default function calculateFinancialData(incomes, expenses) {
  const totalIncome = incomes.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );

  // Calculate total expenses (amounts are in cents)
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );

  // Combine and sort recent transactions (last 10)
  const allTransactions = [
    ...incomes.map((item) => ({
      _id: item._id,
      description: item.source || "Income",
      amount: item.amount,
      date: item.date,
      type: "income",
      createdBy: item.createdBy,
    })),
    ...expenses.map((item) => ({
      _id: item._id,
      description: item.category || "Expense",
      amount: item.amount,
      date: item.date,
      type: "expense",
      createdBy: item.createdBy,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  // .slice(0, 10);

  return { totalIncome, totalExpenses, transactions: allTransactions };
}
