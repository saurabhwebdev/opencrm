import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { parsePhoneNumber } from 'libphonenumber-js';
import { contactsService } from '../services/databaseService';
import * as countryFlags from 'country-flag-icons/react/3x2';
import { countries } from '../data/countries';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';

const getCountryFromPhone = (phoneNumber) => {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    if (parsed) {
      const country = countries.find(c => c.code === parsed.country);
      if (country) {
        const FlagComponent = countryFlags[parsed.country];
        return {
          code: parsed.country,
          name: country.name,
          flag: FlagComponent ? <FlagComponent className="h-4 w-6 mr-2" /> : null
        };
      }
    }
  } catch (error) {
    console.warn('Error parsing phone number:', error);
  }
  return null;
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await contactsService.getAll();
      setContacts(data);
    } catch (error) {
      toast.error('Error loading contacts');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts
    .filter(contact => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.phone.includes(searchTerm) ||
        (contact.company && contact.company.toLowerCase().includes(searchLower));

      const matchesCountry = filters.country === 'all' || 
        (getCountryFromPhone(contact.phone)?.code === filters.country);

      return matchesSearch && matchesCountry;
    })
    .sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'name':
          return order * a.name.localeCompare(b.name);
        case 'email':
          return order * a.email.localeCompare(b.email);
        case 'country':
          const countryA = getCountryFromPhone(a.phone)?.name || '';
          const countryB = getCountryFromPhone(b.phone)?.name || '';
          return order * countryA.localeCompare(countryB);
        default:
          return 0;
      }
    });

  // Get unique countries from contacts
  const uniqueCountries = [...new Set(contacts
    .map(contact => getCountryFromPhone(contact.phone))
    .filter(Boolean)
    .map(country => ({ code: country.code, name: country.name }))
  )].sort((a, b) => a.name.localeCompare(b.name));

  const handleSave = () => {
    setIsAddModalOpen(false);
    setSelectedContact(null);
    fetchContacts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsService.delete(id);
        toast.success('Contact deleted successfully');
        await fetchContacts();
      } catch (error) {
        toast.error('Error deleting contact');
        console.error('Error:', error);
      }
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };

  const getFlagComponent = (countryCode) => {
    if (!countryCode) return null;
    const Flag = countryFlags[countryCode];
    return Flag ? <Flag className="h-4 w-6 inline-block mr-2" /> : null;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Contact
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
                placeholder="Search contacts by name, email, phone, or company..."
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
                  
                  {/* Country Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      className="input w-full"
                      value={filters.country}
                      onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    >
                      <option value="all">All Countries</option>
                      {uniqueCountries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
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
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="country">Country</option>
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
                        country: 'all',
                        sortBy: 'name',
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

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          type="contacts"
          title={searchTerm || filters.country !== 'all'
            ? "No contacts found"
            : "Your contacts list is empty"}
          description={searchTerm || filters.country !== 'all'
            ? "Try adjusting your search or filter criteria"
            : "Add your first contact to start building your network"}
          actionText="Add Contact"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Country
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact, index) => {
                const country = getCountryFromPhone(contact.phone);
                return (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleContactClick(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        {country && (
                          <>
                            {getFlagComponent(country.code)}
                            {country.name}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContact(contact);
                            setIsAddModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contact.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <ContactModal
          contact={selectedContact}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedContact(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedContact(null);
          }}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}

function ContactModal({ contact, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    notes: contact?.notes || '',
    countryCode: contact?.countryCode || 'US',
    company: contact?.company || '',
    title: contact?.title || '',
    address: contact?.address || '',
  });

  // Extract local number from full phone number
  const getLocalNumber = (fullNumber) => {
    if (!fullNumber) return '';
    const country = countries.find(c => c.code === formData.countryCode);
    return fullNumber.replace(country.dial_code, '').trim();
  };

  // Get the initial local number
  const [localNumber, setLocalNumber] = useState(getLocalNumber(contact?.phone || ''));
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'additional'

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    setLocalNumber(value);
    
    const country = countries.find(c => c.code === formData.countryCode);
    const fullNumber = value ? `${country.dial_code}${value}` : '';
    setFormData({ ...formData, phone: fullNumber });
  };

  const handleCountryChange = (e) => {
    const newCountryCode = e.target.value;
    setFormData({ ...formData, countryCode: newCountryCode });
    
    // Update phone number with new country code
    const country = countries.find(c => c.code === newCountryCode);
    const fullNumber = localNumber ? `${country.dial_code}${localNumber}` : '';
    setFormData(prev => ({ ...prev, countryCode: newCountryCode, phone: fullNumber }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.phone) {
        toast.error('Please enter a valid phone number');
        return;
      }

      if (contact) {
        contactsService.update(contact.id, formData);
        toast.success('Contact updated successfully');
      } else {
        contactsService.add(formData);
        toast.success('Contact added successfully');
      }
      onSave();
    } catch (error) {
      toast.error(contact ? 'Error updating contact' : 'Error adding contact');
      console.error('Error:', error);
    }
  };

  const TabButton = ({ tab, label }) => (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
        activeTab === tab
          ? 'bg-white text-blue-600 border-t border-x border-gray-200'
          : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {label}
    </button>
  );

  const getFlagEmoji = (countryCode) => {
    const Flag = countryFlags[countryCode];
    return Flag ? <Flag className="h-4 w-6 inline-block" /> : null;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-10 mx-auto p-0 border w-[600px] shadow-2xl rounded-lg bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {contact ? 'Edit Contact' : 'Add Contact'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-1"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex space-x-4 border-b border-gray-200">
            <TabButton tab="basic" label="Basic Info" />
            <TabButton tab="additional" label="Additional Info" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {activeTab === 'basic' ? (
              <>
                {/* Basic Info Tab */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input mt-1"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="input mt-1"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      className="input mt-1 pr-10"
                      value={formData.countryCode}
                      onChange={handleCountryChange}
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {getFlagEmoji(country.code)} {country.name} ({country.dial_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm min-w-[4.5rem]">
                        {getFlagEmoji(formData.countryCode)}
                        <span className="ml-2">
                          {countries.find(c => c.code === formData.countryCode)?.dial_code}
                        </span>
                      </span>
                      <input
                        type="text"
                        pattern="\d*"
                        inputMode="numeric"
                        className="input rounded-l-none flex-1"
                        value={localNumber}
                        onChange={handlePhoneChange}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Additional Info Tab */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <input
                      type="text"
                      className="input mt-1"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <input
                      type="text"
                      className="input mt-1"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      className="input mt-1"
                      rows="2"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      className="input mt-1"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Add any additional notes about the contact..."
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {contact ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactDetailModal({ contact, onClose, onEdit }) {
  const getFlagEmoji = (countryCode) => {
    const Flag = countryFlags[countryCode];
    return Flag ? <Flag className="h-4 w-6 inline-block" /> : null;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-10 mx-auto p-0 border w-[600px] shadow-2xl rounded-lg bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-semibold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{contact.name}</h3>
                {contact.title && contact.company && (
                  <p className="text-gray-600">{contact.title} at {contact.company}</p>
                )}
              </div>
            </div>
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
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                    {contact.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <div className="w-8 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="flex items-center">
                    {getFlagEmoji(contact.countryCode)}
                    <a href={`tel:${contact.phone}`} className="ml-2 text-blue-600 hover:text-blue-800">
                      {contact.phone}
                    </a>
                  </div>
                </div>
                {contact.address && (
                  <div className="flex items-start">
                    <div className="w-8 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 whitespace-pre-line">{contact.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            {(contact.company || contact.title) && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Company Information</h4>
                <div className="space-y-4">
                  {contact.company && (
                    <div className="flex items-center">
                      <div className="w-8 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{contact.company}</span>
                    </div>
                  )}
                  {contact.title && (
                    <div className="flex items-center">
                      <div className="w-8 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{contact.title}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Notes</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">{contact.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
