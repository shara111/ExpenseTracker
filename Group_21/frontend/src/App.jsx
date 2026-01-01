import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";

import SideNavbar from "./components/SideNavbar";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Logout from "./pages/Logout";
import Charts from "./pages/Charts";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoutes";
import ManageAccount from "./pages/ManageAccount";
import { AccountProvider } from "./context/AccountContext";
import { IncomeProvider } from "./context/IncomeContext";
import ExpenseProvider from "./context/ExpenseContext";

const App = () => {
  const location = useLocation();
  const showNavbar =
    location.pathname !== "/login" && location.pathname !== "/signup";

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#fff",
            color: "#1f2937",
            padding: "16px 20px",
            borderRadius: "16px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              color: "#065f46",
              border: "1px solid #6ee7b7",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              color: "#991b1b",
              border: "1px solid #fca5a5",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#875cf5",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="app-container">
        {showNavbar && <SideNavbar />}
        <div className={`main-content ${showNavbar ? "with-sidebar" : ""}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <AccountProvider>
                    <ExpenseProvider>
                      <Expenses />
                    </ExpenseProvider>
                  </AccountProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/income"
              element={
                <ProtectedRoute>
                  <AccountProvider>
                    <IncomeProvider>
                      <Income />
                    </IncomeProvider>
                  </AccountProvider>
                </ProtectedRoute>
              }
            />
            <Route path="/logout" element={<Logout />} />
            <Route
              path="/charts"
              element={
                <ProtectedRoute>
                  <Charts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Charts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-account"
              element={
                <ProtectedRoute>
                  <ManageAccount />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
