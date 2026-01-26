// Header.jsx
const Header = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Logo */}


      {/* Right Side Actions */}
      <div className="flex absolute right-0 gap-4 items-center">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          + Add Application
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
