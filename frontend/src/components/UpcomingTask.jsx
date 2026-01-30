import { useTaskContext, TASK_CATEGORIES } from '../context/TaskContext';
import { CheckCircle2, Circle, ArrowRight, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpcomingTasks = () => {
  const { tasks, totalPoints, streak, toggleTask, getPendingTasks, getTodaysTasks } = useTaskContext();
  
  const pendingTasks = getPendingTasks().slice(0, 5); // Show top 5 pending tasks
  const todaysTasks = getTodaysTasks();
  const completedToday = todaysTasks.filter(t => t.completed).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daily Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              {completedToday} of {todaysTasks.length} completed today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-600">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">{totalPoints} pts</span>
              </div>
              <div className="flex items-center gap-1 text-orange-600 mt-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-semibold">{streak} day streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {pendingTasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">All caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No pending tasks. Great job!</p>
          </div>
        ) : (
          <>
            {pendingTasks.map((task) => {
              const category = TASK_CATEGORIES[task.category];
              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center text-xs text-gray-600">
                          {category?.icon} {category?.name}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-blue-600 font-medium">
                          +{category?.points} pts
                        </span>
                      </div>
                    </div>

                    {task.priority === 'high' && (
                      <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="p-4 bg-gray-50">
              <Link
                to="/tasks"
                className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all tasks
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;