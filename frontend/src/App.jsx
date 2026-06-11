/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/index';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { ClientsPage } from './pages/ClientsPage/ClientsPage';
import { LeadsPage } from './pages/LeadsPage/LeadsPage';
import { TasksPage } from './pages/TasksPage/TasksPage';
import { PipelinePage } from './pages/PipelinePage/PipelinePage';
import { AIEmailGeneratorPage } from './pages/AIEmailGeneratorPage/AIEmailGeneratorPage';
import { AIAssistantPage } from './pages/AIAssistantPage/AIAssistantPage';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Protected Client Workspace Core */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ClientsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LeadsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TasksPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PipelinePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-generator"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AIEmailGeneratorPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AIAssistantPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Route Fail-safes fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}