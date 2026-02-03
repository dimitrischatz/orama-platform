// Page wrapper components for Wasp routing
// Each page wraps its content with the DemoStoreLayout

import React from 'react';
import { DemoStoreLayout } from './DemoStoreLayout';
import { DemoStoreDashboard } from './DemoStoreDashboard';
import { ProductsPage } from './products/ProductsPage';
import { ProductForm } from './products/ProductForm';
import { OrdersPage } from './orders/OrdersPage';
import { OrderDetail } from './orders/OrderDetail';
import { InventoryPage } from './inventory/InventoryPage';
import { SettingsPage } from './settings/SettingsPage';

export function DemoStoreDashboardPage() {
  return (
    <DemoStoreLayout>
      <DemoStoreDashboard />
    </DemoStoreLayout>
  );
}

export function DemoStoreProductsPage() {
  return (
    <DemoStoreLayout>
      <ProductsPage />
    </DemoStoreLayout>
  );
}

export function DemoStoreProductNewPage() {
  return (
    <DemoStoreLayout>
      <ProductForm />
    </DemoStoreLayout>
  );
}

export function DemoStoreProductEditPage() {
  return (
    <DemoStoreLayout>
      <ProductForm />
    </DemoStoreLayout>
  );
}

export function DemoStoreOrdersPage() {
  return (
    <DemoStoreLayout>
      <OrdersPage />
    </DemoStoreLayout>
  );
}

export function DemoStoreOrderDetailPage() {
  return (
    <DemoStoreLayout>
      <OrderDetail />
    </DemoStoreLayout>
  );
}

export function DemoStoreInventoryPage() {
  return (
    <DemoStoreLayout>
      <InventoryPage />
    </DemoStoreLayout>
  );
}

export function DemoStoreSettingsPage() {
  return (
    <DemoStoreLayout>
      <SettingsPage />
    </DemoStoreLayout>
  );
}
