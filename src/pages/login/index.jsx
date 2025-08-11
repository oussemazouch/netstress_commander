import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import BackgroundPattern from './components/BackgroundPattern';
import SecurityBadges from './components/SecurityBadges';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err?.message?.includes('Failed to fetch') || 
          err?.message?.includes('AuthRetryableFetchError')) {
        setError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      } else {
        setError(err?.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <BackgroundPattern />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                NetStress Commander
              </h2>
              <p className="text-blue-200">
                Secure network stress testing platform
              </p>
            </div>

            <LoginForm 
              onSubmit={handleLogin}
              onSignUp={handleSignUp}
              loading={loading || authLoading}
              error={error}
            />

            <SecurityBadges />
          </div>
        </div>

        {/* Right Panel - Info Section */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-12">
          <div className="max-w-lg text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Professional Network Testing
            </h3>
            <div className="space-y-4 text-blue-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Distributed attack simulation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Real-time monitoring and analytics</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Role-based access control</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Comprehensive attack templates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;