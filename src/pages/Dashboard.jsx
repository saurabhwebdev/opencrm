import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksService, contactsService, interactionsService } from '../services/databaseService';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
    totalInteractions: 0,
    interactionsThisWeek: 0,
    recentTasks: [],
    recentContacts: [],
    recentInteractions: [],
    tasksByPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    upcomingFollowUps: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      calculateStats();
    }
  }, [user]);

  const calculateStats = async () => {
    try {
      const [contacts, tasks, interactions] = await Promise.all([
        contactsService.getAll(),
        tasksService.getAll(),
        interactionsService.getAll()
      ]);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const dashboardStats = {
        totalContacts: contacts.length,
        totalTasks: tasks.length,
        overdueTasks: tasks.filter(task => 
          new Date(task.dueDate) < now && task.status !== 'completed'
        ).length,
        completedTasks: tasks.filter(task => task.status === 'completed').length,
        totalInteractions: interactions.length,
        interactionsThisWeek: interactions.filter(interaction => 
          new Date(interaction.interaction_date) > weekAgo
        ).length,
        recentTasks: tasks
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5),
        recentContacts: contacts
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5),
        recentInteractions: interactions
          .sort((a, b) => new Date(b.interaction_date) - new Date(a.interaction_date))
          .slice(0, 5),
        tasksByPriority: {
          high: tasks.filter(task => task.priority === 'high').length,
          medium: tasks.filter(task => task.priority === 'medium').length,
          low: tasks.filter(task => task.priority === 'low').length
        },
        upcomingFollowUps: interactions
          .filter(interaction => 
            interaction.follow_up_date && 
            new Date(interaction.follow_up_date) > now &&
            interaction.status === 'needs_follow_up'
          )
          .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date))
          .slice(0, 5)
      };

      setStats(dashboardStats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setIsLoading(false);
    }
  };

  const taskPriorityChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [stats.tasksByPriority.high, stats.tasksByPriority.medium, stats.tasksByPriority.low],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
      },
    ],
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
      </div>

      {/* Stats Grid */}
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
          title="Overdue Tasks"
          value={stats.overdueTasks}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
        />
        <StatCard
          title="Interactions This Week"
          value={stats.interactionsThisWeek}
          icon={ChatBubbleLeftRightIcon}
          color="bg-green-500"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Priority Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Priority</h2>
          <div className="h-64">
            <Bar 
              data={taskPriorityChartData} 
              options={{
                responsive: true,
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

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Follow-ups</h2>
            <Link to="/interactions" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingFollowUps.map(interaction => (
              <div key={interaction.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)} with {interaction.contacts?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Follow-up: {new Date(interaction.follow_up_date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm text-blue-600">
                  {interaction.summary}
                </span>
              </div>
            ))}
            {stats.upcomingFollowUps.length === 0 && (
              <p className="text-sm text-gray-500">No upcoming follow-ups</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <RecentActivityCard
          title="Recent Tasks"
          items={stats.recentTasks}
          viewAllLink="/tasks"
          renderItem={(task) => (
            <>
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </>
          )}
        />

        {/* Recent Contacts */}
        <RecentActivityCard
          title="Recent Contacts"
          items={stats.recentContacts}
          viewAllLink="/contacts"
          renderItem={(contact) => (
            <>
              <p className="text-sm font-medium text-gray-900">{contact.name}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">{contact.email}</p>
                <span className="text-xs text-gray-500">{contact.company}</span>
              </div>
            </>
          )}
        />

        {/* Recent Interactions */}
        <RecentActivityCard
          title="Recent Interactions"
          items={stats.recentInteractions}
          viewAllLink="/interactions"
          renderItem={(interaction) => (
            <>
              <p className="text-sm font-medium text-gray-900">
                {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {new Date(interaction.interaction_date).toLocaleDateString()}
                </p>
                <span className="text-xs text-blue-600">{interaction.contacts?.name}</span>
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${color}/10 mr-4`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const RecentActivityCard = ({ title, items, viewAllLink, renderItem }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <Link to={viewAllLink} className="text-sm text-blue-600 hover:text-blue-800">
        View all
      </Link>
    </div>
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
          {renderItem(item)}
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-gray-500">No recent activity</p>
      )}
    </div>
  </div>
); 