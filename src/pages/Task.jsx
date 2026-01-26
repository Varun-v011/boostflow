import { useState } from 'react';
import { useTaskContext, TASK_CATEGORIES, ACHIEVEMENTS } from '../context/TaskContext';
import { Plus, Trophy, TrendingUp, Flame, CheckCircle2, Circle, Trash2, Edit2, X, Star } from 'lucide-react';

const Tasks = () => {
  const {
    tasks,
    totalPoints,
    streak,
    achievements,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    getTodaysTasks,
    getCompletedToday,
    getPendingTasks,
    getStats,
    resetAllData
  } = useTaskContext();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, today, pending, completed
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'APPLICATION',
    description: '',
    priority: 'medium'
  });

  const stats = getStats();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      editTask(editingTask.id, newTask);
      setEditingTask(null);
    } else {
      addTask(newTask);
    }
    setNewTask({ title: '', category: 'APPLICATION', description: '', priority: 'medium' });
    setShowAddModal(false);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      category: task.category,
      description: task.description || '',
      priority: task.priority || 'medium'
    });
    setShowAddModal(true);
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setNewTask({ title: '', category: 'APPLICATION', description: '', priority: 'medium' });
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'today':
        return getTodaysTasks();
      case 'pending':
        return getPendingTasks();
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const unlockedAchievements = ACHIEVEMENTS.filter(a => achievements.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !achievements.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Tasks & Challenges</h1>
          <p className="text-gray-600 mt-1">Complete tasks to earn points and unlock achievements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Points</p>
              <p className="text-3xl font-bold mt-1">{totalPoints}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Current Streak</p>
              <p className="text-3xl font-bold mt-1">{streak} days</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Flame className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed Today</p>
              <p className="text-3xl font-bold mt-1">{stats.todayCompleted}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Achievements</p>
              <p className="text-3xl font-bold mt-1">{achievements.length}/{ACHIEVEMENTS.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      {unlockedAchievements.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Unlocked Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    {achievement.points > 0 && (
                      <p className="text-xs text-yellow-700 font-medium mt-2">
                        +{achievement.points} bonus points
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Tasks' },
            { value: 'today', label: 'Today' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filter === 'all' && 'All Tasks'}
            {filter === 'today' && "Today's Tasks"}
            {filter === 'pending' && 'Pending Tasks'}
            {filter === 'completed' && 'Completed Tasks'}
            <span className="text-gray-500 font-normal ml-2">({filteredTasks.length})</span>
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Circle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found. Add your first task to get started!</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const category = TASK_CATEGORIES[task.category];
              const priorityColors = {
                high: 'bg-red-100 text-red-800',
                medium: 'bg-yellow-100 text-yellow-800',
                low: 'bg-green-100 text-green-800'
              };

              return (
                <div
                  key={task.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    task.completed ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-medium ${
                            task.completed
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {category?.icon} {category?.name}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {category?.points} pts
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                        {task.completedAt && ` • Completed ${new Date(task.completedAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
            Locked Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60"
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-3 grayscale">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    {achievement.points > 0 && (
                      <p className="text-xs text-gray-500 font-medium mt-2">
                        Unlock for +{achievement.points} points
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Apply to Software Engineer position"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.name} ({cat.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debug/Reset Button */}
      <div className="bg-white rounded-lg border border-red-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-600 mt-1">Reset all tasks and progress</p>
          </div>
          <button
            onClick={resetAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
