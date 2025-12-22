import React, { useState, useEffect, useRef } from 'react'; // Ajout de useRef
import { Plus, Search, Upload, Edit, Trash2, X } from 'lucide-react'; // Ajout de X pour fermer
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
  const [isImporting, setIsImporting] = useState(false); // État pour le chargement de l'import
  
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref pour déclencher l'input file

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      // Remplacez par : const response = await apiClient.getClubs();
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
      setIsImporting(true);
      await apiClient.importClubs(file); // Assurez-vous que cette méthode accepte FormData ou le fichier
      alert('Clubs imported successfully!');
      loadClubs();
      setShowImportModal(false);
    } catch (error) {
      console.error(error);
      alert('Import failed. Please check your CSV format.');
    } finally {
      setIsImporting(false);
      // Reset de l'input pour permettre de re-sélectionner le même fichier si besoin
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... (Reste du code identique jusqu'au Modal)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
          <p className="text-gray-600 mt-1">Manage your fitness clubs</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <button className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Club
          </button>
        </div>
      </div>

      {/* ... (Section Stats et Search inchangées) ... */}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Import Clubs</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 text-sm">
              Upload a CSV file with columns: <code className="bg-gray-100 px-1 rounded">external_club_id, name, city, timezone</code>
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors mb-6"
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {isImporting ? "Uploading..." : "Click to select or drag and drop CSV file"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden" // On cache l'input réel
              />
            </div>

            <div className="flex gap-3">
              <button
                disabled={isImporting}
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
