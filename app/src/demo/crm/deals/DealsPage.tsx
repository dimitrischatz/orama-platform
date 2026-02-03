import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { DemoCRMLayout } from '../DemoCRMLayout';
import type { Deal, DealStage } from '../types';

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-100' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-100' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-100' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-amber-100' },
  { id: 'closed_won', label: 'Closed Won', color: 'bg-green-100' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100' },
];

export function DealsPage() {
  const { deals, contacts, companies, addDeal, updateDeal, updateDealStage, deleteDeal } = useCRM();
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getContact = (contactId: string) => contacts.find(c => c.id === contactId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const dealData = {
      title: formData.get('title') as string,
      value: parseFloat(formData.get('value') as string) || 0,
      stage: formData.get('stage') as DealStage,
      probability: parseInt(formData.get('probability') as string) || 50,
      contactId: formData.get('contactId') as string,
      companyId: formData.get('companyId') as string || undefined,
      expectedCloseDate: formData.get('expectedCloseDate') ? new Date(formData.get('expectedCloseDate') as string) : undefined,
      notes: formData.get('notes') as string || undefined,
    };

    if (editingDeal) {
      updateDeal(editingDeal.id, dealData);
    } else {
      addDeal(dealData);
    }

    setShowModal(false);
    setEditingDeal(null);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    updateDealStage(dealId, stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <DemoCRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="text-gray-500">{deals.length} total deals</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'board' ? 'bg-white shadow' : ''}`}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                List
              </button>
            </div>
            <button
              onClick={() => { setEditingDeal(null); setShowModal(true); }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Deal
            </button>
          </div>
        </div>

        {/* Board View */}
        {viewMode === 'board' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-72"
                  onDrop={e => handleDrop(e, stage.id)}
                  onDragOver={handleDragOver}
                >
                  <div className={`rounded-t-lg px-3 py-2 ${stage.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{stage.label}</span>
                      <span className="text-sm text-gray-600">{stageDeals.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">{formatCurrency(stageValue)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-b-lg p-2 min-h-[200px] space-y-2">
                    {stageDeals.map(deal => {
                      const contact = getContact(deal.contactId);
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={e => handleDragStart(e, deal.id)}
                          className="bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                        >
                          <p className="font-medium text-gray-900 mb-1">{deal.title}</p>
                          <p className="text-lg font-semibold text-emerald-600">{formatCurrency(deal.value)}</p>
                          {contact && (
                            <p className="text-sm text-gray-500 mt-2">
                              {contact.firstName} {contact.lastName}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">{deal.probability}%</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingDeal(deal); setShowModal(true); }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this deal?')) deleteDeal(deal.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.map(deal => {
                  const contact = getContact(deal.contactId);
                  const stage = stages.find(s => s.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{deal.title}</td>
                      <td className="px-6 py-4 text-emerald-600 font-semibold">{formatCurrency(deal.value)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stage?.color}`}>
                          {stage?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {contact ? `${contact.firstName} ${contact.lastName}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{deal.probability}%</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setEditingDeal(deal); setShowModal(true); }}
                          className="text-gray-400 hover:text-gray-600 mr-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this deal?')) deleteDeal(deal.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingDeal ? 'Edit Deal' : 'Add Deal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                <input
                  name="title"
                  defaultValue={editingDeal?.title}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                <input
                  name="value"
                  type="number"
                  defaultValue={editingDeal?.value}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  name="stage"
                  defaultValue={editingDeal?.stage || 'lead'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <select
                  name="contactId"
                  defaultValue={editingDeal?.contactId}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select contact</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  name="companyId"
                  defaultValue={editingDeal?.companyId}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                <input
                  name="probability"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingDeal?.probability || 50}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <input
                  name="expectedCloseDate"
                  type="date"
                  defaultValue={editingDeal?.expectedCloseDate ? new Date(editingDeal.expectedCloseDate).toISOString().split('T')[0] : ''}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingDeal?.notes}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingDeal(null); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {editingDeal ? 'Save Changes' : 'Add Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DemoCRMLayout>
  );
}
