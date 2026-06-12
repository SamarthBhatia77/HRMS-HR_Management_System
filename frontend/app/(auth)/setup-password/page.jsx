"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tempPasswordParam = searchParams.get("tempPassword");
    if (emailParam) setEmail(emailParam);
    if (tempPasswordParam) setTempPassword(tempPasswordParam);
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!tempPassword) {
      setError("Temporary password is required.");
      return;
    }
    if (!newPassword) {
      setError("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/auth/setup-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          tempPassword,
          newPassword,
        }),
      });

      if (response.success) {
        setSuccess("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(response.message || "Failed to update password.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during password setup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthCard title="Password Setup Successful">
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-green-700 bg-green-50 p-4 rounded-md font-medium">
            {success}
          </p>
          <p className="text-xs text-slate-500">
            You will be redirected shortly, or click below to login.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Go to Login
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create Your Password"
      subtitle="Complete your registration by defining a new secure password."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <AuthField
          label="Email Address"
          name="email"
          type="email"
          value={email}
          disabled={!!searchParams.get("email")}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Temporary Password"
          name="tempPassword"
          type="text"
          value={tempPassword}
          disabled={!!searchParams.get("tempPassword")}
          onChange={(e) => setTempPassword(e.target.value)}
        />
        <hr className="border-slate-200 my-4" />
        <AuthField
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="Min 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <AuthField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Verify new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <Button className="w-full py-2.5" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Activating account..." : "Set Password & Activate"}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100">Loading...</div>}>
      <SetupPasswordForm />
    </Suspense>
  );
}
