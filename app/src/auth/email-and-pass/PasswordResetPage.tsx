import { useState, FormEvent } from "react";
import { useLocation } from "react-router";
import { resetPassword } from "wasp/client/auth";
import { Link, routes } from "wasp/client/router";
import { AuthPageLayout } from "../AuthPageLayout";

const inputClass =
  "w-full rounded-lg border border-white/[0.07] bg-[#18181c] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

export function PasswordResetPage() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, password });
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
        title="Password reset"
        subtitle="Your password has been updated successfully."
        footer={
          <Link to={routes.LoginRoute.to} className="text-orange-500 hover:text-orange-600">
            Sign in with your new password
          </Link>
        }
      >
        <div />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Set new password"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-200">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-zinc-200">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
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
          {isLoading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthPageLayout>
  );
}
