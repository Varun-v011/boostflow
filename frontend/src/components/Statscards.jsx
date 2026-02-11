import { Briefcase, Calendar, Clock, TrendingUp, Trophy, Target } from 'lucide-react';
import { useApplications } from '../context/applicationContext.jsx';
import { useTaskContext } from '../context/TaskContext.jsx';

const StatsCards = () => {
  // ✅ Get shared data from contexts (NO API calls!)
  const { applications, loading, getStats } = useApplications();
  const { 
    tasks, 
    totalPoints, 
    streak,
    getCompletedToday
  } = useTaskContext();

  // Calculate stats from shared data
  const appStats = getStats(); // ✅ Fixed: was getAppStats()
  
  // Calculate pending tasks
  const pendingTasks = tasks.filter(task => !task.completed).length;
  
  // Calculate interviews scheduled
  const interviewsScheduled = applications.filter(
    app => app.status === 'Interview'
  ).length;
  
  // Calculate this week's applications
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const thisWeekApplications = applications.filter(app => {
    const appDate = new Date(app.date_applied);
    return appDate >= oneWeekAgo;
  }).length;

  // Define stats using REAL DATA from contexts
  const stats = [
    {
      title: 'Total Applications',
      value: appStats.total, // ✅ From ApplicationContext
      change: `+${thisWeekApplications} this week`,
      trend: thisWeekApplications > 0 ? 'up' : 'neutral',
      icon: Briefcase,
      color: 'blue'
    },
    {
      title: 'Interviews Scheduled',
      value: interviewsScheduled, // ✅ From ApplicationContext
      change: `${appStats.offer} offers received`,
      trend: interviewsScheduled > 0 ? 'up' : 'neutral',
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks, // ✅ From TaskContext
      change: `${getCompletedToday()} done today`,
      trend: 'neutral',
      icon: Target,
      color: 'orange'
    },
    {
      title: 'Task Points',
      value: totalPoints, // ✅ From TaskContext
      change: streak > 0 ? `${streak} day streak 🔥` : 'Start your streak!',
      trend: streak > 0 ? 'up' : 'neutral',
      icon: Trophy,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  // Show loading state while data is being fetched
  if (loading) { // ✅ Fixed: was appsLoading
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
