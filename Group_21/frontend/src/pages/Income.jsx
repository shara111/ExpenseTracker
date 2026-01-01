import EditSource from "../components/EditSource";
import CompactControlsBar from "../components/CompactControlsBar.jsx";
import { useIncome } from "../context/IncomeContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TransactionsTable from "../layouts/Table.jsx";

export default function Income() {
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
    incomeUI,
    handleExportCSV,
    handleExportPDF,
    viewOptions,
    range,
    setRefreshKey,
    type,
    selectedIncome,
    isOwner,
    user,
    setSelectedIncome,
    location,
    INCOME_KEY,
    incomeCache,
  } = useIncome();

  return (
    <>
      <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50">
        {/* Page Header */}
        <PageHeader
          title="Income"
          subtitle="Track your earnings and revenue"
          setOpen={setOpen}
          setType={setType}
          location={location.pathname}
          text="Add Income"
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
          documentUI={incomeUI}
          handleExportCSV={handleExportCSV}
          handleExportPDF={handleExportPDF}
          viewOptions={viewOptions}
          range={range}
        />

        {open && (
          <EditSource
            open={open}
            closeModal={() => {
              setOpen(false);
              setRefreshKey((prev) => prev + 1);
            }}
            type={type}
            incomeData={selectedIncome}
            cacheKey={`${range}-${user._id}-${transactionOption}-${INCOME_KEY}`}
            incomeCache={incomeCache.current}
          />
        )}

        {/* Transactions Table */}
        <TransactionsTable
          type="income"
          data={incomeUI || []}
          isOwner={isOwner}
          user={user}
          onEdit={(item) => {
            setOpen(true);
            setType("editIncome");
            setSelectedIncome(item);
          }}
          onDelete={(item) => {
            setOpen(true);
            setType("deleteIncome");
            setSelectedIncome(item);
          }}
          transactionOption={transactionOption}
        />
      </div>
    </>
  );
}
