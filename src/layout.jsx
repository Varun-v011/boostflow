import React, { useState } from 'react';
import Sidebar from './components/sidebar.jsx';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Static */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        shown={showSidebar}
      />
      
      {/* Main Content Area - Dynamic */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Static */}
        
        {/* Dynamic Content (changes based on sidebar clicks) */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
