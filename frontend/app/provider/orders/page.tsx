"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredUser } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
};

type Service = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  category: string;
  status: "ACTIVE" | "INACTIVE";
};

type Transaction = {
  id: string;
  amount: number | string;
  status: string;
  createdAt: string;
};

type Order = {
  id: string;
  amount: number | string;
  status: "PENDING" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  service: Service;
  transaction?: Transaction | null;
};

export default function ProviderOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }

    loadOrders();
  }, [router]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Order[]>("/orders/provider", {
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

  async function updateOrderStatus(
    orderId: string,
    status: "IN_PROGRESS" | "COMPLETED",
  ) {
    try {
      setUpdatingId(orderId);
      setError("");

      const data = await apiRequest<{ message: string; order: Order }>(
        `/orders/${orderId}/status`,
        {
          method: "PATCH",
          auth: true,
          body: JSON.stringify({ status }),
        },
      );

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? data.order : order,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

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

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) =>
      order.status === "PAID" ||
      order.status === "IN_PROGRESS" ||
      order.status === "COMPLETED",
  );

  const inProgressOrders = orders.filter(
    (order) => order.status === "IN_PROGRESS",
  );

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  );

  const totalRevenue = completedOrders.reduce(
    (total, order) => total + Number(order.amount),
    0,
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading your orders...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Provider Orders
            </h1>

            <p className="mt-1 text-gray-600">
              Manage orders from customers who purchased your services.
            </p>
          </div>

          <Link
            href="/provider/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-center font-medium text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              Paid Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {paidOrders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {inProgressOrders.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              Completed Revenue
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatPrice(totalRevenue)}
            </p>
          </div>

        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-600">
              Customer orders for your services will appear here.
            </p>

            <Link
              href="/provider/services"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
              Manage My Services
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  <div className="flex-1">

                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {order.service.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Customer
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {order.customer.name}
                        </p>

                        <p className="text-sm text-gray-600">
                          {order.customer.email}
                        </p>

                        {order.customer.phone && (
                          <p className="text-sm text-gray-600">
                            {order.customer.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Order Amount
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {formatPrice(order.amount)}
                        </p>

                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                    </div>

                    {order.notes && (
                      <div className="mt-5 rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Customer Notes
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {order.notes}
                        </p>
                      </div>
                    )}

                  </div>

                  <div className="flex flex-col gap-3 lg:w-48">

                    <Link
                      href={`/provider/orders/${order.id}`}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </Link>

                    {order.status === "PAID" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "IN_PROGRESS",
                          )
                        }
                        disabled={updatingId === order.id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Start Service"}
                      </button>
                    )}

                    {order.status === "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "COMPLETED",
                          )
                        }
                        disabled={updatingId === order.id}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Mark Completed"}
                      </button>
                    )}

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
