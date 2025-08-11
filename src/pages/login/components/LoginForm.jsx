import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoginForm = ({ onSubmit, onSignUp, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e?.target?.name]: e?.target?.value
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSubmit?.(formData?.email, formData?.password);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl border border-white/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-100 text-sm font-medium mb-2">Authentication Error</div>
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
          <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            value={formData?.email}
            onChange={handleChange}
            placeholder="admin@netstress.com"
            required
            disabled={loading}
            className="w-full"
          />
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
            placeholder="Enter your password"
            required
            disabled={loading}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
          iconName={loading ? "Loader2" : "LogIn"}
          iconPosition="left"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <p className="text-blue-200 text-sm">
            Demo Credentials: admin@netstress.com / admin123
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-blue-200">Need an account?</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSignUp}
          disabled={loading}
        >
          Create Account
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;