"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getStoredUser } from "@/lib/api";


type Order = {
  id: string;
  status: string;
  amount: number | string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    title: string;
    description: string;
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
  paymentReference?: string | null;
  amount?: number | string;
} | null;
};

function formatCurrency(amount: number | string) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [paying, setPaying] = useState(false);
const [paymentError, setPaymentError] = useState("");

const [rating, setRating] = useState(0);
const [comment, setComment] = useState("");
const [reviewSubmitting, setReviewSubmitting] = useState(false);
const [reviewError, setReviewError] = useState("");
const [reviewSuccess, setReviewSuccess] = useState("");
const [hasReviewed, setHasReviewed] = useState(false);

async function 
    handlePayment() {
  if (!order) return;

  try {
    setPaying(true);
    setPaymentError("");

    const payment = await apiRequest<{
      authorizationUrl: string;
      reference: string;
      orderId: string;
    }>(`/payments/initialize/${order.id}`, {
      method: "POST",
      auth: true,
    });

    window.location.href = payment.authorizationUrl;
  } catch (err) {
    setPaymentError(
      err instanceof Error
        ? err.message
        : "Unable to initialize payment.",
    );
  } finally {
    setPaying(false);
  }
}

async function handleReviewSubmit() {
  if (!order) return;

  if (rating < 1 || rating > 5) {
    setReviewError("Please select a rating from 1 to 5 stars.");
    return;
  }

  try {
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    await apiRequest("/reviews", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        serviceId: order.service.id,
        rating,
        comment: comment.trim() || undefined,
      }),
    });

    setHasReviewed(true);
    setReviewSuccess("Your review has been submitted successfully.");
    setComment("");
  } catch (err) {
    setReviewError(
      err instanceof Error
        ? err.message
        : "Unable to submit your review.",
    );
  } finally {
    setReviewSubmitting(false);
  }
}


  useEffect(() => {
  const user = getStoredUser();

  if (!user) {
    router.push("/login");
    return;
  }

  if (orderId) {
    loadOrder();
  }
}, [orderId, router])


async function loadOrder() {
  try {
    setLoading(true);
    setError("");

    const data = await apiRequest<Order>(
      `/orders/${orderId}`,
      {
        auth: true,
      },
    );

    setOrder(data);

    const paymentStatus =
      new URLSearchParams(window.location.search).get("payment");

    if (
      paymentStatus === "success" &&
      data.status === "PAID"
    ) {
      setPaymentError("");
    }
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
              href="/orders"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/orders"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Orders
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Order Details
                </p>

                <h1 className="mt-2 text-2xl font-bold text-slate-950">
                  {order.service.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Order ID: {order.id}
                </p>
              </div>

              <span
                className={`self-start rounded-full px-4 py-2 text-sm font-semibold ${statusClass(
                  order.status,
                )}`}
              >
                {formatStatus(order.status)}
              </span>

            </div>
          </div>

          {/* Service */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Service
            </h2>

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
                  Provider
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {order.service.provider.name}
                </p>

                <p className="text-sm text-slate-500">
                  {order.service.provider.email}
                </p>
              </div>

            </div>
          </div>

          {/* Payment */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Payment status for this order.
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {formatCurrency(order.amount)}
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Transaction status:
                {" "}
                <span className="font-semibold text-slate-900">
                  {order.transaction?.status || "NOT PAID"}
                </span>
              </p>

              {order.transaction?.paymentReference && (
               <p className="mt-1 text-xs text-slate-500">
                 Reference: {order.transaction.paymentReference}
               </p> 
                )}
            </div>

           {order.status === "PENDING" && (
  <>
    {paymentError && (
      <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
        {paymentError}
      </p>
    )}

    <button
      type="button"
      onClick={handlePayment}
      disabled={paying}
      className="mt-5 w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {paying ? "Connecting to Paystack..." : "Pay Now"}
    </button>
  </>
)}

            {order.status === "PAID" && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-700">
                Payment successful
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Order Notes
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-slate-600">
              {order.notes || "No additional notes were provided."}
            </p>
          </div>


{/* Review */}
{order.status === "COMPLETED" && (
  <div className="border-b border-slate-100 p-6 sm:p-8">
    <h2 className="text-lg font-bold text-slate-950">
      Review & Rating
    </h2>

    <p className="mt-2 text-sm text-slate-500">
      How was your experience with this service?
    </p>

    {!hasReviewed ? (
      <div className="mt-5">

        {/* Star Rating */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star);
                setReviewError("");
              }}
              className={`text-3xl transition ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-slate-300 hover:text-yellow-300"
              }`}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {rating === 0
            ? "Select a rating"
            : `${rating} out of 5 stars`}
        </p>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell us about your experience with this service..."
          rows={4}
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {reviewError && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {reviewError}
          </p>
        )}

        {reviewSuccess && (
          <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {reviewSuccess}
          </p>
        )}

        <button
          type="button"
          onClick={handleReviewSubmit}
          disabled={reviewSubmitting}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reviewSubmitting
            ? "Submitting Review..."
            : "Submit Review"}
        </button>
      </div>
    ) : (
      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-700">
          Thank you for your review!
        </p>

        <p className="mt-1 text-sm text-green-600">
          Your feedback has been submitted successfully.
        </p>
      </div>
    )}
  </div>
)}





          {/* Timeline */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-950">
              Order Timeline
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex gap-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600" />

                <div>
                  <p className="font-semibold text-slate-900">
                    Order Created
                  </p>

                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString("en-NG")}
                  </p>
                </div>
              </div>

              {order.status !== "PENDING" && (
                <div className="flex gap-4">
                  <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-green-600" />

                  <div>
                    <p className="font-semibold text-slate-900">
                      Current Status: {formatStatus(order.status)}
                    </p>

                    <p className="text-sm text-slate-500">
                      Last updated{" "}
                      {new Date(order.updatedAt).toLocaleString("en-NG")}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
