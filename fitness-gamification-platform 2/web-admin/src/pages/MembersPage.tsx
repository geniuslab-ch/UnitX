import React, { useState, useEffect } from 'react';
import { Search, Upload, UserCheck, Users as UsersIcon } from 'lucide-react';
import apiClient from '../api/client';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  club_name: string;
  total_points: number;
  status: string;
}

const MembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      // Mock data
      setMembers([
        {
          id: '1',
          first_name: 'Jean',
          last_name: 'Dupont',
          email: 'jean.dupont@example.com',
          club_name: 'Downtown Fitness',
          total_points: 2450,
          status: 'ACTIVE',
        },
        {
          id: '2',
          first_name: 'Marie',
          last_name: 'Martin',
          email: 'marie.martin@example.com',
          club_name: 'Downtown Fitness',
          total_points: 3120,
          status: 'ACTIVE',
        },
        {
          id: '3',
          first_name: 'Pierre',
          last_name: 'Durand',
          email: 'pierre.durand@example.com',
          club_name: 'Westside Gym',
          total_points: 1890,
          status: 'ACTIVE',
        },
        {
          id: '4',
          first_name: 'Sophie',
          last_name: 'Bernard',
          email: 'sophie.bernard@example.com',
          club_name: 'Northside Club',
          total_points: 4200,
          status: 'ACTIVE',
        },
      ]);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.club_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage club members</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-green-600">
                {members.filter(m => m.status === 'ACTIVE').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Total Points</p>
          <p className="text-2xl font-bold text-gray-900">
            {members.reduce((sum, m) => sum + m.total_points, 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Avg Points/Member</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(members.reduce((sum, m) => sum + m.total_points, 0) / members.length)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name, email, or club..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Club</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Points</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.email}</td>
                  <td className="py-3 px-4 text-gray-600">{member.club_name}</td>
                  <td className="py-3 px-4 font-medium text-primary-600">
                    {member.total_points.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
