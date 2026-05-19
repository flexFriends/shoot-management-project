import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/index.js';
import toast from 'react-hot-toast';

export default function AddUserForm({ initialRole = 'EMPLOYEE', roles = ['EMPLOYEE', 'MANAGER'] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: initialRole });

  const createMutation = useMutation({
    mutationFn: (payload) => authApi.createUser(payload),
    onSuccess: () => {
      toast.success('User created');
      setForm({ name: '', email: '', password: '', role: initialRole });
      queryClient.invalidateQueries(['hr-dashboard']);
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create user'),
  });

  const submitting = createMutation.isLoading;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.error('Please fill required fields');
    }

    const submitData = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    
    createMutation.mutate(submitData);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Full name"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          placeholder="Email address"
          type="email"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          placeholder="Password"
          type="password"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          value={form.role}
          onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="flex items-stretch sm:items-center justify-stretch sm:justify-end">
        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto sm:px-5 sm:py-2.5">
          {submitting ? 'Creating...' : 'Create user'}
        </button>
      </div>
    </form>
  );
}
