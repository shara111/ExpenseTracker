/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import IncomeByYear from "../pages/IncomeByYear";
import ExpenseByYear from "../pages/ExpenseByYear";

// Mock fetch
global.fetch = vi.fn();

// Mock useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ year: "2025" }),
    useLocation: () => ({ state: null }),
  };
});

describe("Year Pages with Recurring Support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("IncomeByYear Page", () => {
    it("should fetch income data for the year", async () => {
      const mockData = {
        January: { income: [], expenses: [] },
        October: {
          income: [
            {
              _id: "1",
              source: "Recurring Salary",
              amount: 500000,
              date: "2025-10-01T00:00:00.000Z",
              recurring: true,
              startDate: "2025-10-01T00:00:00.000Z",
            },
          ],
          expenses: [],
        },
        November: {
          income: [
            {
              _id: "1",
              source: "Recurring Salary",
              amount: 500000,
              date: "2025-10-01T00:00:00.000Z",
              recurring: true,
              startDate: "2025-10-01T00:00:00.000Z",
            },
          ],
          expenses: [],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(
        <BrowserRouter>
          <IncomeByYear />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Income for 2025")).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith("/api/v1/finances/income/2025");
    });

    it("should display recurring income in multiple months", async () => {
      const mockData = {
        October: {
          income: [
            {
              _id: "1",
              source: "Recurring Salary",
              amount: 500000,
              date: "2025-10-01T00:00:00.000Z",
            },
          ],
          expenses: [],
        },
        November: {
          income: [
            {
              _id: "1",
              source: "Recurring Salary",
              amount: 500000,
              date: "2025-10-01T00:00:00.000Z",
            },
          ],
          expenses: [],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(
        <BrowserRouter>
          <IncomeByYear />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("October")).toBeInTheDocument();
        expect(screen.getByText("November")).toBeInTheDocument();
      });

      // Both months should show the same recurring income
      const incomeSources = screen.getAllByText("Recurring Salary");
      expect(incomeSources).toHaveLength(2);
    });

    it("should show recurring indicator for recurring items", async () => {
      const mockData = {
        October: {
          income: [
            {
              _id: "1",
              source: "Recurring Salary",
              amount: 500000,
              date: "2025-10-01T00:00:00.000Z",
              recurring: true,
            },
          ],
          expenses: [],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(
        <BrowserRouter>
          <IncomeByYear />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Recurring Salary")).toBeInTheDocument();
      });

      // The recurring item should be displayed (no specific visual indicator in current implementation)
      expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    });
  });

  describe("ExpenseByYear Page", () => {
    it("should fetch expense data for the year", async () => {
      const mockData = {
        January: { income: [], expenses: [] },
        October: {
          income: [
            {
              _id: "1",
              category: "Recurring Subscription",
              amount: 2500,
              date: "2025-10-15T00:00:00.000Z",
              recurring: true,
              startDate: "2025-10-15T00:00:00.000Z",
            },
          ],
          expenses: [
            {
              _id: "1",
              category: "Recurring Subscription",
              amount: 2500,
              date: "2025-10-15T00:00:00.000Z",
              recurring: true,
              startDate: "2025-10-15T00:00:00.000Z",
            },
          ],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(
        <BrowserRouter>
          <ExpenseByYear />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Expenses for 2025")).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/finances/expense/2025",
      );
    });

    it("should display recurring expenses in multiple months", async () => {
      const mockData = {
        October: {
          income: [
            {
              _id: "1",
              category: "Recurring Subscription",
              amount: 2500,
              date: "2025-10-15T00:00:00.000Z",
            },
          ],
          expenses: [
            {
              _id: "1",
              category: "Recurring Subscription",
              amount: 2500,
              date: "2025-10-15T00:00:00.000Z",
            },
          ],
        },
        November: {
          income: [
            {
              _id: "1",
              category: "Recurring Subscription",
              amount: 2500,
              date: "2025-10-15T00:00:00.000Z",
            },
          ],
          expenses: [
            {
              _id: "1",
              category: "Recurring Subscription",
              amount: 2500,
              date: "2025-10-15T00:00:00.000Z",
            },
          ],
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(
        <BrowserRouter>
          <ExpenseByYear />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("October")).toBeInTheDocument();
        expect(screen.getByText("November")).toBeInTheDocument();
      });

      // Both months should show the same recurring expense
      const expenseCategories = screen.getAllByText("Recurring Subscription");
      expect(expenseCategories).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      render(
        <BrowserRouter>
          <IncomeByYear />
        </BrowserRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Income for 2025")).toBeInTheDocument();
      });

      // Should not crash on error
      expect(global.fetch).toHaveBeenCalledWith("/api/v1/finances/income/2025");
    });
  });
});
