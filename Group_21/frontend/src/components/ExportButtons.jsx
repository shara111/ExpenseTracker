import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ExportButtons Component
 * Provides CSV and PDF export functionality with loading states and modern UI
 *
 * @param {Object} props
 * @param {Function} props.onExportCSV - Function to call for CSV export
 * @param {Function} props.onExportPDF - Function to call for PDF export
 * @param {boolean} props.disabled - Whether buttons are disabled
 * @param {string} props.className - Additional CSS classes
 */
const ExportButtons = ({
  onExportCSV,
  onExportPDF,
  disabled = false,
  className = "",
}) => {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleCSVExport = async () => {
    if (disabled || isExportingCSV) return;

    setIsExportingCSV(true);
    const loadingToast = toast.loading("Generating CSV file...");

    try {
      const result = await onExportCSV();

      if (result.success) {
        toast.success(result.message || "CSV exported successfully!", {
          id: loadingToast,
          duration: 3000,
        });
      } else {
        toast.error(result.message || "Failed to export CSV", {
          id: loadingToast,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("An error occurred while exporting CSV", {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handlePDFExport = async () => {
    if (disabled || isExportingPDF) return;

    setIsExportingPDF(true);
    const loadingToast = toast.loading("Generating PDF file...");
    try {
      const result = await onExportPDF();

      if (result.success) {
        toast.success(result.message || "PDF exported successfully!", {
          id: loadingToast,
          duration: 3000,
        });
      } else {
        toast.error(result.message || "Failed to export PDF", {
          id: loadingToast,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("An error occurred while exporting PDF", {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* CSV Export Button */}
      <button
        onClick={handleCSVExport}
        disabled={disabled || isExportingCSV}
        className={`
          group relative flex items-center gap-2 px-4 py-2.5 
          bg-white border-2 border-emerald-200 rounded-xl
          text-sm font-semibold text-emerald-700
          transition-all duration-200
          hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
          disabled:hover:border-emerald-200 disabled:hover:shadow-none
          ${isExportingCSV ? "cursor-wait animate-pulse" : ""}
        `}
        aria-label="Export to CSV"
      >
        {isExportingCSV ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <FileSpreadsheet className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
        )}
        <span className="hidden sm:inline">
          {isExportingCSV ? "Exporting..." : "Export CSV"}
        </span>
        <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all hidden sm:inline" />
      </button>

      {/* PDF Export Button */}
      <button
        onClick={handlePDFExport}
        disabled={disabled || isExportingPDF}
        className={`
          group relative flex items-center gap-2 px-4 py-2.5 
          bg-white border-2 border-red-200 rounded-xl
          text-sm font-semibold text-red-700
          transition-all duration-200
          hover:bg-red-50 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
          disabled:hover:border-red-200 disabled:hover:shadow-none
          ${isExportingPDF ? "cursor-wait animate-pulse" : ""}
        `}
        aria-label="Export to PDF"
      >
        {isExportingPDF ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <FileText className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
        )}
        <span className="hidden sm:inline">
          {isExportingPDF ? "Exporting..." : "Export PDF"}
        </span>
        <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all hidden sm:inline" />
      </button>
    </div>
  );
};

export default ExportButtons;
