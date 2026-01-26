import React from 'react';
import { navItems } from './navitems';


const Sidebar = ({ collapsed, setCollapsed, shown }) => {


  return (
    <div className={`
      bg-gray-900 text-white z-20 transition-all duration-300 h-screen
      ${collapsed ? 'w-16' : 'w-64'}
      ${!shown ? 'hidden md:block' : 'block'}
    `}>
      <div className="flex flex-col justify-between h-full">
        {/* Logo & Toggle */}
        <div className={`flex items-center border-b border-gray-800 ${collapsed ? 'py-4 justify-center' : 'p-4 justify-between'}`}>
          {!collapsed && <span className="font-bold text-lg">JobTracker</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-10 h-10 rounded-full hover:bg-gray-800 grid place-content-center transition-colors"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-grow overflow-y-auto">
          <ul className="my-2 flex flex-col gap-2">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={index}>
                  <Link 
                    to={item.href}
                    className={`
                      flex items-center gap-3 transition-colors duration-300
                      ${collapsed ? 'rounded-full p-2 mx-3 w-10 h-10 justify-center' : 'rounded-md p-3 mx-3'}
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">User Name</span>
                <span className="text-xs text-gray-400">View Profile</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
