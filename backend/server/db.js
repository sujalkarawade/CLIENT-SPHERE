/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool } from 'pg';

const DEFAULT_USERS = [
  {
    id: 'user-default-1',
    name: 'Sujal Karawade',
    email: 'sujalkarawade18@gmail.com',
    password: '$2a$10$Uq6q3fK/R72CAs6pE7vI1OCY4fH/v6Z3t.vR/9s8N8NIsG1G6rZ3S',
    createdAt: new Date('2026-01-15T09:00:00Z').toISOString(),
  }
];

const DEFAULT_CLIENTS = [
  {
    id: 'client-1',
    name: 'Sarah Connor',
    company: 'SkyNet Solutions',
    email: 'sarah.c@skynet.io',
    phone: '+1 (555) 019-2834',
    status: 'Active',
    notes: 'Primary contact for enterprise cloud migration. Highly responsive and satisfied with our consulting services.',
    createdAt: new Date('2026-02-12T10:15:00Z').toISOString(),
  },
  {
    id: 'client-2',
    name: 'Tony Stark',
    company: 'Stark Industries',
    email: 'tony@stark.com',
    phone: '+1 (555) 382-9102',
    status: 'Active',
    notes: 'Premium client. Managing recurring defense software contracts. Interested in AI pipeline integration.',
    createdAt: new Date('2026-03-01T14:20:00Z').toISOString(),
  },
  {
    id: 'client-3',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@waynecorp.com',
    phone: '+1 (555) 998-1029',
    status: 'Pending',
    notes: 'Discussing a workspace security suite contract. Requires strict zero-knowledge security standard.',
    createdAt: new Date('2026-04-10T11:45:00Z').toISOString(),
  },
  {
    id: 'client-4',
    name: 'Peter Parker',
    company: 'Daily Bugle Media',
    email: 'peter.p@dailybugle.net',
    phone: '+1 (555) 728-1122',
    status: 'Inactive',
    notes: 'Photography licensing service client. Accounts suspended awaiting renew contract signature.',
    createdAt: new Date('2026-05-05T08:30:00Z').toISOString(),
  }
];

const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Clark Kent',
    email: 'clark.kent@dailyplanet.com',
    phone: '+1 (555) 831-2940',
    source: 'Website',
    leadScore: 92,
    status: 'Qualified',
    createdAt: new Date('2026-05-20T16:40:00Z').toISOString(),
  },
  {
    id: 'lead-2',
    name: 'Diana Prince',
    email: 'diana.prince@louvre.fr',
    phone: '+1 (555) 472-1039',
    source: 'Referral',
    leadScore: 85,
    status: 'Contacted',
    createdAt: new Date('2026-06-01T13:10:00Z').toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Barry Allen',
    email: 'barry.a@star-labs.org',
    phone: '+1 (555) 302-1209',
    source: 'Ad Campaign',
    leadScore: 64,
    status: 'New',
    createdAt: new Date('2026-06-05T09:15:00Z').toISOString(),
  },
  {
    id: 'lead-4',
    name: 'Arthur Curry',
    email: 'arthur@atlantisone.gov',
    phone: '+1 (555) 293-1122',
    source: 'Cold Outreach',
    leadScore: 40,
    status: 'Contacted',
    createdAt: new Date('2026-05-15T15:50:00Z').toISOString(),
  },
  {
    id: 'lead-5',
    name: 'Hal Jordan',
    email: 'hal.jordan@ferrisair.com',
    phone: '+1 (555) 103-9482',
    source: 'Partner',
    leadScore: 78,
    status: 'Proposal',
    createdAt: new Date('2026-05-28T11:00:00Z').toISOString(),
  }
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Review Star Industries contract notes',
    description: 'Go through the security requirements specification sheet in Stark Industries workspace.',
    priority: 'High',
    dueDate: '2026-06-15',
    status: 'In Progress',
    createdAt: new Date('2026-06-01T09:00:00Z').toISOString(),
  },
  {
    id: 'task-2',
    title: 'Follow up contact with Diana Prince',
    description: 'Schedule a call to discuss partnership opportunities in the artifact digitization process.',
    priority: 'Medium',
    dueDate: '2026-06-12',
    status: 'Pending',
    createdAt: new Date('2026-06-03T10:30:00Z').toISOString(),
  },
  {
    id: 'task-3',
    title: 'Email Clark Kent proposal specs',
    description: 'Draft the core server structure and technical sheets for the Daily Planet migration.',
    priority: 'High',
    dueDate: '2026-06-10',
    status: 'Completed',
    createdAt: new Date('2026-06-04T11:00:00Z').toISOString(),
  },
  {
    id: 'task-4',
    title: 'Update monthly dashboard reports',
    description: 'Aggregate revenue charts and lead conversion data for quarterly presentations.',
    priority: 'Low',
    dueDate: '2026-06-25',
    status: 'Pending',
    createdAt: new Date('2026-06-06T14:00:00Z').toISOString(),
  }
];

const DEFAULT_PIPELINES = [
  {
    id: 'deal-1',
    title: 'Acme Security Upgrade',
    value: 15400,
    stage: 'New Lead',
    createdAt: new Date('2026-05-01T10:00:00Z').toISOString(),
  },
  {
    id: 'deal-2',
    title: 'Skynet Cloud Migration',
    value: 45000,
    stage: 'Proposal Sent',
    createdAt: new Date('2026-05-10T11:30:00Z').toISOString(),
  },
  {
    id: 'deal-3',
    title: 'Wayne Cyber Security Retainer',
    value: 85000,
    stage: 'Won',
    createdAt: new Date('2026-05-15T09:45:00Z').toISOString(),
  },
  {
    id: 'deal-4',
    title: 'Daily Planet System Overhaul',
    value: 12500,
    stage: 'Qualified',
    createdAt: new Date('2026-05-20T14:15:00Z').toISOString(),
  },
  {
    id: 'deal-5',
    title: 'LexCorp Telecom Systems Audit',
    value: 30000,
    stage: 'Lost',
    createdAt: new Date('2026-05-25T16:00:00Z').toISOString(),
  },
  {
    id: 'deal-6',
    title: 'Ferris Air Logistics SaaS Integration',
    value: 22000,
    stage: 'Contacted',
    createdAt: new Date('2026-06-02T13:00:00Z').toISOString(),
  }
];

const DEFAULT_AI_EMAILS = [
  {
    id: 'email-default-1',
    clientName: 'Tony Stark',
    companyName: 'Stark Industries',
    emailPurpose: 'Follow-Up Emails',
    tone: 'Professional',
    additionalContext: 'Following up on our discussion about AI pipeline integration.',
    subject: 'AI Pipeline Integration - Next Steps',
    body: 'Hi Tony,\n\nI hope you are doing well. I am following up on our discussion regarding the AI pipeline integration for Stark Industries. I wanted to see if you had any questions on the details we went over, and if you would like to schedule a brief call next week to finalize the scope.\n\nLooking forward to your thoughts.\n\nBest regards,\nSujal Karawade',
    createdAt: new Date('2026-06-07T14:30:00Z').toISOString(),
  },
  {
    id: 'email-default-2',
    clientName: 'Sarah Connor',
    companyName: 'SkyNet Solutions',
    emailPurpose: 'Proposal Emails',
    tone: 'Formal',
    additionalContext: 'Proposal for enterprise cloud migration services.',
    subject: 'Proposal: Enterprise Cloud Migration Services',
    body: "Dear Sarah,\n\nIt was a pleasure speaking with you regarding SkyNet Solutions' cloud migration requirements. Please find attached our comprehensive proposal outlining the project scope, timeline, and deliverables for the migration services.\n\nWe believe this solution will significantly improve your system redundancy and security. Please let me know if you would like to schedule a walkthrough of the proposal details.\n\nSincerely,\nSujal Karawade",
    createdAt: new Date('2026-06-08T09:15:00Z').toISOString(),
  }
];

class Database {
  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/clientsphere';

    try {
      const parsedUrl = new URL(connectionString);
      this.pool = new Pool({
        user: decodeURIComponent(parsedUrl.username),
        password: decodeURIComponent(parsedUrl.password),
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || '5432', 10),
        database: parsedUrl.pathname.slice(1) || 'clientsphere',
      });
    } catch (e) {
      this.pool = new Pool({ connectionString });
    }

    this.initializedPromise = this.init();
  }

  async init() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/clientsphere';
    try {
      await this.pool.query('SELECT 1');
    } catch (err) {
      if (err.code === '3D000') {
        console.log('Database does not exist. Attempting to create database automatically...');
        try {
          const parsedUrl = new URL(connectionString);
          const dbName = parsedUrl.pathname.slice(1);

          const adminPool = new Pool({
            user: decodeURIComponent(parsedUrl.username),
            password: decodeURIComponent(parsedUrl.password),
            host: parsedUrl.hostname,
            port: parseInt(parsedUrl.port || '5432', 10),
            database: 'postgres'
          });

          await adminPool.query('CREATE DATABASE "' + dbName + '"');
          await adminPool.end();
          console.log('Database "' + dbName + '" created successfully.');
        } catch (createErr) {
          console.error('Failed to automatically create database:', createErr);
        }
      } else {
        console.error('Initial database connection failed:', err);
      }
    }

    try {
      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS users (' +
        '"id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT UNIQUE NOT NULL, ' +
        '"password" TEXT NOT NULL, "createdAt" TEXT NOT NULL' +
        ');'
      );

      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS clients (' +
        '"id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "company" TEXT NOT NULL, ' +
        '"email" TEXT NOT NULL, "phone" TEXT NOT NULL, "status" TEXT NOT NULL, ' +
        '"notes" TEXT NOT NULL, "createdAt" TEXT NOT NULL' +
        ');'
      );

      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS leads (' +
        '"id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, ' +
        '"phone" TEXT NOT NULL, "source" TEXT NOT NULL, "leadScore" INTEGER NOT NULL, ' +
        '"status" TEXT NOT NULL, "createdAt" TEXT NOT NULL' +
        ');'
      );

      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS tasks (' +
        '"id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL, ' +
        '"priority" TEXT NOT NULL, "dueDate" TEXT NOT NULL, "status" TEXT NOT NULL, ' +
        '"createdAt" TEXT NOT NULL' +
        ');'
      );

      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS pipelines (' +
        '"id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "value" DOUBLE PRECISION NOT NULL, ' +
        '"stage" TEXT NOT NULL, "createdAt" TEXT NOT NULL' +
        ');'
      );

      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS ai_emails (' +
        '"id" TEXT PRIMARY KEY, "clientName" TEXT NOT NULL, "companyName" TEXT NOT NULL, ' +
        '"emailPurpose" TEXT NOT NULL, "tone" TEXT NOT NULL, "additionalContext" TEXT, ' +
        '"subject" TEXT NOT NULL, "body" TEXT NOT NULL, "createdAt" TEXT NOT NULL' +
        ');'
      );

      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS ai_conversations (' +
        '"id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "role" TEXT NOT NULL, ' +
        '"content" TEXT NOT NULL, "createdAt" TEXT NOT NULL' +
        ');'
      );


      const userRes = await this.pool.query('SELECT COUNT(*)::int as count FROM users');
      if (userRes.rows[0].count === 0) {
        for (const u of DEFAULT_USERS) {
          await this.pool.query(
            'INSERT INTO users ("id", "name", "email", "password", "createdAt") VALUES ($1, $2, $3, $4, $5)',
            [u.id, u.name, u.email, u.password, u.createdAt]
          );
        }
      }

      const clientRes = await this.pool.query('SELECT COUNT(*)::int as count FROM clients');
      if (clientRes.rows[0].count === 0) {
        for (const c of DEFAULT_CLIENTS) {
          await this.pool.query(
            'INSERT INTO clients ("id", "name", "company", "email", "phone", "status", "notes", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [c.id, c.name, c.company, c.email, c.phone, c.status, c.notes, c.createdAt]
          );
        }
      }

      const leadRes = await this.pool.query('SELECT COUNT(*)::int as count FROM leads');
      if (leadRes.rows[0].count === 0) {
        for (const l of DEFAULT_LEADS) {
          await this.pool.query(
            'INSERT INTO leads ("id", "name", "email", "phone", "source", "leadScore", "status", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [l.id, l.name, l.email, l.phone, l.source, l.leadScore, l.status, l.createdAt]
          );
        }
      }

      const taskRes = await this.pool.query('SELECT COUNT(*)::int as count FROM tasks');
      if (taskRes.rows[0].count === 0) {
        for (const t of DEFAULT_TASKS) {
          await this.pool.query(
            'INSERT INTO tasks ("id", "title", "description", "priority", "dueDate", "status", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [t.id, t.title, t.description, t.priority, t.dueDate, t.status, t.createdAt]
          );
        }
      }

      const pipelineRes = await this.pool.query('SELECT COUNT(*)::int as count FROM pipelines');
      if (pipelineRes.rows[0].count === 0) {
        for (const p of DEFAULT_PIPELINES) {
          await this.pool.query(
            'INSERT INTO pipelines ("id", "title", "value", "stage", "createdAt") VALUES ($1, $2, $3, $4, $5)',
            [p.id, p.title, p.value, p.stage, p.createdAt]
          );
        }
      }

      const emailRes = await this.pool.query('SELECT COUNT(*)::int as count FROM ai_emails');
      if (emailRes.rows[0].count === 0) {
        for (const e of DEFAULT_AI_EMAILS) {
          await this.pool.query(
            'INSERT INTO ai_emails ("id", "clientName", "companyName", "emailPurpose", "tone", "additionalContext", "subject", "body", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [e.id, e.clientName, e.companyName, e.emailPurpose, e.tone, e.additionalContext || '', e.subject, e.body, e.createdAt]
          );
        }
      }

      console.log('PostgreSQL database initialized successfully and seeded.');
    } catch (e) {
      console.error('CRITICAL: Failed to initialize database tables in PostgreSQL.', e);
      console.error('Please make sure PostgreSQL is running and DATABASE_URL in .env is configured correctly.');
    }
  }

  async ensureInit() {
    await this.initializedPromise;
  }

  users = {
    findMany: async () => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM users');
      return res.rows;
    },
    findFirst: async (predicate) => {
      await this.ensureInit();
      const users = await this.users.findMany();
      const found = users.find(predicate);
      return found ? { ...found } : null;
    },
    create: async (data) => {
      await this.ensureInit();
      await this.pool.query(
        'INSERT INTO users ("id", "name", "email", "password", "createdAt") VALUES ($1, $2, $3, $4, $5)',
        [data.id, data.name, data.email, data.password, data.createdAt]
      );
      return { ...data };
    }
  };

  clients = {
    findMany: async () => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM clients');
      return res.rows;
    },
    findUnique: async (id) => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM clients WHERE id = $1', [id]);
      return res.rows[0] || null;
    },
    create: async (data) => {
      await this.ensureInit();
      const newClient = {
        ...data,
        id: 'client-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      };
      await this.pool.query(
        'INSERT INTO clients ("id", "name", "company", "email", "phone", "status", "notes", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newClient.id, newClient.name, newClient.company, newClient.email, newClient.phone, newClient.status, newClient.notes, newClient.createdAt]
      );
      return newClient;
    },
    update: async (id, data) => {
      await this.ensureInit();
      const current = await this.clients.findUnique(id);
      if (!current) throw new Error('Client with id ' + id + ' not found');
      const updated = { ...current, ...data };
      await this.pool.query(
        'UPDATE clients SET "name" = $1, "company" = $2, "email" = $3, "phone" = $4, "status" = $5, "notes" = $6 WHERE id = $7',
        [updated.name, updated.company, updated.email, updated.phone, updated.status, updated.notes, id]
      );
      return updated;
    },
    delete: async (id) => {
      await this.ensureInit();
      const current = await this.clients.findUnique(id);
      if (!current) throw new Error('Client with id ' + id + ' not found');
      await this.pool.query('DELETE FROM clients WHERE id = $1', [id]);
      return current;
    }
  };

  leads = {
    findMany: async () => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM leads');
      return res.rows;
    },
    findUnique: async (id) => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM leads WHERE id = $1', [id]);
      return res.rows[0] || null;
    },
    create: async (data) => {
      await this.ensureInit();
      const newLead = {
        ...data,
        id: 'lead-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      };
      await this.pool.query(
        'INSERT INTO leads ("id", "name", "email", "phone", "source", "leadScore", "status", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newLead.id, newLead.name, newLead.email, newLead.phone, newLead.source, newLead.leadScore, newLead.status, newLead.createdAt]
      );
      return newLead;
    },
    update: async (id, data) => {
      await this.ensureInit();
      const current = await this.leads.findUnique(id);
      if (!current) throw new Error('Lead with id ' + id + ' not found');
      const updated = { ...current, ...data };
      await this.pool.query(
        'UPDATE leads SET "name" = $1, "email" = $2, "phone" = $3, "source" = $4, "leadScore" = $5, "status" = $6 WHERE id = $7',
        [updated.name, updated.email, updated.phone, updated.source, updated.leadScore, updated.status, id]
      );
      return updated;
    },
    delete: async (id) => {
      await this.ensureInit();
      const current = await this.leads.findUnique(id);
      if (!current) throw new Error('Lead with id ' + id + ' not found');
      await this.pool.query('DELETE FROM leads WHERE id = $1', [id]);
      return current;
    }
  };

  tasks = {
    findMany: async () => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM tasks');
      return res.rows;
    },
    findUnique: async (id) => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
      return res.rows[0] || null;
    },
    create: async (data) => {
      await this.ensureInit();
      const newTask = {
        ...data,
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      };
      await this.pool.query(
        'INSERT INTO tasks ("id", "title", "description", "priority", "dueDate", "status", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [newTask.id, newTask.title, newTask.description, newTask.priority, newTask.dueDate, newTask.status, newTask.createdAt]
      );
      return newTask;
    },
    update: async (id, data) => {
      await this.ensureInit();
      const current = await this.tasks.findUnique(id);
      if (!current) throw new Error('Task with id ' + id + ' not found');
      const updated = { ...current, ...data };
      await this.pool.query(
        'UPDATE tasks SET "title" = $1, "description" = $2, "priority" = $3, "dueDate" = $4, "status" = $5 WHERE id = $6',
        [updated.title, updated.description, updated.priority, updated.dueDate, updated.status, id]
      );
      return updated;
    },
    delete: async (id) => {
      await this.ensureInit();
      const current = await this.tasks.findUnique(id);
      if (!current) throw new Error('Task with id ' + id + ' not found');
      await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      return current;
    }
  };

  pipelines = {
    findMany: async () => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM pipelines');
      return res.rows;
    },
    findUnique: async (id) => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM pipelines WHERE id = $1', [id]);
      return res.rows[0] || null;
    },
    create: async (data) => {
      await this.ensureInit();
      const newPipeline = {
        ...data,
        id: 'deal-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      };
      await this.pool.query(
        'INSERT INTO pipelines ("id", "title", "value", "stage", "createdAt") VALUES ($1, $2, $3, $4, $5)',
        [newPipeline.id, newPipeline.title, newPipeline.value, newPipeline.stage, newPipeline.createdAt]
      );
      return newPipeline;
    },
    update: async (id, data) => {
      await this.ensureInit();
      const current = await this.pipelines.findUnique(id);
      if (!current) throw new Error('Pipeline deal with id ' + id + ' not found');
      const updated = { ...current, ...data };
      await this.pool.query(
        'UPDATE pipelines SET "title" = $1, "value" = $2, "stage" = $3 WHERE id = $4',
        [updated.title, updated.value, updated.stage, id]
      );
      return updated;
    },
    delete: async (id) => {
      await this.ensureInit();
      const current = await this.pipelines.findUnique(id);
      if (!current) throw new Error('Pipeline deal with id ' + id + ' not found');
      await this.pool.query('DELETE FROM pipelines WHERE id = $1', [id]);
      return current;
    }
  };

  aiEmails = {
    findMany: async () => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM ai_emails ORDER BY "createdAt" DESC');
      return res.rows;
    },
    create: async (data) => {
      await this.ensureInit();
      const newEmail = {
        ...data,
        id: 'email-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      };
      await this.pool.query(
        'INSERT INTO ai_emails ("id", "clientName", "companyName", "emailPurpose", "tone", "additionalContext", "subject", "body", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [newEmail.id, newEmail.clientName, newEmail.companyName, newEmail.emailPurpose, newEmail.tone, newEmail.additionalContext || '', newEmail.subject, newEmail.body, newEmail.createdAt]
      );
      return newEmail;
    }
  };

  aiConversations = {
    findManyByUser: async (userId) => {
      await this.ensureInit();
      const res = await this.pool.query('SELECT * FROM ai_conversations WHERE "userId" = $1 ORDER BY "createdAt" ASC', [userId]);
      return res.rows;
    },
    create: async (data) => {
      await this.ensureInit();
      const newMessage = {
        ...data,
        id: 'conv-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString()
      };
      await this.pool.query(
        'INSERT INTO ai_conversations ("id", "userId", "role", "content", "createdAt") VALUES ($1, $2, $3, $4, $5)',
        [newMessage.id, newMessage.userId, newMessage.role, newMessage.content, newMessage.createdAt]
      );
      return newMessage;
    },
    deleteManyByUser: async (userId) => {
      await this.ensureInit();
      await this.pool.query('DELETE FROM ai_conversations WHERE "userId" = $1', [userId]);
    }
  };
}

export const db = new Database();