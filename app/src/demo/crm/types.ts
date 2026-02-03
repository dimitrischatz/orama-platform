export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  companyId?: string;
  title?: string;
  status: 'active' | 'inactive' | 'lead';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  size?: 'startup' | 'small' | 'medium' | 'enterprise';
  revenue?: string;
  address?: string;
  status: 'prospect' | 'customer' | 'churned';
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  contactId: string;
  companyId?: string;
  expectedCloseDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
}

export interface CRMSettings {
  companyName: string;
  currency: string;
  isSetupComplete: boolean;
}
