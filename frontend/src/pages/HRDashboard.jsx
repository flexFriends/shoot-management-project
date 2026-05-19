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
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-6 max-w-4xl">
        <p className="text-xs font-semibold uppercase text-gray-500">HR Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Welcome HR</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">Quick overview and actions for HR.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={data?.total ?? '--'} />
        <StatCard label="Managers" value={data?.managers ?? '--'} />
        <StatCard label="Employees" value={data?.employees ?? '--'} />
        <StatCard label="HRs" value={data?.hrs ?? '--'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">Add user</h2>
          <div className="mt-4">
            <AddUserForm roles={["EMPLOYEE", "MANAGER"]} />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Manage users</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">Use the Users page for full management.</p>
          <div className="mt-4">
            <a href="/users" className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto sm:px-5 sm:py-2.5">Open Users</a>
          </div>
        </section>
      </div>
    </div>
  );
}
