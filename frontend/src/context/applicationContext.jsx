import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const APPLICATION_STATUSES = [
  'Applied',
  'Assessment', 
  'Interview',
  'Offer',
  'Rejected'
];
const ApplicationContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const API_BASE_URL = import.meta.env.REACT_APP_API_URL;

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Fetch last sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/sync-status`);
      if (!response.ok) throw new Error('Failed to fetch sync status');
      
      const data = await response.json();
      setLastSync(data);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  }, [API_BASE_URL]);

  // Create new application
  const createApplication = async (applicationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) throw new Error('Failed to create application');
      
      const newApp = await response.json();
      
      // Update state immediately
      setApplications(prev => [newApp, ...prev]);
      
      return newApp;
    } catch (err) {
      setError(err.message);
      console.error('Error creating application:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update application
  const updateApplication = async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update application');
      
      const updated = await response.json();
      
      // Update state immediately
      setApplications(prev =>
        prev.map(app => (app.id === id ? updated : app))
      );
      
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('Error updating application:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete application
  const deleteApplication = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete application');
      
      // Update state immediately
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting application:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sync emails and update applications dynamically
  const syncEmails = async (daysBack = 30, useAI = false) => {
    setSyncing(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days_back: daysBack,
          use_ai: useAI,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email sync failed');
      }
      
      const result = await response.json();
      
      // IMPORTANT: Refresh applications to get updates
      await fetchApplications();
      await fetchSyncStatus();
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Email sync error:', err);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  // Get application statistics
  const getStats = () => {
    const total = applications.length;
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    const autoImported = applications.filter(app => app.auto_imported).length;
    const manual = total - autoImported;
    
    return {
      total,
      byStatus,
      autoImported,
      manual,
      applied: byStatus['Applied'] || 0,
      assessment: byStatus['Assessment'] || 0,
      interview: byStatus['Interview'] || 0,
      rejected: byStatus['Rejected'] || 0,
      offer: byStatus['Offer'] || 0,
    };
  };

  // Get applications by status
  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  // Get auto-imported applications
  const getAutoImported = () => {
    return applications.filter(app => app.auto_imported);
  };

  // Get manually added applications
  const getManualApplications = () => {
    return applications.filter(app => !app.auto_imported);
  };

  // Initial fetch
  useEffect(() => {
    fetchApplications();
    fetchSyncStatus();
  }, [fetchApplications, fetchSyncStatus]);

  // Auto-refresh every 5 minutes (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications();
      fetchSyncStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchApplications, fetchSyncStatus]);

  const value = {
    // State
    applications,
    loading,
    error,
    syncing,
    lastSync,
    
    // CRUD operations
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    
    // Email sync
    syncEmails,
    fetchSyncStatus,
    
    // Helpers
    getStats,
    getApplicationsByStatus,
    getAutoImported,
    getManualApplications,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};