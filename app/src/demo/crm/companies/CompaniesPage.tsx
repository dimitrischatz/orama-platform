import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import type { Company } from '../types';

export function CompaniesPage() {
  const { companies, contacts, addCompany, updateCompany, deleteCompany } = useCRM();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const filteredCompanies = companies.filter(c =>
    `${c.name} ${c.industry}`.toLowerCase().includes(search.toLowerCase())
  );

  const getContactCount = (companyId: string) => contacts.filter(c => c.companyId === companyId).length;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const companyData = {
      name: formData.get('name') as string,
      industry: formData.get('industry') as string || undefined,
      website: formData.get('website') as string || undefined,
      size: formData.get('size') as Company['size'] || undefined,
      revenue: formData.get('revenue') as string || undefined,
      address: formData.get('address') as string || undefined,
      status: formData.get('status') as Company['status'],
    };

    if (editingCompany) {
      updateCompany(editingCompany.id, companyData);
    } else {
      addCompany(companyData);
    }

    setShowModal(false);
    setEditingCompany(null);
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'customer': return 'bg-green-100 text-green-700';
      case 'prospect': return 'bg-blue-100 text-blue-700';
      case 'churned': return 'bg-red-100 text-red-700';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-500">{companies.length} total companies</p>
          </div>
          <button
            onClick={() => { setEditingCompany(null); setShowModal(true); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Company
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map(company => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
              {company.industry && <p className="text-sm text-gray-500 mb-2">{company.industry}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{getContactCount(company.id)} contacts</span>
                {company.size && <span>{company.size}</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingCompany(company); setShowModal(true); }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this company?')) {
                      deleteCompany(company.id);
                    }
                  }}
                  className="px-3 py-2 text-sm text-red-600 border border-gray-200 rounded-lg hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No companies found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCompany ? 'Edit Company' : 'Add Company'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  name="name"
                  defaultValue={editingCompany?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  name="industry"
                  defaultValue={editingCompany?.industry}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  name="website"
                  defaultValue={editingCompany?.website}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select
                  name="size"
                  defaultValue={editingCompany?.size}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10)</option>
                  <option value="small">Small (11-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="enterprise">Enterprise (200+)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                <input
                  name="revenue"
                  defaultValue={editingCompany?.revenue}
                  placeholder="e.g. $1M - $5M"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  name="address"
                  defaultValue={editingCompany?.address}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingCompany?.status || 'prospect'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCompany(null); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {editingCompany ? 'Save Changes' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
