import { motion } from "framer-motion";
import { MdFilterList, MdCalendarToday } from "react-icons/md";
import ExportButtons from "./ExportButtons";

export default function CompactControlsBar({
  members,
  memberFilter,
  setMemberFilter,
  allTags,
  selectedTag,
  setSelectedTag,
  handleClearFilters,
  transactionOption,
  setTransactionOption,
  transactionOptions,
  customSearch,
  setCustomSearch,
  yesterdayStr,
  todayStr,
  customStartDateUI,
  setCustomStartDateUI,
  customEndDateUI,
  setCustomEndDateUI,
  handleRangeSubmit,
  noDataMessage,
  documentUI,
  handleExportCSV,
  handleExportPDF,
  viewOptions,
  range,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
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
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 hover:border-gray-300 transition-all cursor-pointer bg-white"
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

          {/* Tag Filter */}
          {allTags.length > 0 && (
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <select
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 hover:border-gray-300 transition-all cursor-pointer bg-white"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleClearFilters}
            disabled={
              memberFilter === "all" &&
              !selectedTag &&
              range === "4w" &&
              !customSearch
            }
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 hover:border-gray-300 transition-all cursor-pointer bg-white"
          >
            Clear Filters
          </button>
          {/* View current or upcoming transactions */}
          <select
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 hover:border-gray-300 transition-all cursor-pointer bg-white"
            value={transactionOption}
            onChange={(e) => setTransactionOption(e.target.value)}
          >
            {transactionOptions.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Custom Search Toggle */}
          {transactionOption === "All Transactions" && (
            <>
              <MdCalendarToday className="w-4 h-4" />
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setCustomSearch(!customSearch)}
              >
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
            </>
          )}
        </div>

        {/* Right Side: View Options & Export */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              Period:
            </span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {viewOptions.map((item) => (
                <button
                  key={item.label}
                  onClick={item.setter}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-600 rounded-md hover:bg-white transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <ExportButtons
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            disabled={!documentUI || documentUI.length === 0}
          />
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
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm"
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
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm"
                max={todayStr}
                onChange={(e) => setCustomEndDateUI(e.target.value)}
                value={customEndDateUI}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap"
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
  );
}
