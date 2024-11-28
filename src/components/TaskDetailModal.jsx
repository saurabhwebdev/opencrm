import React from 'react';
import { XMarkIcon, PencilIcon, CalendarIcon, UserIcon, ClipboardDocumentListIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

export default function TaskDetailModal({ task, onClose, onEdit }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'low':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-xl rounded-xl bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {task.title}
            </h3>
            <div className="flex gap-2 mt-2">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            {task.contactName && (
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="h-5 w-5" />
                <span className="text-sm">Contact: {task.contactName}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="pt-4">
              <div className="flex items-center gap-2 text-gray-900 mb-2">
                <ClipboardDocumentListIcon className="h-5 w-5" />
                <h5 className="text-sm font-medium">Description</h5>
              </div>
              <p className="text-gray-600 text-sm pl-7 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="pt-4">
              <div className="flex items-center gap-2 text-gray-900 mb-2">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                <h5 className="text-sm font-medium">Notes</h5>
              </div>
              <p className="text-gray-600 text-sm pl-7 whitespace-pre-wrap">{task.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 mt-6 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Created {new Date(task.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 