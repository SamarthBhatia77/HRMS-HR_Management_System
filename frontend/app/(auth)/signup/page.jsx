"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { AuthField, AuthSelect, AuthTextarea } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { loginUser, readFileAsDataUrl, registerUser } from "@/lib/auth-storage";

const initialForm = {
  fullName: "",
  username: "",
  mobileNumber: "",
  address: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const mobileNumber = form.mobileNumber.trim();
    const address = form.address.trim();
    const email = form.email.trim();

    if (!fullName) {
      setError("Full name is required.");
      return;
    }

    if (!username) {
      setError("Username is required.");
      return;
    }

    if (!mobileNumber) {
      setError("Mobile number is required.");
      return;
    }

    if (!address) {
      setError("Address is required.");
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }

    if (!form.gender) {
      setError("Please select a gender.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      let image = null;

      if (imageFile) {
        image = await readFileAsDataUrl(imageFile);
      }

      const user = {
        fullName,
        username,
        mobileNumber,
        address,
        email,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        image,
        password: form.password,
      };

      registerUser(user);
      loginUser(username, form.password);
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Sign up"
      subtitle="Create your HRMS account to get started."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <AuthField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="John Doe"
          value={form.fullName}
          onChange={updateField("fullName")}
        />
        <AuthField
          label="Username"
          name="username"
          autoComplete="username"
          placeholder="john.doe"
          value={form.username}
          onChange={updateField("username")}
        />
        <AuthField
          label="Mobile number"
          name="mobileNumber"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 0100"
          value={form.mobileNumber}
          onChange={updateField("mobileNumber")}
        />
        <AuthTextarea
          label="Address"
          name="address"
          autoComplete="street-address"
          placeholder="Street, city, state, postal code"
          value={form.address}
          onChange={updateField("address")}
        />
        <AuthField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="john.doe@company.com"
          value={form.email}
          onChange={updateField("email")}
        />
        <AuthField
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={updateField("dateOfBirth")}
        />
        <AuthSelect label="Gender" name="gender" value={form.gender} onChange={updateField("gender")}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </AuthSelect>
        <AuthField label="Profile image (optional)" name="image" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={form.password}
          onChange={updateField("password")}
        />
        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
        />
        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <Button className="w-full py-2.5" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
