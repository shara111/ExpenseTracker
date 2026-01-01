import { useRef, createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "../context/AccountContext.jsx";
import { useParams, useLocation } from "react-router-dom";
const ExpenseContext = createContext(null);
import { parseDateToLocal } from "../utils/dateFormatter.js";
import ViewOptions from "../utils/ViewOptions.js";
import { TransactionOptions } from "../utils/ViewOptions.js";
import {
  exportExpenseToCSV,
  exportExpenseToPDF,
} from "../utils/exportUtils.js";
import api from "../utils/api";
import { applyFilter } from "../utils/helper.js";
export default function ExpenseProvider({ children }) {
  const { year } = useParams();
  const location = useLocation();
  const { expense } = location.state || {};
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [expenseUI, setExpenseUI] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState({});
  const { currentAccountId, user, isOwner } = useAccount();
  const [members, setMembers] = useState([]);
  const [memberFilter, setMemberFilter] = useState("all");
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [range, setRange] = useState("4w");
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
  const viewOptions = ViewOptions({ setRange });
  const [transactionOption, setTransactionOption] =
    useState("All Transactions");
  const transactionOptions = TransactionOptions({ setTransactionOption });
  const EXPENSE_KEY = "Expense";
  const expenseCache = useRef(new Map());
  // Export handlers
  const handleExportCSV = () => {
    if (!expenseUI || expenseUI.length === 0) {
      return { success: false, message: "No data to export" };
    }
    return exportExpenseToCSV(expenseUI, year, memberFilter);
  };
  const handleClearFilters = () => {
    setMemberFilter("all");
    setSelectedTag("");
    setRange("4w");
    setCustomSearch(false);
    setCustomStartDateUI(yesterdayStr);
    setCustomEndDateUI(todayStr);
  };

  const handleExportPDF = () => {
    if (!expenseUI || expenseUI.length === 0) {
      return { success: false, message: "No data to export" };
    }
    return exportExpenseToPDF(expenseUI, year, memberFilter);
  };
  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    try {
      setNoDataMessage("");
      const res = await api.get(
        `expense/get?start=${customStartDateUI}&end=${customEndDateUI}`,
      );
      if (res.status === 200) {
        const expenseDocuments = res.data;
        if (expenseDocuments.length === 0) {
          setNoDataMessage("Nothing to show!");
        }
        const withTagAndMemberFilter = applyFilter(
          expenseDocuments,
          setAllTags,
          selectedTag,
          memberFilter,
        );
        setExpenseUI(withTagAndMemberFilter);
      }
    } catch (error) {
      setNoDataMessage(
        error.response?.data?.message || "An unexpected error occurred",
      );
    }
  };
  useEffect(() => {
    if (expense) {
      setExpenseUI(expense);
    }
  }, [expense]);

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
    const fetchExpenseData = async () => {
      try {
        let res;
        let cacheKey = `${range}-${user._id}-${transactionOption}`;
        selectedTag ? cacheKey += `-${selectedTag}` : ""
        memberFilter ? cacheKey += `-${memberFilter}` : ""
        cacheKey += `-${EXPENSE_KEY}`
        const cachedData = expenseCache.current.get(cacheKey);
        if (cachedData) {
          setExpenseUI(cachedData);
        } else {
          if (transactionOption === "Upcoming Transactions") {
            res = await api.get(`expense/upcomingExpenses?range=${range}`);
          } else {
            res = await api.get(`expense/get?range=${range}`);
          }
          setNoDataMessage("");
          if (res.status === 200) {
            const expenseDocuments = res.data;
            if (transactionOption === "All Transactions") {
              expenseDocuments.sort(
                (a, b) => new Date(b.date) - new Date(a.date),
              );
            } else {
              expenseDocuments.sort(
                (a, b) => new Date(a.date) - new Date(b.date),
              );
            }
            const withTagAndMemberFilter = applyFilter(
              expenseDocuments,
              setAllTags,
              selectedTag,
              memberFilter,
            );
            setExpenseUI(withTagAndMemberFilter);
            expenseCache.current.set(cacheKey, withTagAndMemberFilter);
          }
        }
      } catch (error) {
        console.error("Failed to fetch year data:", error);
      }
    };
    fetchExpenseData();
  }, [
    year,
    refreshKey,
    memberFilter,
    range,
    selectedTag,
    currentAccountId,
    transactionOption,
    user,
  ]);

  const value = {
    open,
    setOpen,
    type,
    setType,
    expenseUI,
    setExpenseUI,
    selectedExpense,
    setSelectedExpense,
    members,
    memberFilter,
    setMemberFilter,
    allTags,
    selectedTag,
    setSelectedTag,
    range,
    setRange,
    customSearch,
    setCustomSearch,
    customStartDateUI,
    setCustomStartDateUI,
    customEndDateUI,
    setCustomEndDateUI,
    refreshKey,
    setRefreshKey,
    noDataMessage,
    viewOptions,
    transactionOption,
    setTransactionOption,
    transactionOptions,
    handleExportCSV,
    handleExportPDF,
    handleRangeSubmit,
    handleClearFilters,
    user,
    isOwner,
    expenseCache,
    EXPENSE_KEY,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}
export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};
