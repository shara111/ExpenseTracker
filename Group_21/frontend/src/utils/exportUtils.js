import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Format currency value from cents to dollars
 * @param {number} amount - Amount in cents
 * @returns {string} Formatted amount in dollars
 */
const formatCurrency = (amount) => {
  return (amount / 100).toFixed(2);
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString.slice(0, 10) + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Escape special characters for CSV
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeCSV = (str) => {
  if (str === null || str === undefined) return "";
  const stringValue = String(str);
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Export income data to CSV
 * @param {Array} incomeData - Array of income transactions
 * @param {string} year - Year for the export
 * @param {string} memberFilter - Filter by member (optional)
 */
export const exportIncomeToCSV = (incomeData, year, memberFilter = "all") => {
  try {
    // Flatten the grouped data structure
    const flatData = [];
    incomeData.forEach((data) => {
      if (data) {
        flatData.push({
          Date: formatDate(data.date),
          Type: "Income",
          Source: data.source || "",
          Amount: formatCurrency(data.amount),
          "Created By":
            data.createdBy?.fullName || data.createdBy?.email || "You",
          Recurring: data.recurring,
        });
      }
    });

    // Sort by date (newest first)
    flatData.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    // Convert to CSV
    const csv = Papa.unparse(flatData, {
      quotes: true,
      header: true,
    });

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filterSuffix = memberFilter !== "all" ? `_${memberFilter}` : "";
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `income_${year}${filterSuffix}_${timestamp}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: "CSV exported successfully" };
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return {
      success: false,
      message: "Failed to export CSV. Please try again.",
    };
  }
};

/**
 * Export expense data to CSV
 * @param {Array} expenseData - Array of expense transactions
 * @param {string} year - Year for the export
 * @param {string} memberFilter - Filter by member (optional)
 */
export const exportExpenseToCSV = (expenseData, year, memberFilter = "all") => {
  try {
    // Flatten the grouped data structure
    const flatData = [];

    expenseData.forEach((data) => {
      if (data) {
        flatData.push({
          Date: formatDate(data.date),
          Type: "Expense",
          Category: data.category || "",
          Amount: formatCurrency(data.amount),
          "Created By":
            data.createdBy?.fullName || data.createdBy?.email || "You",
          Recurring: data.recurring,
        });
      }
    });

    // Sort by date (newest first)
    flatData.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    // Convert to CSV
    const csv = Papa.unparse(flatData, {
      quotes: true,
      header: true,
    });

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filterSuffix = memberFilter !== "all" ? `_${memberFilter}` : "";
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `expenses_${year}${filterSuffix}_${timestamp}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: "CSV exported successfully" };
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return {
      success: false,
      message: "Failed to export CSV. Please try again.",
    };
  }
};

/**
 * Export income data to PDF
 * @param {Array} incomeData - Array of income transactions
 * @param {string} year - Year for the export
 * @param {string} memberFilter - Filter by member (optional)
 */
export const exportIncomeToPDF = (incomeData, year, memberFilter = "all") => {
  try {
    // Validate input data
    if (!incomeData || incomeData.length === 0) {
      return { success: false, message: "No data available to export" };
    }

    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Income Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Year: ${year}`, 14, 30);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      14,
      36,
    );

    // Flatten and prepare data
    const flatData = [];
    let totalIncome = 0;

    incomeData.forEach((data) => {
      if (data) {
        totalIncome += data.amount || 0;
        flatData.push([
          formatDate(data.date),
          data.source || "",
          `$${formatCurrency(data.amount || 0)}`,
          data.createdBy?.fullName || data.createdBy?.email || "You",
        ]);
      }
    });

    // Check if we have any data
    if (flatData.length === 0) {
      return { success: false, message: "No transactions found to export" };
    }

    // Sort by date
    flatData.sort((a, b) => new Date(b[0]) - new Date(a[0]));

    // Add table
    autoTable(doc, {
      startY: 45,
      head: [["Date", "Source", "Amount", "Created By"]],
      body: flatData,
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229], // Indigo color
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 },
      },
      margin: { top: 45 },
    });

    // Add summary
    const finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Summary Statistics", 14, finalY + 15);

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Total Income: $${formatCurrency(totalIncome)}`, 14, finalY + 23);
    doc.text(`Number of Transactions: ${flatData.length}`, 14, finalY + 30);

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    const filterSuffix = memberFilter !== "all" ? `_${memberFilter}` : "";
    doc.save(`income_report_${year}${filterSuffix}_${timestamp}.pdf`);

    return { success: true, message: "PDF exported successfully" };
  } catch (error) {
    console.error("Error exporting PDF:", error);
    console.error("Error details:", error.message, error.stack);
    return {
      success: false,
      message: `Failed to export PDF: ${error.message}`,
    };
  }
};

/**
 * Export expense data to PDF
 * @param {Array} expenseData - Array of expense transactions
 * @param {string} year - Year for the export
 * @param {string} memberFilter - Filter by member (optional)
 */
export const exportExpenseToPDF = (expenseData, year, memberFilter = "all") => {
  try {
    // Validate input data
    if (!expenseData || expenseData.length === 0) {
      return { success: false, message: "No data available to export" };
    }

    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Expense Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Year: ${year}`, 14, 30);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      14,
      36,
    );

    // Flatten and prepare data
    const flatData = [];
    let totalExpense = 0;

    expenseData.forEach((data) => {
      if (data) {
        totalExpense += data.amount || 0;
        flatData.push([
          formatDate(data.date),
          data.category || "",
          `$${formatCurrency(data.amount || 0)}`,
          data.createdBy?.fullName || data.createdBy?.email || "You",
        ]);
      }
    });

    // Check if we have any data
    if (flatData.length === 0) {
      return { success: false, message: "No transactions found to export" };
    }

    // Sort by date
    flatData.sort((a, b) => new Date(b[0]) - new Date(a[0]));

    // Add table
    autoTable(doc, {
      startY: 45,
      head: [["Date", "Category", "Amount", "Created By"]],
      body: flatData,
      theme: "striped",
      headStyles: {
        fillColor: [220, 38, 38], // Red color for expenses
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 },
      },
      margin: { top: 45 },
    });

    // Add summary
    const finalY = doc.lastAutoTable.finalY || 45;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("Summary Statistics", 14, finalY + 15);

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(
      `Total Expenses: $${formatCurrency(totalExpense)}`,
      14,
      finalY + 23,
    );
    doc.text(`Number of Transactions: ${flatData.length}`, 14, finalY + 30);

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    const filterSuffix = memberFilter !== "all" ? `_${memberFilter}` : "";
    doc.save(`expense_report_${year}${filterSuffix}_${timestamp}.pdf`);

    return { success: true, message: "PDF exported successfully" };
  } catch (error) {
    console.error("Error exporting PDF:", error);
    console.error("Error details:", error.message, error.stack);
    return {
      success: false,
      message: `Failed to export PDF: ${error.message}`,
    };
  }
};
