"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredUser, logout } from "@/lib/api";

type Order = {
  id: string;
  amount: string | number;
  status: string;
  notes?: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    category: string;
    price: string | number;
    provider: {
      id: string;
      name: string;
    };
  };
  transaction?: {
    id: string;
    status: string;
    paymentReference?: string | null;
    paidAt?: string | null;
  } | null;
};

type Transaction = {
  id: string;
  amount: string | number;
  status: string;
  paymentReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
  };
  order: {
    id: string;
    status: string;
  };
};

type DashboardData = {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: string | number;
  };
  recentOrders: Order[];
  recentTransactions: Transaction[];
};

function formatCurrency(value: string | number) {
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "PAID":
      return "bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700";
    case "PENDING":
      return "bg-slate-100 text-slate-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700";
    case "FAILED":
    case "REVERSED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function CustomerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    if (storedUser.role !== "CUSTOMER") {
      if (storedUser.role === "PROVIDER") {
        router.replace("/provider/dashboard");
      } else {
        router.replace("/");
      }

      return;
    }

    setUser(storedUser);

    async function loadDashboard() {
      try {
        const data = await apiRequest<DashboardData>(
          "/dashboard/customer",
          {
            auth: true,
          },
        );

        setDashboard(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load dashboard";

        setError(message);

        if (
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("token")
        ) {
          logout();
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 rounded bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-slate-200"
                />
              ))}
            </div>

            <div className="h-80 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-950">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Something went wrong while loading your account."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const summaryCards = [
    {
      label: "Total Orders",
      value: dashboard.summary.totalOrders,
      icon: "📦",
    },
    {
      label: "Pending",
      value: dashboard.summary.pendingOrders,
      icon: "⏳",
    },
    {
      label: "In Progress",
      value: dashboard.summary.paidOrders,
      icon: "🔄",
    },
    {
      label: "Completed",
      value: dashboard.summary.completedOrders,
      icon: "✓",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
  F
</div>

<span className="text-lg font-bold tracking-tight sm:text-xl">
  FeeqTech <span className="text-blue-600">Innovation Network</span>
</span>
          </a>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              Welcome,{" "}
              <span className="font-semibold text-slate-900">
                {user?.name}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {user?.name?.split(" ")[0] || "there"} ��
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your services, orders and payments from one place.
            </p>
          </div>

          <a
            href="/services"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Find a Service
          </a>
        </div>

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  {card.icon}
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {card.label}
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {/* Spending */}
        <section className="mt-6 rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-400">
                Total amount spent
              </p>

              <p className="mt-1 text-3xl font-bold">
                {formatCurrency(dashboard.summary.totalSpent)}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Based on successful transactions
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-4">
              <p className="text-sm text-slate-400">
                Cancelled orders
              </p>

              <p className="mt-1 text-2xl font-bold">
                {dashboard.summary.cancelledOrders}
              </p>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Recent orders */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-950">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest service requests
                </p>
              </div>

              <a
                href="/orders"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </a>
            </div>

            {dashboard.recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="text-4xl">📦</div>

                <h3 className="mt-4 font-semibold text-slate-950">
                  No orders yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Find a service and place your first order.
                </p>

                <a
                  href="/services"
                  className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Browse Services
                </a>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboard.recentOrders.map((order) => (
                  <a
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block px-6 py-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950">
                            {order.service.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              order.status,
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Provider: {order.service.provider.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-bold text-slate-950">
                          {formatCurrency(order.amount)}
                        </p>

                        {order.transaction && (
                          <p
                            className={`mt-1 text-xs font-medium ${
                              order.transaction.status === "SUCCESS"
                                ? "text-emerald-600"
                                : "text-slate-500"
                            }`}
                          >
                            Payment:{" "}
                            {formatStatus(
                              order.transaction.status,
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Transactions */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-bold text-slate-950">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent payment activity
              </p>
            </div>

            {dashboard.recentTransactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-3xl">💳</div>

                <p className="mt-3 text-sm text-slate-500">
                  No transactions yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboard.recentTransactions.map(
                  (transaction) => (
                    <div
                      key={transaction.id}
                      className="px-6 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {transaction.service.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                            transaction.status,
                          )}`}
                        >
                          {formatStatus(transaction.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-slate-950">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        {/* Quick actions */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-950">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/services"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="text-2xl">🔎</div>
              <h3 className="mt-4 font-semibold">
                Find a Service
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Browse available services.
              </p>
            </a>

            <a
              href="/orders"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="text-2xl">📦</div>
              <h3 className="mt-4 font-semibold">
                My Orders
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Track your service orders.
              </p>
            </a>

            <a
              href="/reviews"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="text-2xl">⭐</div>
              <h3 className="mt-4 font-semibold">
                My Reviews
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage your service reviews.
              </p>
            </a>

            <a
              href="/profile"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="text-2xl">👤</div>
              <h3 className="mt-4 font-semibold">
                My Profile
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage your account.
              </p>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
