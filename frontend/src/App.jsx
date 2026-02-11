import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext.jsx';
import Layout from './layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Applications from './pages/Application.jsx';
import Calendar from './pages/Calendar.jsx';
import Tasks from './pages/Task.jsx';
import Analytics from './pages/Analytics.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Settings from './pages/Setting.jsx';
import { ApplicationProvider } from './context/applicationContext.jsx';
import ResumeManager from './components/ResumeManager.jsx';
import Tutorial from './components/Tutorial.jsx';
import { useState, useEffect } from 'react';

function App() {
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if this is first time user
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorial_completed');
    if (tutorialCompleted !== 'true') {
      // Show tutorial after a short delay for better UX
      setTimeout(() => {
        setShowTutorial(true);
      }, 500);
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <ApplicationProvider>
    <TaskProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/resumes" element={<ResumeManager />} /> 
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
         {showTutorial && (
            <Tutorial onComplete={handleTutorialComplete} />
          )}
      </Router>
    </TaskProvider>
    </ApplicationProvider>
  );
}

export default App;