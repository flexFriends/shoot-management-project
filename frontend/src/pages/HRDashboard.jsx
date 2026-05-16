import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/index.js';
import AddUserForm from '../components/hr/AddUserForm.jsx';

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

export default function HRDashboard() {
  const { data } = useQuery({
    queryKey: ['hr-dashboard'],
    queryFn: async () => {
      const res = await authApi.getHRDashboard();
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-gray-500">HR Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Welcome HR</h1>
        <p className="mt-1 text-gray-600">Quick overview and actions for HR.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={data?.total ?? '--'} />
        <StatCard label="Managers" value={data?.managers ?? '--'} />
        <StatCard label="Employees" value={data?.employees ?? '--'} />
        <StatCard label="HRs" value={data?.hrs ?? '--'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="col-span-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Add user</h2>
          <div className="mt-4">
            <AddUserForm roles={["EMPLOYEE", "MANAGER"]} />
          </div>
        </section>

        <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Manage users</h2>
          <p className="mt-2 text-sm text-gray-500">Use the Users page for full management.</p>
          <div className="mt-4">
            <a href="/users" className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-white">Open Users</a>
          </div>
        </section>
      </div>
    </div>
  );
}
