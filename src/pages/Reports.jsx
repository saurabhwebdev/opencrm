import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { contactsService, tasksService, interactionsService } from '../services/databaseService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Reports() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalTasks: 0,
    tasksThisWeek: 0,
    overdueTasks: 0,
    totalInteractions: 0,
    completedInteractions: 0,
    needsFollowUp: 0,
    interactionsByType: {
      meeting: 0,
      call: 0,
      email: 0
    },
    tasksByPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    recentActivity: []
  });

  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [contacts, tasks, interactions] = await Promise.all([
        contactsService.getAll(),
        tasksService.getAll(),
        interactionsService.getAll()
      ]);

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const timeframeDate = timeframe === 'week' ? weekAgo : monthAgo;

      const recentInteractions = interactions.filter(i => 
        new Date(i.interaction_date) > timeframeDate
      );

      const recentTasks = tasks.filter(t => 
        new Date(t.created_at) > timeframeDate
      );

      setStats({
        totalContacts: contacts.length,
        totalTasks: tasks.length,
        tasksThisWeek: tasks.filter(t => new Date(t.dueDate) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)).length,
        overdueTasks: tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'completed').length,
        totalInteractions: interactions.length,
        completedInteractions: interactions.filter(i => i.status === 'completed').length,
        needsFollowUp: interactions.filter(i => i.status === 'needs_follow_up').length,
        interactionsByType: {
          meeting: recentInteractions.filter(i => i.type === 'meeting').length,
          call: recentInteractions.filter(i => i.type === 'call').length,
          email: recentInteractions.filter(i => i.type === 'email').length
        },
        tasksByPriority: {
          high: recentTasks.filter(t => t.priority === 'high').length,
          medium: recentTasks.filter(t => t.priority === 'medium').length,
          low: recentTasks.filter(t => t.priority === 'low').length
        },
        recentActivity: [...recentInteractions, ...recentTasks]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error loading reports');
    } finally {
      setIsLoading(false);
    }
  };

  const interactionChartData = {
    labels: ['Meetings', 'Calls', 'Emails'],
    datasets: [{
      data: [
        stats.interactionsByType.meeting,
        stats.interactionsByType.call,
        stats.interactionsByType.email
      ],
      backgroundColor: ['#60A5FA', '#34D399', '#F472B6'],
    }]
  };

  const taskPriorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      label: 'Tasks by Priority',
      data: [
        stats.tasksByPriority.high,
        stats.tasksByPriority.medium,
        stats.tasksByPriority.low
      ],
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
    }]
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Overview of your CRM activity</p>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeframe === 'week' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeframe === 'month' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
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

          {/* Interaction Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interaction Types</h3>
              <div className="h-64">
                <Pie data={interactionChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
              <div className="h-64">
                <Bar 
                  data={taskPriorityData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    'interaction_date' in activity ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {'interaction_date' in activity 
                      ? <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                      : <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {'interaction_date' in activity 
                        ? `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} with ${activity.contacts?.name}`
                        : activity.title
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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