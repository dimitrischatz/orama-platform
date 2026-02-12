import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { routes } from "wasp/client/router";
import { Toaster } from "../client/components/ui/toaster";
import "./Main.css";
import NavBar from "./components/NavBar/NavBar";
import {
  demoNavigationitems,
  marketingNavigationItems,
} from "./components/NavBar/constants";
import CookieConsentBanner from "./components/cookie-consent/Banner";
import { DashboardLayout } from "../platform/layout/DashboardLayout";
import { DemoStoreRoot } from "../demo/store/DemoStoreRoot";
import { DemoCRMRoot } from "../demo/crm/DemoCRMRoot";

export default function App() {
  const location = useLocation();

  const isMarketingPage = useMemo(() => {
    return location.pathname.startsWith("/pricing");
  }, [location]);

  const isDashboard = useMemo(() => {
    return (
      location.pathname === "/" ||
      location.pathname.startsWith("/projects") ||
      location.pathname.startsWith("/usage") ||
      location.pathname.startsWith("/keys") ||
      location.pathname.startsWith("/account")
    );
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith("/admin");
  }, [location]);

  const isDemoStore = useMemo(() => {
    return location.pathname.startsWith("/demo/store");
  }, [location]);

  const isDemoCRM = useMemo(() => {
    return location.pathname.startsWith("/demo/crm");
  }, [location]);

  const navigationItems = isMarketingPage
    ? marketingNavigationItems
    : demoNavigationitems;


  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  // Demo routes use early returns to ensure providers stay mounted
  if (isDemoStore) {
    return (
      <DemoStoreRoot>
        <Outlet />
      </DemoStoreRoot>
    );
  }

  if (isDemoCRM) {
    return (
      <DemoCRMRoot>
        <Outlet />
      </DemoCRMRoot>
    );
  }

  return (
    <>
      <div className="bg-background text-foreground min-h-screen">
        {isDashboard ? (
          <DashboardLayout />
        ) : isAdminDashboard ? (
          <Outlet />
        ) : (
          <>
            <div className="mx-auto max-w-screen-2xl">
              <Outlet />
            </div>
          </>
        )}
      </div>
      <Toaster position="bottom-right" />
      <CookieConsentBanner />
    </>
  );
}
