import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  BookOpen,
  Target,
  ArrowLeft,
  ArrowRight,
  Plus,
  Filter,
  Search,
  ChevronRight,
  X
} from 'lucide-react';
import { StudentNavigation } from './StudentNavigation';
import { apiClient } from '../../lib/api';

export const CalendarPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, list
  const [filterType, setFilterType] = useState('all'); // all, upcoming, overdue, completed
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateAssignments, setSelectedDateAssignments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [assignmentsResponse, topicsResponse, submissionsResponse] = await Promise.all([
          apiClient.getAssignments(),
          apiClient.getTopics(),
          apiClient.getMySubmissions()
        ]);
        setAssignments(assignmentsResponse.assignments || []);
        setTopics(topicsResponse.topics || []);
        setSubmissions(submissionsResponse.submissions || []);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  const getAssignmentStatus = (assignment) => {
    const submission = getSubmissionForAssignment(assignment.id);
    if (submission) {
      if (submission.is_graded) {
        return { status: 'completed', label: 'Завершено', color: 'bg-green-100 text-green-800' };
      }
      return { status: 'submitted', label: 'Отправлено', color: 'bg-blue-100 text-blue-800' };
    }
    
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    
    if (dueDate < now) {
      return { status: 'overdue', label: 'Просрочено', color: 'bg-red-100 text-red-800' };
    }
    
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 3) {
      return { status: 'urgent', label: 'Срочно', color: 'bg-orange-100 text-orange-800' };
    }
    
    return { status: 'upcoming', label: 'Предстоит', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredAssignments = assignments.filter(assignment => {
    const status = getAssignmentStatus(assignment);
    
    switch (filterType) {
      case 'upcoming':
        return status.status === 'upcoming';
      case 'overdue':
        return status.status === 'overdue';
      case 'urgent':
        return status.status === 'urgent';
      case 'completed':
        return status.status === 'completed';
      default:
        return true;
    }
  });

  const getEventsForDate = (date) => {
    return assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.due_date);
      return assignmentDate.toDateString() === date.toDateString();
    });
  };

  const getAssignmentColor = (assignment) => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (dueDate < now) {
      return 'bg-red-500'; // Просрочено - красный
    } else if (daysUntilDue <= 1) {
      return 'bg-orange-500'; // Сегодня/завтра - оранжевый
    } else if (daysUntilDue <= 3) {
      return 'bg-yellow-500'; // В течение 3 дней - жёлтый
    } else {
      return 'bg-blue-500'; // Остальные - синий
    }
  };

  const handleDateClick = (date) => {
    const eventsForDate = getEventsForDate(date);
    setSelectedDateAssignments(eventsForDate);
    setShowDateModal(true);
  };

  const calendarClassNames = {
    months: "flex flex-col sm:flex-row gap-2",
    month: "flex flex-col gap-4",
    caption: "flex justify-center pt-1 relative items-center w-full",
    caption_label: "text-sm font-medium",
    nav: "flex items-center gap-1",
    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-x-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
    day: (date) => {
      const baseClass = "h-8 w-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors";
      const eventsForDate = getEventsForDate(date);
      
      if (eventsForDate.length === 0) return baseClass;
      
      // Находим самое срочное задание для определения цвета
      const mostUrgentAssignment = eventsForDate.reduce((mostUrgent, assignment) => {
        const dueDate = new Date(assignment.due_date);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        if (!mostUrgent || daysUntilDue < mostUrgent.daysUntilDue) {
          return { assignment, daysUntilDue };
        }
        return mostUrgent;
      }, null);
      
      if (!mostUrgentAssignment) return baseClass;
      
      const { daysUntilDue } = mostUrgentAssignment;
      
      if (daysUntilDue < 0) {
        return `${baseClass} bg-red-100 text-red-800 hover:bg-red-200 border-red-300 font-semibold`; // Просрочено
      } else if (daysUntilDue <= 1) {
        return `${baseClass} bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300 font-semibold`; // Сегодня/завтра
      } else if (daysUntilDue <= 3) {
        return `${baseClass} bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300 font-semibold`; // В течение 3 дней
      } else {
        return `${baseClass} bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 font-semibold`; // Остальные
      }
    },
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside: "text-muted-foreground opacity-50",
    day_disabled: "text-muted-foreground opacity-50",
    day_hidden: "invisible",
  };

  const upcomingDeadlines = assignments
    .filter(assignment => {
      const dueDate = new Date(assignment.due_date);
      const now = new Date();
      return dueDate > now && !getSubmissionForAssignment(assignment.id);
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const overdueAssignments = assignments.filter(assignment => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    return dueDate < now && !getSubmissionForAssignment(assignment.id);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <StudentNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="space-y-8">
            <div className="text-center">
              <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto mb-2 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-5 w-96 mx-auto rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2 sm:mb-4 leading-tight">
              Календарь и дедлайны
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Отслеживайте сроки выполнения заданий и планируйте свое обучение
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Календарь */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Календарь</span>
                  </CardTitle>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className={`text-white hover:bg-white/20 ${viewMode === 'month' ? 'bg-white/20' : ''}`}
                    >
                      <span className="hidden sm:inline">Месяц</span>
                      <span className="sm:hidden">М</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={`text-white hover:bg-white/20 ${viewMode === 'week' ? 'bg-white/20' : ''}`}
                    >
                      <span className="hidden sm:inline">Неделя</span>
                      <span className="sm:hidden">Н</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`text-white hover:bg-white/20 ${viewMode === 'list' ? 'bg-white/20' : ''}`}
                    >
                      <span className="hidden sm:inline">Список</span>
                      <span className="sm:hidden">С</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('all')}
                        className={`text-xs sm:text-sm ${filterType === 'all' ? 'bg-blue-50 border-blue-300' : ''}`}
                      >
                        Все
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('upcoming')}
                        className={`text-xs sm:text-sm ${filterType === 'upcoming' ? 'bg-blue-50 border-blue-300' : ''}`}
                      >
                        Предстоящие
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('urgent')}
                        className={`text-xs sm:text-sm ${filterType === 'urgent' ? 'bg-orange-50 border-orange-300' : ''}`}
                      >
                        Срочные
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('overdue')}
                        className={`text-xs sm:text-sm ${filterType === 'overdue' ? 'bg-red-50 border-red-300' : ''}`}
                      >
                        Просроченные
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredAssignments.map((assignment, index) => {
                        const status = getAssignmentStatus(assignment);
                        const submission = getSubmissionForAssignment(assignment.id);
                        
                        return (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 bg-white"
                          >
                            <div className="flex-1 w-full mb-3 sm:mb-0">
                              <div className="flex items-start space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 leading-tight">
                                    {assignment.title}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    {assignment.description?.substring(0, 60)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                              <div className="text-right order-2 sm:order-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-900">
                                  {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(assignment.due_date).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 order-1 sm:order-2">
                                <Badge className={`text-xs ${status.color}`}>
                                  {status.label}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant={submission ? "outline" : "default"}
                                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                                  className="text-xs sm:text-sm px-3 py-1 h-auto"
                                >
                                  <span className="hidden sm:inline">
                                    {submission ? "Просмотреть" : "Выполнить"}
                                  </span>
                                  <span className="sm:hidden">
                                    {submission ? "Просмотр" : "Выполнить"}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      onDayClick={handleDateClick}
                      className="rounded-md border w-full"
                      classNames={calendarClassNames}
                    />
                    {/* Легенда календаря */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-gray-600" />
                        Легенда календаря
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          </div>
                          <span className="text-xs font-medium text-red-800">Просрочено</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          </div>
                          <span className="text-xs font-medium text-orange-800">Сегодня/завтра</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          </div>
                          <span className="text-xs font-medium text-yellow-800">В течение 3 дней</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                          <span className="text-xs font-medium text-blue-800">Остальные</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Боковая панель */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Срочные дедлайны */}
            {upcomingDeadlines.length > 0 && (
              <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Ближайшие дедлайны</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {upcomingDeadlines.map((assignment, index) => {
                      const dueDate = new Date(assignment.due_date);
                      const now = new Date();
                      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-900 text-sm sm:text-base mb-1 leading-tight">
                                {assignment.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-orange-700 font-medium">
                                {daysUntilDue === 0 ? 'Сегодня' : 
                                 daysUntilDue === 1 ? 'Завтра' : 
                                 `Через ${daysUntilDue} дней`}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/assignments/${assignment.id}`)}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs sm:text-sm px-3 py-1 h-auto"
                            >
                              <span className="hidden sm:inline">Выполнить</span>
                              <span className="sm:hidden">→</span>
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Просроченные задания */}
            {overdueAssignments.length > 0 && (
              <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Clock className="h-5 w-5" />
                    <span>Просроченные задания</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {overdueAssignments.map((assignment, index) => {
                      const dueDate = new Date(assignment.due_date);
                      const now = new Date();
                      const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-900 text-sm sm:text-base mb-1 leading-tight">
                                {assignment.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-red-700 font-medium">
                                Просрочено на {daysOverdue} {daysOverdue === 1 ? 'день' : 'дней'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/assignments/${assignment.id}`)}
                              className="text-red-600 border-red-300 hover:bg-red-50 text-xs sm:text-sm px-3 py-1 h-auto"
                            >
                              <span className="hidden sm:inline">Выполнить</span>
                              <span className="sm:hidden">→</span>
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Статистика */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Target className="h-5 w-5" />
                  <span>Статистика</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Всего заданий</span>
                    <span className="font-semibold text-lg">{assignments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Выполнено</span>
                    <span className="font-semibold text-green-600 text-lg">
                      {submissions.filter(s => s.is_graded).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">В процессе</span>
                    <span className="font-semibold text-blue-600 text-lg">
                      {submissions.filter(s => !s.is_graded).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">Просрочено</span>
                    <span className="font-semibold text-red-600 text-lg">
                      {overdueAssignments.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Модальное окно для заданий выбранной даты */}
      {showDateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Задания на {selectedDate.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {selectedDateAssignments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAssignments.map((assignment, index) => {
                    const status = getAssignmentStatus(assignment);
                    const submission = getSubmissionForAssignment(assignment.id);
                    
                    return (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-1 ${getAssignmentColor(assignment)}`}></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {assignment.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {assignment.description?.substring(0, 80)}...
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${status.color}`}>
                                {status.label}
                              </Badge>
                              <Button
                                size="sm"
                                variant={submission ? "outline" : "default"}
                                onClick={() => {
                                  setShowDateModal(false);
                                  navigate(`/assignments/${assignment.id}`);
                                }}
                                className="text-xs px-3 py-1 h-auto"
                              >
                                {submission ? "Просмотреть" : "Выполнить"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заданий</h3>
                  <p className="text-gray-500 text-sm">
                    На эту дату не запланировано заданий
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}; 