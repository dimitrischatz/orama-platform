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
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-white"
          >
            Orama
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#111114] p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-lg font-semibold text-white">
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
