
import React, { useState } from 'react';
import { useApplicationContext } from '../context/applicationContext';

const ApplicationsTable = () => {
  // ✅ Get shared data from context - NO API call needed!
  const { 
    applications, 
    loading, 
    updateApplication,
    deleteApplication 
  } = useApplicationContext();

  // Local state for table interactions
  const [selectedApp, setSelectedApp] = useState(null);

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
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
  // Replace your formatDate function with this:
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  // ✅ Parse in local timezone (no UTC conversion)
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

  // Empty state
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
        </div>
        <div className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">Start tracking your job applications to see them here.</p>
        </div>
      </div>
    );
  }

  // Get recent applications (last 10)
  const recentApplications = applications.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Recent Applications
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({applications.length} total)
            </span>
          </h2>
          <button 
            onClick={() => window.location.href = '/applications'}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>
      </div>
      
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
    </div>
  );
};

export default ApplicationsTable;