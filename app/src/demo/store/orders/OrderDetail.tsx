import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { StatusBadge } from '../components/StatusBadge';
import type { OrderStatus } from '../types';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, settings, updateOrderStatus, addOrderNote, createReturn, returns } = useStore();

  const order = orders.find(o => o.id === id);
  const orderReturns = returns.filter(r => r.orderId === id);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');

  const [returnItems, setReturnItems] = useState<Record<string, { selected: boolean; quantity: number; reason: string }>>({});

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <button
          onClick={() => navigate('/demo/store/orders')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    const symbol = settings.store.currency === 'EUR' ? '€' : settings.store.currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = () => {
    if (newStatus) {
      updateOrderStatus(order.id, newStatus, trackingNumber || undefined);
      setShowStatusModal(false);
      setNewStatus('');
      setTrackingNumber('');
    }
  };

  const handleAddNote = () => {
    if (note.trim()) {
      addOrderNote(order.id, note.trim());
      setNote('');
    }
  };

  const handleCreateReturn = () => {
    const items = Object.entries(returnItems)
      .filter(([_, data]) => data.selected && data.quantity > 0)
      .map(([itemId, data]) => {
        const orderItem = order.items.find(i => i.id === itemId)!;
        return {
          orderItemId: itemId,
          productName: orderItem.productName,
          variantName: orderItem.variantName,
          quantity: data.quantity,
          reason: data.reason,
        };
      });

    if (items.length > 0) {
      createReturn(order.id, items);
      setShowReturnModal(false);
      setReturnItems({});
    }
  };

  const initReturnItems = () => {
    const items: typeof returnItems = {};
    order.items.forEach(item => {
      items[item.id] = { selected: false, quantity: item.quantity, reason: '' };
    });
    setReturnItems(items);
    setShowReturnModal(true);
  };

  const statusOptions: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  const canProcessReturn = ['delivered', 'shipped'].includes(order.status);

  return (
    <div data-orama-id="order-detail-page">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/demo/store/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          data-orama-id="back-to-orders"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className="flex gap-3">
            <button
              data-orama-id="update-status-button"
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Update Status
            </button>
            {canProcessReturn && (
              <button
                data-orama-id="process-return-button"
                onClick={initReturnItems}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Process Return
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100" data-orama-id="order-items-section">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map(item => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between" data-orama-id={`order-item-${item.id}`}>
                  <div>
                    <div className="font-medium text-gray-900">{item.productName}</div>
                    {item.variantName && (
                      <div className="text-sm text-gray-500">{item.variantName}</div>
                    )}
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(item.total)}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(item.unitPrice)} each</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Returns */}
          {orderReturns.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100" data-orama-id="order-returns-section">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Returns</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {orderReturns.map(ret => (
                  <div key={ret.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <StatusBadge status={ret.status} size="sm" />
                      <span className="text-sm text-gray-500">{formatDate(ret.createdAt)}</span>
                    </div>
                    <div className="space-y-1">
                      {ret.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="text-gray-900">{item.productName}</span>
                          {item.variantName && <span className="text-gray-500"> - {item.variantName}</span>}
                          <span className="text-gray-500"> x {item.quantity}</span>
                          <div className="text-gray-500 text-xs">Reason: {item.reason}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-900">
                      Refund: {formatCurrency(ret.refundAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100" data-orama-id="order-notes-section">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Notes</h2>
            </div>
            <div className="p-6">
              {order.notes ? (
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{order.notes}</p>
              ) : (
                <p className="text-gray-500 mb-4">No notes yet</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  data-orama-id="add-note-input"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  data-orama-id="add-note-button"
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-orama-id="customer-info-section">
            <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
              )}
              <p className="text-sm text-gray-500 pt-2">
                {order.customer.totalOrders} orders · {formatCurrency(order.customer.totalSpent)} spent
              </p>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-orama-id="shipping-info-section">
            <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="font-medium text-gray-900">{order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-orama-id="order-timeline-section">
            <h2 className="font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Order {order.status}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Order placed</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" data-orama-id="status-modal">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  data-orama-id="status-select"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select status...</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status} disabled={status === order.status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'shipped' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    data-orama-id="tracking-number-input"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                data-orama-id="confirm-status-update"
                onClick={handleStatusUpdate}
                disabled={!newStatus}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" data-orama-id="return-modal">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Return</h3>

            <p className="text-sm text-gray-600 mb-4">Select items to return:</p>

            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg" data-orama-id={`return-item-${item.id}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      data-orama-id={`return-checkbox-${item.id}`}
                      checked={returnItems[item.id]?.selected || false}
                      onChange={e => setReturnItems({
                        ...returnItems,
                        [item.id]: { ...returnItems[item.id], selected: e.target.checked },
                      })}
                      className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      {item.variantName && (
                        <div className="text-sm text-gray-500">{item.variantName}</div>
                      )}

                      {returnItems[item.id]?.selected && (
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                            <input
                              type="number"
                              data-orama-id={`return-quantity-${item.id}`}
                              value={returnItems[item.id]?.quantity || 1}
                              onChange={e => setReturnItems({
                                ...returnItems,
                                [item.id]: { ...returnItems[item.id], quantity: Math.min(parseInt(e.target.value) || 1, item.quantity) },
                              })}
                              min="1"
                              max={item.quantity}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Reason</label>
                            <select
                              data-orama-id={`return-reason-${item.id}`}
                              value={returnItems[item.id]?.reason || ''}
                              onChange={e => setReturnItems({
                                ...returnItems,
                                [item.id]: { ...returnItems[item.id], reason: e.target.value },
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select reason...</option>
                              <option value="Defective product">Defective product</option>
                              <option value="Wrong item received">Wrong item received</option>
                              <option value="Item not as described">Item not as described</option>
                              <option value="Changed mind">Changed mind</option>
                              <option value="Size/fit issue">Size/fit issue</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                data-orama-id="confirm-return"
                onClick={handleCreateReturn}
                disabled={!Object.values(returnItems).some(i => i.selected && i.quantity > 0 && i.reason)}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Create Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
