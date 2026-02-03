import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { StatusBadge } from '../components/StatusBadge';
import type { OrderStatus } from '../types';

type StatusFilter = 'all' | OrderStatus;

export function OrdersPage() {
  const { orders, settings, updateOrderStatus } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const initialStatus = (searchParams.get('status') as StatusFilter) || 'all';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesSearch =
          search === '' ||
          order.orderNumber.includes(search) ||
          order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, statusFilter]);

  const formatCurrency = (amount: number) => {
    const symbol = settings.store.currency === 'EUR' ? '€' : settings.store.currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const statuses: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  const quickAction = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
      pending: 'paid',
      paid: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    };

    const next = nextStatus[currentStatus];
    if (next) {
      return (
        <button
          data-orama-id={`quick-action-${orderId}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateOrderStatus(orderId, next);
          }}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Mark as {next}
        </button>
      );
    }
    return null;
  };

  return (
    <div data-orama-id="orders-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">{orders.length} total orders</p>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex overflow-x-auto">
          {statuses.map(status => (
            <button
              key={status.value}
              data-orama-id={`order-status-tab-${status.value}`}
              onClick={() => handleStatusFilterChange(status.value)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                statusFilter === status.value
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {status.label}
              {statusCounts[status.value] !== undefined && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === status.value
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {statusCounts[status.value] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            data-orama-id="order-search-input"
            placeholder="Search by order number, customer name, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    {search || statusFilter !== 'all'
                      ? 'No orders match your filters'
                      : 'No orders yet'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50" data-orama-id={`order-row-${order.orderNumber}`}>
                    <td className="px-4 py-4">
                      <Link
                        to={`/demo/store/orders/${order.id}`}
                        data-orama-id={`order-link-${order.orderNumber}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {quickAction(order.id, order.status)}
                        <Link
                          to={`/demo/store/orders/${order.id}`}
                          data-orama-id={`view-order-${order.orderNumber}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
