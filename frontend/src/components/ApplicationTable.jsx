import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useApplications } from '../context/applicationContext';

const ApplicationsTable = () => {
  // ✅ Get shared data from context
  const { 
    applications, 
    loading, 
    updateApplication,
    deleteApplication,
    fetchApplications
  } = useApplications();

  // Email sync states
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Fetch last sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/sync-status`);
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  // Handle email sync
  const handleEmailSync = async (daysBack = 30, useAI = false) => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days_back: daysBack,
          use_ai: useAI
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSyncResult(data);
        // Refresh applications list from context
        await fetchApplications();
        await fetchSyncStatus();
      } else {
        setSyncResult({
          success: false,
          message: data.detail || 'Sync failed',
          errors: [data.detail]
        });
      }
    } catch (error) {
      console.error('Email sync failed:', error);
      setSyncResult({
        success: false,
        message: 'Failed to connect to server',
        errors: [error.message]
      });
    } finally {
      setSyncing(false);
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
      'Assessment': 'bg-blue-100 text-blue-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Handle status change
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplication(appId, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Handle delete
  const handleDelete = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(appId);
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Get recent applications (last 10)
  const recentApplications = applications.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Sync Result Alert */}
      {syncResult && (
        <div className={`p-4 rounded-lg border ${
          syncResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {syncResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                syncResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {syncResult.success ? 'Email Sync Successful!' : 'Email Sync Failed'}
              </h3>
              <p className={`text-sm mt-1 ${
                syncResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {syncResult.message}
              </p>
              {syncResult.success && (
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <div>📧 Emails processed: {syncResult.emails_processed}</div>
                  <div>✅ Applications added: {syncResult.applications_added}</div>
                  <div>🔄 Applications updated: {syncResult.applications_updated}</div>
                </div>
              )}
              {syncResult.errors && syncResult.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-700">
                  <div className="font-medium">Errors:</div>
                  <ul className="list-disc list-inside">
                    {syncResult.errors.slice(0, 3).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => setSyncResult(null)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sync Job Emails</h2>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Automatically import job applications from your Gmail inbox.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What will be synced?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Application confirmations</li>
                  <li>• Assessment/test invitations</li>
                  <li>• Interview invitations</li>
                  <li>• Rejection notices</li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Time Range</span>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="daysBack"
                    defaultValue="30"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 60 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useAI"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Use AI for complex emails (limited to 10 per sync)
                  </span>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    First-time setup requires Gmail authorization. A browser window will open.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const daysBack = parseInt(document.getElementById('daysBack').value);
                    const useAI = document.getElementById('useAI').checked;
                    setShowSyncModal(false);
                    handleEmailSync(daysBack, useAI);
                  }}
                  disabled={syncing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Start Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-lg shadow">
        {/* Enhanced Header with Sync Button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Applications
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({applications.length} total)
                </span>
              </h2>
              {syncStatus && syncStatus.last_sync && (
                <p className="text-xs text-gray-500 mt-1">
                  Last synced: {new Date(syncStatus.last_sync).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.location.href = '/applications'}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All →
              </button>
              
              {/* Sync Button */}
              <button
                onClick={() => setShowSyncModal(true)}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Mail className="w-5 h-5" />
                {syncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync Emails'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">Click "Sync Emails" to import from Gmail or add manually</p>
          </div>
        ) : (
          <>
            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map((app) => (
                    <tr 
                      key={app.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Company */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3 text-white font-bold">
                            {app.company.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{app.company}</span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{app.position}</div>
                        {app.location && (
                          <div className="text-xs text-gray-500">{app.location}</div>
                        )}
                      </td>

                      {/* Status - Editable */}
                      <td className="px-6 py-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-0 ${getStatusColor(app.status)}`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Interview">Interview</option>
                          <option value="Offer">Offer</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(app.date_applied)}
                      </td>

                      {/* Salary */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {app.salary || 'Not specified'}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.auto_imported ? (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Mail className="w-4 h-4" />
                            Email
                          </span>
                        ) : (
                          'Manual'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Show "View All" footer if there are more than 10 applications */}
            {applications.length > 10 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                <button 
                  onClick={() => window.location.href = '/applications'}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {applications.length} applications →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationsTable;
