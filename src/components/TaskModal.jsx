import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { tasksService, contactsService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function TaskModal({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    contact_id: task?.contact_id || '',
    contact_name: task?.contact_name || '',
    notes: task?.notes || ''
  });
  
  const [contacts, setContacts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const loadedContacts = await contactsService.getAll();
          setContacts(loadedContacts);

          if (task) {
            setFormData({
              title: task.title || '',
              description: task.description || '',
              due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
              priority: task.priority || 'medium',
              status: task.status || 'pending',
              contact_id: task.contact_id || '',
              contact_name: task.contact_name || '',
              notes: task.notes || ''
            });
          }
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Error loading data');
        }
      }
    };

    loadData();
  }, [task, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        priority: formData.priority,
        status: formData.status,
        contact_id: formData.contact_id,
        contact_name: formData.contact_name,
        notes: formData.notes,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (task) {
        await tasksService.update(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await tasksService.add(taskData);
        toast.success('Task created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(task ? 'Error updating task' : 'Error creating task');
      console.error('Error:', error);
    }
  };

  const handleContactChange = (e) => {
    const selectedContact = contacts.find(c => c.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      contact_id: selectedContact?.id || '',
      contact_name: selectedContact?.name || ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {task ? 'Edit Task' : 'Create Task'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input mt-1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="input mt-1"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                className="input mt-1"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                className="input mt-1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="input mt-1"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Associated Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Associated Contact
              </label>
              <select
                className="input mt-1"
                value={formData.contact_id}
                onChange={handleContactChange}
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                className="input mt-1"
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 