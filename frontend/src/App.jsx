import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';
import { authApi } from './api/index.js';

// Pages
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Workspaces from './pages/Workspaces.jsx';
import WorkspaceDetail from './pages/WorkspaceDetail.jsx';
import CreateWorkspace from './pages/CreateWorkspace.jsx';
import TaskDetail from './pages/TaskDetail.jsx';
import Tasks from './pages/Tasks.jsx';

// Components
import PrivateRoute from './components/common/PrivateRoute.jsx';
import RoleGuard from './components/common/RoleGuard.jsx';

const queryClient = new QueryClient();

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Verify token on app load
    if (token) {
      authApi
        .getCurrentUser()
        .then((response) => {
          const user = response.data.data.user;
          setAuth(user, token);
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/workspaces"
            element={
              <PrivateRoute>
                <Workspaces />
              </PrivateRoute>
            }
          />

          <Route
            path="/workspaces/create"
            element={
              <PrivateRoute>
                <RoleGuard allowedRoles={['MANAGER', 'ADMIN']} fallback={<Navigate to="/dashboard" replace />}>
                  <CreateWorkspace />
                </RoleGuard>
              </PrivateRoute>
            }
          />

          <Route
            path="/create-workspace"
            element={<Navigate to="/workspaces/create" replace />}
          />

          <Route
            path="/workspaces/:workspaceId"
            element={
              <PrivateRoute>
                <WorkspaceDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/workspaces/:workspaceId/tasks/:taskId"
            element={
              <PrivateRoute>
                <TaskDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
