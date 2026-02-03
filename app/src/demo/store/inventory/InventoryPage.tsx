import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getProductInventory } from '../context/seedData';

type StockFilter = 'all' | 'low' | 'out' | 'healthy';

export function InventoryPage() {
  const { products, updateInventory } = useStore();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [editingVariant, setEditingVariant] = useState<{ productId: string; variantId: string } | null>(null);
  const [newInventory, setNewInventory] = useState<number>(0);

  const activeProducts = products.filter(p => p.status === 'active');

  const inventoryData = useMemo(() => {
    return activeProducts.flatMap(product =>
      product.variants.map(variant => ({
        product,
        variant,
        totalStock: variant.inventory,
        isLowStock: variant.inventory > 0 && variant.inventory < 10,
        isOutOfStock: variant.inventory === 0,
      }))
    );
  }, [activeProducts]);

  const filteredInventory = useMemo(() => {
    return inventoryData.filter(item => {
      const matchesSearch =
        search === '' ||
        item.product.name.toLowerCase().includes(search.toLowerCase()) ||
        item.variant.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.variant.name.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        stockFilter === 'all' ||
        (stockFilter === 'low' && item.isLowStock) ||
        (stockFilter === 'out' && item.isOutOfStock) ||
        (stockFilter === 'healthy' && !item.isLowStock && !item.isOutOfStock);

      return matchesSearch && matchesFilter;
    });
  }, [inventoryData, search, stockFilter]);

  const stockCounts = useMemo(() => {
    return {
      all: inventoryData.length,
      low: inventoryData.filter(i => i.isLowStock).length,
      out: inventoryData.filter(i => i.isOutOfStock).length,
      healthy: inventoryData.filter(i => !i.isLowStock && !i.isOutOfStock).length,
    };
  }, [inventoryData]);

  const totalInventoryValue = useMemo(() => {
    return inventoryData.reduce((sum, item) => {
      const price = item.variant.price || item.product.price;
      return sum + price * item.variant.inventory;
    }, 0);
  }, [inventoryData]);

  const handleStartEdit = (productId: string, variantId: string, currentInventory: number) => {
    setEditingVariant({ productId, variantId });
    setNewInventory(currentInventory);
  };

  const handleSaveInventory = () => {
    if (editingVariant) {
      updateInventory(editingVariant.productId, editingVariant.variantId, newInventory);
      setEditingVariant(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
    setNewInventory(0);
  };

  const filters: { value: StockFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All Items', color: 'gray' },
    { value: 'healthy', label: 'In Stock', color: 'green' },
    { value: 'low', label: 'Low Stock', color: 'yellow' },
    { value: 'out', label: 'Out of Stock', color: 'red' },
  ];

  return (
    <div data-orama-id="inventory-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-600">Manage stock levels for your products</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100" data-orama-id="stat-total-variants">
          <p className="text-sm text-gray-500">Total Variants</p>
          <p className="text-2xl font-bold text-gray-900">{inventoryData.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100" data-orama-id="stat-total-units">
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-2xl font-bold text-gray-900">
            {inventoryData.reduce((sum, i) => sum + i.totalStock, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100" data-orama-id="stat-low-stock-count">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-600">{stockCounts.low}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100" data-orama-id="stat-out-of-stock">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{stockCounts.out}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                data-orama-id="inventory-search-input"
                placeholder="Search by product name, variant, or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stock Filter */}
          <div className="flex gap-2">
            {filters.map(filter => (
              <button
                key={filter.value}
                data-orama-id={`stock-filter-${filter.value}`}
                onClick={() => setStockFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  stockFilter === filter.value
                    ? `bg-${filter.color}-100 text-${filter.color}-700 border border-${filter.color}-200`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: stockFilter === filter.value
                    ? filter.color === 'green' ? '#dcfce7' : filter.color === 'yellow' ? '#fef9c3' : filter.color === 'red' ? '#fee2e2' : '#f3f4f6'
                    : undefined,
                  color: stockFilter === filter.value
                    ? filter.color === 'green' ? '#15803d' : filter.color === 'yellow' ? '#a16207' : filter.color === 'red' ? '#b91c1c' : '#374151'
                    : undefined,
                }}
              >
                {filter.label} ({stockCounts[filter.value]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    {search || stockFilter !== 'all'
                      ? 'No items match your filters'
                      : 'No inventory items'}
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isEditing =
                    editingVariant?.productId === item.product.id &&
                    editingVariant?.variantId === item.variant.id;

                  return (
                    <tr key={`${item.product.id}-${item.variant.id}`} className="hover:bg-gray-50" data-orama-id={`inventory-row-${item.variant.sku}`}>
                      <td className="px-4 py-4">
                        <Link
                          to={`/demo/store/products/${item.product.id}/edit`}
                          className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {item.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{item.variant.name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono text-gray-500">{item.variant.sku}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            data-orama-id={`edit-inventory-input-${item.variant.sku}`}
                            value={newInventory}
                            onChange={e => setNewInventory(parseInt(e.target.value) || 0)}
                            min="0"
                            autoFocus
                            className="w-20 px-2 py-1 text-center border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInventory();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                        ) : (
                          <span className={`font-medium ${item.isOutOfStock ? 'text-red-600' : item.isLowStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {item.totalStock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : item.isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              data-orama-id={`save-inventory-${item.variant.sku}`}
                              onClick={handleSaveInventory}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            data-orama-id={`edit-inventory-${item.variant.sku}`}
                            onClick={() => handleStartEdit(item.product.id, item.variant.id, item.variant.inventory)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Adjust
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Restock Tip */}
      {stockCounts.low > 0 || stockCounts.out > 0 ? (
        <div className="mt-6 bg-indigo-50 rounded-xl p-4" data-orama-id="restock-tip">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-indigo-900">Tip: Try using the AI assistant</p>
              <p className="text-sm text-indigo-700 mt-1">
                Say "Show me all low stock items" or "Update inventory for [product name] to 50 units"
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
