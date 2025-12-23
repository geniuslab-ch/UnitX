import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trophy, Users, X, TrendingUp } from 'lucide-react';
import apiClient from '../api/client';

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  scope: string;
  status: string;
  club_count: number;
  brand_name?: string;
}

interface SeasonProgress {
  progress_percentage: number;
  days_remaining: number;
  status: string;
}

const SeasonsPage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    scope: 'INTERCLUB_OPEN',
    start_date: '',
    end_date: '',
    min_checkins_per_week: 1,
    max_checkins_per_week: null
  });

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSeasons();
      setSeasons(response);
    } catch (error) {
      console.error('Error loading seasons:', error);
      // Fallback data
      setSeasons([
        {
          id: '1',
          name: 'Winter Challenge 2024',
          start_date: '2024-01-01',
          end_date: '2024-02-29',
          scope: 'INTERCLUB_OPEN',
          status: 'COMPLETED',
          club_count: 18,
        },
        {
          id: '2',
          name: 'Spring Championship',
          start_date: '2024-03-01',
          end_date: '2024-04-30',
          scope: 'INTERCLUB_OPEN',
          status: 'ACTIVE',
          club_count: 24,
        },
        {
          id: '3',
          name: 'Summer League',
          start_date: '2025-01-01',
          end_date: '2025-03-31',
          scope: 'INTERCLUB_OPEN',
          status: 'DRAFT',
          club_count: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeason = async () => {
    try {
      if (!newSeason.name || !newSeason.start_date || !newSeason.end_date) {
        alert('Name, start date and end date are required');
        return;
      }

      await apiClient.createSeason(newSeason);
      alert('Season created successfully! It will start automatically on the start date.');
      loadSeasons();
      setShowCreateModal(false);
      setNewSeason({
        name: '',
        scope: 'INTERCLUB_OPEN',
        start_date: '',
        end_date: '',
        min_checkins_per_week: 1,
        max_checkins_per_week: null
      });
    } catch (error) {
      console.error(error);
      alert('Failed to create season');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusMessage = (season: Season) => {
    const today = new Date();
    const startDate = new Date(season.start_date);
    const endDate = new Date(season.end_date);
    
    if (season.status === 'DRAFT') {
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilStart > 0) {
        return `Starts automatically in ${daysUntilStart} day${daysUntilStart > 1 ? 's' : ''}`;
      } else if (daysUntilStart === 0) {
        return 'Starts automatically today at midnight';
      } else {
        return 'Will start at next cron job run (00:01 UTC)';
      }
    }
    
    if (season.status === 'ACTIVE') {
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`;
    }
    
    return '';
  };

  const calculateProgress = (season: Season) => {
    if (season.status === 'DRAFT') return 0;
    if (season.status === 'COMPLETED') return 100;
    
    const today = new Date();
    const startDate = new Date(season.start_date);
    const endDate = new Date(season.end_date);
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seasons</h1>
          <p className="text-gray-600 mt-1">Competition seasons start automatically on their start date</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Season
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Seasons</p>
              <p className="text-2xl font-bold text-gray-900">{seasons.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {seasons.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-600">
            {seasons.filter(s => s.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">
            {seasons.filter(s => s.status === 'DRAFT').length}
          </p>
        </div>
      </div>

      {/* Seasons List */}
      <div className="grid grid-cols-1 gap-4">
        {seasons.map((season) => {
          const progress = calculateProgress(season);
          
          return (
            <div key={season.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{season.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(season.status)}`}>
                      {season.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{season.club_count} clubs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{season.scope.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Status Message */}
                  <p className="text-sm text-blue-600 font-medium">
                    {getStatusMessage(season)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {(season.status === 'ACTIVE' || season.status === 'COMPLETED') && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${season.status === 'COMPLETED' ? 'bg-gray-600' : 'bg-green-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Season Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Season</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season Name *
                </label>
                <input
                  type="text"
                  value={newSeason.name}
                  onChange={(e) => setNewSeason({...newSeason, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Summer Championship 2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newSeason.start_date}
                    onChange={(e) => setNewSeason({...newSeason, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Will auto-start on this date</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newSeason.end_date}
                    onChange={(e) => setNewSeason({...newSeason, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Will auto-complete on this date</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competition Scope
                </label>
                <select 
                  value={newSeason.scope}
                  onChange={(e) => setNewSeason({...newSeason, scope: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INTERCLUB_OPEN">Inter-Club Open (All clubs compete)</option>
                  <option value="INTRABRAND">Intra-Brand (Same brand clubs only)</option>
                  <option value="CUSTOM_MATCH">Custom Match</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Check-ins per Week
                </label>
                <input
                  type="number"
                  value={newSeason.min_checkins_per_week}
                  onChange={(e) => setNewSeason({...newSeason, min_checkins_per_week: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Auto-start:</strong> Season will automatically become ACTIVE at 00:01 UTC on the start date. 
                  Monthly standings are calculated on the 1st of each month.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSeason}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Season
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonsPage;
