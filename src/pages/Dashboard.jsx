import { useTaskContext } from '../context/TaskContext';
import StatsCards from '../components/Statscards';
import ApplicationsTable from '../components/ApplicationTable';
import UpcomingTasks from '../components/UpcomingTask';

const Dashboard = () => {
  const { getStats } = useTaskContext();
  const taskStats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your job search overview.</p>
      </div>

      <StatsCards taskStats={taskStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationsTable />
          <ActivityFeed />
        </div>
        
        <div className="space-y-6">
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;