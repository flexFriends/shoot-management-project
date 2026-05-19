// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import { taskApi } from '../api/index.js';
// import { useAuthStore } from '../store/authStore.js';
// import Sidebar from '../components/layout/Sidebar.jsx';

// export default function TaskDetail() {
//   const { workspaceId, taskId } = useParams();
//   const navigate = useNavigate();
//   const user = useAuthStore((state) => state.user);
//   const [showSubmit, setShowSubmit] = useState(false);
//   const [submitForm, setSubmitForm] = useState({ submissionLink: '', note: '' });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showApproveModal, setShowApproveModal] = useState(false);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [approvalNote, setApprovalNote] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Fetch task details
//   const { data: task, isLoading: taskLoading, refetch: refetchTask } = useQuery({
//     queryKey: ['task', workspaceId, taskId],
//     queryFn: async () => {
//       const response = await taskApi.getById(workspaceId, taskId);
//       return response.data.data;
//     },
//   });

//   // Fetch task submission
//   const { data: submission } = useQuery({
//     queryKey: ['task-submission', taskId],
//     queryFn: async () => {
//       try {
//         const response = await taskApi.getSubmission(workspaceId, taskId);
//         return response.data.data;
//       } catch {
//         return null;
//       }
//     },
//   });

//   const handleSubmitTask = async (e) => {
//     e.preventDefault();
//     if (!submitForm.submissionLink?.trim()) {
//       toast.error('Please provide a submission link');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await taskApi.submit(workspaceId, taskId, submitForm);
//       toast.success('Task submitted successfully!');
//       setSubmitForm({ submissionLink: '', note: '' });
//       setShowSubmit(false);
//       refetchTask();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to submit task');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleApprove = async () => {
//     if (!approvalNote.trim()) {
//       toast.error('Please provide approval notes');
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       await taskApi.approve(workspaceId, taskId, approvalNote);
//       toast.success('Task approved successfully!');
//       setApprovalNote('');
//       setShowApproveModal(false);
//       refetchTask();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to approve task');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleReject = async () => {
//     if (!approvalNote.trim()) {
//       toast.error('Please provide a rejection reason');
//       return;
//     }

//     setIsProcessing(true);
//     try {
//       await taskApi.reject(workspaceId, taskId, approvalNote);
//       toast.success('Task rejected! Employee will resubmit.');
//       setApprovalNote('');
//       setShowRejectModal(false);
//       refetchTask();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to reject task');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (taskLoading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <p className="text-gray-500">Loading task...</p>
//       </div>
//     );
//   }

//   if (!task) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
//         <p className="text-gray-500 mb-4">Task not found</p>
//         <button
//           onClick={() => navigate(`/workspaces/${workspaceId}`)}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           Back to Workspace
//         </button>
//       </div>
//     );
//   }

//   const isEmployee = user.role === 'EMPLOYEE';
//   const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar Navigation */}
//       <Sidebar />

//       {/* Main Content */}
//       <main className="flex-1 ml-64 overflow-auto">
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-4xl font-bold text-gray-900">{task.title}</h1>
//             <p className="text-gray-600 mt-2">{task.description}</p>
//           </div>

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-6 py-8">
//         {/* Task Details */}
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <div>
//               <p className="text-gray-600 text-sm font-medium">Status</p>
//               <p className="text-lg font-semibold text-gray-900 mt-1">{task.status}</p>
//             </div>
//             {task.priority && (
//               <div>
//                 <p className="text-gray-600 text-sm font-medium">Priority</p>
//                 <p className="text-lg font-semibold text-gray-900 mt-1">{task.priority}</p>
//               </div>
//             )}
//             {task.dueDate && (
//               <div>
//                 <p className="text-gray-600 text-sm font-medium">Due Date</p>
//                 <p className="text-lg font-semibold text-gray-900 mt-1">
//                   {new Date(task.dueDate).toLocaleDateString()}
//                 </p>
//               </div>
//             )}
//             {task.createdBy && (
//               <div>
//                 <p className="text-gray-600 text-sm font-medium">Assigned By</p>
//                 <p className="text-lg font-semibold text-gray-900 mt-1">{task.createdBy.name}</p>
//               </div>
//             )}
//           </div>

//           {/* Description */}
//           {task.description && (
//             <div className="mb-6 pb-6 border-b">
//               <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
//               <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
//             </div>
//           )}

//           {/* Reference Link */}
//           {task.referenceLink && (
//             <div className="mb-6 pb-6 border-b bg-blue-50 p-4 rounded">
//               <h2 className="text-lg font-semibold text-gray-900 mb-2">Reference Link</h2>
//               <p className="text-gray-600 text-sm mb-2">
//                 This is the reference material you should follow or recreate:
//               </p>
//               <a
//                 href={task.referenceLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 Open Reference Link
//               </a>
//               <p className="text-xs text-gray-600 mt-2 break-all">{task.referenceLink}</p>
//             </div>
//           )}
//         </div>

//         {/* Submission Section */}
//         {isEmployee && (
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Your Submission</h2>
//               {!submission && !showSubmit && (
//                 <button
//                   onClick={() => setShowSubmit(true)}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                 >
//                   Submit Work
//                 </button>
//               )}
//             </div>

//             {submission ? (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <p className="text-green-700 font-medium mb-2">✓ Submitted</p>
//                 <p className="text-sm text-gray-600 mb-2">
//                   Submitted on: {new Date(submission.submittedAt).toLocaleString()}
//                 </p>
//                 <p className="text-sm font-medium text-gray-700 mb-1">Submission Link:</p>
//                 <a
//                   href={submission.submissionLink}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:text-blue-700 break-all text-sm"
//                 >
//                   {submission.submissionLink}
//                 </a>
//                 {submission.note && (
//                   <div className="mt-3 pt-3 border-t">
//                     <p className="text-sm font-medium text-gray-700 mb-1">Your Note:</p>
//                     <p className="text-sm text-gray-600 whitespace-pre-wrap">{submission.note}</p>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {showSubmit && (
//                   <form onSubmit={handleSubmitTask} className="space-y-4 bg-gray-50 p-4 rounded">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Submission Link *
//                       </label>
//                       <input
//                         type="url"
//                         value={submitForm.submissionLink}
//                         onChange={(e) => setSubmitForm({ ...submitForm, submissionLink: e.target.value })}
//                         placeholder="Paste your Instagram, Dropbox, or any link to your work"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                         autoComplete="off"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Optional Notes
//                       </label>
//                       <textarea
//                         value={submitForm.note}
//                         onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
//                         placeholder="Add any notes or comments about your work"
//                         rows="3"
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
//                       >
//                         {isSubmitting ? 'Submitting...' : 'Submit'}
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setShowSubmit(false)}
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </>
//             )}
//           </div>
//         )}

//         {/* Manager Review Section */}
//         {isManager && submission && (
//           <div className="bg-white rounded-lg shadow p-6 mt-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Submission</h2>
            
//             {/* Submission Details */}
//             <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
//               <p className="text-sm font-medium text-gray-700 mb-1">Submitted By:</p>
//               <p className="text-gray-900 font-semibold mb-3">{submission.submittedBy?.name}</p>
              
//               <p className="text-sm font-medium text-gray-700 mb-1">Submitted At:</p>
//               <p className="text-gray-600 mb-3">{new Date(submission.submittedAt).toLocaleString()}</p>
              
//               <p className="text-sm font-medium text-gray-700 mb-1">Submission Link:</p>
//               <a
//                 href={submission.submissionLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:text-blue-700 break-all text-sm mb-3 inline-block"
//               >
//                 {submission.submissionLink}
//               </a>
              
//               {submission.note && (
//                 <div className="pt-3 border-t">
//                   <p className="text-sm font-medium text-gray-700 mb-1">Employee's Note:</p>
//                   <p className="text-gray-600 whitespace-pre-wrap text-sm">{submission.note}</p>
//                 </div>
//               )}
//             </div>

//             {/* Status Badge */}
//             <div className="mb-4">
//               <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
//               <div className="flex items-center gap-2">
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   submission.status === 'APPROVED' 
//                     ? 'bg-green-100 text-green-700' 
//                     : submission.status === 'REJECTED'
//                     ? 'bg-red-100 text-red-700'
//                     : 'bg-yellow-100 text-yellow-700'
//                 }`}>
//                   {submission.status}
//                 </span>
//               </div>
//             </div>

//             {/* Approval Notes */}
//             {submission.approvalNote && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                 <p className="text-sm font-medium text-blue-900 mb-1">
//                   {submission.status === 'APPROVED' ? 'Approval Notes:' : 'Rejection Reason:'}
//                 </p>
//                 <p className="text-sm text-blue-800 whitespace-pre-wrap">{submission.approvalNote}</p>
//               </div>
//             )}

//             {/* Action Buttons */}
//             {submission.status === 'PENDING' && (
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowApproveModal(true)}
//                   className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
//                 >
//                   ✓ Approve
//                 </button>
//                 <button
//                   onClick={() => setShowRejectModal(true)}
//                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
//                 >
//                   ✗ Reject
//                 </button>
//               </div>
//             )}

//             {/* Approve Modal */}
//             {showApproveModal && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Submission?</h3>
//                   <textarea
//                     value={approvalNote}
//                     onChange={(e) => setApprovalNote(e.target.value)}
//                     placeholder="Write your approval notes or feedback..."
//                     rows="4"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
//                   />
//                   <div className="flex gap-2">
//                     <button
//                       onClick={handleApprove}
//                       disabled={isProcessing}
//                       className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
//                     >
//                       {isProcessing ? 'Processing...' : 'Confirm Approval'}
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowApproveModal(false);
//                         setApprovalNote('');
//                       }}
//                       className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Reject Modal */}
//             {showRejectModal && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Submission?</h3>
//                   <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejection so the employee knows what to fix.</p>
//                   <textarea
//                     value={approvalNote}
//                     onChange={(e) => setApprovalNote(e.target.value)}
//                     placeholder="Write your rejection reason..."
//                     rows="4"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
//                   />
//                   <div className="flex gap-2">
//                     <button
//                       onClick={handleReject}
//                       disabled={isProcessing}
//                       className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
//                     >
//                       {isProcessing ? 'Processing...' : 'Confirm Rejection'}
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowRejectModal(false);
//                         setApprovalNote('');
//                       }}
//                       className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </main>
//   </div>
//   );
// }


import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import Sidebar from '../components/layout/Sidebar.jsx';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' },
  ACTIVE:      { label: 'Active',      color: '#3B82F6', bg: '#DBEAFE', dot: '#3B82F6' },
  IN_PROGRESS: { label: 'In Progress', color: '#8B5CF6', bg: '#EDE9FE', dot: '#8B5CF6' },
  REVIEW:      { label: 'In Review',   color: '#F97316', bg: '#FFEDD5', dot: '#F97316' },
  COMPLETED:   { label: 'Completed',   color: '#10B981', bg: '#D1FAE5', dot: '#10B981' },
  REJECTED:    { label: 'Rejected',    color: '#EF4444', bg: '#FEE2E2', dot: '#EF4444' },
};

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: '#6B7280', bg: '#F3F4F6' },
  MEDIUM: { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  HIGH:   { label: 'High',   color: '#EF4444', bg: '#FEE2E2' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span style={{ background: cfg.bg, color: cfg.color }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
      <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full" />
      {cfg.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return (
    <span style={{ background: cfg.bg, color: cfg.color }}
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
      {cfg.label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TaskDetail() {
  const { workspaceId, taskId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({ submissionLink: '', note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: task, isLoading: taskLoading, refetch: refetchTask } = useQuery({
    queryKey: ['task', workspaceId, taskId],
    queryFn: async () => {
      const response = await taskApi.getById(workspaceId, taskId);
      return response.data.data;
    },
  });

  const { data: submission, refetch: refetchSubmission } = useQuery({
    queryKey: ['task-submission', taskId],
    queryFn: async () => {
      try {
        const response = await taskApi.getSubmission(workspaceId, taskId);
        return response.data.data;
      } catch {
        return null;
      }
    },
  });

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!submitForm.submissionLink?.trim()) {
      toast.error('Please provide a submission link');
      return;
    }
    setIsSubmitting(true);
    try {
      await taskApi.submit(workspaceId, taskId, submitForm);
      toast.success('Task submitted for review!');
      setSubmitForm({ submissionLink: '', note: '' });
      setShowSubmit(false);
      refetchTask();
      refetchSubmission();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!approvalNote.trim()) { toast.error('Please provide approval notes'); return; }
    setIsProcessing(true);
    try {
      await taskApi.approve(workspaceId, taskId, approvalNote);
      toast.success('Task approved!');
      setApprovalNote(''); setShowApproveModal(false);
      refetchTask(); refetchSubmission();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve task');
    } finally { setIsProcessing(false); }
  };

  const handleReject = async () => {
    if (!approvalNote.trim()) { toast.error('Please provide a rejection reason'); return; }
    setIsProcessing(true);
    try {
      await taskApi.reject(workspaceId, taskId, approvalNote);
      toast.success('Task rejected — employee notified.');
      setApprovalNote(''); setShowRejectModal(false);
      refetchTask(); refetchSubmission();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject task');
    } finally { setIsProcessing(false); }
  };

  if (taskLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center ml-0 pt-16 md:ml-64 md:pt-0">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading task...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col items-center justify-center ml-0 pt-16 md:ml-64 md:pt-0">
          <p className="text-gray-500 mb-4">Task not found</p>
          <button onClick={() => navigate(`/workspaces/${workspaceId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
            ← Back to Workspace
          </button>
        </main>
      </div>
    );
  }

  const isEmployee = user?.role === 'EMPLOYEE';
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const canSubmit = isEmployee && task.status !== 'COMPLETED' && task.status !== 'REVIEW';
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'COMPLETED';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .animate-modal { animation: modalIn 0.18s ease-out; }
        .task-card { transition: box-shadow 0.2s; }
        .task-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,0.10); }
      `}</style>

      <Sidebar />

      <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 overflow-auto transition-all duration-300">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

          {/* Back button */}
          <button onClick={() => navigate(`/workspaces/${workspaceId}`)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition mb-8 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Workspace
          </button>

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-8 mb-5 task-card">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight flex-1">{task.title}</h1>
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-6">
              {task.createdBy && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {task.createdBy.name?.[0]?.toUpperCase()}
                  </div>
                  <span>Assigned by <strong className="text-gray-700">{task.createdBy.name}</strong></span>
                </div>
              )}
              {dueDate && (
                <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                  <span>{isOverdue ? '⚠' : '📅'}</span>
                  <span>{isOverdue ? 'Overdue · ' : ''}{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 task-card">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{task.description}</p>
            </div>
          )}

          {/* Reference Link */}
          {task.referenceLink && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-5">
              <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Reference Material</h2>
              <p className="text-sm text-indigo-700 mb-3">Use this as your reference or recreate it:</p>
              <a href={task.referenceLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                Open Reference ↗
              </a>
              <p className="text-xs text-indigo-400 mt-2 break-all">{task.referenceLink}</p>
            </div>
          )}

          {/* ── EMPLOYEE: Submission Section ── */}
          {isEmployee && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 task-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Submission</h2>
                {canSubmit && !submission && !showSubmit && (
                  <button onClick={() => setShowSubmit(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    Submit Work
                  </button>
                )}
              </div>

              {submission ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={submission.status} />
                    <span className="text-xs text-gray-400">
                      Submitted {new Date(submission.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Submission Link</p>
                    <a href={submission.submissionLink} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm break-all font-medium">
                      {submission.submissionLink}
                    </a>
                  </div>

                  {submission.note && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Note</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.note}</p>
                    </div>
                  )}

                  {submission.approvalNote && (
                    <div className={`rounded-xl p-4 border ${
                      submission.status === 'APPROVED'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-red-50 border-red-100'
                    }`}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                        style={{ color: submission.status === 'APPROVED' ? '#059669' : '#DC2626' }}>
                        {submission.status === 'APPROVED' ? '✓ Manager Feedback' : '✗ Rejection Reason'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap"
                        style={{ color: submission.status === 'APPROVED' ? '#065F46' : '#7F1D1D' }}>
                        {submission.approvalNote}
                      </p>
                    </div>
                  )}

                  {submission.status === 'REJECTED' && canSubmit && !showSubmit && (
                    <button
                      type="button"
                      onClick={() => setShowSubmit(true)}
                      className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                      Resubmit Work
                    </button>
                  )}

                  {submission.status === 'REJECTED' && canSubmit && showSubmit && (
                    <form onSubmit={handleSubmitTask} className="space-y-4 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Submission Link <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="url"
                          value={submitForm.submissionLink}
                          onChange={(e) => setSubmitForm({ ...submitForm, submissionLink: e.target.value })}
                          placeholder="https://instagram.com/p/... or Dropbox link"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Notes (optional)
                        </label>
                        <textarea
                          value={submitForm.note}
                          onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
                          placeholder="Tell the manager what you changed..."
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none transition"
                        />
                      </div>
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Submitting...' : 'Resubmit for Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSubmit(false)}
                          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  {!showSubmit ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No submission yet. Click "Submit Work" to submit your work.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitTask} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Submission Link <span className="text-red-400">*</span>
                        </label>
                        <input type="url" value={submitForm.submissionLink}
                          onChange={(e) => setSubmitForm({ ...submitForm, submissionLink: e.target.value })}
                          placeholder="https://instagram.com/p/... or Dropbox link"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition"
                          autoComplete="off" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          Notes (optional)
                        </label>
                        <textarea value={submitForm.note}
                          onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
                          placeholder="Any comments about your submission..."
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none transition" />
                      </div>
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <button type="submit" disabled={isSubmitting}
                          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
                          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                        </button>
                        <button type="button" onClick={() => setShowSubmit(false)}
                          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── MANAGER: Review Section ── */}
          {isManager && submission && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 task-card">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Review Submission</h2>

              <div className="space-y-4">
                {/* Employee info */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                      {submission.submittedBy?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{submission.submittedBy?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>

                {/* Submission link */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Submission Link</p>
                  <a href={submission.submissionLink} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-sm break-all font-medium">
                    {submission.submissionLink} ↗
                  </a>
                </div>

                {submission.note && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Employee's Note</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.note}</p>
                  </div>
                )}

                {/* Prior approval note */}
                {submission.approvalNote && (
                  <div className={`rounded-xl p-4 border ${
                    submission.status === 'APPROVED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                  }`}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1"
                      style={{ color: submission.status === 'APPROVED' ? '#059669' : '#DC2626' }}>
                      {submission.status === 'APPROVED' ? 'Approval Notes' : 'Rejection Reason'}
                    </p>
                    <p className="text-sm whitespace-pre-wrap"
                      style={{ color: submission.status === 'APPROVED' ? '#065F46' : '#991B1B' }}>
                      {submission.approvalNote}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {submission.status === 'PENDING' && (
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button onClick={() => setShowApproveModal(true)}
                      className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                      ✓ Approve
                    </button>
                    <button onClick={() => setShowRejectModal(true)}
                      className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && (
        <Modal title="Approve Submission" onClose={() => { setShowApproveModal(false); setApprovalNote(''); }}>
          <p className="text-sm text-gray-500 mb-4">Add feedback for the employee before approving.</p>
          <textarea value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)}
            placeholder="Great work! The submission looks perfect..."
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none resize-none mb-4 transition" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={handleApprove} disabled={isProcessing}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
              {isProcessing ? 'Processing...' : 'Confirm Approval'}
            </button>
            <button onClick={() => { setShowApproveModal(false); setApprovalNote(''); }}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal title="Reject Submission" onClose={() => { setShowRejectModal(false); setApprovalNote(''); }}>
          <p className="text-sm text-gray-500 mb-4">Tell the employee what needs to be fixed so they can resubmit.</p>
          <textarea value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)}
            placeholder="Please revise the following..."
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none resize-none mb-4 transition" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={handleReject} disabled={isProcessing}
              className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50">
              {isProcessing ? 'Processing...' : 'Confirm Rejection'}
            </button>
            <button onClick={() => { setShowRejectModal(false); setApprovalNote(''); }}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
