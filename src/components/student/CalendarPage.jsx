import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { StudentNavigation } from './StudentNavigation';
import { apiClient } from '../../lib/api';

export const CalendarPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, list
  const [filterType, setFilterType] = useState('all'); // all, upcoming, overdue, completed

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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
              Календарь и дедлайны
            </h1>
            <p className="text-gray-600 text-lg">
              Отслеживайте сроки выполнения заданий и планируйте свое обучение
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Календарь */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Календарь</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className={viewMode === 'month' ? 'bg-blue-50' : ''}
                    >
                      Месяц
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={viewMode === 'week' ? 'bg-blue-50' : ''}
                    >
                      Неделя
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-blue-50' : ''}
                    >
                      Список
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('all')}
                        className={filterType === 'all' ? 'bg-blue-50' : ''}
                      >
                        Все
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('upcoming')}
                        className={filterType === 'upcoming' ? 'bg-blue-50' : ''}
                      >
                        Предстоящие
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('urgent')}
                        className={filterType === 'urgent' ? 'bg-orange-50' : ''}
                      >
                        Срочные
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilterType('overdue')}
                        className={filterType === 'overdue' ? 'bg-red-50' : ''}
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
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {assignment.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {assignment.description.substring(0, 60)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(assignment.due_date).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Боковая панель */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Срочные дедлайны */}
            {upcomingDeadlines.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Ближайшие дедлайны</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          className="p-3 rounded-lg border border-orange-200 bg-orange-50"
                        >
                          <h4 className="font-medium text-orange-900 mb-1">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-orange-700">
                            {daysUntilDue === 0 ? 'Сегодня' : 
                             daysUntilDue === 1 ? 'Завтра' : 
                             `Через ${daysUntilDue} дней`}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Просроченные задания */}
            {overdueAssignments.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <Clock className="h-5 w-5" />
                    <span>Просроченные задания</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          className="p-3 rounded-lg border border-red-200 bg-red-50"
                        >
                          <h4 className="font-medium text-red-900 mb-1">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-red-700">
                            Просрочено на {daysOverdue} {daysOverdue === 1 ? 'день' : 'дней'}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Статистика */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Статистика</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Всего заданий</span>
                    <span className="font-medium">{assignments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Выполнено</span>
                    <span className="font-medium text-green-600">
                      {submissions.filter(s => s.is_graded).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">В процессе</span>
                    <span className="font-medium text-blue-600">
                      {submissions.filter(s => !s.is_graded).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Просрочено</span>
                    <span className="font-medium text-red-600">
                      {overdueAssignments.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}; 