import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trophy, Users } from 'lucide-react';
import apiClient from '../api/client';

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  scope: string;
  status: string;
  clubs_count: number;
}

const SeasonsPage = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      // Mock data
      setSeasons([
        {
          id: '1',
          name: 'Winter Challenge 2024',
          start_date: '2024-01-01',
          end_date: '2024-02-29',
          scope: 'INTERCLUB_OPEN',
          status: 'COMPLETED',
          clubs_count: 18,
        },
        {
          id: '2',
          name: 'Spring Championship',
          start_date: '2024-03-01',
          end_date: '2024-04-30',
          scope: 'INTERCLUB_OPEN',
          status: 'ACTIVE',
          clubs_count: 24,
        },
        {
          id: '3',
          name: 'Summer League',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          scope: 'INTERCLUB_OPEN',
          status: 'DRAFT',
          clubs_count: 0,
        },
      ]);
    } catch (error) {
      console.error('Error loading seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seasons</h1>
          <p className="text-gray-600 mt-1">Manage competition seasons</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Season
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Seasons</p>
              <p className="text-2xl font-bold text-gray-900">{seasons.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
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
        <div className="stat-card">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-600">
            {seasons.filter(s => s.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">
            {seasons.filter(s => s.status === 'DRAFT').length}
          </p>
        </div>
      </div>

      {/* Seasons List */}
      <div className="grid grid-cols-1 gap-4">
        {seasons.map((season) => (
          <div key={season.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{season.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(season.status)}`}>
                    {season.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{season.clubs_count} clubs</span>
                  </div>
                  <div>
                    <span className="font-medium">{season.scope.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn-secondary text-sm">
                  View Details
                </button>
                {season.status === 'DRAFT' && (
                  <button className="btn-primary text-sm">
                    Start Season
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar for active seasons */}
            {season.status === 'ACTIVE' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>Week 4 of 8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Season Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Create New Season</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Summer Championship 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope
                </label>
                <select className="input-field">
                  <option value="INTERCLUB_OPEN">Inter-Club Open</option>
                  <option value="INTRABRAND">Intra-Brand</option>
                  <option value="CUSTOM_MATCH">Custom Match</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Top N Contributors
                </label>
                <input
                  type="number"
                  className="input-field"
                  defaultValue={50}
                  min={1}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of top members counted for club score
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button className="btn-primary flex-1">
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
