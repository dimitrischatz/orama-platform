import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Contact, Company, Deal, Activity, CRMSettings, DealStage, ActivityType } from '../types';
import { seedContacts, seedCompanies, seedDeals, seedActivities, seedCRMSettings } from './seedData';

interface CRMContextType {
  // Settings
  settings: CRMSettings;
  updateSettings: (updates: Partial<CRMSettings>) => void;
  completeSetup: () => void;

  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  // Deals
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  updateDealStage: (id: string, stage: DealStage) => void;
  deleteDeal: (id: string) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  toggleActivityComplete: (id: string) => void;
  deleteActivity: (id: string) => void;

  // Stats
  getPipelineValue: () => number;
  getWonDealsValue: () => number;

  // Reset
  resetCRM: () => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}

interface CRMProviderProps {
  children: ReactNode;
}

export function CRMProvider({ children }: CRMProviderProps) {
  const [settings, setSettings] = useState<CRMSettings>(() => JSON.parse(JSON.stringify(seedCRMSettings)));
  const [contacts, setContacts] = useState<Contact[]>(() => JSON.parse(JSON.stringify(seedContacts)));
  const [companies, setCompanies] = useState<Company[]>(() => JSON.parse(JSON.stringify(seedCompanies)));
  const [deals, setDeals] = useState<Deal[]>(() => JSON.parse(JSON.stringify(seedDeals)));
  const [activities, setActivities] = useState<Activity[]>(() => JSON.parse(JSON.stringify(seedActivities)));

  // Settings
  const updateSettings = useCallback((updates: Partial<CRMSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const completeSetup = useCallback(() => {
    setSettings(prev => ({ ...prev, isSetupComplete: true }));
  }, []);

  // Contacts
  const addContact = useCallback((contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: `cont-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  // Companies
  const addCompany = useCallback((company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCompany: Company = {
      ...company,
      id: `comp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  }, []);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setCompanies(prev => prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  }, []);

  // Deals
  const addDeal = useCallback((deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  }, []);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d)));
  }, []);

  const updateDealStage = useCallback((id: string, stage: DealStage) => {
    const probability = stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 :
      stage === 'lead' ? 10 : stage === 'qualified' ? 30 : stage === 'proposal' ? 50 : 70;
    setDeals(prev => prev.map(d => (d.id === id ? { ...d, stage, probability, updatedAt: new Date() } : d)));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  // Activities
  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      createdAt: new Date(),
    };
    setActivities(prev => [newActivity, ...prev]);
    return newActivity;
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const toggleActivityComplete = useCallback((id: string) => {
    setActivities(prev => prev.map(a => (a.id === id ? { ...a, completed: !a.completed } : a)));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  // Stats
  const getPipelineValue = useCallback(() => {
    return deals
      .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
      .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
  }, [deals]);

  const getWonDealsValue = useCallback(() => {
    return deals
      .filter(d => d.stage === 'closed_won')
      .reduce((sum, d) => sum + d.value, 0);
  }, [deals]);

  // Reset
  const resetCRM = useCallback(() => {
    setSettings(JSON.parse(JSON.stringify(seedCRMSettings)));
    setContacts(JSON.parse(JSON.stringify(seedContacts)));
    setCompanies(JSON.parse(JSON.stringify(seedCompanies)));
    setDeals(JSON.parse(JSON.stringify(seedDeals)));
    setActivities(JSON.parse(JSON.stringify(seedActivities)));
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      completeSetup,
      contacts,
      addContact,
      updateContact,
      deleteContact,
      companies,
      addCompany,
      updateCompany,
      deleteCompany,
      deals,
      addDeal,
      updateDeal,
      updateDealStage,
      deleteDeal,
      activities,
      addActivity,
      updateActivity,
      toggleActivityComplete,
      deleteActivity,
      getPipelineValue,
      getWonDealsValue,
      resetCRM,
    }),
    [
      settings, updateSettings, completeSetup,
      contacts, addContact, updateContact, deleteContact,
      companies, addCompany, updateCompany, deleteCompany,
      deals, addDeal, updateDeal, updateDealStage, deleteDeal,
      activities, addActivity, updateActivity, toggleActivityComplete, deleteActivity,
      getPipelineValue, getWonDealsValue, resetCRM,
    ]
  );

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}
