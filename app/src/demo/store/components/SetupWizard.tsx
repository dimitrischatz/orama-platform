import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

type Step = 'welcome' | 'store-info' | 'currency' | 'complete';

export function SetupWizard() {
  const { settings, updateStoreSettings, completeSetup } = useStore();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [storeName, setStoreName] = useState(settings.store.name || '');
  const [currency, setCurrency] = useState(settings.store.currency || 'USD');

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('store-info');
        break;
      case 'store-info':
        updateStoreSettings({ name: storeName });
        setCurrentStep('currency');
        break;
      case 'currency':
        updateStoreSettings({ currency });
        setCurrentStep('complete');
        break;
      case 'complete':
        completeSetup();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'store-info':
        setCurrentStep('welcome');
        break;
      case 'currency':
        setCurrentStep('store-info');
        break;
      case 'complete':
        setCurrentStep('currency');
        break;
    }
  };

  const handleSkip = () => {
    updateStoreSettings({ name: storeName || 'My Store', currency });
    completeSetup();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'store-info':
        return storeName.trim().length > 0;
      default:
        return true;
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {['welcome', 'store-info', 'currency', 'complete'].map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step === currentStep
                      ? 'bg-indigo-600'
                      : ['welcome', 'store-info', 'currency', 'complete'].indexOf(step) <
                        ['welcome', 'store-info', 'currency', 'complete'].indexOf(currentStep)
                      ? 'bg-indigo-400'
                      : 'bg-gray-300'
                  }`}
                />
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 'welcome' && (
            <div className="text-center" data-orama-id="setup-welcome-step">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Store Admin</h1>
              <p className="text-gray-600 mb-8">
                Let's set up your store in just a few steps. This demo showcases how Orama can help automate
                e-commerce workflows.
              </p>
              <div className="bg-indigo-50 rounded-lg p-4 text-left mb-6">
                <p className="text-sm text-indigo-800">
                  <strong>Tip:</strong> Try asking the AI assistant to "help me set up my store" and watch it guide you
                  through this process automatically!
                </p>
              </div>
            </div>
          )}

          {currentStep === 'store-info' && (
            <div data-orama-id="setup-store-info-step">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Name your store</h2>
              <p className="text-gray-600 mb-6">This will appear in your admin dashboard and customer communications.</p>
              <div className="mb-6">
                <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  id="store-name"
                  data-orama-id="store-name-input"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="e.g., Fashion Forward, Tech Gadgets Co."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}

          {currentStep === 'currency' && (
            <div data-orama-id="setup-currency-step">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Select your currency</h2>
              <p className="text-gray-600 mb-6">Choose the primary currency for your store.</p>
              <div className="space-y-2">
                {currencies.map(curr => (
                  <button
                    key={curr.code}
                    data-orama-id={`currency-option-${curr.code.toLowerCase()}`}
                    onClick={() => setCurrency(curr.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors ${
                      currency === curr.code
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-gray-700 w-8">{curr.symbol}</span>
                      <span className="text-gray-900">{curr.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{curr.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center" data-orama-id="setup-complete-step">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600 mb-6">
                Your store <strong>"{storeName}"</strong> is ready. You can now explore the dashboard, add products,
                and manage orders.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Next steps you can try:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Add a new product called Blue T-Shirt for $29.99"</li>
                  <li>• "Show me all pending orders"</li>
                  <li>• "Apply 20% discount to summer items"</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {currentStep !== 'welcome' && (
                <button
                  data-orama-id="setup-back-button"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {currentStep !== 'complete' && (
                <button
                  data-orama-id="setup-skip-button"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Skip setup
                </button>
              )}
              <button
                data-orama-id="setup-next-button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {currentStep === 'complete' ? 'Go to Dashboard' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
