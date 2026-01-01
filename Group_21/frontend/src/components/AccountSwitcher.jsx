import { useEffect } from "react";
import { MdPerson, MdGroups } from "react-icons/md";
import { useAccount } from "../context/AccountContext.jsx";

export default function AccountSwitcher() {
  const {
    allAccounts,
    currentAccountId,
    setCurrentAccountId,
    loading,
    loadAccounts,
  } = useAccount();

  useEffect(() => {
    if (!allAccounts?.length) loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return null;
  if (!allAccounts || allAccounts.length <= 1) return null; // no need to show if only personal

  const currentAccount = allAccounts.find(
    (acc) => acc._id === currentAccountId,
  );

  return (
    <div className="mb-6 px-1">
      {/* Compact Account Switcher */}
      <div className="relative group">
        {/* Icon and Type Badge Combined */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentAccount?.type === "personal"
                ? "bg-indigo-700/70"
                : "bg-primary/30"
            }`}
          >
            {currentAccount?.type === "personal" ? (
              <MdPerson className="w-4.5 h-4.5 text-white" />
            ) : (
              <MdGroups className="w-4.5 h-4.5 text-primary-light" />
            )}
          </div>
        </div>

        <select
          className="w-full bg-gradient-to-r from-indigo-800/40 to-indigo-900/40 text-white text-sm rounded-xl pl-14 pr-10 py-3.5 border border-indigo-700/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 hover:border-indigo-600/50 hover:bg-indigo-800/50 transition-all duration-200 appearance-none cursor-pointer font-semibold shadow-lg backdrop-blur-sm group-hover:shadow-xl"
          value={currentAccountId || ""}
          onChange={(e) => setCurrentAccountId(e.target.value)}
        >
          {allAccounts.map((acc) => {
            const memberCount = acc.members?.length || 0;
            const displayName =
              acc.name ||
              (acc.type === "personal" ? "Personal" : "Shared Account");
            const suffix =
              acc.type === "shared" && memberCount > 0
                ? ` • ${memberCount} member${memberCount !== 1 ? "s" : ""}`
                : "";

            return (
              <option
                key={acc._id}
                value={acc._id}
                className="bg-indigo-900 text-white py-2"
              >
                {displayName}
                {suffix}
              </option>
            );
          })}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 group-hover:text-primary-light pointer-events-none transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    </div>
  );
}
