"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
};

export default function ProviderServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }

    loadServices();
  }, [router]);

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Service[]>(
        "/services/provider/my-services",
        {
          auth: true,
        },
      );

      setServices(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your services",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(service: Service) {
    try {
      setUpdatingId(service.id);

      const newStatus =
        service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await apiRequest(`/services/${service.id}/status`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? { ...item, status: newStatus }
            : item,
        ),
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update service status",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatPrice(price: number | string) {
    return `₦${Number(price).toLocaleString("en-NG")}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading your services...
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
              My Services
            </h1>
            <p className="mt-1 text-gray-600">
              Manage the services you offer to customers.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/provider/dashboard"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </Link>

            <Link
              href="/provider/services/new"
              className="rounded-lg bg-black px-5 py-2 font-medium text-white hover:bg-gray-800"
            >
              + Add Service
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {services.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              No services yet
            </h2>

            <p className="mt-2 text-gray-600">
              Add your first service so customers can discover what you offer.
            </p>

            <Link
              href="/provider/services/new"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {service.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {service.category}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      service.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                <p className="mb-5 line-clamp-3 text-sm text-gray-600">
                  {service.description}
                </p>

                <div className="mb-5 text-2xl font-bold text-gray-900">
                  {formatPrice(service.price)}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/provider/services/${service.id}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => toggleStatus(service)}
                    disabled={updatingId === service.id}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                      service.status === "ACTIVE"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {updatingId === service.id
                      ? "Updating..."
                      : service.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
