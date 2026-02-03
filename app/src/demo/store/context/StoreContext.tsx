import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Product, Order, Return, Customer, StoreSettings, OrderStatus, ReturnStatus } from '../types';
import { seedProducts, seedOrders, seedReturns, seedCustomers, seedStoreSettings, generateOrderNumber, getProductInventory } from './seedData';

interface StoreContextType {
  // Store settings
  settings: StoreSettings;
  updateStoreSettings: (updates: Partial<StoreSettings['store']>) => void;
  completeSetup: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  applyDiscount: (productIds: string[], discountPercent: number) => void;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  addOrderNote: (orderId: string, note: string) => void;

  // Returns
  returns: Return[];
  createReturn: (orderId: string, items: Return['items'], notes?: string) => Return;
  updateReturnStatus: (returnId: string, status: ReturnStatus) => void;

  // Customers
  customers: Customer[];

  // Inventory
  updateInventory: (productId: string, variantId: string, quantity: number) => void;
  getLowStockProducts: () => Product[];

  // Reset
  resetStore: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [settings, setSettings] = useState<StoreSettings>(() => JSON.parse(JSON.stringify(seedStoreSettings)));
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(JSON.stringify(seedProducts)));
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(JSON.stringify(seedOrders)));
  const [returns, setReturns] = useState<Return[]>(() => JSON.parse(JSON.stringify(seedReturns)));
  const [customers] = useState<Customer[]>(() => JSON.parse(JSON.stringify(seedCustomers)));

  // Store settings
  const updateStoreSettings = useCallback((updates: Partial<StoreSettings['store']>) => {
    setSettings(prev => ({
      ...prev,
      store: { ...prev.store, ...updates },
    }));
  }, []);

  const completeSetup = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      store: { ...prev.store, isSetupComplete: true },
    }));
  }, []);

  // Products
  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date(),
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const applyDiscount = useCallback((productIds: string[], discountPercent: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (productIds.includes(p.id)) {
          const discountMultiplier = 1 - discountPercent / 100;
          return {
            ...p,
            compareAtPrice: p.compareAtPrice || p.price,
            price: Math.round(p.price * discountMultiplier * 100) / 100,
          };
        }
        return p;
      })
    );
  }, []);

  // Orders
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            trackingNumber: trackingNumber || o.trackingNumber,
            updatedAt: new Date(),
          };
        }
        return o;
      })
    );
  }, []);

  const addOrderNote = useCallback((orderId: string, note: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            notes: o.notes ? `${o.notes}\n${note}` : note,
            updatedAt: new Date(),
          };
        }
        return o;
      })
    );
  }, []);

  // Returns
  const createReturn = useCallback(
    (orderId: string, items: Return['items'], notes?: string) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      const refundAmount = items.reduce((sum, item) => {
        const orderItem = order.items.find(oi => oi.id === item.orderItemId);
        return sum + (orderItem ? orderItem.unitPrice * item.quantity : 0);
      }, 0);

      const newReturn: Return = {
        id: `ret-${Date.now()}`,
        orderId,
        orderNumber: order.orderNumber,
        items,
        status: 'requested',
        refundAmount: Math.round(refundAmount * 100) / 100,
        notes,
        createdAt: new Date(),
      };

      setReturns(prev => [newReturn, ...prev]);
      return newReturn;
    },
    [orders]
  );

  const updateReturnStatus = useCallback(
    (returnId: string, status: ReturnStatus) => {
      setReturns(prev =>
        prev.map(r => {
          if (r.id === returnId) {
            // If refunded, also update the order status
            if (status === 'refunded') {
              const ret = prev.find(x => x.id === returnId);
              if (ret) {
                updateOrderStatus(ret.orderId, 'refunded');
              }
            }
            return { ...r, status };
          }
          return r;
        })
      );
    },
    [updateOrderStatus]
  );

  // Inventory
  const updateInventory = useCallback((productId: string, variantId: string, quantity: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            variants: p.variants.map(v => (v.id === variantId ? { ...v, inventory: Math.max(0, quantity) } : v)),
          };
        }
        return p;
      })
    );
  }, []);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.status === 'active' && getProductInventory(p) < 10);
  }, [products]);

  // Reset
  const resetStore = useCallback(() => {
    setSettings(JSON.parse(JSON.stringify(seedStoreSettings)));
    setProducts(JSON.parse(JSON.stringify(seedProducts)));
    setOrders(JSON.parse(JSON.stringify(seedOrders)));
    setReturns(JSON.parse(JSON.stringify(seedReturns)));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateStoreSettings,
      completeSetup,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      applyDiscount,
      orders,
      updateOrderStatus,
      addOrderNote,
      returns,
      createReturn,
      updateReturnStatus,
      customers,
      updateInventory,
      getLowStockProducts,
      resetStore,
    }),
    [
      settings,
      updateStoreSettings,
      completeSetup,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      applyDiscount,
      orders,
      updateOrderStatus,
      addOrderNote,
      returns,
      createReturn,
      updateReturnStatus,
      customers,
      updateInventory,
      getLowStockProducts,
      resetStore,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
