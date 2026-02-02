import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Sparkles, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useState } from 'react';


const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/applications', icon: Briefcase, label: 'Applications' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
    { path: '/resumes', icon: FileText, label: 'Resumes' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">JobTracker</h1>
            <p className="text-xs text-gray-400">Career Dashboard</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed ? (
          <div className="text-xs text-gray-400">
            <p>© 2026 JobTracker</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-xs">JT</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;