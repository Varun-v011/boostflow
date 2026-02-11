import React from 'react';
import { Settings as SettingsIcon, Sparkles, Bell, Moon, Globe, Shield, HelpCircle, BookOpen } from 'lucide-react';
import { TutorialButton } from '../components/Tutorial';

const Settings = ({ onShowTutorial }) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your preferences and account</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Help & Support Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Help & Support
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {/* Tutorial Button */}
            <TutorialButton onClick={onShowTutorial} />

            {/* Documentation */}
            <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Documentation</div>
                <div className="text-sm text-gray-600">View setup guides and FAQs</div>
              </div>
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-600" />
              Preferences
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Notifications</div>
                  <div className="text-sm text-gray-600">Get notified about updates</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Dark Mode</div>
                  <div className="text-sm text-gray-600">Switch to dark theme</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Language</div>
                  <div className="text-sm text-gray-600">Choose your language</div>
                </div>
              </div>
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Privacy & Security
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="font-medium text-gray-900">Export Data</div>
              <div className="text-sm text-gray-600 mt-1">Download all your application data</div>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="font-medium text-gray-900">Reset Tutorial</div>
              <div className="text-sm text-gray-600 mt-1">Show the tutorial again next time</div>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600">
              <div className="font-medium">Delete All Data</div>
              <div className="text-sm text-red-500 mt-1">Permanently remove all your data</div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">🚀</div>
          <h3 className="font-bold text-gray-900">JobTracker v2.0</h3>
          <p className="text-sm text-gray-600 mt-2">
            AI-powered job application tracking with email automation
          </p>
          <div className="mt-4 text-xs text-gray-500">
            Built with React, FastAPI, and Google Gemini AI
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;