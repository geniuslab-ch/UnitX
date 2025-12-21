import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import apiClient from '../api/client';

interface LeaderboardEntry {
  rank: number;
  club_name: string;
  city: string;
  tier: string;
  points: number;
  contributors: number;
  change: number;
}

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('ALL');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTier]);

  const loadLeaderboard = async () => {
    try {
      // Mock data
      const mockData = [
        {
          rank: 1,
          club_name: 'Downtown Fitness',
          city: 'Paris',
          tier: 'GOLD',
          points: 28450,
          contributors: 48,
          change: 2,
        },
        {
          rank: 2,
          club_name: 'Westside Gym',
          city: 'Lyon',
          tier: 'GOLD',
          points: 26320,
          contributors: 45,
          change: -1,
        },
        {
          rank: 3,
          club_name: 'Northside Club',
          city: 'Marseille',
          tier: 'GOLD',
          points: 24890,
          contributors: 50,
          change: 1,
        },
        {
          rank: 4,
          club_name: 'Eastside Fitness',
          city: 'Toulouse',
          tier: 'SILVER',
          points: 22100,
          contributors: 38,
          change: 0,
        },
        {
          rank: 5,
          club_name: 'Central Sports',
          city: 'Nice',
          tier: 'SILVER',
          points: 19800,
          contributors: 42,
          change: 3,
        },
      ];

      setLeaderboard(mockData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'SILVER':
        return 'bg-gray-200 text-gray-700';
      case 'BRONZE':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredLeaderboard = selectedTier === 'ALL'
    ? leaderboard
    : leaderboard.filter(entry => entry.tier === selectedTier);

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-1">Current club rankings</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by tier:</label>
          <div className="flex gap-2">
            {['ALL', 'GOLD', 'SILVER', 'BRONZE'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTier === tier
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {selectedTier === 'ALL' && (
        <div className="grid grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <div
              key={entry.rank}
              className={`card text-center ${
                index === 0 ? 'transform scale-105 shadow-xl' : ''
              }`}
            >
              <div className="mb-4">
                <Trophy
                  className={`h-12 w-12 mx-auto ${
                    index === 0
                      ? 'text-yellow-500'
                      : index === 1
                      ? 'text-gray-400'
                      : 'text-orange-600'
                  }`}
                />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">#{entry.rank}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{entry.club_name}</h3>
              <p className="text-sm text-gray-600 mb-3">{entry.city}</p>
              <div className="text-2xl font-bold text-primary-600">
                {entry.points.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">points</p>
            </div>
          ))}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Club</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">City</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Points</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Contributors</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`border-b hover:bg-gray-50 ${
                    entry.rank <= 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {entry.rank}
                      </span>
                      {entry.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {entry.club_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{entry.city}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(entry.tier)}`}>
                      {entry.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-primary-600">
                    {entry.points.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{entry.contributors}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {entry.change > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">+{entry.change}</span>
                        </>
                      ) : entry.change < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">{entry.change}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">📊 How Rankings Work</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Rankings updated every Monday at 00:10 UTC</li>
          <li>• Top 2 clubs per tier get promoted each week</li>
          <li>• Bottom 2 clubs per tier get demoted each week</li>
          <li>• Club score = sum of top 50 contributors</li>
          <li>• Points include: check-ins (50pts) + calories (1pt/10kcal) + bonuses</li>
        </ul>
      </div>
    </div>
  );
};

export default LeaderboardPage;
