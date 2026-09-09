"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Service = {
  id: string;
  title: string;
  description: string;
  price: string | number;
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

const categories = [
  {
    name: "Computer Services",
    icon: "💻",
    description: "Repairs, installations & maintenance",
  },
  {
    name: "Web Development",
    icon: "🌐",
    description: "Websites, apps & digital solutions",
  },
  {
    name: "Graphics & Design",
    icon: "🎨",
    description: "Logos, flyers & creative designs",
  },
  {
    name: "Home Services",
    icon: "🏠",
    description: "Cleaning, repairs & maintenance",
  },
  {
    name: "Photography",
    icon: "📸",
    description: "Events, portraits & product photos",
  },
  {
    name: "Business Services",
    icon: "💼",
    description: "Professional services for businesses",
  },
];

function formatPrice(price: string | number) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return `₦${price}`;
  }

  return `₦${numericPrice.toLocaleString("en-NG")}`;
}

function getServiceIcon(category: string) {
  switch (category.toLowerCase()) {
    case "computer services":
      return "💻";
    case "web development":
      return "🌐";
    case "graphics & design":
      return "🎨";
    case "home services":
      return "🏠";
    case "photography":
      return "📸";
    case "business services":
      return "💼";
    default:
      return "🛠️";
  }
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest<Service[]>("/services");

        setServices(data);
      } catch (err) {
        console.error("Failed to load services:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load services",
        );
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  const filteredServices = services.filter((service) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      service.title.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.provider?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              F
            </div>

            <span className="text-lg font-bold tracking-tight sm:text-xl">
              FeeqTech{" "}
              <span className="text-blue-600">
                Innovation Network
              </span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Find Services
            </a>

            <a
              href="#categories"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Categories
            </a>

            <a
              href="#providers"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Become a Provider
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:block"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <span>✨</span>
              Find trusted professionals near you
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Find the right service.
              <span className="block text-blue-600">
                Get the job done.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              FeeqTech Innovation Network connects you with trusted
              service providers for everything from technology and
              business services to home and creative services.
            </p>

            {/* Search */}
            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What service are you looking for?"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <a
                href="#services"
                className="flex h-14 items-center justify-center rounded-xl bg-blue-600 px-7 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Search Services
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              [services.length.toString(), "Active Services"],
              [
                new Set(
                  services.map((service) => service.providerId),
                ).size.toString(),
                "Service Providers",
              ],
              [
                new Set(
                  services.map((service) => service.category),
                ).size.toString(),
                "Categories",
              ],
              ["4.9/5", "Average Rating"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
              >
                <div className="text-2xl font-bold text-slate-950">
                  {loading ? "—" : value}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Browse by category
            </h2>

            <p className="mt-2 text-slate-600">
              Find professionals offering the service you need.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setSearch(category.name);

                setTimeout(() => {
                  document
                    .getElementById("services")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }, 50);
              }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {category.icon}
                </div>

                <span className="text-slate-300 transition group-hover:text-blue-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-semibold text-slate-950">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {category.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Popular services
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Services you can book
            </h2>

            <p className="mt-2 text-slate-600">
              Discover professionals ready to help you get things done.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="h-40 bg-slate-100" />

                  <div className="space-y-4 p-6">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-12 rounded bg-slate-100" />
                    <div className="h-5 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="text-4xl">⚠️</div>

              <h3 className="mt-4 font-semibold text-red-900">
                Unable to load services
              </h3>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading &&
            !error &&
            filteredServices.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="text-4xl">🔎</div>

                <h3 className="mt-4 font-semibold">
                  No services found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try searching for another service or category.
                </p>

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

          {/* Real Services */}
          {!loading &&
            !error &&
            filteredServices.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <article
                    key={service.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                      <span className="text-6xl">
                        {getServiceIcon(service.category)}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {service.category}
                      </div>

                      <h3 className="mt-2 text-xl font-bold text-slate-950">
                        {service.title}
                      </h3>

                      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                        {service.description}
                      </p>

                      {/* Provider */}
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {(
                            service.provider?.name || "P"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="text-xs text-slate-400">
                            Provider
                          </div>

                          <div className="font-medium text-slate-800">
                            {service.provider?.name ||
                              "Service Provider"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">★</span>

                        <span className="font-semibold">
                          New
                        </span>

                        <span className="text-slate-400">
                          Service
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">
                        <div>
                          <div className="text-xs text-slate-500">
                            Starting from
                          </div>

                          <div className="mt-1 text-xl font-bold text-slate-950">
                            {formatPrice(service.price)}
                          </div>
                        </div>

                        <a
                          href={`/services/${service.id}`}
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          View Service
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* Provider CTA */}
      <section
        id="providers"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-8"
      >
        <div className="overflow-hidden rounded-3xl bg-slate-950 px-8 py-14 text-white sm:px-14 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              For service providers
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Turn your skills into a business.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-300">
              Create your provider profile, publish your services,
              receive orders, accept payments and build your reputation
              through customer reviews.
            </p>
          </div>

          <a
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-500 lg:mt-0"
          >
            Become a Provider →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            © {new Date().getFullYear()} FeeqTech Innovation Network.
            All rights reserved.
          </div>

          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600">
              About
            </a>

            <a href="#" className="hover:text-blue-600">
              Contact
            </a>

            <a href="#" className="hover:text-blue-600">
              Terms
            </a>

            <a href="#" className="hover:text-blue-600">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
