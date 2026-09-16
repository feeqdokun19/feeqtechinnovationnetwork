"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredUser } from "@/lib/api";

type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

type VerificationResponse = {
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  latestRequest: {
    id: string;
    status: VerificationStatus;
    submittedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null;
};

const statusConfig: Record<
  VerificationStatus,
  {
    label: string;
    description: string;
    className: string;
  }
> = {
  UNVERIFIED: {
    label: "Not verified",
    description:
      "Your account has not been submitted for verification yet.",
    className: "bg-gray-100 text-gray-700",
  },
  PENDING: {
    label: "Verification pending",
    description:
      "Your verification request has been submitted and is awaiting review.",
    className: "bg-yellow-100 text-yellow-800",
  },
  VERIFIED: {
    label: "Verified",
    description:
      "Your account has been successfully verified.",
    className: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Verification rejected",
    description:
      "Your previous verification request was not approved.",
    className: "bg-red-100 text-red-800",
  },
};

export default function VerificationPage() {
  const router = useRouter();

  const [verification, setVerification] =
    useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      router.push("/login");
      return;
    }

    loadVerification();
  }, [router]);

  async function loadVerification() {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest<VerificationResponse>(
          "/auth/verification",
          {
            auth: true,
          },
        );

      setVerification(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load verification status.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitVerification() {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = await apiRequest<{
        message: string;
        verificationStatus: VerificationStatus;
        request: {
          id: string;
          status: VerificationStatus;
          submittedAt: string;
        };
      }>("/auth/verification/submit", {
        method: "POST",
        auth: true,
      });

      setSuccess(data.message);

      await loadVerification();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit verification request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-56 rounded bg-gray-200" />
            <div className="h-4 w-96 max-w-full rounded bg-gray-200" />
            <div className="h-64 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  const status =
    verification?.verificationStatus ?? "UNVERIFIED";

  const config = statusConfig[status];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Account Verification
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Verify your account to build trust with customers and
            service providers on FeeqTech Innovation Network.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Verification status
              </p>

              <h2 className="mt-2 text-xl font-semibold text-gray-900">
                {config.label}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                {config.description}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${config.className}`}
            >
              {config.label}
            </span>
          </div>

          {status === "UNVERIFIED" && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Why verify your account?
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-lg">✓</div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Build trust
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Show other users that your account has been
                    reviewed.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-lg">🛡</div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Improve safety
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Verification helps us maintain a trusted
                    marketplace.
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-lg">★</div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Better visibility
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    Verified accounts can build stronger credibility
                    over time.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={submitVerification}
                disabled={submitting}
                className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit for Verification"}
              </button>
            </div>
          )}

          {status === "PENDING" && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="rounded-xl bg-yellow-50 p-5">
                <h3 className="text-sm font-semibold text-yellow-900">
                  Your request is under review
                </h3>

                <p className="mt-2 text-sm leading-6 text-yellow-800">
                  Our verification team will review your request.
                  You will be notified when a decision has been made.
                </p>

                {verification?.latestRequest?.submittedAt && (
                  <p className="mt-3 text-xs text-yellow-700">
                    Submitted{" "}
                    {new Date(
                      verification.latestRequest.submittedAt,
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === "VERIFIED" && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="rounded-xl bg-green-50 p-5">
                <h3 className="text-sm font-semibold text-green-900">
                  Your account is verified
                </h3>

                <p className="mt-2 text-sm leading-6 text-green-800">
                  Your account has been successfully verified on
                  FeeqTech Innovation Network.
                </p>

                {verification?.verifiedAt && (
                  <p className="mt-3 text-xs text-green-700">
                    Verified{" "}
                    {new Date(
                      verification.verifiedAt,
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="rounded-xl bg-red-50 p-5">
                <h3 className="text-sm font-semibold text-red-900">
                  Verification was not approved
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-800">
                  Please review the reason below and submit a new
                  verification request when you are ready.
                </p>

                {verification?.latestRequest?.rejectionReason && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Reason
                    </p>
                    <p className="mt-1 text-sm text-gray-800">
                      {
                        verification.latestRequest
                          .rejectionReason
                      }
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submitVerification}
                  disabled={submitting}
                  className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Again"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}