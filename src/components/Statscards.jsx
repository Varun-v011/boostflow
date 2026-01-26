import { Briefcase, Calendar, Clock, TrendingUp, Trophy, Target } from 'lucide-react';

const StatsCards = ({ taskStats }) => {
  const stats = [
    {
      title: 'Total Applications',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Briefcase,
      color: 'blue'
    },
    {
      title: 'Interviews Scheduled',
      value: '8',
      change: '+3 this week',
      trend: 'up',
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Pending Tasks',
      value: taskStats?.pending || 0,
      change: `${taskStats?.todayCompleted || 0} done today`,
      trend: 'neutral',
      icon: Target,
      color: 'orange'
    },
    {
      title: 'Task Points',
      value: taskStats?.totalPoints || 0,
      change: `${taskStats?.streak || 0} day streak`,
      trend: taskStats?.streak > 0 ? 'up' : 'neutral',
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
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