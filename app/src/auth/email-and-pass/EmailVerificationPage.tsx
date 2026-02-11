import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { verifyEmail } from "wasp/client/auth";
import { Link, routes } from "wasp/client/router";
import { AuthPageLayout } from "../AuthPageLayout";

export function EmailVerificationPage() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing verification token.");
      setStatus("error");
      return;
    }

    verifyEmail({ token })
      .then(() => setStatus("success"))
      .catch((e: any) => {
        setError(e.message || "Verification failed.");
        setStatus("error");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <AuthPageLayout title="Verifying email" subtitle="Please wait...">
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
        </div>
      </AuthPageLayout>
    );
  }

  if (status === "error") {
    return (
      <AuthPageLayout
        title="Verification failed"
        subtitle={error}
        footer={
          <Link to={routes.LoginRoute.to} className="text-orange-500 hover:text-orange-600">
            Back to Sign in
          </Link>
        }
      >
        <div />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      title="Email verified"
      subtitle="Your email has been verified successfully. You can now sign in."
      footer={
        <Link to={routes.LoginRoute.to} className="text-orange-500 hover:text-orange-600">
          Sign in
        </Link>
      }
    >
      <div />
    </AuthPageLayout>
  );
}
