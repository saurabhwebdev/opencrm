import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function InteractionDetailModal({ interaction, onClose, onEdit }) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Interaction Details
            </Dialog.Title>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(interaction.interaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="mt-1 text-sm text-gray-900">{interaction.duration} minutes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {interaction.status === 'completed' ? 'Completed' : 'Needs Follow-up'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary and Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Summary</label>
                    <p className="mt-1 text-sm text-gray-900">{interaction.summary}</p>
                  </div>
                  {interaction.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {interaction.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-up Information */}
              {(interaction.follow_up_date || interaction.follow_up_notes) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                    Follow-up
                  </h3>
                  <div className="space-y-4">
                    {interaction.follow_up_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Follow-up Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(interaction.follow_up_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {interaction.follow_up_notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Follow-up Notes
                        </label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {interaction.follow_up_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 