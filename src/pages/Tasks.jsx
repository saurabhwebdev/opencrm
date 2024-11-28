import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { tasksService } from '../services/databaseService';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksService.getAll();
      setTasks(data);
    } catch (error) {
      toast.error('Error loading tasks');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.contactName?.toLowerCase().includes(searchLower);

      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || task.status === filters.status;

      return matchesSearch && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'dueDate':
          return order * (new Date(a.dueDate) - new Date(b.dueDate));
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return order * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'title':
          return order * a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleSave = async () => {
    setIsAddModalOpen(false);
    setSelectedTask(null);
    await fetchTasks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.delete(id);
        toast.success('Task deleted successfully');
        await fetchTasks();
      } catch (error) {
        toast.error('Error deleting task');
        console.error('Error:', error);
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search tasks by title, description, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="btn btn-secondary flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Filter & Sort</h3>
                  
                  {/* Priority Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="input w-full"
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="input w-full"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      className="input w-full"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="title">Title</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <select
                      className="input w-full"
                      value={filters.sortOrder}
                      onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  <button
                    onClick={() => {
                      setFilters({
                        priority: 'all',
                        status: 'all',
                        sortBy: 'dueDate',
                        sortOrder: 'asc'
                      });
                      setIsFilterOpen(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          type="tasks"
          title={searchTerm || filters.priority !== 'all' || filters.status !== 'all' 
            ? "No tasks found"
            : "No tasks yet"}
          description={searchTerm || filters.priority !== 'all' || filters.status !== 'all'
            ? "Try adjusting your search or filter criteria"
            : "Get started by creating your first task"}
          actionText="Add Task"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    {task.contactName && (
                      <div className="text-sm text-gray-500">
                        For: {task.contactName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                      {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setIsAddModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
} 