import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { contactsService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import * as countryFlags from 'country-flag-icons/react/3x2';
import { countries } from '../data/countries';

export default function ContactModal({ contact, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    title: contact?.title || '',
    address: contact?.address || '',
    notes: contact?.notes || '',
    country_code: contact?.country_code || 'US',
    country_name: contact?.country_name || 'United States'
  });

  // Extract local number from full phone number
  const getLocalNumber = (fullNumber) => {
    if (!fullNumber) return '';
    const country = countries.find(c => c.code === formData.country_code);
    return fullNumber.replace(country?.dial_code || '', '').trim();
  };

  const [localNumber, setLocalNumber] = useState(getLocalNumber(contact?.phone || ''));
  const { user } = useAuth();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setLocalNumber(value);
    
    const country = countries.find(c => c.code === formData.country_code);
    const fullNumber = value ? `${country.dial_code}${value}` : '';
    setFormData(prev => ({ ...prev, phone: fullNumber }));
  };

  const handleCountryChange = (e) => {
    const newCountryCode = e.target.value;
    const country = countries.find(c => c.code === newCountryCode);
    
    setFormData(prev => ({
      ...prev,
      country_code: newCountryCode,
      country_name: country.name,
      phone: localNumber ? `${country.dial_code}${localNumber}` : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const country = countries.find(c => c.code === formData.country_code);
      const contactData = {
        ...formData,
        user_id: user.id,
        country_code: formData.country_code,
        country_name: country.name
      };

      if (contact) {
        await contactsService.update(contact.id, contactData);
        toast.success('Contact updated successfully');
      } else {
        await contactsService.add(contactData);
        toast.success('Contact created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(contact ? 'Error updating contact' : 'Error creating contact');
      console.error('Error:', error);
    }
  };

  const getFlagEmoji = (countryCode) => {
    const Flag = countryFlags[countryCode];
    return Flag ? <Flag className="h-4 w-6 inline-block" /> : null;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {contact ? 'Edit Contact' : 'Add Contact'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="input mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="input mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                className="input mt-1"
                value={formData.country_code}
                onChange={handleCountryChange}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.dial_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  {getFlagEmoji(formData.country_code)}
                  <span className="ml-2">
                    {countries.find(c => c.code === formData.country_code)?.dial_code}
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

            {/* Rest of your form fields... */}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {contact ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 