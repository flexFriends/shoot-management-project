import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../api/index.js';

export default function Workspaces() {
  const { data, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspaceApi.getAll();
      return response.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <p>Loading...</p>
        ) : data?.workspaces?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.workspaces.map((ws) => (
              <div key={ws.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg">{ws.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{ws.description}</p>
                <p className="text-xs text-gray-500 mt-4">
                  Status: <span className="font-semibold">{ws.status}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No workspaces found</p>
        )}
      </main>
    </div>
  );
}
