"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, getStoredUser, logout } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
};

function EyeIcon({ hidden = false }: { hidden?: boolean }) {
  return hidden ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c7 0 10 8 10 8a17.4 17.4 0 0 1-2.1 3.4" />
      <path d="M6.6 6.6C3.9 8.4 2 12 2 12s3 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    setUser(storedUser);
    setFullName(storedUser.name || "");
    setEmail(storedUser.email || "");
    setPhone(storedUser.phone || "");

    async function loadProfile() {
      try {
        const data = await apiRequest<{
          user: User;
        }>("/auth/profile", {
          auth: true,
        });

        setUser(data.user);
        setFullName(data.user.name || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");

        localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        // Keep the locally stored user if the profile request fails.
      }
    }

    loadProfile();
  }, [router]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");
    setProfileLoading(true);

    try {
      const data = await apiRequest<{
        message: string;
        user: User;
      }>("/auth/profile", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
        }),
      });

      setUser(data.user);
      setFullName(data.user.name);
      setEmail(data.user.email);
      setPhone(data.user.phone || "");

      localStorage.setItem("user", JSON.stringify(data.user));

      setProfileMessage(data.message);
    } catch (err) {
      setProfileError(
        err instanceof Error
          ? err.message
          : "Unable to update profile",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const data = await apiRequest<{
        message: string;
      }>("/auth/change-password", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setPasswordMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Unable to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50" />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
              F
            </div>

            <span className="text-xl font-bold">
              FeeqTech <span className="text-blue-600">Innovation Network</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the information associated with your account.
              </p>
            </div>

            {profileError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {profileMessage}
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>

                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your phone number"
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-sm text-slate-500">
                  Account role:{" "}
                  <span className="font-semibold text-slate-700">
                    {user.role}
                  </span>
                </span>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          {/* Change Password */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your account secure by using a strong password.
              </p>
            </div>

            {passwordError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {passwordMessage}
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current password
                </label>

                <div className="relative">
                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={8}
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 px-4 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword,
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <EyeIcon hidden={showCurrentPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New password
                </label>

                <div className="relative">
                  <input
                    type={
                      showNewPassword ? "text" : "password"
                    }
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 px-4 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <EyeIcon hidden={showNewPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-slate-200 px-4 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <EyeIcon hidden={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordLoading
                    ? "Updating..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
