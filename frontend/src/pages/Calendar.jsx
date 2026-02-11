import { useState } from 'react';
import { useApplications, APPLICATION_STATUSES } from '../context/applicationContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Building2 } from 'lucide-react';

const Calendar = () => {
  const { applications } = useApplications();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get interviews (applications with Interview status)
  const interviews = applications.filter(app => app.status === APPLICATION_STATUSES.INTERVIEW);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getInterviewsForDay = (day) => {
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.date_applied);
      return (
        interviewDate.getDate() === day &&
        interviewDate.getMonth() === currentDate.getMonth() &&
        interviewDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  // Upcoming interviews
  const upcomingInterviews = interviews
    .filter(interview => new Date(interview.date_applied) >= new Date())
    .sort((a, b) => new Date(a.date_applied) - new Date(b.date_applied))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview Calendar</h1>
        <p className="text-gray-600 mt-1">Schedule and track your upcoming interviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{interviews.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {interviews.filter(i => {
                  const date = new Date(i.date_applied);
                  return date.getMonth() === currentDate.getMonth() &&
                         date.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {interviews.filter(i => new Date(i.date_applied) >= new Date()).length}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Names */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}

              {/* Empty Days */}
              {emptyDays.map(i => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days */}
              {days.map(day => {
                const dayInterviews = getInterviewsForDay(day);
                const hasInterviews = dayInterviews.length > 0;

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 ${
                      isToday(day)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${hasInterviews ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-sm font-medium ${
                          isToday(day) ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                      {hasInterviews && (
                        <div className="mt-1 space-y-1">
                          {dayInterviews.slice(0, 2).map((interview, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded truncate"
                              title={interview.company}
                            >
                              {interview.company}
                            </div>
                          ))}
                          {dayInterviews.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium">
                              +{dayInterviews.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
          
          {upcomingInterviews.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming interviews scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{interview.company}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Interview
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{interview.position}</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <CalendarIcon className="w-3 h-3 mr-2" />
                      {new Date(interview.date_applied).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {interview.location && (
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mr-2" />
                        {interview.location}
                      </div>
                    )}
                  </div>
                  {interview.notes && (
                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      {interview.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Interviews List */}
      {interviews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Interviews</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{interview.company}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        new Date(interview.date_applied) >= new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {new Date(interview.date_applied) >= new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{interview.position}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {new Date(interview.date_applied).toLocaleDateString()}
                      </div>
                      {interview.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {interview.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;