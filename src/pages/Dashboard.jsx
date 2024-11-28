import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksService, contactsService } from '../services/databaseService';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
    recentTasks: [],
    recentContacts: [],
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      calculateStats();
    }
  }, [user]);

  const calculateStats = async () => {
    try {
      const contacts = await contactsService.getAll();
      const tasks = await tasksService.getAll();
      const now = new Date();

      const dashboardStats = {
        totalContacts: contacts.length,
        totalTasks: tasks.length,
        overdueTasks: tasks.filter(task => 
          new Date(task.dueDate) < now && task.status !== 'completed'
        ).length,
        completedTasks: tasks.filter(task => task.status === 'completed').length,
        recentTasks: tasks
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5),
        recentContacts: contacts
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5),
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your CRM dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500/10 mr-4">
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500/10 mr-4">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-500/10 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overdueTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500/10 mr-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            ))}
            {stats.recentTasks.length === 0 && (
              <p className="text-sm text-gray-500">No tasks yet</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Contacts</h2>
            <Link to="/contacts" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentContacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.email}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {contact.country}
                </span>
              </div>
            ))}
            {stats.recentContacts.length === 0 && (
              <p className="text-sm text-gray-500">No contacts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 