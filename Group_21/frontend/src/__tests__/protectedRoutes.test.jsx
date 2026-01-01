import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Ensure localStorage exists in the test environment
if (typeof window !== "undefined" && !window.localStorage) {
  const createStorageMock = () => {
    let store = {};
    return {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  };
  Object.defineProperty(window, "localStorage", {
    value: createStorageMock(),
    configurable: true,
    writable: true,
  });
}

// Mock the API client to avoid real network calls
vi.mock("../Utils/api", () => {
  return {
    default: {
      get: vi.fn().mockResolvedValue({
        data: { fullName: "Test User", email: "test@example.com" },
      }),
      post: vi.fn(),
    },
  };
});

// Provide a lightweight SideNavbar that includes a working Logout button
vi.mock("../../components/SideNavbar", async () => {
  const reactRouterDom = await vi.importActual("react-router-dom");
  const { useNavigate } = reactRouterDom;

  const MockSideNavbar = () => {
    const navigate = useNavigate();
    return (
      <div>
        <button
          aria-label="mock-logout"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Log Out
        </button>
      </div>
    );
  };

  return { __esModule: true, default: MockSideNavbar };
});

let AppWrapper;
beforeAll(async () => {
  AppWrapper = (await import("../App.jsx")).default;
});

const goTo = (path) => {
  window.history.pushState({}, "", path);
};

beforeEach(() => {
  // Reset token before each test
  window.localStorage?.clear();
});

describe("Protected Routes", () => {
  it("redirects to /login when visiting protected routes without a token", async () => {
    goTo("/dashboard");
    render(<AppWrapper />);

    // Should land on Login page
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it("renders protected route when token is present", async () => {
    window.localStorage.setItem("token", "abc");
    goTo("/dashboard");
    render(<AppWrapper />);

    // Dashboard should render after ProtectedRoute allows access
    expect(
      await screen.findByText(/Your Financial Dashboard/i),
    ).toBeInTheDocument();
  });

  it("redirects to /login when visiting /expenses without a token", async () => {
    goTo("/expenses");
    render(<AppWrapper />);
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it("renders /expenses when token is present", async () => {
    window.localStorage.setItem("token", "abc");
    goTo("/expenses");
    render(<AppWrapper />);
    expect(await screen.findByText(/Expense Tracking/i)).toBeInTheDocument();
  });

  it("redirects to /login when visiting /income without a token", async () => {
    goTo("/income");
    render(<AppWrapper />);
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it("renders /income when token is present", async () => {
    window.localStorage.setItem("token", "abc");
    goTo("/income");
    render(<AppWrapper />);
    expect(await screen.findByText(/Income Tracking/i)).toBeInTheDocument();
  });

  it("logout clears token and redirects to /login", async () => {
    // Start authenticated on a protected page
    window.localStorage.setItem("token", "abc");
    goTo("/dashboard");
    render(<AppWrapper />);

    // Ensure dashboard is visible
    expect(
      await screen.findByText(/Your Financial Dashboard/i),
    ).toBeInTheDocument();

    // Click the mocked logout button in the mocked sidebar
    const logoutBtn = await screen.findByLabelText("mock-logout");
    fireEvent.click(logoutBtn);

    // Token removed and redirected to login
    await waitFor(() =>
      expect(window.localStorage.getItem("token")).toBeNull(),
    );
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it("direct URL access with token succeeds and without token redirects", async () => {
    // No token -> redirect
    goTo("/charts");
    const first = render(<AppWrapper />);
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();

    // With token -> can access
    window.localStorage.setItem("token", "abc");
    first.unmount();
    goTo("/charts");
    render(<AppWrapper />);
    // Assert the mocked sidebar is visible on protected pages, indicating we did not land on /login
    expect(await screen.findByLabelText("mock-logout")).toBeInTheDocument();
  });

  // Tiny tests for alias '/analytics'
  it("redirects to /login when visiting /analytics without a token", async () => {
    goTo("/analytics");
    render(<AppWrapper />);
    expect(await screen.findByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it("renders Charts when visiting /analytics with a token", async () => {
    window.localStorage.setItem("token", "abc");
    goTo("/analytics");
    render(<AppWrapper />);
    // Charts page has heading 'Financial Analytics'
    expect(await screen.findByText(/Financial Analytics/i)).toBeInTheDocument();
  });
});
