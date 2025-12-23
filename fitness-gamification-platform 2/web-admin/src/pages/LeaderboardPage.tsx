import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import apiClient from '../api/client';

interface ClubStanding {
  club_id: string;
  club_name: string;
  club_city?: string;
  total_points: number;
  total_checkins: number;
  club_rank: number;
  top_contributors?: {
    system: string;
    home_members?: {
      count: number;
      checkins: number;
      raw_points: number;
      weighted_points: number;
    };
    visitors?: {
      count: number;
      checkins: number;
      raw_points: number;
      weighted_points: number;
    };
  };
}

interface Season {
  id: string;
  name: string;
  status: string;
}

const LeaderboardPage = () => {
  const [standings, setStandings] = useState<ClubStanding[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      loadStandings(selectedSeason);
    }
  }, [selectedSeason]);

  const loadSeasons = async () => {
    try {
      const response = await apiClient.getSeasons({ status: 'ACTIVE' });
      setSeasons(response);
      if (response.length > 0) {
        setSelectedSeason(response[0].id);
      }
    } catch (error) {
      console.error('Error loading seasons:', error);
      // Fallback data
      setSeasons([
        { id: '1', name: 'Spring Championship 2025', status: 'ACTIVE' }
      ]);
      setSelectedSeason('1');
    }
  };

  const loadStandings = async (seasonId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getSeasonStandings(seasonId);
      setStandings(response);
    } catch (error) {
      console.error('Error loading standings:', error);
      // Fallback data
      setStandings([
        {
          club_id: '1',
          club_name: 'Downtown Fitness',
          club_city: 'Paris',
          total_points: 15420,
          total_checkins: 342,
          club_rank: 1,
          top_contributors: {
            system: 'hybrid_70_30',
            home_members: {
              count: 45,
              checkins: 280,
              raw_points: 14000,
              weighted_points: 9800
            },
            visitors: {
              count: 12,
              checkins: 62,
              raw_points: 3100,
              weighted_points: 930
            }
          }
        },
        {
          club_id: '2',
          club_name: 'Westside Gym',
          club_city: 'Lyon',
          total_points: 13250,
          total_checkins: 298,
          club_rank: 2,
          top_contributors: {
            system: 'hybrid_70_30',
            home_members: {
              count: 38,
              checkins: 245,
              raw_points: 12250,
              weighted_points: 8575
            },
            visitors: {
              count: 8,
              checkins: 53,
              raw_points: 2650,
              weighted_points: 795
            }
          }
        },
        {
          club_id: '3',
          club_name: 'Northside Club',
          club_city: 'Marseille',
          total_points: 11890,
          total_checkins: 267,
          club_rank: 3,
          top_contributors: {
            system: 'hybrid_70_30',
            home_members: {
              count: 35,
              checkins: 220,
              raw_points: 11000,
              weighted_points: 7700
            },
            visitors: {
              count: 6,
              checkins: 47,
              raw_points: 2350,
              weighted_points: 705
            }
          }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">Club rankings - Hybrid scoring (70% home + 30% visitors)</p>
        </div>
        
        {/* Season Selector */}
        {seasons.length > 0 && (
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Top 3 Podium */}
      {standings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 border-2 border-gray-300 transform translate-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="text-lg font-bold text-gray-900">{standings[1].club_name}</h3>
              <p className="text-sm text-gray-600 mb-3">{standings[1].club_city}</p>
              <div className="text-3xl font-bold text-gray-700">{standings[1].total_points.toLocaleString()}</div>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6 border-2 border-yellow-400 shadow-lg">
            <div className="text-center">
              <div className="text-5xl mb-2">🥇</div>
              <h3 className="text-xl font-bold text-gray-900">{standings[0].club_name}</h3>
              <p className="text-sm text-gray-600 mb-3">{standings[0].club_city}</p>
              <div className="text-4xl font-bold text-yellow-700">{standings[0].total_points.toLocaleString()}</div>
              <p className="text-xs text-gray-600">points</p>
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mt-2" />
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 border-2 border-orange-300 transform translate-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="text-lg font-bold text-gray-900">{standings[2].club_name}</h3>
              <p className="text-sm text-gray-600 mb-3">{standings[2].club_city}</p>
              <div className="text-3xl font-bold text-orange-700">{standings[2].total_points.toLocaleString()}</div>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Home Points (70%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visitor Points (30%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-ins
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standings.map((standing) => (
              <tr key={standing.club_id} className={`hover:bg-gray-50 ${standing.club_rank <= 3 ? getRankColor(standing.club_rank) : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {getRankMedal(standing.club_rank)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{standing.club_name}</div>
                    <div className="text-sm text-gray-500">{standing.club_city}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-blue-600">
                      {standing.top_contributors?.home_members?.weighted_points.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {standing.top_contributors?.home_members?.count || 0} members
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-green-600">
                      {standing.top_contributors?.visitors?.weighted_points.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {standing.top_contributors?.visitors?.count || 0} visitors
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-gray-900">
                    {standing.total_points.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {standing.total_checkins}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scoring System Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Hybrid Scoring System (70/30)
        </h3>
        <p className="text-sm text-blue-800">
          <strong>70% Home Member Points:</strong> Points earned by your club's members, even when they visit other clubs.<br />
          <strong>30% Visitor Points:</strong> Points earned by members from other clubs when they visit your club.<br />
          <strong>Benefit:</strong> Rewards both member recruitment and club popularity!
        </p>
      </div>

      {standings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>No standings available yet</p>
          <p className="text-sm">Check-ins will appear here once the season starts</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
