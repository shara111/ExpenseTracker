import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MdPeople,
  MdDelete,
  MdPersonRemove,
  MdAdminPanelSettings,
  MdWarning,
} from "react-icons/md";
import { FiUsers, FiAlertCircle } from "react-icons/fi";
import api from "../utils/api";
import { useAccount } from "../context/AccountContext.jsx";
import toast from "react-hot-toast";

export default function ManageAccount() {
  const { currentAccount, currentAccountId, isOwner, loadAccounts } =
    useAccount();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const loadMembers = async () => {
    if (!currentAccountId) return;
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/accounts/${currentAccountId}/members`);
      setMembers(res.data || []);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentAccountId]);

  const removeMember = async (userId) => {
    if (!isOwner) return;
    try {
      await api.delete(`/accounts/${currentAccountId}/members/${userId}`);
      toast.success("Member removed successfully!");
      await loadMembers();
      setMemberToRemove(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove member");
    }
  };

  const deleteAccount = async () => {
    if (!isOwner) return;
    try {
      await api.delete(`/accounts/${currentAccountId}`);
      toast.success("Account deleted successfully!");
      await loadAccounts();
      window.location.href = "/dashboard";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <MdAdminPanelSettings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Account</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {currentAccount?.name ||
                (currentAccount?.type === "personal"
                  ? "Personal Account"
                  : "Shared Account")}
            </p>
          </div>
        </div>

        {isOwner && currentAccount?.type === "shared" && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
          >
            <MdDelete className="w-5 h-5" />
            Delete Account
          </button>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3"
        >
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-medium">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary mb-4"></div>
          <p className="text-gray-600 font-medium">Loading members...</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-primary to-primary-light rounded-full"></span>
              Account Members
              <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                {members.length}
              </span>
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m, index) => (
                  <motion.tr
                    key={m.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            m.role === "owner"
                              ? "bg-gradient-to-br from-primary to-primary-light text-white"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                          }`}
                        >
                          {(m.fullName || m.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {m.fullName || "Unknown User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {m.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${
                          m.role === "owner"
                            ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {m.role === "owner" ? (
                          <>
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Owner
                          </>
                        ) : (
                          <>
                            <FiUsers className="w-3 h-3" />
                            Member
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {isOwner && m.role !== "owner" ? (
                          <button
                            onClick={() => setMemberToRemove(m)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold text-sm transition-all"
                          >
                            <MdPersonRemove className="w-4 h-4" />
                            Remove
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdPersonRemove className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Remove Member?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {memberToRemove.fullName || memberToRemove.email}
              </span>{" "}
              from this account?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => removeMember(memberToRemove.userId)}
                className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
              >
                Yes, Remove Member
              </button>
              <button
                onClick={() => setMemberToRemove(null)}
                className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdWarning className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Delete Account?
            </h2>
            <p className="text-gray-600 text-center mb-2">
              This will permanently delete the shared account for all members.
            </p>
            <p className="text-red-600 text-center font-semibold mb-6">
              This action cannot be undone!
            </p>

            <div className="space-y-3">
              <button
                onClick={deleteAccount}
                className="w-full px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
              >
                Yes, Delete Account
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
