import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Ajouté pour la navigation
import { Users, Building2, Trophy, TrendingUp, Zap, Award } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import apiClient from '../api/client';

interface Stats {
  totalClubs: number;
  totalMembers: number;
  activeSeasons: number;
  todayCheckins: number;
}

const DashboardPage = () => {
  const navigate = useNavigate(); // Initialisation du hook de navigation
  const [stats, setStats] = useState<Stats>({
    totalClubs: 0,
    totalMembers: 0,
    activeSeasons: 0,
    todayCheckins: 0,
  });
  const [loading, setLoading] = useState(true);

  const weeklyActivity = [
    { day: 'Mon', checkins: 245, points: 12500 },
    { day: 'Tue', checkins: 289, points: 14200 },
    { day: 'Wed', checkins: 312, points: 15800 },
    { day: 'Thu', checkins: 278, points: 13900 },
    { day: 'Fri', checkins: 356, points: 17800 },
    { day: 'Sat', checkins: 423, points: 21200 },
    { day: 'Sun', checkins: 387, points: 19400 },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Pour passer en "réel", décommentez la ligne ci-dessous :
      // const response = await apiClient.get('/api/v1/health'); // Exemple de test
      
      setStats({
        totalClubs: 24,
        totalMembers: 1847,
        activeSeasons: 3,
        todayCheckins: 312,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de clic pour les boutons
  const handleQuickAction = (title: string) => {
    console.log(`Action déclenchée: ${title}`);
    switch (title) {
      case 'Create Season':
        navigate('/seasons'); // Redirige vers la page des saisons
        break;
      case 'Import Clubs':
        navigate('/clubs'); // Redirige vers la page des clubs
        break;
      case 'View Leaderboard':
        navigate('/leaderboard'); // Redirige vers le classement
        break;
      default:
        break;
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, gradient, iconBg }: any) => (
    <div className="stat-card card-gradient group relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gradient-unitx mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                change > 0 ? 'bg-unitx-500/20 text-unitx-300' : 'bg-red-500/20 text-red-400'
              }`}>
                <TrendingUp className={`h-3 w-3 ${change < 0 ? 'rotate-180' : ''}`} />
                <span className="text-xs font-bold">{Math.abs(change)}%</span>
              </div>
              <span className="text-xs text-gray-500">from last week</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{
             background: `linear-gradient(135deg, ${gradient})`,
             padding: '2px',
             WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             WebkitMaskComposite: 'xor',
             maskComposite: 'exclude',
           }}>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1419]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-unitx-500/30 border-t-unitx-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-gradient-unitx mb-3">Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome back! Here's what's happening today. ✨</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building2} title="Total Clubs" value={stats.totalClubs} change={8} gradient="rgba(2, 132, 199, 0.5), rgba(6, 182, 212, 0.5)" iconBg="bg-gradient-to-br from-unitx-600 to-unitx-400" />
        <StatCard icon={Users} title="Total Members" value={stats.totalMembers.toLocaleString()} change={12} gradient="rgba(16, 185, 129, 0.5), rgba(6, 182, 212, 0.5)" iconBg="bg-gradient-to-br from-green-500 to-unitx-400" />
        <StatCard icon={Trophy} title="Active Seasons" value={stats.activeSeasons} gradient="rgba(2, 132, 199, 0.5), rgba(56, 189, 248, 0.5)" iconBg="bg-gradient-to-br from-unitx-700 to-unitx-light" />
        <StatCard icon={Zap} title="Today's Check-ins" value={stats.todayCheckins} change={-3} gradient="rgba(245, 158, 11, 0.5), rgba(6, 182, 212, 0.5)" iconBg="bg-gradient-to-br from-yellow-500 to-unitx-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-gradient">
          <h3 className="text-xl font-bold text-gradient-unitx mb-6">Weekly Check-ins</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #0284c7', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="checkins" stroke="#0284c7" fill="url(#colorCheckins)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-gradient">
          <h3 className="text-xl font-bold text-gradient-success mb-6">Weekly Points</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #06b6d4', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="points" stroke="#06b6d4" fill="url(#colorPoints)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Create Season', desc: 'Start a new competition', icon: '🎯', gradient: 'from-unitx-600 to-unitx-400' },
          { title: 'Import Clubs', desc: 'Upload clubs via CSV', icon: '📥', gradient: 'from-green-500 to-unitx-400' },
          { title: 'View Leaderboard', desc: 'Check current rankings', icon: '🏆', gradient: 'from-yellow-500 to-unitx-400' },
        ].map((action, index) => (
          <button 
            key={index} 
            onClick={() => handleQuickAction(action.title)} // Action ajoutée ici
            className="card card-gradient text-left group hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-3xl mb-4 shadow-xl group-hover:scale-110 transition-all duration-300`}>
              {action.icon}
            </div>
            <h4 className="text-xl font-bold text-gradient-unitx mb-2">{action.title}</h4>
            <p className="text-sm text-gray-400">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
