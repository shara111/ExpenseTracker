import { RxDividerVertical } from "react-icons/rx";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdCalendarMonth, MdExpandMore, MdExpandLess } from "react-icons/md";

export default function DateRangeSelector({
  customSearch,
  viewOptions,
  handleRangeSubmit,
  noDataMessage,
  yesterdayStr,
  todayStr,
  customEndDateUI,
  customStartDateUI,
  setCustomStartDateUI,
  setCustomEndDateUI,
  setCustomSearch,
}) {
  return (
    <>
      {/* Enhanced Date Range Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {/* Custom Search Toggle */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary rounded-xl hover:from-primary/20 hover:to-primary-light/20 transition-all font-semibold border-2 border-primary/20 hover:border-primary/30 group"
            onClick={() => setCustomSearch(!customSearch)}
          >
            <FaMagnifyingGlass className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Custom Search</span>
            {customSearch ? (
              <MdExpandLess className="w-5 h-5" />
            ) : (
              <MdExpandMore className="w-5 h-5" />
            )}
          </button>

          {/* View Options */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MdCalendarMonth className="w-5 h-5 text-primary" />
              View:
            </span>
            <div className="flex items-center gap-0 bg-gray-100 rounded-xl p-1">
              {viewOptions.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.setter}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-lg hover:bg-white transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Search Form - Collapsible */}
        {customSearch && (
          <div className="mt-5 pt-5 border-t-2 border-gray-100 scale-in">
            <form
              onSubmit={handleRangeSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 font-medium hover:border-gray-300"
                  max={yesterdayStr}
                  onChange={(e) => setCustomStartDateUI(e.target.value)}
                  value={customStartDateUI}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 font-medium hover:border-gray-300"
                  max={todayStr}
                  onChange={(e) => setCustomEndDateUI(e.target.value)}
                  value={customEndDateUI}
                />
              </div>

              <div className="md:col-span-2 flex justify-center mt-2">
                <button type="submit" className="btn-primary max-w-xs group">
                  <svg
                    className="w-5 h-5 inline mr-2"
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
                  Apply Date Range
                  <svg
                    className="w-5 h-5 inline ml-2 transform group-hover:translate-x-1 transition-transform"
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
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {noDataMessage && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 error-message">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0"
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
    </>
  );
}
