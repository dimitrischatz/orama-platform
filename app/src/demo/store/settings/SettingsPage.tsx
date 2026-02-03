import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export function SettingsPage() {
  const { settings, updateStoreSettings } = useStore();
  const [storeName, setStoreName] = useState(settings.store.name);
  const [currency, setCurrency] = useState(settings.store.currency);
  const [taxRate, setTaxRate] = useState((settings.store.taxRate * 100).toString());
  const [saved, setSaved] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const handleSave = () => {
    updateStoreSettings({
      name: storeName,
      currency,
      taxRate: parseFloat(taxRate) / 100,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-orama-id="settings-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store configuration</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-orama-id="general-settings-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                id="store-name"
                data-orama-id="settings-store-name-input"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="My Store"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                data-orama-id="settings-currency-select"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="tax-rate"
                data-orama-id="settings-tax-rate-input"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="8"
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-orama-id="shipping-settings-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Zones</h2>
          </div>

          <div className="space-y-4">
            {settings.shippingZones.map(zone => (
              <div key={zone.id} className="p-4 bg-gray-50 rounded-lg" data-orama-id={`shipping-zone-${zone.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{zone.name}</h3>
                  <span className="text-sm text-gray-500">{zone.countries.length} countries</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {zone.countries.join(', ')}
                </div>
                <div className="space-y-2">
                  {zone.rates.map(rate => (
                    <div key={rate.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{rate.name}</span>
                      <span className="font-medium text-gray-900">
                        {rate.price === 0 ? 'Free' : `$${rate.price.toFixed(2)}`}
                        {rate.minOrderValue !== undefined && rate.minOrderValue > 0 && (
                          <span className="text-gray-500 ml-1">(orders over ${rate.minOrderValue})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Shipping zones are pre-configured for this demo. In a real store, you would be able to add and edit zones.
          </p>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-orama-id="payment-settings-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>

          <div className="space-y-3">
            {settings.paymentMethods.map(method => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                data-orama-id={`payment-method-${method.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {method.type === 'card' && (
                      <svg className={`w-5 h-5 ${method.enabled ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                    {method.type === 'paypal' && (
                      <svg className={`w-5 h-5 ${method.enabled ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.3l-.126.64-1.18 5.963-.067.339-.85.064z" />
                      </svg>
                    )}
                    {method.type === 'bank_transfer' && (
                      <svg className={`w-5 h-5 ${method.enabled ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{method.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${method.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {method.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Payment methods are pre-configured for this demo. In a real store, you would connect actual payment providers.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <button
            data-orama-id="save-settings-button"
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
          {saved && (
            <span className="text-green-600 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
