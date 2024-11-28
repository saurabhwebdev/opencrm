import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const EmptyStateIllustration = () => (
  <div className="w-64 h-64 mx-auto mb-8">
    <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Circle */}
      <circle 
        cx="200" 
        cy="200" 
        r="150" 
        fill="#EEF2FF" 
      >
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Floating elements */}
      <g>
        <rect x="120" y="120" width="40" height="40" rx="8" fill="#BFDBFE">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -20; 0 0"
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="240" y="160" width="30" height="30" rx="6" fill="#93C5FD">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -15; 0 0"
            dur="5s"
            repeatCount="indefinite"
          />
        </rect>
        <circle cx="150" cy="280" r="15" fill="#60A5FA">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -25; 0 0"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="280" cy="220" r="20" fill="#3B82F6">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -20; 0 0"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Central Icon */}
      <g>
        <circle cx="200" cy="200" r="50" fill="#2563EB">
          <animate
            attributeName="r"
            values="50;52;50"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <path
          d="M180 200h40M200 180v40"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Decorative Lines */}
      <g stroke="#DBEAFE" strokeWidth="2" strokeDasharray="6 6">
        <path d="M200 50v40">
          <animate
            attributeName="stroke-opacity"
            values="0.3;1;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M200 310v40">
          <animate
            attributeName="stroke-opacity"
            values="0.3;1;0.3"
            dur="2s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </path>
        <path d="M50 200h40">
          <animate
            attributeName="stroke-opacity"
            values="0.3;1;0.3"
            dur="2s"
            repeatCount="indefinite"
            begin="1s"
          />
        </path>
        <path d="M310 200h40">
          <animate
            attributeName="stroke-opacity"
            values="0.3;1;0.3"
            dur="2s"
            repeatCount="indefinite"
            begin="1.5s"
          />
        </path>
      </g>
    </svg>
  </div>
);

export default function EmptyState({
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionText = 'Add New',
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <EmptyStateIllustration />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-8">
          {description}
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium 
                     rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
} 