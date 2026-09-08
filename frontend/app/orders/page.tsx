"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getStoredUser } from "@/lib/api";

type Order = {
  id: string;
  status: string;
  amount: number | string;
  notes?: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    category: string;
    provider: {
      id: string;
      name: string;
      email: string;
    };
  };
  transaction?: {
    id: string;
    status: string;
    reference?: string | null;
  } | null;
};

function formatCurrency(amount: number | string) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function formatStatus(status: string) {
  return status.replace("_", " ");
}

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "PAID":
      return "bg-emerald-100 text-emerald-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Order[]>("/orders", {
        auth: true,
      });

      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your orders.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            Loading your orders...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              My Orders
            </h1>

            <p className="mt-2 text-slate-600">
              Track and manage your service orders.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Find a Service
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📦</div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No orders yet
            </h2>

            <p className="mt-2 text-slate-500">
              You haven't placed any service orders yet.
            </p>

            <Link
              href="/services"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-950">
                        {order.service.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          order.status,
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Category: {order.service.category}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Provider: {order.service.provider.name}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Ordered{" "}
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 lg:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {formatCurrency(order.amount)}
                    </p>

                    {order.transaction && (
                      <p className="mt-1 text-xs text-slate-500">
                        Payment: {order.transaction.status}
                      </p>
                    )}

                    <p className="mt-3 text-sm font-semibold text-blue-600">
                      View Order →
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
