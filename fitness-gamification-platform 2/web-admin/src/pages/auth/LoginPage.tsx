import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../api/client';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.login(email, password);
      login(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient UNITX */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0c4a6e 50%, #0284c7 100%)'
      }}></div>
      
      {/* Animated orbs UNITX colors */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-float"
           style={{ background: 'rgba(2, 132, 199, 0.3)' }}></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl animate-float"
           style={{ background: 'rgba(6, 182, 212, 0.2)', animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl animate-float"
           style={{ background: 'rgba(56, 189, 248, 0.2)', animationDelay: '4s' }}></div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-unitx rounded-3xl p-8 shadow-2xl border-2 border-unitx-500/20">
          {/* Logo UNITX */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6 glow-unitx rounded-2xl p-4">
              <img 
                src="/logo.png" 
                alt="UNITX Logo" 
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-gradient-unitx mb-2">
              UNITX Admin
            </h1>
            <p className="text-gray-400">Fitness Gamification Platform</p>
            <div className="h-1 w-24 mx-auto mt-4 rounded-full bg-gradient-unitx"></div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-xl">
              <span className="font-semibold">⚠️ Error:</span> {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@unitx.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-unitx-900/30 border border-unitx-500/30 rounded-xl backdrop-blur-xl">
            <p className="text-unitx-300 font-semibold mb-2 text-sm">🔑 Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p><span className="text-gray-500">Email:</span> admin@unitx.com</p>
              <p><span className="text-gray-500">Password:</span> admin123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              UNITX Gamification Platform <span className="text-gradient-unitx">v1.0</span>
            </p>
          </div>
        </div>

        {/* Decorative elements UNITX colors */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-50"
             style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 rounded-full blur-2xl opacity-30"
             style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}></div>
      </div>
    </div>
  );
};

export default LoginPage;
