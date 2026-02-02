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
import { ApplicationProvider } from './context/ApplicationContext.jsx';
import ResumeManager from './components/ResumeManager.jsx';

function App() {
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
      </Router>
    </TaskProvider>
    </ApplicationProvider>
  );
}

export default App;