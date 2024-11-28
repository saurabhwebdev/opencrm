import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Contacts', href: '/contacts', icon: UserGroupIcon },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Interactions', href: '/interactions', icon: ChatBubbleLeftRightIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navigation={navigation} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-auto py-6">
        {children}
      </main>
    </div>
  );
}
