// Beautiful Card Components
export const StatCard = ({ icon, label, value, subtext, color = 'blue', onClick, className = '' }) => {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-600',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl p-6 border shadow-sm hover:shadow-lg transition cursor-pointer ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold uppercase tracking-wider text-gray-600">{label}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      {subtext && <p className="text-sm text-gray-600">{subtext}</p>}
    </div>
  );
};

export const WorkspaceCard = ({ workspace, onEdit, onDelete, onView, status }) => {
  const statusConfig = {
    ACTIVE: { color: 'green', icon: '▶️' },
    DRAFT: { color: 'amber', icon: '📝' },
    COMPLETED: { color: 'blue', icon: '✅' },
    IN_PROGRESS: { color: 'purple', icon: '⏳' },
    ARCHIVED: { color: 'gray', icon: '🗂️' },
    PENDING: { color: 'red', icon: '⚠️' },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition group">
      {/* Header */}
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-blue-600 relative overflow-hidden">
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${config.color}-100 text-${config.color}-700`}>
            {config.icon} {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{workspace.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workspace.description || 'No description'}</p>

        {/* Meta */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{new Date(workspace.shootDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{workspace.members?.length || 0} members</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
          >
            View
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const TaskCard = ({ task, onView, onEdit }) => {
  const statusConfig = {
    PENDING: { color: 'gray', icon: '⏳' },
    ASSIGNED: { color: 'blue', icon: '📋' },
    IN_PROGRESS: { color: 'purple', icon: '⚙️' },
    SUBMITTED: { color: 'amber', icon: '📤' },
    APPROVED: { color: 'green', icon: '✅' },
    REJECTED: { color: 'red', icon: '❌' },
  };

  const config = statusConfig[task.status] || statusConfig.PENDING;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">{task.title}</h3>
        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold bg-${config.color}-100 text-${config.color}-700 whitespace-nowrap`}>
          {config.icon} {task.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
        >
          View
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  );
);

export const EmptyState = ({ icon = '📭', title, description, actionText, onAction }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
    {onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
      >
        {actionText || 'Take Action'}
      </button>
    )}
  </div>
);

export const PageHeader = ({ title, subtitle, actionText, onAction, icon = '📊' }) => (
  <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{icon}</span>
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
      </div>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
    {onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
      >
        {actionText}
      </button>
    )}
  </div>
);
