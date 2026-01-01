import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import Input from "../components/Inputs/Input";
import {
  MdPerson,
  MdLock,
  MdPhotoCamera,
  MdCheckCircle,
  MdEmail,
  MdShield,
} from "react-icons/md";
import { FiUpload, FiUser } from "react-icons/fi";

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // Error states
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Loads user data when component mounts, constructs full image URLs
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get("/auth/getUser");
        setUser(data);
        setFullName(data.fullName || "");
        // Construct full URL for profile image
        const baseURL =
          import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
          "http://localhost:8000";
        const fullImageUrl = data.profileImageURL
          ? `${baseURL}${data.profileImageURL}`
          : "";
        setPreviewImage(fullImageUrl);
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

  // Validates all the form fields, ensures passwords match, checks required fields
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      if (!newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Updates user name via API, shows success message, notifies other components
  const handleNameUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      const { data } = await api.put("/profile/name", { fullName });
      setUser(data.user);
      setSuccessMessage("Name updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: data.user }),
      );
    } catch (error) {
      setErrors({
        name: error.response?.data?.message || "Failed to update name",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Updates password with current password verification, clears form fields
  const handlePasswordUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      await api.put("/profile/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({
        password: error.response?.data?.message || "Failed to update password",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handles file upload, constructs full image URLs, notifies other components
  const handleImageUpload = async () => {
    if (!profilePicture) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("picture", profilePicture);

      const { data } = await api.put("/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      // Construct full URL for profile image
      const baseURL =
        import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
        "http://localhost:8000";
      const fullImageUrl = data.user.profileImageURL
        ? `${baseURL}${data.user.profileImageURL}`
        : "";
      setPreviewImage(fullImageUrl);
      setProfilePicture(null);
      setSuccessMessage("Profile picture updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: data.user }),
      );
    } catch (error) {
      setErrors({
        picture:
          error.response?.data?.message || "Failed to update profile picture",
      });
    } finally {
      setUpdating(false);
    }
  };

  //Image preview handler, Creates preview of selected image before upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:ml-72 md:pt-8 pt-20 p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <FiUser className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Manage your account information and preferences
            </p>
          </div>
        </motion.div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-3 shadow-lg shadow-emerald-500/10"
          >
            <MdCheckCircle className="w-6 h-6 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Account Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MdPhotoCamera className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">
                  Profile Photo
                </h2>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  <img
                    src={
                      previewImage ||
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjMwIiBmaWxsPSIjNjY2NjY2Ij5VU0VSPC90ZXh0Pjwvc3ZnPg=="
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-2xl border-4 border-primary/20 object-cover shadow-xl group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <MdPhotoCamera className="w-8 h-8 text-white" />
                  </div>
                </div>

                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile-upload"
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300"
                >
                  <FiUpload className="w-4 h-4" />
                  Choose Photo
                </label>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  JPEG, PNG or WEBP • Max 5MB
                </p>

                {errors.picture && (
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    {errors.picture}
                  </p>
                )}

                {profilePicture && (
                  <button
                    onClick={handleImageUpload}
                    disabled={updating}
                    className="btn-primary w-full mt-3"
                  >
                    {updating ? "Uploading..." : "Save Photo"}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Account Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MdEmail className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">
                  Account Info
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {user?.email}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Account Status
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                      <MdCheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <MdPerson className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-4">
                <Input
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  label="Full Name"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-sm font-medium">
                    {errors.fullName}
                  </p>
                )}
                {errors.name && (
                  <p className="text-red-600 text-sm font-medium">
                    {errors.name}
                  </p>
                )}

                <button
                  onClick={handleNameUpdate}
                  disabled={updating || !fullName.trim()}
                  className="btn-primary"
                >
                  {updating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Name"
                  )}
                </button>
              </div>
            </motion.div>

            {/* Password Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <MdShield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-gray-900">
                  Security & Password
                </h2>
              </div>

              <div className="space-y-4">
                <Input
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  label="Current Password"
                  placeholder="Enter current password"
                  type="password"
                />
                {errors.currentPassword && (
                  <p className="text-red-600 text-sm font-medium">
                    {errors.currentPassword}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      label="New Password"
                      placeholder="Enter new password"
                      type="password"
                    />
                    {errors.newPassword && (
                      <p className="text-red-600 text-sm font-medium mt-1">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      type="password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm font-medium mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {errors.password && (
                  <p className="text-red-600 text-sm font-medium">
                    {errors.password}
                  </p>
                )}

                <button
                  onClick={handlePasswordUpdate}
                  disabled={
                    updating ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="btn-primary"
                >
                  {updating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
