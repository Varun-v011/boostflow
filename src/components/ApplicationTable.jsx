// ApplicationsTable.jsx
const ApplicationsTable = () => {
  const applications = [
    { company: 'Google', position: 'Software Engineer', status: 'Interview', date: 'Jan 20, 2026', salary: '$120k' },
    { company: 'Meta', position: 'Frontend Developer', status: 'Applied', date: 'Jan 18, 2026', salary: '$110k' },
    { company: 'Amazon', position: 'Full Stack Dev', status: 'Rejected', date: 'Jan 15, 2026', salary: '$115k' },
    { company: 'Microsoft', position: 'React Developer', status: 'Offer', date: 'Jan 12, 2026', salary: '$125k' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white  rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map((app, index) => (
              <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      {app.company[0]}
                    </div>
                    <span className="font-medium text-gray-900">{app.company}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{app.position}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{app.date}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{app.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;
