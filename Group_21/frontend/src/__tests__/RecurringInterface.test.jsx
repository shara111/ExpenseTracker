/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditSource from "../components/EditSource";
import AddExpense from "../components/AddExpense";

// Mock API calls
vi.mock("../utils/api", () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Recurring Income/Expense Interface", () => {
  let mockApi;

  beforeAll(async () => {
    const apiModule = await import("../utils/api");
    mockApi = vi.mocked(apiModule).default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("EditSource Component (Income)", () => {
    it("should render recurring checkbox for add income", () => {
      render(
        <EditSource
          open={true}
          closeModal={vi.fn()}
          type="addIncome"
          incomeData={null}
        />,
      );

      expect(screen.getByText("Recurring Every Month")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should include recurring and startDate in form data when checkbox is checked", async () => {
      const user = userEvent.setup();
      const mockCloseModal = vi.fn();

      render(
        <EditSource
          open={true}
          closeModal={mockCloseModal}
          type="addIncome"
          incomeData={null}
        />,
      );

      // Fill form
      await user.type(screen.getByPlaceholderText("pay cheque"), "Test Income");
      await user.type(screen.getByPlaceholderText("1000"), "5000");
      await user.type(screen.getByDisplayValue(""), "2025-10-01");

      // Check recurring checkbox
      const recurringCheckbox = screen.getByRole("checkbox");
      await user.click(recurringCheckbox);

      // Submit form
      await user.click(screen.getByText("Save"));

      expect(mockApi.post).toHaveBeenCalledWith("/income/add", {
        icon: "",
        source: "Test Income",
        amount: 500000, // 5000 * 100 cents
        date: "2025-10-01",
        recurring: true,
        startDate: "2025-10-01",
      });
    });

    it("should not include recurring when checkbox is unchecked", async () => {
      const user = userEvent.setup();
      const mockCloseModal = vi.fn();

      render(
        <EditSource
          open={true}
          closeModal={mockCloseModal}
          type="addIncome"
          incomeData={null}
        />,
      );

      // Fill form without checking recurring
      await user.type(screen.getByPlaceholderText("pay cheque"), "Test Income");
      await user.type(screen.getByPlaceholderText("1000"), "3000");
      await user.type(screen.getByDisplayValue(""), "2025-10-01");

      // Submit form (recurring should be false by default)
      await user.click(screen.getByText("Save"));

      expect(mockApi.post).toHaveBeenCalledWith("/income/add", {
        icon: "",
        source: "Test Income",
        amount: 300000,
        date: "2025-10-01",
        recurring: false,
        startDate: "2025-10-01",
      });
    });
  });

  describe("AddExpense Component (Expense)", () => {
    it("should render recurring checkbox for add expense", () => {
      render(
        <AddExpense
          open={true}
          closeModal={vi.fn()}
          type="addExpense"
          expenseData={null}
        />,
      );

      expect(screen.getByText("Recurring Every Month")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should include recurring and startDate in form data when checkbox is checked", async () => {
      const user = userEvent.setup();
      const mockCloseModal = vi.fn();

      render(
        <AddExpense
          open={true}
          closeModal={mockCloseModal}
          type="addExpense"
          expenseData={null}
        />,
      );

      // Fill form
      await user.type(screen.getByPlaceholderText("groceries"), "Test Expense");
      await user.type(screen.getByPlaceholderText("50.00"), "75");
      await user.type(screen.getByDisplayValue(""), "2025-10-15");

      // Check recurring checkbox
      const recurringCheckbox = screen.getByRole("checkbox");
      await user.click(recurringCheckbox);

      // Submit form
      await user.click(screen.getByText("Save"));

      expect(mockApi.post).toHaveBeenCalledWith("/expense/add", {
        icon: "",
        category: "Test Expense",
        amount: 7500, // 75 * 100 cents
        date: "2025-10-15",
        recurring: true,
        startDate: "2025-10-15",
      });
    });
  });

  describe("Recurring State Management", () => {
    it("should initialize recurring checkbox correctly for edit mode", () => {
      const mockIncomeData = {
        recurring: true,
        source: "Existing Income",
        amount: 400000,
        date: "2025-09-01T00:00:00.000Z",
      };

      render(
        <EditSource
          open={true}
          closeModal={vi.fn()}
          type="editIncome"
          incomeData={mockIncomeData}
        />,
      );

      const recurringCheckbox = screen.getByRole("checkbox");
      expect(recurringCheckbox).toBeChecked();
    });

    it("should initialize recurring checkbox as unchecked for add mode", () => {
      render(
        <EditSource
          open={true}
          closeModal={vi.fn()}
          type="addIncome"
          incomeData={null}
        />,
      );

      const recurringCheckbox = screen.getByRole("checkbox");
      expect(recurringCheckbox).not.toBeChecked();
    });
  });
});
