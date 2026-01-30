import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TaskContext = createContext();

// Task categories with different point values
// eslint-disable-next-line react-refresh/only-export-components
export const TASK_CATEGORIES = {
  APPLICATION: { name: 'Job Application', points: 10, icon: '📝' },
  NETWORKING: { name: 'Networking', points: 8, icon: '🤝' },
  SKILL_BUILDING: { name: 'Skill Building', points: 15, icon: '📚' },
  INTERVIEW_PREP: { name: 'Interview Prep', points: 12, icon: '💼' },
  RESEARCH: { name: 'Company Research', points: 6, icon: '🔍' },
  RESUME: { name: 'Resume/Portfolio', points: 10, icon: '📄' },
  FOLLOW_UP: { name: 'Follow-up', points: 5, icon: '✉️' },
  OTHER: { name: 'Other', points: 5, icon: '⭐' }
};

// Achievement badges
export const ACHIEVEMENTS = [
  { id: 'first_task', name: 'Getting Started', description: 'Complete your first task', points: 0, icon: '🎯' },
  { id: 'streak_3', name: '3-Day Streak', description: 'Complete tasks 3 days in a row', points: 50, icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Complete tasks 7 days in a row', points: 100, icon: '⚡' },
  { id: 'points_100', name: 'Century Club', description: 'Earn 100 points', points: 0, icon: '💯' },
  { id: 'points_500', name: 'Power User', description: 'Earn 500 points', points: 0, icon: '🏆' },
  { id: 'tasks_50', name: 'Task Master', description: 'Complete 50 tasks', points: 50, icon: '👑' },
  { id: 'daily_5', name: 'Daily Five', description: 'Complete 5 tasks in one day', points: 25, icon: '🌟' }
];

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('jobtracker_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [totalPoints, setTotalPoints] = useState(() => {
    const savedPoints = localStorage.getItem('jobtracker_points');
    return savedPoints ? parseInt(savedPoints) : 0;
  });

  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem('jobtracker_streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });

  const [achievements, setAchievements] = useState(() => {
    const savedAchievements = localStorage.getItem('jobtracker_achievements');
    return savedAchievements ? JSON.parse(savedAchievements) : [];
  });

  const [lastCompletedDate, setLastCompletedDate] = useState(() => {
    return localStorage.getItem('jobtracker_last_completed') || null;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('jobtracker_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jobtracker_points', totalPoints.toString());
  }, [totalPoints]);

  useEffect(() => {
    localStorage.setItem('jobtracker_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('jobtracker_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    if (lastCompletedDate) {
      localStorage.setItem('jobtracker_last_completed', lastCompletedDate);
    }
  }, [lastCompletedDate]);

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastCompletedDate === today) {
      // Already completed something today
      return;
    } else if (lastCompletedDate === yesterday) {
      // Continuing streak
      setStreak(prev => prev + 1);
    } else if (!lastCompletedDate) {
      // First task ever
      setStreak(1);
    } else {
      // Streak broken
      setStreak(1);
    }
    
    setLastCompletedDate(today);
  }, [lastCompletedDate]);

  const checkAchievements = useCallback((pointsAdded, currentTasks, currentStreak) => {
    const newAchievements = [];
    const completedTasks = currentTasks.filter(t => t.completed).length + 1;
    const newTotalPoints = totalPoints + pointsAdded;
    const today = new Date().toDateString();
    const tasksCompletedToday = currentTasks.filter(t => 
      t.completed && new Date(t.completedAt).toDateString() === today
    ).length + 1;

    // Check each achievement
    if (completedTasks === 1 && !achievements.includes('first_task')) {
      newAchievements.push('first_task');
    }
    if (currentStreak === 3 && !achievements.includes('streak_3')) {
      newAchievements.push('streak_3');
    }
    if (currentStreak === 7 && !achievements.includes('streak_7')) {
      newAchievements.push('streak_7');
    }
    if (newTotalPoints >= 100 && !achievements.includes('points_100')) {
      newAchievements.push('points_100');
    }
    if (newTotalPoints >= 500 && !achievements.includes('points_500')) {
      newAchievements.push('points_500');
    }
    if (completedTasks >= 50 && !achievements.includes('tasks_50')) {
      newAchievements.push('tasks_50');
    }
    if (tasksCompletedToday >= 5 && !achievements.includes('daily_5')) {
      newAchievements.push('daily_5');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      // Add achievement bonus points
      const bonusPoints = newAchievements.reduce((sum, achievementId) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        return sum + (achievement?.points || 0);
      }, 0);
      if (bonusPoints > 0) {
        setTotalPoints(prev => prev + bonusPoints);
      }
    }

    return newAchievements;
  }, [totalPoints, achievements]);

  const addTask = useCallback((taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const toggleTask = useCallback((taskId) => {
    setTasks(currentTasks => {
      const task = currentTasks.find(t => t.id === taskId);
      if (!task) return currentTasks;

      const isCompleting = !task.completed;
      const points = TASK_CATEGORIES[task.category]?.points || 5;
      
      if (isCompleting) {
        // Add points
        setTotalPoints(prev => prev + points);
        
        // Update streak
        updateStreak();
        
        // Check achievements (pass current streak value)
        setTimeout(() => {
          setStreak(currentStreak => {
            checkAchievements(points, currentTasks, currentStreak);
            return currentStreak;
          });
        }, 0);
      } else {
        // Remove points
        setTotalPoints(prev => Math.max(0, prev - points));
      }

      return currentTasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : null
          };
        }
        return t;
      });
    });
  }, [updateStreak, checkAchievements]);

  const deleteTask = useCallback((taskId) => {
    setTasks(currentTasks => {
      const task = currentTasks.find(t => t.id === taskId);
      if (task && task.completed) {
        // Remove points if task was completed
        const points = TASK_CATEGORIES[task.category]?.points || 5;
        setTotalPoints(prev => Math.max(0, prev - points));
      }
      return currentTasks.filter(t => t.id !== taskId);
    });
  }, []);

  const editTask = useCallback((taskId, updates) => {
    setTasks(currentTasks => 
      currentTasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    );
  }, []);

  const getTodaysTasks = useCallback(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => new Date(t.createdAt).toDateString() === today);
  }, [tasks]);

  const getCompletedToday = useCallback(() => {
    return getTodaysTasks().filter(t => t.completed).length;
  }, [getTodaysTasks]);

  const getPendingTasks = useCallback(() => {
    return tasks.filter(t => !t.completed);
  }, [tasks]);

  const getStats = useCallback(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const todayCompleted = getCompletedToday();
    
    return {
      totalTasks: tasks.length,
      completed,
      pending,
      todayCompleted,
      totalPoints,
      streak,
      achievements: achievements.length
    };
  }, [tasks, totalPoints, streak, achievements.length, getCompletedToday]);

  const resetAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all tasks and progress? This cannot be undone.')) {
      setTasks([]);
      setTotalPoints(0);
      setStreak(0);
      setAchievements([]);
      setLastCompletedDate(null);
      localStorage.removeItem('jobtracker_tasks');
      localStorage.removeItem('jobtracker_points');
      localStorage.removeItem('jobtracker_streak');
      localStorage.removeItem('jobtracker_achievements');
      localStorage.removeItem('jobtracker_last_completed');
    }
  }, []);

  const value = {
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
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};