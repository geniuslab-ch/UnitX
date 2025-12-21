import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  Trophy,
  Calendar,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Clubs', href: '/clubs', icon: Building2 },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Seasons', href: '/seasons', icon: Calendar },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'QR Codes', href: '/qr-code', icon: QrCode },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const DashboardLayout = () => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar background with UNITX gradient */}
        <div className="h-full glass-unitx border-r-2 border-unitx-500/20">
          {/* Logo UNITX */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-unitx-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg glow-unitx">
                <img src="/logo.png" alt="UNITX" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gradient-unitx">
                  UNITX
                </h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                    boxShadow: '0 10px 30px -10px rgba(2, 132, 199, 0.5)'
                  } : {}}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform duration-300`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <Sparkles className="h-4 w-4 ml-auto animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section with UNITX gradient */}
          <div className="border-t border-unitx-500/20 p-4">
            <div className="mb-4 p-4 rounded-xl border border-unitx-500/20"
                 style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                     style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}>
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-unitx-500/20 text-unitx-300 font-medium">
                      {user?.role || 'ADMIN'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar with UNITX gradient border */}
        <div className="sticky top-0 z-10 h-20 glass-unitx border-b-2 border-unitx-500/20 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-6">
            <button
              className="lg:hidden p-2 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-400" />
            </button>
            
            <div className="flex-1 lg:flex items-center justify-end gap-4 hidden">
              {/* System Status with UNITX colors */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-unitx-400 animate-pulse glow-unitx"></div>
                <span className="text-gray-400">System Status: </span>
                <span className="text-gradient-unitx font-semibold">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Decorative gradient orbs UNITX colors */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(2, 132, 199, 0.1)' }}></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: 'rgba(6, 182, 212, 0.1)' }}></div>
    </div>
  );
};

export default DashboardLayout;
