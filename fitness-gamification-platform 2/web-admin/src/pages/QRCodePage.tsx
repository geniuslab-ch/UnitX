import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

const QRCodePage = () => {
  const [clubId, setClubId] = useState('');
  const [clubs, setClubs] = useState<any[]>([]);
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load clubs
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get('/api/v1/clubs');
      // setClubs(response.data);
      
      // Mock data for now
      setClubs([
        { id: '1', name: 'Downtown Gym' },
        { id: '2', name: 'Westside Fitness' },
      ]);
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const generateQRCode = async () => {
    if (!clubId) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call to get QR data
      // const response = await axios.get(`/api/v1/clubs/${clubId}/qr`);
      
      // Mock QR data for now
      const mockQRData = JSON.stringify({
        club_id: clubId,
        token: 'mock-token-' + Date.now(),
        timestamp: Math.floor(Date.now() / 1000),
        expires: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      });
      
      setQrData(mockQRData);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `club-qr-${clubId}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="mt-2 text-gray-600">
          Generate QR codes for club check-ins
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Club selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Club
          </label>
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Choose a club...</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate button */}
        <button
          onClick={generateQRCode}
          disabled={!clubId || loading}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>

        {/* QR Code display */}
        {qrData && (
          <div className="mt-8">
            <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center">
              <QRCode
                id="qr-code"
                value={qrData}
                size={300}
                level="H"
                includeMargin
              />
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download PNG
                </button>
                <button
                  onClick={generateQRCode}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Regenerate
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  This QR code rotates every 5 minutes
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Display on TV or print for members to scan
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            📱 How to use QR codes:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Generate a QR code for your club</li>
            <li>• Display it on a TV screen or print it</li>
            <li>• Members scan with their mobile app to check in</li>
            <li>• QR codes rotate automatically for security</li>
            <li>• Each scan earns 50 points (max 1 per day)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
