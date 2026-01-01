import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, X, Check, AlertCircle } from "lucide-react";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";
import api from "../utils/api";

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/auth/getUser");
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const fetchNotifications = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/notifications/${user._id}`);
      setNotifications(response.data.data);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user?._id]);

  const markAsRead = async (notificationId, e) => {
    e?.stopPropagation?.();
    try {
      await api.put(`/notifications/${notificationId}`);
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId
            ? { ...notif, readAt: new Date() }
            : notif,
        ),
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.readAt)
        .map((n) => n._id);
      await Promise.all(unreadIds.map((id) => api.put(`/notifications/${id}`)));
      setNotifications(
        notifications.map((notif) => ({ ...notif, readAt: new Date() })),
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <MdNotificationsActive className="h-6 w-6 text-primary group-hover:scale-110 transition-transform animate-pulse" />
        ) : (
          <MdNotifications className="h-6 w-6 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all" />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full px-1.5 shadow-lg shadow-red-500/30 animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 scale-in overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary to-primary-light border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MdNotificationsActive className="h-5 w-5 text-white" />
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-white/30 backdrop-blur text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-white/90 hover:text-white text-xs font-semibold underline"
                    title="Mark all as read"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
                <p className="mt-3 text-sm text-gray-500 font-medium">
                  Loading notifications...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  We'll notify you when something arrives
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer relative group ${
                      !notification.readAt ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    {/* Unread indicator */}
                    {!notification.readAt && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light"></div>
                    )}

                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                          !notification.readAt
                            ? "bg-gradient-to-br from-primary to-primary-light text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {notification.data.amount ? (
                          <span className="text-lg font-bold">$</span>
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p
                            className={`font-semibold text-sm ${
                              !notification.readAt
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.data.title}
                          </p>
                          {!notification.readAt && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.data.message}
                        </p>

                        <div className="flex items-center justify-between">
                          {notification.data.amount && (
                            <span className="text-sm font-bold text-primary">
                              ${parseFloat(notification.data.amount).toFixed(2)}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 font-medium ml-auto">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Mark as read button */}
                      {!notification.readAt && (
                        <button
                          onClick={(e) => markAsRead(notification._id, e)}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-all"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
