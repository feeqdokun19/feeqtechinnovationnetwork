"use client";

import { FormEvent, useEffect, useState } from "react";
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
};

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();

  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "PROVIDER") {
      router.push("/login");
      return;
    }

    loadService();
  }, [router, serviceId]);

  async function loadService() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Service>(
        `/services/${serviceId}`,
      );

      setService(data);

      setTitle(data.title);
      setDescription(data.description);
      setPrice(String(data.price));
      setCategory(data.category);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter a service title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a service description.");
      return;
    }

    if (!category.trim()) {
      setError("Please enter a service category.");
      return;
    }

    const numericPrice = Number(price);

    if (!price || Number.isNaN(numericPrice) || numericPrice < 0) {
      setError("Please enter a valid service price.");
      return;
    }

    try {
      setSaving(true);

      await apiRequest(`/services/${serviceId}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: numericPrice,
          category: category.trim(),
        }),
      });

      router.push("/provider/services");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading service...
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h1 className="text-xl font-semibold text-gray-900">
              Service not found
            </h1>

            {error && (
              <p className="mt-3 text-red-600">
                {error}
              </p>
            )}

            <Link
              href="/provider/services"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white"
            >
              Back to My Services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <Link
            href="/provider/services"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to My Services
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Edit Service
          </h1>

          <p className="mt-1 text-gray-600">
            Update your service information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Service Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category
              </label>

              <input
                id="category"
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Price (₦)
              </label>

              <input
                id="price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                disabled={saving}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
              />
            </div>

          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/provider/services"
              className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
