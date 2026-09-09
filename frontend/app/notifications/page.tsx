"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  order?: {
    id: string;
    status: string;
    amount: string | number;
    service?: {
      id: string;
      title: string;
    };
  } | null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Notification[]>("/notifications", {
        auth: true,
      });

      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await apiRequest(`/notifications/${id}/read`, {
        method: "PATCH",
        auth: true,
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  async function markAllAsRead() {
    try {
      await apiRequest("/notifications/read-all", {
        method: "PATCH",
        auth: true,
      });

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            Loading notifications...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={loadNotifications}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">🔔</div>

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No notifications
            </h2>

            <p className="mt-2 text-slate-500">
              You&apos;re all caught up.
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  notification.isRead
                    ? "border-slate-200"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        notification.isRead
                          ? "bg-slate-100"
                          : "bg-blue-100"
                      }`}
                    >
                      🔔
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {notification.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(
                          notification.createdAt,
                        ).toLocaleString()}
                      </p>

                      {notification.order && (
                        <Link
                          href={`/orders/${notification.order.id}`}
                          onClick={() => markAsRead(notification.id)}
                          className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View order →
                        </Link>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
