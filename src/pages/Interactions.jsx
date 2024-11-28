import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { interactionsService } from '../services/databaseService';
import InteractionModal from '../components/InteractionModal';
import InteractionDetailModal from '../components/InteractionDetailModal';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';

export default function Interactions() {
  const [interactions, setInteractions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInteractions();
    }
  }, [user]);

  const fetchInteractions = async () => {
    setIsLoading(true);
    try {
      const data = await interactionsService.getAll();
      setInteractions(data);
    } catch (error) {
      toast.error('Error loading interactions');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setIsAddModalOpen(false);
    setSelectedInteraction(null);
    fetchInteractions();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interaction?')) {
      try {
        await interactionsService.delete(id);
        toast.success('Interaction deleted successfully');
        await fetchInteractions();
      } catch (error) {
        toast.error('Error deleting interaction');
        console.error('Error:', error);
      }
    }
  };

  const handleInteractionClick = (interaction) => {
    setSelectedInteraction(interaction);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };

  // Filter and sort interactions
  const filteredInteractions = interactions
    .filter(interaction => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        interaction.summary?.toLowerCase().includes(searchLower) ||
        interaction.contacts?.name?.toLowerCase().includes(searchLower);

      const matchesType = filters.type === 'all' || interaction.type === filters.type;
      const matchesStatus = filters.status === 'all' || interaction.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      switch (filters.sortBy) {
        case 'date':
          return order * (new Date(a.interaction_date) - new Date(b.interaction_date));
        case 'type':
          return order * a.type.localeCompare(b.type);
        case 'status':
          return order * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Interactions</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Interaction
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
                placeholder="Search interactions..."
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
                  
                  {/* Type Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      className="input w-full"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="all">All Types</option>
                      <option value="meeting">Meeting</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
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
                      <option value="completed">Completed</option>
                      <option value="needs_follow_up">Needs Follow-up</option>
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
                      <option value="date">Date</option>
                      <option value="type">Type</option>
                      <option value="status">Status</option>
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
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  <button
                    onClick={() => {
                      setFilters({
                        type: 'all',
                        status: 'all',
                        sortBy: 'date',
                        sortOrder: 'desc'
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredInteractions.length === 0 ? (
        <EmptyState
          title="No interactions found"
          description="Get started by adding your first interaction."
          buttonText="Add Interaction"
          onClick={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInteractions.map((interaction) => (
                  <tr
                    key={interaction.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleInteractionClick(interaction)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {interaction.contacts?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {interaction.contacts?.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interaction.interaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {interaction.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        interaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interaction.status === 'completed' ? 'Completed' : 'Needs Follow-up'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interaction.follow_up_date && (
                        new Date(interaction.follow_up_date).toLocaleDateString()
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInteraction(interaction);
                            setIsAddModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(interaction.id);
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
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <InteractionModal
          interaction={selectedInteraction}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedInteraction(null);
          }}
          onSave={handleSave}
        />
      )}

      {isDetailModalOpen && selectedInteraction && (
        <InteractionDetailModal
          interaction={selectedInteraction}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedInteraction(null);
          }}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
} 