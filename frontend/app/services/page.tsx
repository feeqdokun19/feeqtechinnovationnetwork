"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Service[]>("/services");

      setServices(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load services.",
      );
    } finally {
      setLoading(false);
    }
  }

  const activeServices = services.filter(
    (service) => service.status === "ACTIVE",
  );

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        activeServices
          .map((service) => service.category)
          .filter(Boolean),
      ),
    ).sort();
  }, [activeServices]);

  const filteredServices = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return activeServices.filter((service) => {
      const matchesCategory =
        category === "ALL" ||
        service.category === category;

      const matchesSearch =
        !searchTerm ||
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [activeServices, search, category]);

  function formatPrice(price: number | string) {
    return `₦${Number(price).toLocaleString("en-NG")}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            Loading available services...
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
              Find a Service
            </h1>

            <p className="mt-1 text-gray-600">
              Find trusted service providers for what you need.
            </p>
          </div>

          <Link
            href="/dashboard"
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

        <div className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">

            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Search services
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search laptop repair, cleaning, plumbing..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="ALL">
                  All Categories
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredServices.length} service
            {filteredServices.length === 1 ? "" : "s"}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              No services found
            </h2>

            <p className="mt-2 text-gray-600">
              Try another search term or select a different category.
            </p>

            {(search || category !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("ALL");
                }}
                className="mt-6 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {service.title}
                    </h2>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      AVAILABLE
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    {service.category}
                  </p>
                </div>

                <p className="mb-5 line-clamp-4 flex-1 text-sm leading-6 text-gray-600">
                  {service.description}
                </p>

                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Starting Price
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatPrice(service.price)}
                  </p>
                </div>

                {service.provider && (
                  <div className="mb-5 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Service Provider
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {service.provider.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {service.provider.email}
                    </p>
                  </div>
                )}

                <Link
                  href={`/services/${service.id}`}
                  className="rounded-lg bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
                >
                  View Service
                </Link>
              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}
