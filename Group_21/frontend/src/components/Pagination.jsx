import { MdChevronLeft, MdChevronRight } from "react-icons/md";

export default function Pagination({
  setCurrentPage,
  currentPage,
  totalPages,
}) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all duration-200 group"
        aria-label="Previous page"
      >
        <MdChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === page
                  ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/25 scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary"
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all duration-200 group"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <MdChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
