"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";
import Logo from "../Logo";
import { loginApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ErrorIcon, RefreshIcon, BoltIcon, ArrowRightIcon } from "../Icons";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      setError(null);
      setLoading(true);
      setAuthStatus("Verifying credentials...");

      try {
        const res = await loginApi(value.email, value.password);
        setAuthStatus("Authentication successful! Loading dashboard...");
        login(res.token, res.user);
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid email or password";
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
      <div className="mb-4 text-center flex flex-col items-center">
        <Logo size="md" showBadge badgeText="v2.4-edge" href="/" />

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-on-surface">
          Sign In to Linkly
        </h1>

        <p className="mt-1 text-xs text-on-surface-variant max-w-xs">
          Access your real-time telemetry console and custom link routes.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 sm:p-6 shadow-xl">
        {authStatus && (
          <div className="mb-3.5 rounded-xl bg-primary-container/10 border border-primary-container/20 p-2.5 text-center text-xs font-semibold text-primary flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{authStatus}</span>
          </div>
        )}

        {error && (
          <div className="mb-3.5 rounded-xl border border-error-container bg-error-container/30 p-2.5 text-center text-xs font-semibold text-on-error-container flex items-center justify-center gap-2">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary-container hover:bg-primary py-2.5 text-xs font-bold text-on-primary shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <RefreshIcon size={18} className="animate-spin" />
            ) : (
              <ArrowRightIcon size={18} />
            )}
            <span>{loading ? "Signing in..." : "Sign In to Linkly"}</span>
          </button>
        </form>

        <div className="relative my-3.5 flex items-center justify-center">
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
          <BoltIcon size={16} />
          <span>1-Click Instant Demo Login (Jigyansh)</span>
        </button>

        <p className="mt-3.5 text-center text-xs text-on-surface-variant">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}