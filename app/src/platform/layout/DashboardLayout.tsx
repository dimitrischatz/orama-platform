import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../client/components/ui/sheet";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen font-['Inter',sans-serif]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="ml-4 text-sm font-bold tracking-tight">orama</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
