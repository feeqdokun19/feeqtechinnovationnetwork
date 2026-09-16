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
  
  providerAccepted: boolean;
  providerAcceptedAt?: string | null;
  
  scheduledAt?: string | null;
  paidAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;

  
  providerDeclinedAt?: string | null;
  providerDeclineReason?: string | null;

  providerApproved: boolean;
  customerApproved: boolean;
  providerApprovedAt?: string | null;
  customerApprovedAt?: string | null;

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

function formatApprovalDate(date?: string | null) {
  if (!date) return "";

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

  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const [approvalSuccess, setApprovalSuccess] = useState("");

  const [accepting, setAccepting] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState("");
  const [acceptanceSuccess, setAcceptanceSuccess] = useState("");

  const [declining, setDeclining] = useState(false);
  const [declineError, setDeclineError] = useState("");
  const [declineSuccess, setDeclineSuccess] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineDetails, setDeclineDetails] = useState("");

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
      
      console.log("=== PROVIDER ORDER DEBUG ===");
      console.log("Order ID:", data.id);
      console.log("Order Status:", data.status);
      console.log("Provider Accepted:", data.providerAccepted);
      console.log("Provider Approved:", data.providerApproved);
      console.log("Customer Approved:", data.customerApproved);
      console.log("Provider Approved At:", data.providerApprovedAt);
      console.log("Customer Approved At:", data.customerApprovedAt);
      console.log("Full Order:", data);
      
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

  async function handleApproval() {
    if (!order) return;

    try {
      setApproving(true);
      setApprovalError("");
      setApprovalSuccess("");

      const data = await apiRequest<{
        message: string;
        order: Order;
      }>(`/orders/${order.id}/provider-approval`, {
        method: "PATCH",
        auth: true,
      });

      setOrder(data.order);
      setApprovalSuccess(
        "Your provider approval has been recorded successfully.",
      );
    } catch (err) {
      setApprovalError(
        err instanceof Error
          ? err.message
          : "Unable to approve this order.",
      );
    } finally {
      setApproving(false);
    }
  }

  async function handleProviderAcceptance() {
    if (!order) return;

    try {
      setAccepting(true);
      setAcceptanceError("");
      setAcceptanceSuccess("");

      const data = await apiRequest<{
        message: string;
        order: Order;
      }>(`/orders/${order.id}/provider-acceptance`, {
        method: "PATCH",
        auth: true,
      });

      setOrder(data.order);

      setAcceptanceSuccess(
        "The customer's request has been accepted successfully.",
      );
    } catch (err) {
      setAcceptanceError(
        err instanceof Error
          ? err.message
          : "Unable to accept this request.",
      );
    } finally {
      setAccepting(false);
    }
  }

  async function handleProviderDecline() {
    if (!order) return;

    const reason =
      declineReason === "Other"
        ? declineDetails.trim()
        : declineReason;

    if (!reason) {
      setDeclineError("Please select a reason for declining this request.");
      return;
    }

    try {
      setDeclining(true);
      setDeclineError("");
      setDeclineSuccess("");

      const data = await apiRequest<{
        message: string;
        order: Order;
      }>(`/orders/${order.id}/provider-decline`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ reason }),
      });

      setOrder(data.order);
      setShowDeclineForm(false);
      setDeclineSuccess(
        "The customer's request has been declined successfully.",
      );
    } catch (err) {
      setDeclineError(
        err instanceof Error
          ? err.message
          : "Unable to decline this request.",
      );
    } finally {
      setDeclining(false);
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

          </div>

          {/* Order Timeline */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Order Timeline
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Track the progress of this order from request to completion.
            </p>

            <div className="mt-6 space-y-6">
              {/* Request Created */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    ✓
                  </div>
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-2">
                  <p className="font-semibold text-slate-900">
                    Request Created
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Provider Accepted */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.providerAccepted
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {order.providerAccepted ? "✓" : "•"}
                  </div>
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-2">
                  <p
                    className={`font-semibold ${
                      order.providerAccepted
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    Provider Accepted
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.providerAcceptedAt
                      ? formatDate(order.providerAcceptedAt)
                      : "Waiting for provider acceptance"}
                  </p>
                </div>
              </div>

              {/* Payment Received */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.paidAt
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {order.paidAt ? "✓" : "•"}
                  </div>
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-2">
                  <p
                    className={`font-semibold ${
                      order.paidAt
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    Payment Received
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.paidAt
                      ? formatDate(order.paidAt)
                      : "Waiting for customer payment"}
                  </p>
                </div>
              </div>

              {/* Service Started */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.startedAt
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {order.startedAt ? "✓" : "•"}
                  </div>
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-2">
                  <p
                    className={`font-semibold ${
                      order.startedAt
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    Service Started
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.startedAt
                      ? formatDate(order.startedAt)
                      : "Waiting for service to start"}
                  </p>
                </div>
              </div>

              {/* Service Completed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.completedAt
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {order.completedAt ? "✓" : "•"}
                  </div>
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-2">
                  <p
                    className={`font-semibold ${
                      order.completedAt
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    Service Completed
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.completedAt
                      ? formatDate(order.completedAt)
                      : "Waiting for service completion"}
                  </p>
                </div>
              </div>

              {/* Provider Approval */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.providerApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {order.providerApproved ? "✓" : "•"}
                  </div>
                  <div className="mt-2 h-full w-px bg-slate-200" />
                </div>

                <div className="pb-2">
                  <p
                    className={`font-semibold ${
                      order.providerApproved
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    Provider Approved
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.providerApprovedAt
                      ? formatDate(order.providerApprovedAt)
                      : "Waiting for provider approval"}
                  </p>
                </div>
              </div>

              {/* Customer Approval */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.customerApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {order.customerApproved ? "✓" : "•"}
                  </div>
                </div>

                <div>
                  <p
                    className={`font-semibold ${
                      order.customerApproved
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    Customer Approved
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.customerApprovedAt
                      ? formatDate(order.customerApprovedAt)
                      : "Waiting for customer approval"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="border-b border-slate-100 p-6 sm:p-8">

          {/* Provider Actions */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
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
              <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                {!order.providerAccepted ? (
                  <>
                    <p className="font-semibold text-yellow-800">
                      New Service Request
                    </p>

                    <p className="mt-1 text-sm text-yellow-700">
                      Review the customer's request and accept it before
                      the customer proceeds with payment.
                    </p>

                    {acceptanceError && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {acceptanceError}
                      </div>
                    )}

                    {acceptanceSuccess && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {acceptanceSuccess}
                      </div>
                    )}

                    {!showDeclineForm ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={handleProviderAcceptance}
                          disabled={accepting || declining}
                          className="rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {accepting
                            ? "Accepting Request..."
                            : "Accept Request"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeclineError("");
                            setShowDeclineForm(true);
                          }}
                          disabled={accepting || declining}
                          className="rounded-xl border border-red-300 bg-white px-6 py-3.5 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          Decline Request
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                        <p className="font-semibold text-slate-900">
                          Decline Request
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Please select a reason.
                        </p>

                        <div className="mt-4 space-y-2">
                          {[
                            "I'm currently unavailable",
                            "The request is outside my service scope",
                            "The requested schedule does not work for me",
                            "Other",
                          ].map((reason) => (
                            <label
                              key={reason}
                              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                            >
                              <input
                                type="radio"
                                name="declineReason"
                                value={reason}
                                checked={declineReason === reason}
                                onChange={(e) =>
                                  setDeclineReason(e.target.value)
                                }
                              />
                              <span className="text-sm text-slate-700">
                                {reason}
                              </span>
                            </label>
                          ))}
                        </div>

                        {declineReason === "Other" && (
                          <textarea
                            value={declineDetails}
                            onChange={(e) =>
                              setDeclineDetails(e.target.value)
                            }
                            rows={3}
                            placeholder="Please provide a brief reason..."
                            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-red-400 focus:outline-none"
                          />
                        )}

                        {declineError && (
                          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {declineError}
                          </div>
                        )}

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowDeclineForm(false)}
                            disabled={declining}
                            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={handleProviderDecline}
                            disabled={declining}
                            className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {declining
                              ? "Declining..."
                              : "Confirm Decline"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-green-700">
                      ✓ Request Accepted
                    </p>

                    <p className="mt-1 text-sm text-green-600">
                      The request has been accepted. Waiting for the
                      customer to complete payment.
                    </p>

                    {order.providerAcceptedAt && (
                      <p className="mt-2 text-xs text-green-600">
                        Accepted on {formatApprovalDate(order.providerAcceptedAt)}
                      </p>
                    )}
                  </>
                )}
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
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">
                  Request Declined
                </p>

                <p className="mt-1 text-sm text-red-700">
                  This request is no longer available for processing.
                </p>

                {order.providerDeclineReason && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                      Decline Reason
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {order.providerDeclineReason}
                    </p>
                  </div>
                )}

                {order.providerDeclinedAt && (
                  <p className="mt-3 text-xs text-red-600">
                    Declined on {formatApprovalDate(order.providerDeclinedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Approval */}
          {order.status === "COMPLETED" && (
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-950">
                Order Approval
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Confirm that the completed service has been delivered
                as required.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                {/* Provider Approval */}
                <div
                  className={`rounded-xl border p-5 ${
                    order.providerApproved
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Your Approval
                  </p>

                  {order.providerApproved ? (
                    <>
                      <p className="mt-2 font-semibold text-green-700">
                        ✓ Approved
                      </p>

                      {order.providerApprovedAt && (
                        <p className="mt-1 text-sm text-green-600">
                          {formatApprovalDate(
                            order.providerApprovedAt,
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mt-2 font-semibold text-yellow-800">
                        Approval Pending
                      </p>

                      <button
                        type="button"
                        onClick={handleApproval}
                        disabled={approving}
                        className="mt-4 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approving
                          ? "Approving Order..."
                          : "Approve Completed Order"}
                      </button>
                    </>
                  )}
                </div>

                {/* Customer Approval */}
                <div
                  className={`rounded-xl border p-5 ${
                    order.customerApproved
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Requester Approval
                  </p>

                  {order.customerApproved ? (
                    <>
                      <p className="mt-2 font-semibold text-green-700">
                        ✓ Approved
                      </p>

                      {order.customerApprovedAt && (
                        <p className="mt-1 text-sm text-green-600">
                          {formatApprovalDate(
                            order.customerApprovedAt,
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mt-2 font-semibold text-yellow-800">
                        Requester approval pending
                      </p>

                      <p className="mt-2 text-sm text-yellow-700">
                        The requester still needs to approve the
                        completed order.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {approvalError && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {approvalError}
                </p>
              )}

              {approvalSuccess && (
                <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {approvalSuccess}
                </p>
              )}

              {order.customerApproved &&
                order.providerApproved && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                    <p className="font-semibold text-green-700">
                      ✓ Both parties have approved this completed order.
                    </p>

                    <p className="mt-1 text-sm text-green-600">
                      The order approval process is complete.
                    </p>
                  </div>
                )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
