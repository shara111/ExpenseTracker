import AddExpense from "../components/AddExpense.jsx";
import TransactionsTable from "../layouts/Table.jsx";
import { useExpense } from "../context/ExpenseContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import CompactControlsBar from "../components/CompactControlsBar.jsx";

function Expenses() {
  const {
    open,
    setOpen,
    setType,
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
    expenseUI,
    handleExportCSV,
    handleExportPDF,
    viewOptions,
    range,
    setRefreshKey,
    type,
    selectedExpense,
    isOwner,
    user,
    setSelectedExpense,
    EXPENSE_KEY,
    expenseCache,
  } = useExpense();

  return (
    <>
      <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50">
        {/* Page Header */}
        <PageHeader
          title="Expenses"
          subtitle="Manage your spending and costs"
          setOpen={setOpen}
          setType={setType}
          location={location.pathname}
          text="Add Expense"
        />

        {/* Compact Controls Bar */}
        <CompactControlsBar
          members={members}
          memberFilter={memberFilter}
          setMemberFilter={setMemberFilter}
          allTags={allTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          handleClearFilters={handleClearFilters}
          transactionOption={transactionOption}
          setTransactionOption={setTransactionOption}
          transactionOptions={transactionOptions}
          customSearch={customSearch}
          setCustomSearch={setCustomSearch}
          yesterdayStr={yesterdayStr}
          todayStr={todayStr}
          customStartDateUI={customStartDateUI}
          setCustomStartDateUI={setCustomStartDateUI}
          customEndDateUI={customEndDateUI}
          setCustomEndDateUI={setCustomEndDateUI}
          handleRangeSubmit={handleRangeSubmit}
          noDataMessage={noDataMessage}
          documentUI={expenseUI}
          handleExportCSV={handleExportCSV}
          handleExportPDF={handleExportPDF}
          viewOptions={viewOptions}
          range={range}
        />

        {open && (
          <AddExpense
            open={open}
            closeModal={() => {
              setOpen(false);
              setRefreshKey((prev) => prev + 1);
            }}
            type={type}
            expenseData={selectedExpense}
            cacheKey={`${range}-${user._id}-${transactionOption}-${EXPENSE_KEY}`}
            expenseCache={expenseCache.current}
          />
        )}

        {/* Transactions Table */}
        <TransactionsTable
          type="expense"
          data={expenseUI || []}
          isOwner={isOwner}
          user={user}
          onEdit={(item) => {
            setOpen(true);
            setType("editExpense");
            setSelectedExpense(item);
          }}
          onDelete={(item) => {
            setOpen(true);
            setType("deleteExpense");
            setSelectedExpense(item);
          }}
          transactionOption={transactionOption}
        />
      </div>
    </>
  );
}

export default Expenses;
