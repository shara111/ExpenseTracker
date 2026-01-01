import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdBarChart,
  MdTrendingUp,
  MdTrendingDown,
  MdFilterList,
  MdCalendarToday,
} from "react-icons/md";
import { FiDollarSign, FiPieChart } from "react-icons/fi";
import api from "../utils/api";
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import calculateFinancialData from "../utils/calculateFinancialData";
import { useAccount } from "../context/AccountContext";
import { parseDateToLocal } from "../utils/dateFormatter";
import ViewOptions from "../utils/ViewOptions";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#8884d8",
  "#82ca9d",
];

function FinancialCharts() {
  const [user, setUser] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("4w");
  const [memberFilter, setMemberFilter] = useState("all");
  const [members, setMembers] = useState([]);
  const [customSearch, setCustomSearch] = useState(false);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayStr = parseDateToLocal(today);
  const yesterdayStr = parseDateToLocal(yesterday);
  const [customStartDateUI, setCustomStartDateUI] = useState(yesterdayStr);
  const [customEndDateUI, setCustomEndDateUI] = useState(todayStr);
  const [refreshKey, setRefreshKey] = useState(0); // trigger re-fetch
  const [noDataMessage, setNoDataMessage] = useState("");
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    transactions: [],
  });
  const {
    isOwner,
    currentAccount,
    loadAccounts,
    setCurrentAccountId,
    currentAccountId,
  } = useAccount();
  const viewOptions = ViewOptions({ setRange });
  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    try {
      setNoDataMessage("");
      const incomeResponse = await api.get(
        `income/get?start=${customStartDateUI}&end=${customEndDateUI}`,
      );
      const expenseResponse = await api.get(
        `expense/get?start=${customStartDateUI}&end=${customEndDateUI}`,
      );
      if (incomeResponse.status === 200 && expenseResponse.status === 200) {
        const incomeDocuments = incomeResponse.data;
        const expenseDocuments = expenseResponse.data;
        const filteredIncome =
          memberFilter === "all"
            ? incomeDocuments
            : incomeDocuments.filter((i) => i.createdBy?._id === memberFilter);
        const filteredExpense =
          memberFilter === "all"
            ? expenseDocuments
            : expenseDocuments.filter((i) => i.createdBy?._id === memberFilter);
        setIncomeData(filteredIncome);
        setExpenseData(filteredExpense);
      }
    } catch (error) {
      setNoDataMessage(
        error.response?.data?.message || "An unexpected error occurred",
      );
    }
  };
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!currentAccountId) return;
        const res = await api.get(`/accounts/${currentAccountId}/members`);
        setMembers(res.data || []);
      } catch (e) {
        setMembers([]);
      }
    };
    fetchMembers();
  }, [currentAccountId]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await api.get("/auth/getUser");
        setUser(userResponse.data);

        const incomeResponse = await api.get(`/income/get?range=${range}`);
        const incomes = incomeResponse.data || [];

        const expenseResponse = await api.get(`/expense/get?range=${range}`);
        const expenses = expenseResponse.data || [];

        const filteredExpenses =
          memberFilter === "all"
            ? expenses
            : expenses.filter((i) => i.createdBy?._id === memberFilter);

        const filteredIncome =
          memberFilter === "all"
            ? incomes
            : incomes.filter((i) => i.createdBy?._id === memberFilter);
        setIncomeData(filteredIncome);
        setExpenseData(filteredExpenses);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberFilter, range, currentAccountId]); // Refetch when account changes

  useEffect(() => {
    if (incomeData.length > 0 || expenseData.length > 0) {
      generateMonthlyData();
      generateExpenseCategories();
    }
  }, [incomeData, expenseData, range]);

  const generateMonthlyData = () => {
    const monthlyMap = {};

    // Process income data
    incomeData.forEach((income) => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,
          income: 0,
          expenses: 0,
          savings: 0,
        };
      }
      monthlyMap[monthKey].income += income.amount / 100; // Convert from cents
    });

    // Process expense data
    expenseData.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,
          income: 0,
          expenses: 0,
          savings: 0,
        };
      }
      monthlyMap[monthKey].expenses += expense.amount / 100; // Convert from cents
    });

    // Calculate savings
    Object.keys(monthlyMap).forEach((key) => {
      monthlyMap[key].savings =
        monthlyMap[key].income - monthlyMap[key].expenses;
    });

    const sortedData = Object.values(monthlyMap).sort(
      (a, b) => new Date(`${a.month} 2024`) - new Date(`${b.month} 2024`),
    );

    setMonthlyData(sortedData);
  };

  const generateExpenseCategories = () => {
    const categoryMap = {};

    expenseData.forEach((expense) => {
      const category = expense.category || "Other";
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += expense.amount / 100; // Convert from cents
    });

    const categories = Object.keys(categoryMap)
      .map((name) => ({
        name,
        value: Math.round(categoryMap[name] * 100) / 100, // Round to 2 decimal places
      }))
      .sort((a, b) => b.value - a.value);

    setExpenseCategories(categories);
  };

  if (loading) {
    return (
      <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalIncome = incomeData.reduce(
    (sum, income) => sum + income.amount / 100,
    0,
  );
  const totalExpenses = expenseData.reduce(
    (sum, expense) => sum + expense.amount / 100,
    0,
  );
  const totalSavings = totalIncome - totalExpenses;

  return (
    <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
          <MdBarChart className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Visualize your financial performance
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
      >
        <div className="card-stat group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Income
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalIncome.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <MdTrendingUp className="w-4 h-4" />
                Revenue
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:shadow-xl group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
              <FiDollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-stat group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Expenses
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${totalExpenses.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm text-red-600 font-medium">
                <MdTrendingDown className="w-4 h-4" />
                Spending
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-2xl shadow-lg shadow-red-500/30 group-hover:shadow-xl group-hover:shadow-red-500/40 group-hover:scale-110 transition-all duration-300">
              <FiDollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-stat group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Net Savings
              </p>
              <p
                className={`text-3xl font-bold ${totalSavings >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                ${totalSavings.toFixed(2)}
              </p>
              <div
                className={`mt-2 flex items-center gap-1 text-sm font-medium ${totalSavings >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {totalSavings >= 0 ? (
                  <MdTrendingUp className="w-4 h-4" />
                ) : (
                  <MdTrendingDown className="w-4 h-4" />
                )}
                {totalSavings >= 0 ? "Surplus" : "Deficit"}
              </div>
            </div>
            <div
              className={`bg-gradient-to-br p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${totalSavings >= 0 ? "from-blue-500 to-indigo-600 shadow-blue-500/30 group-hover:shadow-blue-500/40" : "from-orange-500 to-red-600 shadow-orange-500/30 group-hover:shadow-orange-500/40"}`}
            >
              <FiPieChart className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side: Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Member Filter */}
            {members.length > 0 && (
              <div className="flex items-center gap-2">
                <MdFilterList className="w-5 h-5 text-gray-400" />
                <select
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/10 hover:border-gray-300 transition-all cursor-pointer bg-white"
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                >
                  <option value="all">All Members</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName || m.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Search Toggle */}
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setCustomSearch(!customSearch)}
            >
              <MdCalendarToday className="w-4 h-4" />
              Custom Date
              {customSearch ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Right Side: View Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Period:
            </span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {viewOptions.map((item) => (
                <button
                  key={item.label}
                  onClick={item.setter}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-primary rounded-md hover:bg-white transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Custom Date Range */}
        {customSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t-2 border-gray-100"
          >
            <form
              onSubmit={handleRangeSubmit}
              className="flex flex-col sm:flex-row items-end gap-3"
            >
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  max={yesterdayStr}
                  onChange={(e) => setCustomStartDateUI(e.target.value)}
                  value={customStartDateUI}
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  max={todayStr}
                  onChange={(e) => setCustomEndDateUI(e.target.value)}
                  value={customEndDateUI}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary-light text-white rounded-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap"
              >
                Apply
              </button>
            </form>
            {noDataMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm">
                <svg
                  className="w-4 h-4 text-red-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 font-medium">{noDataMessage}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
      {monthlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1 h-8 bg-gradient-to-b from-primary to-primary-light rounded-full"></span>
            <h2 className="text-xl font-bold text-gray-900">
              Monthly Income vs Expenses
            </h2>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, ""]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "14px", fontWeight: "600" }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Monthly Income"
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Monthly Expenses"
                  dot={{ fill: "#ef4444", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Expense Category Breakdown and Savings Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {expenseCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-8 bg-gradient-to-b from-red-500 to-rose-600 rounded-full"></span>
              <h2 className="text-xl font-bold text-gray-900">
                Expense Categories
              </h2>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: $${value}`}
                    labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "14px", fontWeight: "600" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
              <h2 className="text-xl font-bold text-gray-900">
                Monthly Savings Progress
              </h2>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    formatter={(value) => [`$${value.toFixed(2)}`, ""]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "14px", fontWeight: "600" }}
                  />
                  <Bar
                    dataKey="savings"
                    fill="#6366f1"
                    name="Monthly Savings"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* No Data Messages */}
      {incomeData.length === 0 && expenseData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdBarChart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Financial Data Available
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start tracking your finances by adding income and expense entries to
            see detailed analytics and insights.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="/income"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
            >
              <FiDollarSign className="w-5 h-5" />
              Add Income
            </a>
            <a
              href="/expenses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
            >
              <FiDollarSign className="w-5 h-5" />
              Add Expenses
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default FinancialCharts;
