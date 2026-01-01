import { useState, useEffect } from "react";
import api from "../utils/api";
import { MdAttachMoney, MdSavings } from "react-icons/md";
import { FiDollarSign } from "react-icons/fi";
import InviteMemberModal from "../components/InviteMemberModal";
import CreateSharedAccountModal from "../components/CreateSharedAccountModal";
import { useAccount } from "../context/AccountContext.jsx";
import Notifications from "../components/Notification.jsx";
import { parseDateToLocal } from "../utils/dateFormatter.js";
import ViewOptions from "../utils/ViewOptions.js";
import calculateFinancialData from "../utils/calculateFinancialData.js";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [range, setRange] = useState("4w");
  const [customSearch, setCustomSearch] = useState(false);
  const [memberFilter, setMemberFilter] = useState("all");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayStr = parseDateToLocal(today);
  const yesterdayStr = parseDateToLocal(yesterday);
  const [customStartDateUI, setCustomStartDateUI] = useState(yesterdayStr);
  const [customEndDateUI, setCustomEndDateUI] = useState(todayStr);
  const [noDataMessage, setNoDataMessage] = useState("");
  const viewOptions = ViewOptions({ setRange });
  const [members, setMembers] = useState([]);

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
        const calculatedFinances = calculateFinancialData(
          filteredIncome,
          filteredExpense,
        );
        setFinancialData(calculatedFinances);
      }
    } catch (error) {
      setNoDataMessage(
        error.response?.data?.message || "An unexpected error occurred",
      );
    }
  };

  // Get account context - must be declared before useEffect
  const {
    isOwner,
    currentAccount,
    loadAccounts,
    setCurrentAccountId,
    currentAccountId,
  } = useAccount();
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

        const filteredExpense =
          memberFilter === "all"
            ? expenses
            : expenses.filter((i) => i.createdBy?._id === memberFilter);

        const filteredIncome =
          memberFilter === "all"
            ? incomes
            : incomes.filter((i) => i.createdBy?._id === memberFilter);

        const calculatedFinances = calculateFinancialData(
          filteredIncome,
          filteredExpense,
        );

        setFinancialData(calculatedFinances);

        // invitations
        const invRes = await api.get("/invitations");
        setInvitations(invRes.data?.invitations || []);
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

  const createShared = async (name) => {
    try {
      setCreating(true);
      const res = await api.post("/accounts", { name });
      // refresh and switch to new account
      await loadAccounts();
      setCurrentAccountId(res.data?.account?._id);
      setCreateAccountModalOpen(false);
    } catch (error) {
      console.error("Failed to create shared account:", error);
      alert(error.response?.data?.message || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const response = await api.post(`/invitations/${id}/accept`);
      // Remove from invitations list
      setInvitations((prev) => prev.filter((i) => i._id !== id));
      // Reload accounts to show the new shared account
      await loadAccounts();
      // Dispatch event for other components
      window.dispatchEvent(new Event("accountsUpdated"));
      // Show success message
      alert(
        response.data?.message ||
          "Invitation accepted! You can now access the shared account.",
      );
    } catch (e) {
      console.error("Failed to accept invitation:", e);
      alert(
        e?.response?.data?.message ||
          "Failed to accept invitation. Please try again.",
      );
    }
  };

  const handleDecline = async (id) => {
    try {
      await api.post(`/invitations/${id}/decline`);
      setInvitations((prev) => prev.filter((i) => i._id !== id));
      alert("Invitation declined");
    } catch (e) {
      console.error("Failed to decline invitation:", e);
      alert(
        e?.response?.data?.message ||
          "Failed to decline invitation. Please try again.",
      );
    }
  };

  return (
    <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50">
      {/* Compact Header with Inline Controls */}
      <div className="mb-6 fade-in">
        {/* Top Row: Title and Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Here's your financial overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Notifications />
            {isOwner && currentAccount?.type === "shared" && (
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Invite Member
              </button>
            )}
            {isOwner && currentAccount?.type === "personal" && (
              <button
                onClick={() => setCreateAccountModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Shared Account
              </button>
            )}
          </div>
        </div>

        {/* Compact Controls Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Side: Member Filter */}
            <div className="flex items-center gap-4">
              {members.length > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
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
            <div className="mt-4 pt-4 border-t-2 border-gray-100 scale-in">
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
            </div>
          )}
        </div>
      </div>

      {inviteOpen && (
        <InviteMemberModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInvited={() => {}}
        />
      )}
      <CreateSharedAccountModal
        isOpen={createAccountModalOpen}
        onClose={() => setCreateAccountModalOpen(false)}
        onSubmit={createShared}
        loading={creating}
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-stat group slide-in-up">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Income
              </p>
              {loading ? (
                <div className="skeleton h-9 w-32 mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  $
                  {(financialData.totalIncome / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/30 group-hover:shadow-xl group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
              <MdAttachMoney className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div
          className="card-stat group slide-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Total Expenses
              </p>
              {loading ? (
                <div className="skeleton h-9 w-32 mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  $
                  {(financialData.totalExpenses / 100).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-rose-400 to-rose-600 p-4 rounded-2xl shadow-lg shadow-rose-500/30 group-hover:shadow-xl group-hover:shadow-rose-500/40 group-hover:scale-110 transition-all duration-300">
              <FiDollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div
          className="card-stat group slide-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Net Savings
              </p>
              {loading ? (
                <div className="skeleton h-9 w-32 mt-2"></div>
              ) : (
                <p
                  className={`text-3xl font-bold mt-1 ${
                    financialData.totalIncome - financialData.totalExpenses >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  $
                  {(
                    (financialData.totalIncome - financialData.totalExpenses) /
                    100
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
            <div
              className={`p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${
                financialData.totalIncome - financialData.totalExpenses >= 0
                  ? "bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/30 group-hover:shadow-indigo-500/40"
                  : "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30 group-hover:shadow-amber-500/40"
              }`}
            >
              <MdSavings className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-primary to-primary-light rounded-full"></span>
            Recent Transactions
          </h2>
          <button className="btn-ghost text-sm">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-600 border-b-2 border-gray-100">
                <th className="pb-4 font-semibold text-sm">Type</th>
                <th className="pb-4 font-semibold text-sm">Description</th>
                <th className="pb-4 font-semibold text-sm">Amount</th>
                <th className="pb-4 font-semibold text-sm">Created By</th>
                <th className="pb-4 font-semibold text-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="py-4">
                      <div className="skeleton h-6 w-20"></div>
                    </td>
                    <td className="py-4">
                      <div className="skeleton h-4 w-36"></div>
                    </td>
                    <td className="py-4">
                      <div className="skeleton h-5 w-24"></div>
                    </td>
                    <td className="py-4">
                      <div className="skeleton h-8 w-28"></div>
                    </td>
                    <td className="py-4">
                      <div className="skeleton h-4 w-28"></div>
                    </td>
                  </tr>
                ))
              ) : financialData.transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-600 font-medium">
                        No transactions found
                      </p>
                      <p className="text-sm text-gray-500">
                        Start by adding income or expenses!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                financialData.transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors duration-150"
                  >
                    <td className="py-4">
                      <span
                        className={`badge ${
                          transaction.type === "income"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        <svg
                          className="w-3.5 h-3.5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {transaction.type === "income" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                          )}
                        </svg>
                        {transaction.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>
                    <td className="py-4 text-gray-800 font-medium">
                      {transaction.description}
                    </td>
                    <td
                      className={`py-4 font-bold text-lg ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {(transaction.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {(
                            transaction.createdBy?.fullName ||
                            transaction.createdBy?.email ||
                            "You"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {transaction.createdBy?.fullName ||
                            transaction.createdBy?.email ||
                            "You"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 text-sm font-medium">
                      {transaction.date
                        ? new Date(
                            transaction.date.slice(0, 10) + "T00:00:00",
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations */}
      {invitations.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 p-6 rounded-2xl shadow-lg mt-8 scale-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pending Invitations ({invitations.length})
              </h2>
              <p className="text-sm text-gray-700 mt-0.5">
                You have been invited to join shared account(s)
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {invitations.map((i) => (
              <div
                key={i._id}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex-1 mb-4 md:mb-0">
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    {i.account?.name || "Shared Account"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Invited by:{" "}
                    <span className="font-semibold text-gray-800">
                      {i.inviter?.fullName || "Unknown"}
                    </span>
                    {i.inviter?.email && (
                      <span className="text-gray-500 ml-1">
                        ({i.inviter.email})
                      </span>
                    )}
                  </p>
                  {i.message && (
                    <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded-lg border-l-4 border-primary">
                      "{i.message}"
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(i._id)}
                    className="btn-success px-6"
                  >
                    <svg
                      className="w-4 h-4 mr-1.5 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(i._id)}
                    className="btn-secondary px-6"
                  >
                    <svg
                      className="w-4 h-4 mr-1.5 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
