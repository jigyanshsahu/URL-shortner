"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";
import Logo from "../Logo";
import { registerApi, loginApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegisterFormValues,

    validators: {
      onSubmit: registerSchema,
    },

    onSubmit: async ({ value }) => {
      setError(null);
      setLoading(true);
      setAuthStatus("Creating your Linkly developer account...");

      try {
        await registerApi(value.name, value.email, value.password);
        setAuthStatus("Account created! Initializing session...");

        const loginRes = await loginApi(value.email, value.password);
        login(loginRes.token, loginRes.user);

        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        setAuthStatus(null);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDemoLogin = () => {
    setAuthStatus("Initializing demo session...");
    loginAsDemo();
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Header */}
      <div className="mb-6 text-center flex flex-col items-center">
        <Logo size="lg" showBadge badgeText="v2.4-edge" href="/" />

        <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
          Create Linkly Account
        </h1>

        <p className="mt-1.5 text-xs text-on-surface-variant max-w-xs">
          Deploy lightning-fast URL redirects and track click telemetry instantly.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:p-8 shadow-xl">
        {authStatus && (
          <div className="mb-5 rounded-xl bg-primary-container/10 border border-primary-container/20 p-3 text-center text-xs font-semibold text-primary flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{authStatus}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-error-container bg-error-container/30 p-3 text-center text-xs font-semibold text-on-error-container flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-error">error</span>
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <AuthInput
                field={field}
                name="name"
                label="Full Name"
                type="text"
                placeholder="Alex Developer"
              />
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <AuthInput
                field={field}
                name="email"
                label="Work Email"
                type="email"
                placeholder="developer@company.com"
              />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <AuthInput
                field={field}
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
              />
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <AuthInput
                field={field}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
              />
            )}
          </form.Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary-container hover:bg-primary py-3 text-xs font-bold text-on-primary shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? "sync" : "person_add"}
            </span>
            <span>{loading ? "Registering..." : "Create Developer Account"}</span>
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-outline-variant/30" />
          <span className="absolute bg-surface-container-lowest px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-outline">
            Quick Exploration
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary-container/30 bg-primary-container/10 py-2.5 text-xs font-bold text-primary hover:bg-primary-container/20 transition"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>1-Click Instant Demo Login (Jigyansh)</span>
        </button>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}