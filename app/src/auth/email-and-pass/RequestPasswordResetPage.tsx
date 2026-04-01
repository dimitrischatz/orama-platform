import { useState, FormEvent } from "react";
import { requestPasswordReset } from "wasp/client/auth";
import { Link, routes } from "wasp/client/router";
import { AuthPageLayout } from "../AuthPageLayout";

const inputClass =
  "w-full rounded-lg border border-white/[0.07] bg-[#18181c] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

export function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await requestPasswordReset({ email });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthPageLayout
        title="Check your email"
        subtitle="If an account exists with that email, we've sent password reset instructions."
        footer={
          <>
            Back to{" "}
            <Link to={routes.LoginRoute.to} className="text-orange-500 hover:text-orange-600">
              Sign in
            </Link>
          </>
        }
      >
        <div />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Reset password"
      footer={
        <>
          Remember your password?{" "}
          <Link to={routes.LoginRoute.to} className="text-orange-500 hover:text-orange-600">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-full bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthPageLayout>
  );
}
