"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredUser, logout } from "../../../lib/api";

type DashboardData = {
  summary: {
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number | string;
  };
  recentOrders: Array<{
    id: string;
    amount: number | string;
    status: string;
    createdAt: string;
    customer?: {
      name: string;
      email: string;
    };
    service?: {
      title: string;
      category: string;
    };
    transaction?: {
      status: string;
      paymentReference?: string | null;
    } | null;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number | string;
    status: string;
    createdAt: string;
    customer?: {
      name: string;
      email: string;
    };
    service?: {
      title: string;
    };
    order?: {
      status: string;
    };
  }>;
};

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
    case "SUCCESS":
      return "bg-green-100 text-green-700";
    case "PAID":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELLED":
    case "FAILED":
    case "REVERSED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}

export default function ProviderDashboard() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "PROVIDER") {
      router.push("/dashboard");
      return;
    }

    async function loadDashboard() {
      try {
        const data = await apiRequest<DashboardData>("/dashboard/provider", {
          auth: true,
        });

        setDashboard(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load provider dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-600">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!dashboard) return null;

  const { summary } = dashboard;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              FeeqTech Innovation Network
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              Provider Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block"
            >
              View Marketplace
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome, Provider
          </h1>
          <p className="mt-1 text-slate-500">
            Here is an overview of your services, orders and earnings.
          </p>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Services"
            value={summary.totalServices}
            description={`${summary.activeServices} active services`}
          />

          <StatCard
            title="Total Orders"
            value={summary.totalOrders}
            description={`${summary.pendingOrders} pending orders`}
          />

          <StatCard
            title="Completed Orders"
            value={summary.completedOrders}
            description={`${summary.inProgressOrders} currently in progress`}
          />

          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            description={`${summary.paidOrders} paid orders`}
          />
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Services"
            value={summary.activeServices}
            description="Currently available"
          />

          <StatCard
            title="Inactive Services"
            value={summary.inactiveServices}
            description="Not currently available"
          />

          <StatCard
            title="In Progress"
            value={summary.inProgressOrders}
            description="Orders being worked on"
          />

          <StatCard
            title="Cancelled"
            value={summary.cancelledOrders}
            description="Cancelled orders"
          />
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <p className="text-sm text-slate-500">
              Manage your FeeqTech Innovation Network business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/provider/services/new"
              title="Add Service"
              description="Create a new service listing"
            />

            <QuickAction
              href="/provider/orders"
              title="Manage Orders"
              description="View and manage customer orders"
            />

            <QuickAction
              href="/reviews"
              title="Reviews"
              description="View customer feedback"
            />

            <QuickAction
              href="/profile"
              title="My Profile"
              description="Update your provider profile"
            />
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Orders
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {dashboard.recentOrders.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No orders yet.
                </div>
              ) : (
                dashboard.recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {order.service?.title || "Service Order"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {order.customer?.name || "Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(order.amount)}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                            order.status,
                          )}`}
                        >
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Transactions
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {dashboard.recentTransactions.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No transactions yet.
                </div>
              ) : (
                dashboard.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {transaction.service?.title || "Service Payment"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {transaction.customer?.name || "Customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(transaction.amount)}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
