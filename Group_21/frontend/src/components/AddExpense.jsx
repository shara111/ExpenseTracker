import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdAttachMoney,
  MdCalendarToday,
  MdRepeat,
  MdLabel,
  MdDelete,
  MdEdit,
  MdAdd,
  MdCategory,
} from "react-icons/md";
import { FiAlertCircle } from "react-icons/fi";
import api from "../utils/api";
import { formatDateToSend } from "../utils/dateFormatter";
import toast from "react-hot-toast";

export default function EditExpense({
  open,
  closeModal,
  type,
  expenseData,
  cacheKey,
  expenseCache,
}) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (open) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, closeModal]);

  // format the date:
  let formattedStartDate = "";
  let formattedEndDate = "";
  if (type === "editExpense") {
    formattedStartDate = formatDateToSend(expenseData.date);
    formattedEndDate = formatDateToSend(expenseData.endDate);
  }

  const [categoryUI, setCategoryUI] = useState(
    type === "editExpense" ? expenseData.category : "",
  );
  const [amountUI, setAmountUI] = useState(
    type === "editExpense" ? (expenseData.amount / 100).toFixed(2) : "",
  );
  const [startDateUI, setStartDateUI] = useState(formattedStartDate);
  const [endDateUI, setEndDateUI] = useState(formattedEndDate);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recurringUI, setRecurringUI] = useState(
    type === "editExpense" ? expenseData.recurring : "once",
  );
  const recurrenceOptions = ["once", "bi-weekly", "monthly"];
  const [endOption, setEndOption] = useState(
    type === "editExpense"
      ? expenseData.endDate
        ? "customEndDate"
        : "noEndDate"
      : "noEndDate",
  );
  const [tagsUI, setTagsUI] = useState(
    type === "editExpense" && expenseData
      ? expenseData.tags?.join(", ") || ""
      : "",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const floatVal = parseFloat(amountUI);
      let cents = Math.round(floatVal * 100);
      const formData = {
        icon: "",
        category: categoryUI,
        amount: cents,
        date: startDateUI,
        recurring: recurringUI,
        tags: tagsUI,
        endDate: endDateUI,
        head: true,
      };

      let res;
      if (type === "addExpense") {
        res = await api.post("/expense/add", formData);
        toast.success("Expense added successfully!");
      } else if (type === "editExpense") {
        res = await api.put(`/expense/${expenseData._id}`, formData);
        toast.success("Expense updated successfully!");
      } else if (type === "deleteExpense") {
        res = await api.delete(`/expense/${expenseData._id}`);
        toast.success("Expense deleted successfully!");
      }

      if (res.status === 200) {
        closeModal();
        setShowError(false);
        setErrorMessage("");
        expenseCache.clear();
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error?.response?.data?.message || "An error occurred");
      toast.error(error?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Delete Confirmation Modal
  if (type === "deleteExpense") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            {/* Delete Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdDelete className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Delete Expense?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. Are you sure you want to delete this
              expense entry?
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Add/Edit Expense Modal
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-3xl relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all hover:rotate-90"
            >
              <MdClose className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                {type === "addExpense" ? (
                  <MdAdd className="w-8 h-8 text-white" />
                ) : (
                  <MdEdit className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {type === "addExpense" ? "Add Expense" : "Edit Expense"}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {type === "addExpense"
                    ? "Record a new expense transaction"
                    : "Update your expense details"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Category and Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdCategory className="w-4 h-4 text-red-600" />
                  Expense Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Groceries, Rent, Utilities"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 font-medium placeholder-gray-400"
                  value={categoryUI}
                  onChange={(e) => setCategoryUI(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MdAttachMoney className="w-4 h-4 text-red-600" />
                  Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 font-medium placeholder-gray-400"
                  value={amountUI}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setAmountUI(value);
                    }
                  }}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MdCalendarToday className="w-4 h-4 text-red-600" />
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 font-medium"
                value={startDateUI}
                onChange={(e) => setStartDateUI(e.target.value)}
                disabled={
                  type === "editExpense" &&
                  expenseData.head === true &&
                  expenseData.recurring !== "once"
                }
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MdLabel className="w-4 h-4 text-red-600" />
                Tags{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="work, urgent, personal (comma-separated)"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 placeholder-gray-400"
                value={tagsUI}
                onChange={(e) => setTagsUI(e.target.value)}
              />
            </div>

            {/* Recurring */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MdRepeat className="w-4 h-4 text-red-600" />
                Recurrence
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-gray-900 font-medium bg-white cursor-pointer"
                value={recurringUI}
                onChange={(e) => setRecurringUI(e.target.value)}
                disabled={
                  expenseData.recurring === "once" &&
                  expenseData.head === false &&
                  type === "editExpense"
                }
              >
                {recurrenceOptions.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurring Options */}
            {(recurringUI === "bi-weekly" || recurringUI === "monthly") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-gray-50 p-4 rounded-xl border-2 border-gray-100 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="endOption"
                    value="customEndDate"
                    checked={endOption === "customEndDate"}
                    onChange={(e) => setEndOption(e.target.value)}
                    className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={endDateUI}
                      onChange={(e) => setEndDateUI(e.target.value)}
                      disabled={endOption === "noEndDate"}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="endOption"
                    value="noEndDate"
                    checked={endOption === "noEndDate"}
                    onChange={(e) => {
                      setEndOption(e.target.value);
                      setEndDateUI("");
                    }}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <label className="text-sm text-gray-700">
                    I will manually cancel recurring transactions
                  </label>
                </div>
              </motion.div>
            )}

            {/* Recurring Info Message */}
            {expenseData.recurring === "once" &&
              expenseData.head === false &&
              type === "editExpense" && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Recurring Entry
                    </p>
                    <p className="text-xs text-blue-800">
                      This is part of a recurring expense. To edit the recurring
                      expense, go to the most recent recurring entry and make
                      changes there.
                    </p>
                  </div>
                </div>
              )}

            {/* Error Message */}
            {showError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !categoryUI || !amountUI || !startDateUI}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {type === "addExpense" ? "Add Expense" : "Save Changes"}
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
