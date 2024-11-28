import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Transition } from '@headlessui/react';
import { ShieldCheckIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const FloatingBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Animated blobs */}
    <div className="blob absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="blob absolute top-1/2 right-1/3 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="blob absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    
    {/* Additional floating elements */}
    <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-200 rounded-lg opacity-40 animate-float"></div>
    <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-blue-300 rounded-full opacity-40 animate-float animation-delay-2000"></div>
    
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
  </div>
);

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error, message, data } = await signUp(email, password);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        toast.success(message || 'Account created successfully!');
        navigate('/');
      } else {
        toast.success('Account created! Please check your email for verification.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: UserCircleIcon,
      title: "Personal Dashboard",
      description: "Get a personalized overview of your tasks and contacts"
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure Storage",
      description: "Your data is encrypted and securely stored"
    },
    {
      icon: LockClosedIcon,
      title: "Privacy First",
      description: "We prioritize your privacy and data protection"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="w-1/2 relative text-white p-12 flex items-center overflow-hidden">
        <FloatingBackground />
        <div className="relative z-10 max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-8">Join thousands of users</h3>
          <div className="space-y-8">
            {benefits.map((benefit, index) => (
              <Transition
                key={benefit.title}
                show={true}
                appear={true}
                as="div"
                enter="transition ease-out duration-500 delay-300"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                className="flex items-start space-x-4"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <benefit.icon className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">{benefit.title}</h4>
                  <p className="text-blue-100">{benefit.description}</p>
                </div>
              </Transition>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-1/2 flex items-center justify-center bg-white px-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start organizing your work today
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : 'Sign up'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 