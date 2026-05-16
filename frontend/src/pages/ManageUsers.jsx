import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import AddUserForm from '../components/hr/AddUserForm.jsx';

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', 1],
    queryFn: async () => {
      const res = await authApi.getAllUsers(1, 50);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => authApi.createUser(payload),
    onSuccess: () => {
      toast.success('User created');
      queryClient.invalidateQueries(['users']);
      setForm({ name: '', email: '', password: '', role: 'EMPLOYEE' });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId) => authApi.deactivateUser(userId),
    onSuccess: () => {
      toast.success('User deactivated');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to deactivate'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => authApi.changeUserRole(userId, role),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update role'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    // basic validation
    if (!form.email || !form.password || !form.name) return toast.error('Please fill required fields');

    // HR restriction handled on backend; but limit role options in UI
    createMutation.mutate(form);
  };

  const roleOptions = currentUser?.role === 'HR'
    ? ['MANAGER', 'EMPLOYEE']
    : ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-gray-500">User Management</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Manage users</h1>
        <p className="mt-1 text-gray-600">Create employees and managers, view and manage existing users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Create user</h2>
          <div className="mt-4">
            <AddUserForm roles={roleOptions} />
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <p className="text-gray-500">Loading users...</p>
            ) : (
              <div className="space-y-3">
                {data?.users && data.users.length > 0 ? (
                  data.users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{u.name} <span className="text-sm text-gray-500">({u.email})</span></p>
                        <p className="text-sm text-gray-500">Role: {u.role} • Created: {new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select defaultValue={u.role} onChange={(e) => changeRoleMutation.mutate({ userId: u.id, role: e.target.value })} className="rounded-md border-gray-200">
                          {roleOptions.concat(['ADMIN', 'HR']).filter((r, idx, arr) => arr.indexOf(r) === idx).map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <button onClick={() => deactivateMutation.mutate(u.id)} className="rounded-md bg-red-600 px-3 py-1 text-white">Deactivate</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No users found.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
