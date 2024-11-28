import React, { useEffect, useState } from 'react';
import { tasksService, contactsService } from '../services/databaseService';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Reports() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalTasks: 0,
    tasksByStatus: {
      pending: 0,
      in_progress: 0,
      completed: 0,
    },
    tasksByPriority: {
      high: 0,
      medium: 0,
      low: 0,
    },
    tasksThisWeek: 0,
    overdueTasks: 0,
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
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const taskStats = {
        totalContacts: contacts.length,
        totalTasks: tasks.length,
        tasksByStatus: {
          pending: 0,
          in_progress: 0,
          completed: 0,
        },
        tasksByPriority: {
          high: 0,
          medium: 0,
          low: 0,
        },
        tasksThisWeek: 0,
        overdueTasks: 0,
      };

      tasks.forEach(task => {
        // Count by status
        taskStats.tasksByStatus[task.status]++;

        // Count by priority
        taskStats.tasksByPriority[task.priority]++;

        // Count tasks due this week
        const dueDate = new Date(task.due_date);
        if (dueDate >= weekStart && dueDate <= new Date()) {
          taskStats.tasksThisWeek++;
        }

        // Count overdue tasks
        if (dueDate < new Date() && task.status !== 'completed') {
          taskStats.overdueTasks++;
        }
      });

      setStats(taskStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of your CRM activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={ClipboardDocumentListIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Due This Week"
          value={stats.tasksThisWeek}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
        />
      </div>

      {/* Task Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Status Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Completed</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.tasksByStatus.completed}
                </span>
              </div>
              <ProgressBar
                value={stats.tasksByStatus.completed}
                total={stats.totalTasks}
                color="bg-green-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.tasksByStatus.in_progress}
                </span>
              </div>
              <ProgressBar
                value={stats.tasksByStatus.in_progress}
                total={stats.totalTasks}
                color="bg-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Pending</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.tasksByStatus.pending}
                </span>
              </div>
              <ProgressBar
                value={stats.tasksByStatus.pending}
                total={stats.totalTasks}
                color="bg-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Priority Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">High Priority</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.tasksByPriority.high}
                </span>
              </div>
              <ProgressBar
                value={stats.tasksByPriority.high}
                total={stats.totalTasks}
                color="bg-red-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Medium Priority</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.tasksByPriority.medium}
                </span>
              </div>
              <ProgressBar
                value={stats.tasksByPriority.medium}
                total={stats.totalTasks}
                color="bg-yellow-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Low Priority</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.tasksByPriority.low}
                </span>
              </div>
              <ProgressBar
                value={stats.tasksByPriority.low}
                total={stats.totalTasks}
                color="bg-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 