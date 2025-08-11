import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BackgroundPattern from '../login/components/BackgroundPattern';
import SecurityBadges from '../login/components/SecurityBadges';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'operator'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e?.target?.name]: e?.target?.value
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (formData?.password !== formData?.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData?.password?.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await signUp(formData?.email, formData?.password, {
        full_name: formData?.fullName,
        role: formData?.role
      });
      
      navigate('/dashboard');
    } catch (err) {
      if (err?.message?.includes('Failed to fetch') || 
          err?.message?.includes('AuthRetryableFetchError')) {
        setError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      } else {
        setError(err?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <BackgroundPattern />
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Signup Form */}
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
                Create Account
              </h2>
              <p className="text-blue-200">
                Join the NetStress Commander platform
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <div className="text-red-100 text-sm font-medium mb-2">Signup Error</div>
                    <div className="text-red-200 text-sm">{error}</div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(error)}
                      className="text-red-300 text-xs underline mt-2"
                    >
                      Copy error message
                    </button>
                  </div>
                )}

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-blue-100 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData?.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    disabled={loading || authLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    disabled={loading || authLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-blue-100 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData?.role}
                    onChange={handleChange}
                    disabled={loading || authLoading}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData?.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    required
                    disabled={loading || authLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData?.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    disabled={loading || authLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading || authLoading}
                  iconName={loading || authLoading ? "Loader2" : "UserPlus"}
                  iconPosition="left"
                >
                  {loading || authLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-blue-200">Already have an account?</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSignIn}
                  disabled={loading || authLoading}
                >
                  Sign In Instead
                </Button>
              </form>
            </div>

            <SecurityBadges />
          </div>
        </div>

        {/* Right Panel - Info Section */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:px-12">
          <div className="max-w-lg text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Join Our Platform
            </h3>
            <div className="space-y-4 text-blue-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Secure authentication system</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Role-based access control</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Professional network testing tools</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Real-time monitoring dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;