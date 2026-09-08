"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getStoredUser } from "@/lib/api";

type Service = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  category: string;
  status: "ACTIVE" | "INACTIVE";
  providerId: string;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    name: string;
    email: string;
  };
};

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  async function loadService() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Service>(
        `/services/${serviceId}`,
      );

      setService(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load service.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOrder() {
    const user = getStoredUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "CUSTOMER") {
      setError("Only customers can place service orders.");
      return;
    }

    try {
      setOrdering(true);
      setError("");

      const order = await apiRequest<{
        id: string;
      }>("/orders", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          serviceId,
          notes: notes.trim() || undefined,
        }),
      });

     router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place order.",
      );
    } finally {
      setOrdering(false);
    }
  }

  function formatPrice(price: number | string) {
    return `₦${Number(price).toLocaleString("en-NG")}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            Loading service...
          </div>
        </div>
      </main>
    );
  }

  if (error && !service) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>

            <Link
              href="/services"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/services"
            className="font-medium text-gray-700 hover:text-black"
          >
            ← Back to Services
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {service.category}
              </span>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                {service.title}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Starting Price
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {formatPrice(service.price)}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Service Description
            </h2>

            <p className="whitespace-pre-wrap leading-7 text-gray-600">
              {service.description}
            </p>
          </div>

          {service.provider && (
            <div className="mb-8 rounded-xl bg-gray-50 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Service Provider
              </h2>

              <p className="mt-2 font-medium text-gray-900">
                {service.provider.name}
              </p>

              <p className="text-sm text-gray-500">
                {service.provider.email}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Order This Service
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Add any special instructions or notes for the provider.
            </p>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes..."
              rows={5}
              className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />

            <button
              onClick={handleOrder}
              disabled={ordering || service.status !== "ACTIVE"}
              className="mt-4 w-full rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ordering ? "Placing Order..." : "Order This Service"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
