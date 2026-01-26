import { createContext, useContext, useState, useEffect } from 'react';

const ApplicationContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const APPLICATION_STATUSES = {
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected'
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const addApplication = async (applicationData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) throw new Error('Failed to create application');
      
      const newApplication = await response.json();
      setApplications([newApplication, ...applications]);
      return newApplication;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (applicationId, updates) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update application');

      const updatedApplication = await response.json();
      setApplications(applications.map(app => 
        app.id === applicationId ? updatedApplication : app
      ));
      return updatedApplication;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete application');

      setApplications(applications.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  const getStats = () => {
    return {
      total: applications.length,
      applied: getApplicationsByStatus(APPLICATION_STATUSES.APPLIED).length,
      interview: getApplicationsByStatus(APPLICATION_STATUSES.INTERVIEW).length,
      offer: getApplicationsByStatus(APPLICATION_STATUSES.OFFER).length,
      rejected: getApplicationsByStatus(APPLICATION_STATUSES.REJECTED).length,
    };
  };

  const value = {
    applications,
    loading,
    addApplication,
    updateApplication,
    deleteApplication,
    getApplicationsByStatus,
    getStats,
    refreshApplications: fetchApplications
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplicationContext must be used within an ApplicationProvider');
  }
  return context;
};