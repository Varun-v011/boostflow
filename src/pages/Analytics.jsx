import { useApplicationContext } from '../context/ApplicationContext';
import { useTaskContext } from '../context/TaskContext';
import { TrendingUp, Briefcase, CheckCircle, XCircle, Calendar, Trophy, Target } from 'lucide-react';

const Analytics = () => {
  const { applications } = useApplicationContext();
  const { tasks, totalPoints, streak } = useTaskContext();

  // Calculate application statistics
  const totalApps = applications.length;
  const appliedApps = applications.filter(a => a.status === 'Applied').length;
  const interviewApps = applications.filter(a => a.status === 'Interview').length;
  const offerApps = applications.filter(a => a.status === 'Offer').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  const successRate = totalApps > 0 ? ((offerApps / totalApps) * 100).toFixed(1) : 0;
  const interviewRate = totalApps > 0 ? ((interviewApps / totalApps) * 100).toFixed(1) : 0;
  const responseRate = totalApps > 0 ? (((interviewApps + offerApps + rejectedApps) / totalApps) * 100).toFixed(1) : 0;

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  // Applications by month
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const count = applications.filter(app => {
      const appDate = new Date(app.date_applied);
      return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === year;
    }).length;
    last6Months.push({ month: monthName, count });
  }

  const maxCount = Math.max(...last6Months.map(m => m.count), 1);

  // Top companies applied to
  const companyCounts = {};
  applications.forEach(app => {
    companyCounts[app.company] = (companyCounts[app.company] || 0) + 1;
  });
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Category breakdown for tasks
  const taskCategories = {};
  tasks.forEach(task => {
    taskCategories[task.category] = (taskCategories[task.category] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-1">Track your job search progress and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{totalApps}</span>
          </div>
          <p className="text-blue-100 text-sm">Total Applications</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{successRate}%</span>
          </div>
          <p className="text-green-100 text-sm">Success Rate</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{totalPoints}</span>
          </div>
          <p className="text-purple-100 text-sm">Total Points</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{taskCompletionRate}%</span>
          </div>
          <p className="text-orange-100 text-sm">Task Completion</p>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Applied</span>
                <span className="text-sm font-medium text-gray-900">{appliedApps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalApps > 0 ? (appliedApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Interview</span>
                <span className="text-sm font-medium text-gray-900">{interviewApps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalApps > 0 ? (interviewApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Offer</span>
                <span className="text-sm font-medium text-gray-900">{offerApps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalApps > 0 ? (offerApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-sm font-medium text-gray-900">{rejectedApps}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-600 font-medium">Interview Rate</p>
                <p className="text-xs text-blue-700 mt-1">Applications → Interviews</p>
              </div>
              <span className="text-2xl font-bold text-blue-900">{interviewRate}%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-600 font-medium">Response Rate</p>
                <p className="text-xs text-green-700 mt-1">Any response from companies</p>
              </div>
              <span className="text-2xl font-bold text-green-900">{responseRate}%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-purple-600 font-medium">Current Streak</p>
                <p className="text-xs text-purple-700 mt-1">Consecutive days active</p>
              </div>
              <span className="text-2xl font-bold text-purple-900">{streak} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Applications Over Time</h2>
        <div className="flex items-end justify-between gap-4 h-64">
          {last6Months.map((month, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center flex-1 pb-2">
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                  style={{ height: `${(month.count / maxCount) * 100}%`, minHeight: month.count > 0 ? '20px' : '0' }}
                  title={`${month.count} applications`}
                />
              </div>
              <span className="text-xs text-gray-600 mt-2">{month.month}</span>
              <span className="text-xs font-semibold text-gray-900">{month.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        {topCompanies.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Companies Applied</h2>
            <div className="space-y-3">
              {topCompanies.map(([company, count], idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{company}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...topCompanies.map(c => c[1]))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-700 font-medium">Total Tasks</p>
                <p className="text-xs text-gray-500 mt-1">All created tasks</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalTasks}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-700 font-medium">Completed</p>
                <p className="text-xs text-green-600 mt-1">Successfully finished</p>
              </div>
              <span className="text-2xl font-bold text-green-900">{completedTasks}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-700 font-medium">Pending</p>
                <p className="text-xs text-blue-600 mt-1">Yet to complete</p>
              </div>
              <span className="text-2xl font-bold text-blue-900">{pendingTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
          Insights & Recommendations
        </h2>
        <div className="space-y-3">
          {totalApps === 0 && (
            <p className="text-sm text-gray-700">
              🎯 Get started by adding your first job application!
            </p>
          )}
          {totalApps > 0 && interviewRate < 10 && (
            <p className="text-sm text-gray-700">
              💡 Your interview rate is {interviewRate}%. Consider tailoring your resume and cover letters to each position.
            </p>
          )}
          {totalApps > 0 && interviewRate >= 10 && interviewRate < 25 && (
            <p className="text-sm text-gray-700">
              ✅ Good interview rate of {interviewRate}%! Keep refining your application materials.
            </p>
          )}
          {interviewRate >= 25 && (
            <p className="text-sm text-gray-700">
              🌟 Excellent interview rate of {interviewRate}%! Your application strategy is working well.
            </p>
          )}
          {pendingTasks > 10 && (
            <p className="text-sm text-gray-700">
              ⚡ You have {pendingTasks} pending tasks. Focus on completing high-priority items first.
            </p>
          )}
          {streak >= 7 && (
            <p className="text-sm text-gray-700">
              🔥 Amazing {streak}-day streak! Consistency is key to a successful job search.
            </p>
          )}
          {totalPoints >= 100 && (
            <p className="text-sm text-gray-700">
              🏆 You've earned {totalPoints} points! Your dedication is paying off.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;