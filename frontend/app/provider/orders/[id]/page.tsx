"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getStoredUser } from "@/lib/api";

type Order = {
  id: string;
  amount: number | string;
  status:
    | "PENDING"
    | "PAID"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };

  service: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number | string;
    status: "ACTIVE" | "INACTIVE";
    provider: {
      id: string;
      name: string;
      email: string;
    };
  };

  transaction?: {
    id: string;
    amount: number | string;
    status: string;
    paymentReference?: string | null;
    paidAt?: string | null;
    createdAt: string;
  } | null;
};

function formatPrice(price: number | string) {
  return `₦${Number(price).toLocaleString("en-NG")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusClass(status: Order["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";

    case "PAID":
      return "bg-purple-100 text-purple-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function ProviderOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId, router]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Order>(`/orders/${orderId}`, {
        auth: true,
      });

      setOrder(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(
    status: "IN_PROGRESS" | "COMPLETED",
  ) {
    if (!order) return;

    try {
      setUpdating(true);
      setError("");

      const data = await apiRequest<{
        message: string;
        order: Order;
      }>(`/orders/${order.id}/status`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status }),
      });

      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status.",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            Loading order...
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error || "Order not found."}
            </div>

            <Link
              href="/provider/orders"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              ← Back to Provider Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">

        {/* Navigation */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/provider/orders"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Orders
          </Link>

          <Link
            href="/provider/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Provider Order Details
                </p>

                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  {order.service.title}
                </h1>

                <p className="mt-2 break-all text-sm text-slate-500">
                  Order ID: {order.id}
                </p>
              </div>

              <span
                className={`self-start rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                  order.status,
                )}`}
              >
                {order.status.replaceAll("_", " ")}
              </span>

            </div>
          </div>

          {/* Order Summary */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Order Summary
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Amount
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatPrice(order.amount)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order Created
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Last Updated
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(order.updatedAt)}
                </p>
              </div>

            </div>
          </div>

          {/* Customer */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Customer Information
            </h2>

            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="text-lg font-semibold text-slate-900">
                {order.customer.name}
              </p>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">
                    Email:
                  </span>{" "}
                  {order.customer.email}
                </p>

                {order.customer.phone && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Phone:
                    </span>{" "}
                    {order.customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Service Information
            </h2>

            <div className="mt-5">
              <h3 className="text-xl font-semibold text-slate-900">
                {order.service.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {order.service.description}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.service.category}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Service Price
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatPrice(order.service.price)}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Payment Information
            </h2>

            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order Status
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.status.replaceAll("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Transaction Status
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.transaction?.status || "NOT PAID"}
                  </p>
                </div>

                {order.transaction?.paymentReference && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Payment Reference
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-700">
                      {order.transaction.paymentReference}
                    </p>
                  </div>
                )}

                {order.transaction?.paidAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Paid At
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(order.transaction.paidAt)}
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Customer Notes
            </h2>

            <div className="mt-4 rounded-xl bg-slate-50 p-5">
              <p className="whitespace-pre-wrap leading-7 text-slate-600">
                {order.notes || "No additional notes were provided."}
              </p>
            </div>
          </div>

          {/* Provider Actions */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Order Actions
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Update the order when you begin or finish the service.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {order.status === "PENDING" && (
              <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="font-semibold text-yellow-800">
                  Waiting for payment
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  You can start the service after the customer has
                  successfully paid for this order.
                </p>
              </div>
            )}

            {order.status === "PAID" && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() =>
                    updateOrderStatus("IN_PROGRESS")
                  }
                  disabled={updating}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating
                    ? "Starting Service..."
                    : "Start Service"}
                </button>
              </div>
            )}

            {order.status === "IN_PROGRESS" && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() =>
                    updateOrderStatus("COMPLETED")
                  }
                  disabled={updating}
                  className="w-full rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating
                    ? "Updating Order..."
                    : "Mark Order as Completed"}
                </button>
              </div>
            )}

            {order.status === "COMPLETED" && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                <p className="font-semibold text-green-700">
                  This order has been completed successfully.
                </p>
              </div>
            )}

            {order.status === "CANCELLED" && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="font-semibold text-red-700">
                  This order has been cancelled.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
