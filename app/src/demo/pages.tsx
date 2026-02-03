// Demo page wrappers for Wasp routing
// Root providers (OramaProvider + Context) are now in App.tsx to persist across navigations

import React from 'react';

// CRM imports
import { DemoCRMLayout } from './crm/DemoCRMLayout';
import { DemoCRMDashboard } from './crm/DemoCRMDashboard';
import { ContactsPage } from './crm/contacts/ContactsPage';
import { CompaniesPage } from './crm/companies/CompaniesPage';
import { DealsPage } from './crm/deals/DealsPage';
import { ActivitiesPage } from './crm/activities/ActivitiesPage';
import { CRMDocsPage } from './crm/docs/CRMDocsPage';

// Store imports
import {
  DemoStoreDashboardPage as StoreDashboard,
  DemoStoreProductsPage as StoreProducts,
  DemoStoreProductNewPage as StoreProductNew,
  DemoStoreProductEditPage as StoreProductEdit,
  DemoStoreOrdersPage as StoreOrders,
  DemoStoreOrderDetailPage as StoreOrderDetail,
  DemoStoreInventoryPage as StoreInventory,
  DemoStoreSettingsPage as StoreSettings,
} from './store/pages';

// Landing page
export { default as DemoLandingPage } from './OramaDemoLandingPage';

// ─── CRM Pages ───────────────────────────────────────────────────────────────

export function DemoCRMDashboardPage() {
  return (
    <DemoCRMLayout>
      <DemoCRMDashboard />
    </DemoCRMLayout>
  );
}

export function DemoCRMContactsPage() {
  return (
    <DemoCRMLayout>
      <ContactsPage />
    </DemoCRMLayout>
  );
}

export function DemoCRMCompaniesPage() {
  return (
    <DemoCRMLayout>
      <CompaniesPage />
    </DemoCRMLayout>
  );
}

export function DemoCRMDealsPage() {
  return (
    <DemoCRMLayout>
      <DealsPage />
    </DemoCRMLayout>
  );
}

export function DemoCRMActivitiesPage() {
  return (
    <DemoCRMLayout>
      <ActivitiesPage />
    </DemoCRMLayout>
  );
}

export function DemoCRMDocsPageWrapper() {
  return (
    <DemoCRMLayout>
      <CRMDocsPage />
    </DemoCRMLayout>
  );
}

// ─── Store Pages ─────────────────────────────────────────────────────────────
// These are re-exported directly - DemoStoreRoot is now in App.tsx

export {
  StoreDashboard as DemoStoreDashboardPage,
  StoreProducts as DemoStoreProductsPage,
  StoreProductNew as DemoStoreProductNewPage,
  StoreProductEdit as DemoStoreProductEditPage,
  StoreOrders as DemoStoreOrdersPage,
  StoreOrderDetail as DemoStoreOrderDetailPage,
  StoreInventory as DemoStoreInventoryPage,
  StoreSettings as DemoStoreSettingsPage,
};
