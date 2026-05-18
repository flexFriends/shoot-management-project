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
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Full name"
          className="w-full rounded-md border border-gray-200 px-3 py-2"
        />
        <input
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          placeholder="Email address"
          type="email"
          className="w-full rounded-md border border-gray-200 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          placeholder="Password"
          type="password"
          className="w-full rounded-md border border-gray-200 px-3 py-2"
        />
        <select
          value={form.role}
          onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          className="w-full rounded-md border border-gray-200 px-3 py-2"
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end">
        <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">
          {submitting ? 'Creating...' : 'Create user'}
        </button>
      </div>
    </form>
  );
}
