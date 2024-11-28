import React from 'react';
import { 
  LightBulbIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Help() {
  const benefits = [
    {
      icon: LightBulbIcon,
      title: "Why Choose OpenCRM?",
      description: "In a world of complex CRM solutions, OpenCRM stands out by focusing on what truly matters - helping you build and maintain meaningful relationships without the complexity. We believe that managing relationships shouldn't require extensive training or complicated workflows."
    },
    {
      icon: SparklesIcon,
      title: "Designed for Efficiency",
      description: "Every feature in OpenCRM is thoughtfully crafted with your productivity in mind. No steep learning curves, no unnecessary clicks, and no confusing interfaces. Just the tools you need, right where you expect them to be."
    },
    {
      icon: ShieldCheckIcon,
      title: "Security & Privacy First",
      description: "Your data security is our top priority. With SOC 2 certification and GDPR compliance, you can trust that your information is protected by industry-leading security measures while remaining fully accessible to you."
    }
  ];

  const features = [
    {
      icon: UserGroupIcon,
      title: "Contact Management",
      description: "Organize your network effectively with our intuitive contact management system. Add detailed information, track interactions, and maintain meaningful relationships with ease."
    },
    {
      icon: ClockIcon,
      title: "Task Management",
      description: "Stay on top of your commitments with our streamlined task management. Set priorities, due dates, and never miss an important follow-up again."
    },
    {
      icon: ChartBarIcon,
      title: "Insights & Analytics",
      description: "Make informed decisions with clear, actionable insights about your relationships and activities. Our reports focus on metrics that matter, helping you improve your relationship management strategy."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to OpenCRM
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Your solution for simplified relationship management. We've created OpenCRM with one goal in mind: 
          to help you maintain meaningful connections without the complexity of traditional CRM systems.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Why OpenCRM?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <benefit.icon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <feature.icon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white p-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="mb-6">
            Join thousands of professionals who have simplified their relationship management with OpenCRM. 
            Our intuitive design ensures you can start organizing your network immediately, with no lengthy 
            setup process or training required.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>Set Up in Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="max-w-3xl mx-auto text-center">
        <blockquote className="text-xl text-gray-600 italic mb-4">
          "OpenCRM has revolutionized how we manage our professional relationships. 
          Its simplicity and effectiveness have made it an indispensable tool for our team."
        </blockquote>
        <p className="text-gray-900 font-semibold">Sarah Mitchell</p>
        <p className="text-gray-600">Founder, Innovative Solutions</p>
      </div>
    </div>
  );
} 