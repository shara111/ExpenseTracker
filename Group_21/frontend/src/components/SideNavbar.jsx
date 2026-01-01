import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { FiMenu, FiX, FiSettings } from "react-icons/fi";
import { CgMenuGridO } from "react-icons/cg";
import {
  MdAttachMoney,
  MdBarChart,
  MdPerson,
  MdAccountBalance,
} from "react-icons/md";
import { FaHandHoldingUsd } from "react-icons/fa";
import { RiLogoutBoxLine, RiDashboardLine } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi";
import AccountSwitcher from "./AccountSwitcher";
// import defaultAvatar from "../assets/default-avatar.png";
const defaultAvatar =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjMwIiBmaWxsPSIjNjY2NjY2Ij5VU0VSPC90ZXh0Pjwvc3ZnPg==";

const SideNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSmallScreen, setIsSmallScreen] = useState(true);
  const sideNavBar = useRef(null);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get("/auth/getUser");
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentAccountId");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideNavBar.current && !sideNavBar.current.contains(event.target)) {
        setIsSmallScreen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for profile updates from other components, and does real-time updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setUser(event.detail);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={`fixed top-5 left-5 z-50 p-3 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:shadow-xl hover:shadow-primary/30 shadow-lg transition-all md:hidden ${
          isSmallScreen ? "hidden" : "md:hidden"
        }`}
        onClick={() => setIsSmallScreen(!isSmallScreen)}
        aria-label="Open menu"
      >
        <FiMenu className="w-6 h-6 text-white" />
      </button>

      {/* Sidebar */}
      <div
        ref={sideNavBar}
        className={`bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 h-screen p-6 fixed w-72 flex flex-col justify-between transition-all duration-300 shadow-2xl border-r border-indigo-800/30 backdrop-blur-xl ${
          isSmallScreen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-40 overflow-y-auto custom-scrollbar`}
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-6 px-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-primary via-primary-light to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40 group-hover:shadow-xl group-hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                <RiDashboardLine className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <span className="text-xl font-bold text-white group-hover:text-primary-light transition-colors block leading-tight">
                  FinDashboard
                </span>
                <span className="text-xs text-indigo-400 font-medium flex items-center gap-1 leading-tight mt-0.5">
                  <HiSparkles className="w-3 h-3" />
                  Pro Finance
                </span>
              </div>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsSmallScreen(false)}
              className="md:hidden text-white hover:text-primary-light transition-colors p-2 hover:bg-indigo-800/50 rounded-xl"
              aria-label="Close menu"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <AccountSwitcher />

          {/* Navigation Links */}
          <nav className="space-y-1.5 px-1">
            {[
              {
                to: "/dashboard",
                icon: <CgMenuGridO />,
                text: "Dashboard",
                badge: null,
              },
              {
                to: "/income",
                icon: <MdAttachMoney />,
                text: "Income",
                badge: null,
              },
              {
                to: "/expenses",
                icon: <FaHandHoldingUsd />,
                text: "Expenses",
                badge: null,
              },
              {
                to: "/charts",
                icon: <MdBarChart />,
                text: "Analytics",
                badge: null,
              },
              {
                to: "/edit-profile",
                icon: <MdPerson />,
                text: "Profile",
                badge: null,
              },
              {
                to: "/manage-account",
                icon: <MdAccountBalance />,
                text: "Manage Account",
                badge: null,
              },
            ].map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden slide-in-left ${
                  location.pathname === link.to
                    ? "bg-gradient-to-r from-primary/25 to-primary-light/25 text-white shadow-lg shadow-primary/20 border-l-[3px] border-primary-light"
                    : "text-indigo-300 hover:bg-indigo-800/40 hover:text-white hover:translate-x-1"
                }`}
              >
                {/* Active indicator line */}
                {location.pathname === link.to && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary to-primary-light rounded-r"></div>
                )}

                <span
                  className={`text-xl mr-3.5 transition-all duration-200 ${
                    location.pathname === link.to
                      ? "text-primary-light scale-110"
                      : "text-indigo-400 group-hover:text-primary-light group-hover:scale-105"
                  }`}
                >
                  {link.icon}
                </span>
                <span className="text-sm font-semibold tracking-wide flex-1">
                  {link.text}
                </span>

                {/* Active pulse indicator */}
                {location.pathname === link.to && (
                  <span className="w-2 h-2 bg-primary-light rounded-full animate-pulse shadow-lg shadow-primary-light/50" />
                )}

                {/* Badge (if any) */}
                {link.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}

            {/* Divider */}
            <div className="my-4 border-t border-indigo-800/50"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-xl text-indigo-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group relative overflow-hidden"
            >
              <span className="text-xl mr-3.5 group-hover:text-red-400 text-indigo-400 transition-all duration-200 group-hover:scale-105">
                <RiLogoutBoxLine />
              </span>
              <span className="text-sm font-semibold tracking-wide">
                Log Out
              </span>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-indigo-800/40 pt-4 mt-auto px-1">
          {!loading && (
            <Link
              to="/edit-profile"
              className="flex items-center px-3 py-3 bg-gradient-to-r from-indigo-800/30 to-indigo-900/30 rounded-xl hover:from-indigo-800/50 hover:to-indigo-900/50 transition-all duration-300 cursor-pointer group border border-indigo-700/30 hover:border-primary/40 relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <img
                  className="w-10 h-10 rounded-xl border-2 border-indigo-700/50 group-hover:border-primary/70 shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-300 relative z-10 object-cover"
                  src={
                    user.profileImageURL
                      ? `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000"}${user.profileImageURL}`
                      : defaultAvatar
                  }
                  alt="User profile"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-900 z-20 shadow-sm"></div>
              </div>

              {/* User Info */}
              <div className="ml-3 flex-1 min-w-0 relative z-10">
                <p className="text-sm font-bold text-white truncate group-hover:text-primary-light transition-colors leading-tight">
                  {user.fullName || "Guest User"}
                </p>
                <p className="text-xs text-indigo-400 truncate group-hover:text-indigo-300 transition-colors mt-0.5 leading-tight">
                  {user.email || "user@example.com"}
                </p>
              </div>

              {/* Settings Icon */}
              <div className="relative z-10 flex-shrink-0">
                <FiSettings className="w-4.5 h-4.5 text-indigo-400 group-hover:text-primary-light group-hover:rotate-90 transition-all duration-300" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default SideNavbar;
