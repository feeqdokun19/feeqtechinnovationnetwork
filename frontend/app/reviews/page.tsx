"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, getStoredUser } from "@/lib/api";

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    category: string;
  };
};

export default function ReviewsPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "CUSTOMER") {
      if (user.role === "PROVIDER") {
        router.replace("/provider/dashboard");
      } else {
        router.replace("/");
      }

      return;
    }

    async function loadReviews() {
      try {
        const data = await apiRequest<Review[]>(
          "/reviews/my-reviews",
          {
            auth: true,
          },
        );

        setReviews(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your reviews.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [router]);

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-xl text-yellow-400"
                : "text-xl text-slate-300"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            Loading your reviews...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              F
            </div>

            <span className="text-xl font-bold tracking-tight">
              FeeqTech <span className="text-blue-600">Innovation Network</span>
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Customer Reviews
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            My Reviews
          </h1>

          <p className="mt-2 text-slate-600">
            View the feedback you have submitted for services.
          </p>
        </div>

        {/* Empty state */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">⭐</div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No reviews yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Complete a service order and share your experience by
              leaving a rating and review.
            </p>

            <Link
              href="/orders"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      {review.service.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {review.service.category}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    {renderStars(review.rating)}

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-600">
                      "{review.comment}"
                    </p>
                  </div>
                )}

                <Link
                  href={`/services/${review.service.id}`}
                  className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View Service →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
