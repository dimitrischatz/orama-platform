import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import type { Product, ProductVariant } from '../types';

interface VariantFormData {
  id: string;
  name: string;
  sku: string;
  inventory: number;
  options: Record<string, string>;
}

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, settings, addProduct, updateProduct } = useStore();

  const isEditing = Boolean(id);
  const existingProduct = isEditing ? products.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    category: '',
    tags: '',
    status: 'active' as Product['status'],
  });

  const [variants, setVariants] = useState<VariantFormData[]>([
    { id: 'var-new-1', name: 'Default', sku: '', inventory: 0, options: {} },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price.toString(),
        compareAtPrice: existingProduct.compareAtPrice?.toString() || '',
        sku: existingProduct.sku,
        category: existingProduct.category,
        tags: existingProduct.tags.join(', '),
        status: existingProduct.status,
      });
      setVariants(
        existingProduct.variants.length > 0
          ? existingProduct.variants.map(v => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              inventory: v.inventory,
              options: v.options,
            }))
          : [{ id: 'var-new-1', name: 'Default', sku: '', inventory: 0, options: {} }]
      );
    }
  }, [existingProduct]);

  const formatCurrency = (amount: number) => {
    const symbol = settings.store.currency === 'EUR' ? '€' : settings.store.currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      tags: formData.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean),
      status: formData.status,
      variants: variants.map(v => ({
        id: v.id,
        name: v.name,
        sku: v.sku || `${formData.sku}-${v.name.replace(/\s+/g, '-').toUpperCase()}`,
        inventory: v.inventory,
        options: v.options,
      })) as ProductVariant[],
      images: existingProduct?.images || [],
    };

    if (isEditing && id) {
      updateProduct(id, productData);
    } else {
      addProduct(productData);
    }

    navigate('/demo/store/products');
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { id: `var-new-${Date.now()}`, name: '', sku: '', inventory: 0, options: {} },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, updates: Partial<VariantFormData>) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, ...updates } : v)));
  };

  return (
    <div data-orama-id={isEditing ? 'edit-product-page' : 'new-product-page'}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/demo/store/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          data-orama-id="back-to-products"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    data-orama-id="product-name-input"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Classic Cotton T-Shirt"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    data-orama-id="product-description-input"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {settings.store.currency === 'EUR' ? '€' : settings.store.currency === 'GBP' ? '£' : '$'}
                    </span>
                    <input
                      type="number"
                      id="price"
                      data-orama-id="product-price-input"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Compare at Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {settings.store.currency === 'EUR' ? '€' : settings.store.currency === 'GBP' ? '£' : '$'}
                    </span>
                    <input
                      type="number"
                      id="compareAtPrice"
                      data-orama-id="product-compare-price-input"
                      value={formData.compareAtPrice}
                      onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Original price before discount</p>
                </div>
              </div>
            </div>

            {/* Variants Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
                <button
                  type="button"
                  data-orama-id="add-variant-button"
                  onClick={addVariant}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    data-orama-id={`variant-${index}`}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Variant {index + 1}</span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          data-orama-id={`remove-variant-${index}`}
                          onClick={() => removeVariant(index)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          data-orama-id={`variant-name-${index}`}
                          value={variant.name}
                          onChange={e => updateVariant(index, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Blue / Large"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SKU</label>
                        <input
                          type="text"
                          data-orama-id={`variant-sku-${index}`}
                          value={variant.sku}
                          onChange={e => updateVariant(index, { sku: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Inventory</label>
                        <input
                          type="number"
                          data-orama-id={`variant-inventory-${index}`}
                          value={variant.inventory}
                          onChange={e => updateVariant(index, { inventory: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

              <div>
                <select
                  data-orama-id="product-status-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Organization Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    id="sku"
                    data-orama-id="product-sku-input"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.sku ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., TSH-001"
                  />
                  {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    id="category"
                    data-orama-id="product-category-input"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Clothing"
                    list="categories"
                  />
                  <datalist id="categories">
                    <option value="Clothing" />
                    <option value="Footwear" />
                    <option value="Accessories" />
                    <option value="Sportswear" />
                  </datalist>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    data-orama-id="product-tags-input"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="summer, casual, bestseller"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate with commas</p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  data-orama-id="save-product-button"
                  className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
                <button
                  type="button"
                  data-orama-id="cancel-product-button"
                  onClick={() => navigate('/demo/store/products')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
