import { Link, useLocation } from "react-router-dom";
import { useAuth, logout } from "wasp/client/auth";
import { routes } from "wasp/client/router";
import { FolderKanban, Key, LogOut, Settings, X } from "lucide-react";
import { cn } from "../../client/utils";

const navItems = [
  {
    label: "Projects",
    to: routes.DashboardRoute.to,
    icon: FolderKanban,
    match: "/dashboard",
  },
  {
    label: "API Keys",
    to: routes.ApiKeysRoute.to,
    icon: Key,
    match: "/dashboard/keys",
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { data: user } = useAuth();

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.match === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/dashboard/projects")
      );
    }
    return location.pathname.startsWith(item.match);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
        <Link
          to={routes.DashboardRoute.to}
          className="text-lg font-bold tracking-tight text-white"
          onClick={onClose}
        >
          Orama
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item)
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / User */}
      <div className="border-t border-zinc-800 p-4">
        {user && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                {(user.email ?? "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Link
                to={routes.AccountRoute.to}
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
              <button
                onClick={() => logout()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
