import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthPageLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white"
          >
            Orama
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-zinc-500">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {footer && (
          <div className="mt-4 text-center text-sm text-zinc-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
