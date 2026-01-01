import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAccount } from "../context/AccountContext.jsx";
import { useParams, useLocation } from "react-router-dom";
const IncomeContext = createContext(null);
import { parseDateToLocal } from "../utils/dateFormatter.js";
import ViewOptions from "../utils/ViewOptions.js";
import { TransactionOptions } from "../utils/ViewOptions.js";
import { exportIncomeToCSV, exportIncomeToPDF } from "../utils/exportUtils.js";
import api from "../utils/api";
import { applyFilter } from "../utils/helper.js";

export const IncomeProvider = ({ children }) => {
  const { year } = useParams();
  const location = useLocation();
  const { income } = location.state || {};
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [incomeUI, setIncomeUI] = useState(null);
  const [selectedIncome, setSelectedIncome] = useState({});
  const { currentAccountId, user, isOwner } = useAccount();
  const [members, setMembers] = useState([]);
  const [memberFilter, setMemberFilter] = useState("all");
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
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [transactionOption, setTransactionOption] =
    useState("All Transactions");
  const transactionOptions = TransactionOptions({ setTransactionOption });
  const INCOME_KEY = "Income";
  const incomeCache = useRef(new Map());
  // Export handlers
  const handleExportCSV = () => {
    if (!incomeUI || incomeUI.length === 0) {
      return { success: false, message: "No data to export" };
    }
    return exportIncomeToCSV(incomeUI, year, memberFilter);
  };
  const handleExportPDF = () => {
    if (!incomeUI || incomeUI.length === 0) {
      return { success: false, message: "No data to export" };
    }
    return exportIncomeToPDF(incomeUI, year, memberFilter);
  };

  const handleClearFilters = () => {
    setMemberFilter("all");
    setSelectedTag("");
    setRange("4w");
    setCustomSearch(false);
    setCustomStartDateUI(yesterdayStr);
    setCustomEndDateUI(todayStr);
  };
  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    try {
      setNoDataMessage("");
      const res = await api.get(
        `income/get?start=${customStartDateUI}&end=${customEndDateUI}`,
      );
      if (res.status === 200) {
        const incomeDocuments = res.data;
        if (incomeDocuments.length === 0) {
          setNoDataMessage("Nothing to show!");
        }
        const withTagAndMemberFilter = applyFilter(
          incomeDocuments,
          setAllTags,
          selectedTag,
          memberFilter,
        );
        setIncomeUI(withTagAndMemberFilter);
      }
    } catch (error) {
      setNoDataMessage(
        error.response?.data?.message || "An unexpected error occurred",
      );
    }
  };

  useEffect(() => {
    if (income) {
      setIncomeUI(income);
    }
  }, [income]);
  // Fetch account members for filter
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
  // Fetch year data on mount and when refreshKey or memberFilter changes
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        let res;
        let cacheKey = `${range}-${user._id}-${transactionOption}`;
        selectedTag ? cacheKey += `-${selectedTag}` : ""
        memberFilter ? cacheKey += `-${memberFilter}` : ""
        cacheKey += `-${INCOME_KEY}`
        const cachedData = incomeCache.current.get(cacheKey);
        if (cachedData) {
          setIncomeUI(cachedData);
        } else {
          if (transactionOption === "Upcoming Transactions") {
            res = await api.get(`income/upcomingIncome?range=${range}`);
          } else {
            res = await api.get(`income/get?range=${range}`);
          }
          setNoDataMessage("");
          if (res.status === 200) {
            const incomeDocuments = res.data;
            if (transactionOption === "All Transactions") {
              incomeDocuments.sort(
                (a, b) => new Date(b.date) - new Date(a.date),
              );
            } else {
              incomeDocuments.sort(
                (a, b) => new Date(a.date) - new Date(b.date),
              );
            }
            const withTagAndMemberFilter = applyFilter(
              incomeDocuments,
              setAllTags,
              selectedTag,
              memberFilter,
            );
            setIncomeUI(withTagAndMemberFilter);
            incomeCache.current.set(cacheKey, withTagAndMemberFilter);
          }
        }
      } catch (error) {
        console.error("Failed to fetch year data:", error);
      }
    };
    fetchIncomeData();
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
    incomeUI,
    setIncomeUI,
    selectedIncome,
    setSelectedIncome,
    members,
    memberFilter,
    setMemberFilter,
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
    setNoDataMessage,
    viewOptions,
    allTags,
    selectedTag,
    setSelectedTag,
    transactionOption,
    setTransactionOption,
    transactionOptions,
    handleExportCSV,
    handleExportPDF,
    handleClearFilters,
    handleRangeSubmit,
    user,
    isOwner,
    location,
    INCOME_KEY,
    incomeCache,
  };
  return (
    <IncomeContext.Provider value={value}>{children}</IncomeContext.Provider>
  );
};

export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error("useIncome must be used within an IncomeProvider");
  }
  return context;
};
