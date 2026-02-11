import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "wasp/client/auth";
import { Link, routes } from "wasp/client/router";
import { AuthPageLayout } from "./AuthPageLayout";

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signup({ email, password } as any);
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
        subtitle="We've sent a verification link to your email address. Please verify to continue."
        footer={
          <>
            Already verified?{" "}
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
      title="Create an account"
      footer={
        <>
          Already have an account?{" "}
          <Link to={routes.LoginRoute.to} className="text-orange-500 hover:text-orange-600">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-200">
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

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-full bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthPageLayout>
  );
}
