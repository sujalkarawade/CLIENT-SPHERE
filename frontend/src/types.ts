/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export type ClientStatus = 'Active' | 'Inactive' | 'Pending';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
}

export type LeadSource = 'Website' | 'Referral' | 'Cold Outreach' | 'Ad Campaign' | 'Partner' | 'Other';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Nurturing' | 'Unqualified';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  leadScore: number; // 1 to 100
  status: LeadStatus;
  createdAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
}

export type PipelineStage = 'New Lead' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';

export interface Pipeline {
  id: string;
  title: string;
  value: number;
  stage: PipelineStage;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalLeads: number;
  totalTasks: number;
  revenue: number;
  monthlyRevenue: { month: string; amount: number }[];
  leadConversion: { name: string; value: number }[];
}
