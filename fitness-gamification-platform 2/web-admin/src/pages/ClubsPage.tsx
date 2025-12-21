import React, { useState, useEffect } from 'react';
import { Plus, Search, Upload, Edit, Trash2 } from 'lucide-react';
import apiClient from '../api/client';

interface Club {
  id: string;
  name: string;
  city: string;
  status: string;
  member_count?: number;
}

const ClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      // Mock data - replace with actual API call
      setClubs([
        { id: '1', name: 'Downtown Fitness', city: 'Paris', status: 'ACTIVE', member_count: 245 },
        { id: '2', name: 'Westside Gym', city: 'Lyon', status: 'ACTIVE', member_count: 189 },
        { id: '3', name: 'Northside Club', city: 'Marseille', status: 'ACTIVE', member_count: 312 },
        { id: '4', name: 'Eastside Fitness', city: 'Toulouse', status: 'ACTIVE', member_count: 156 },
      ]);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await apiClient.importClubs(file);
      alert('Clubs imported successfully!');
      loadClubs();
      setShowImportModal(false);
    } catch (error) {
      alert('Import failed. Please check your CSV format.');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.city.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
          <p className="text-gray-600 mt-1">Manage your fitness clubs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Club
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-600">Total Clubs</p>
          <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {clubs.filter(c => c.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">
            {clubs.reduce((sum, c) => sum + (c.member_count || 0), 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">Avg Members/Club</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(clubs.reduce((sum, c) => sum + (c.member_count || 0), 0) / clubs.length)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clubs by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Clubs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">City</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Members</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClubs.map((club) => (
                <tr key={club.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{club.name}</td>
                  <td className="py-3 px-4 text-gray-600">{club.city}</td>
                  <td className="py-3 px-4 text-gray-600">{club.member_count}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      club.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {club.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Import Clubs</h3>
            <p className="text-gray-600 mb-4">
              Upload a CSV file with columns: external_club_id, name, city, timezone
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="input-field mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsPage;
