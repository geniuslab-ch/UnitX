import React, { useState } from 'react';
import { Save, Key, Bell, Shield, Globe, Trophy } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    checkinPoints: 50,
    caloriePointsDivisor: 10,
    maxCaloriePointsPerDay: 150,
    streakBonusPoints: 20,
    streakDaysRequired: 3,
    topNContributors: 50,
    maxCaloriesPerDay: 2500,
    qrRotationMinutes: 5,
    promotionCount: 2,
    demotionCount: 2,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform rules and parameters</p>
      </div>

      {/* Scoring Rules */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Scoring Rules</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Points
              </label>
              <input
                type="number"
                value={settings.checkinPoints}
                onChange={(e) => setSettings({ ...settings, checkinPoints: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Points awarded per daily check-in</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calorie Points Divisor
              </label>
              <input
                type="number"
                value={settings.caloriePointsDivisor}
                onChange={(e) => setSettings({ ...settings, caloriePointsDivisor: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">1 point per X active calories</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Calorie Points/Day
              </label>
              <input
                type="number"
                value={settings.maxCaloriePointsPerDay}
                onChange={(e) => setSettings({ ...settings, maxCaloriePointsPerDay: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Daily cap on calorie points</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Streak Bonus Points
              </label>
              <input
                type="number"
                value={settings.streakBonusPoints}
                onChange={(e) => setSettings({ ...settings, streakBonusPoints: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Bonus for consecutive days</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Streak Days Required
              </label>
              <input
                type="number"
                value={settings.streakDaysRequired}
                onChange={(e) => setSettings({ ...settings, streakDaysRequired: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Days needed for streak bonus</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Top N Contributors
              </label>
              <input
                type="number"
                value={settings.topNContributors}
                onChange={(e) => setSettings({ ...settings, topNContributors: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Members counted for club score</p>
            </div>
          </div>
        </div>
      </div>

      {/* League Rules */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">League Rules</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotions per Week
              </label>
              <input
                type="number"
                value={settings.promotionCount}
                onChange={(e) => setSettings({ ...settings, promotionCount: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Top N clubs move up a tier</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demotions per Week
              </label>
              <input
                type="number"
                value={settings.demotionCount}
                onChange={(e) => setSettings({ ...settings, demotionCount: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Bottom N clubs move down a tier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheat */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Anti-Cheat Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Calories per Day
              </label>
              <input
                type="number"
                value={settings.maxCaloriesPerDay}
                onChange={(e) => setSettings({ ...settings, maxCaloriesPerDay: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">Flag if exceeded</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Rotation (minutes)
              </label>
              <input
                type="number"
                value={settings.qrRotationMinutes}
                onChange={(e) => setSettings({ ...settings, qrRotationMinutes: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">QR code expiration time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          ⚠️ Changes to scoring rules will only affect new calculations. Historical data remains unchanged.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
