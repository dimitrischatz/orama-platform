import React from 'react';
import type { OrderStatus, ReturnStatus } from '../types';

type Status = OrderStatus | ReturnStatus | 'active' | 'draft' | 'archived';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  // Order statuses
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', className: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
  refunded: { label: 'Refunded', className: 'bg-red-100 text-red-800' },
  // Return statuses
  requested: { label: 'Requested', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800' },
  received: { label: 'Received', className: 'bg-indigo-100 text-indigo-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  // Product statuses
  active: { label: 'Active', className: 'bg-green-100 text-green-800' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
