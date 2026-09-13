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
import { ErrorIcon, RefreshIcon, PlusIcon, BoltIcon } from "../Icons";

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
        <Logo size="md" href="/" />

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-on-surface">
          Create an account
        </h1>

        <p className="mt-1 text-xs text-on-surface-variant max-w-xs">
          Start shortening links and tracking analytics in seconds.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-md">
        {authStatus && (
          <div className="mb-4 rounded-xl bg-primary-container/10 border border-primary-container/20 p-2.5 text-center text-xs font-semibold text-primary flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>{authStatus}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-error-container bg-error-container/30 p-2.5 text-center text-xs font-semibold text-on-error-container flex items-center justify-center gap-2">
            <ErrorIcon size={16} className="text-error" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-3.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form.Field name="name">
              {(field) => (
                <AuthInput
                  field={field}
                  name="name"
                  label="Full Name"
                  type="text"
                  placeholder="Your Name"
                />
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <AuthInput
                  field={field}
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                />
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary-container hover:bg-primary py-2.5 text-xs font-bold text-on-primary shadow-xs transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <RefreshIcon size={18} className="animate-spin" />
            ) : (
              <PlusIcon size={18} />
            )}
            <span>{loading ? "Creating account..." : "Create Account"}</span>
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-on-surface-variant">
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