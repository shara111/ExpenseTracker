import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";

const AccountContext = createContext(null);

export const AccountProvider = ({ children }) => {
  const [personal, setPersonal] = useState(null);
  const [shared, setShared] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState(
    () => localStorage.getItem("currentAccountId") || null,
  );
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/accounts/mine");
      setPersonal(data.personal);
      setShared(data.shared || []);

      // Get all valid account IDs
      const all = [
        data.personal?._id,
        ...(data.shared || []).map((a) => a._id),
      ].filter(Boolean);

      // Check if current account is still valid
      const persisted = localStorage.getItem("currentAccountId");
      const isCurrentValid = persisted && all.includes(persisted);

      // Only change account if current is invalid or not set
      if (!isCurrentValid) {
        // Default to personal account if current is invalid
        const nextId = data.personal?._id || null;
        setCurrentAccountId(nextId);
        if (nextId) {
          localStorage.setItem("currentAccountId", nextId);
        } else {
          localStorage.removeItem("currentAccountId");
        }
      } else {
        // Keep the current account - don't switch automatically
        setCurrentAccountId(persisted);
      }
    } catch (e) {
      console.error("Failed to load accounts:", e);
      // ignore for now; Account resolution on backend still defaults to personal
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const { data } = await api.get("/auth/getUser");
      setUser(data);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    // load on mount
    loadAccounts();
    loadUser();

    // optional: listen for external refresh requests
    const handler = () => loadAccounts();
    window.addEventListener("accountsUpdated", handler);
    return () => window.removeEventListener("accountsUpdated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrent = (id) => {
    setCurrentAccountId(id);
    if (id) localStorage.setItem("currentAccountId", id);
    else localStorage.removeItem("currentAccountId");
  };

  const allAccounts = useMemo(() => {
    const arr = [];
    if (personal) arr.push(personal);
    if (shared?.length) arr.push(...shared);
    return arr;
  }, [personal, shared]);

  const currentAccount = useMemo(() => {
    return allAccounts.find((a) => a._id === currentAccountId) || personal;
  }, [allAccounts, currentAccountId, personal]);

  const isOwner = useMemo(() => {
    if (!currentAccount || !user) return false;
    // Handle both string and ObjectId formats
    const ownerId = currentAccount.owner?._id || currentAccount.owner;
    const userId = user._id || user.id;
    if (!ownerId || !userId) return false;
    return ownerId.toString() === userId.toString();
  }, [currentAccount, user]);

  const value = {
    personal,
    shared,
    allAccounts,
    currentAccountId,
    currentAccount,
    user,
    isOwner,
    setCurrentAccountId: setCurrent,
    loadAccounts,
    loading,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
};
