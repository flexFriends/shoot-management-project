import axiosInstance from './axios.js';

// Auth API
export const authApi = {
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),

  register: (data) =>
    axiosInstance.post('/auth/register', data),

  // HR/Admin create user
  createUser: (data) =>
    axiosInstance.post('/auth/users', data),

  getCurrentUser: () =>
    axiosInstance.get('/auth/me'),

  updateProfile: (data) =>
    axiosInstance.put('/auth/profile', data),

  // Admin only
  getAllUsers: (page = 1, limit = 20) =>
    axiosInstance.get(`/auth/users?page=${page}&limit=${limit}`),

  getHRDashboard: () =>
    axiosInstance.get('/auth/hr-dashboard'),

  deactivateUser: (userId) =>
    axiosInstance.patch(`/auth/users/${userId}/deactivate`),

  changeUserRole: (userId, role) =>
    axiosInstance.patch(`/auth/users/${userId}/role`, { role }),
};

// Workspace API
export const workspaceApi = {
  create: (data) =>
    axiosInstance.post('/workspaces', data),

  getAll: (page = 1, limit = 20) =>
    axiosInstance.get(`/workspaces?page=${page}&limit=${limit}`),

  getById: (id) =>
    axiosInstance.get(`/workspaces/${id}`),

  update: (id, data) =>
    axiosInstance.put(`/workspaces/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/workspaces/${id}`),

  getMembers: (workspaceId) =>
    axiosInstance.get(`/workspaces/${workspaceId}/members`),

  addMember: (workspaceId, userId, role = 'MEMBER') =>
    axiosInstance.post(`/workspaces/${workspaceId}/members`, { userId, role }),

  removeMember: (workspaceId, userId) =>
    axiosInstance.delete(`/workspaces/${workspaceId}/members/${userId}`),

  getActivity: (workspaceId, page = 1, limit = 20) =>
    axiosInstance.get(`/workspaces/${workspaceId}/activity?page=${page}&limit=${limit}`),

  getManagerDashboard: () =>
    axiosInstance.get('/workspaces/dashboard/manager'),

  getEmployeeDashboard: () =>
    axiosInstance.get('/workspaces/dashboard/employee'),
};

// Task API
export const taskApi = {
  create: (workspaceId, data) =>
    axiosInstance.post(`/workspaces/${workspaceId}/tasks`, data),

  getAll: (workspaceId) =>
    axiosInstance.get(`/workspaces/${workspaceId}/tasks`),

  getById: (workspaceId, taskId) =>
    axiosInstance.get(`/workspaces/${workspaceId}/tasks/${taskId}`),

  update: (workspaceId, taskId, data) =>
    axiosInstance.put(`/workspaces/${workspaceId}/tasks/${taskId}`, data),

  delete: (workspaceId, taskId) =>
    axiosInstance.delete(`/workspaces/${workspaceId}/tasks/${taskId}`),

  submit: (workspaceId, taskId, data) =>
    axiosInstance.post(`/workspaces/${workspaceId}/tasks/${taskId}/submit`, data),

  getSubmission: (workspaceId, taskId) =>
    axiosInstance.get(`/workspaces/${workspaceId}/tasks/${taskId}/submission`),

  addComment: (workspaceId, taskId, content) =>
    axiosInstance.post(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, { content }),

  getComments: (workspaceId, taskId) =>
    axiosInstance.get(`/workspaces/${workspaceId}/tasks/${taskId}/comments`),

  uploadAttachment: (workspaceId, taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`/workspaces/${workspaceId}/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAttachments: (workspaceId, taskId) =>
    axiosInstance.get(`/workspaces/${workspaceId}/tasks/${taskId}/attachments`),

  deleteAttachment: (workspaceId, taskId, attachmentId) =>
    axiosInstance.delete(`/workspaces/${workspaceId}/tasks/${taskId}/attachments/${attachmentId}`),

  reorder: (workspaceId, taskIds) =>
    axiosInstance.patch(`/workspaces/${workspaceId}/tasks/reorder`, { taskIds }),

  approve: (workspaceId, taskId, approvalNote) =>
    axiosInstance.post(`/workspaces/${workspaceId}/tasks/${taskId}/approve`, { approvalNote }),

  reject: (workspaceId, taskId, approvalNote) =>
    axiosInstance.post(`/workspaces/${workspaceId}/tasks/${taskId}/reject`, { approvalNote }),
};

export default {
  authApi,
  workspaceApi,
  taskApi,
};
