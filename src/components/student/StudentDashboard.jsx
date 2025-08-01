import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
  GraduationCap,
  Calendar,
  Trophy,
  Settings,
  TrendingUp,
  Target,
  Award,
  BookOpenCheck,
  Star,
  Zap,
  Flame,
  Crown,
  Medal,
  Heart,
  Sparkles,
  ArrowRight,
  Play,
  Clock as ClockIcon,
  Users,
  Lightbulb,
  Rocket,
  Gem,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { StudentNavigation } from './StudentNavigation';
import { Achievements } from './Achievements';
import { AchievementNotification } from './AchievementNotification';
import { useAchievements } from '../../hooks/useAchievements';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Хук для достижений
  const { newAchievements, removeNewAchievement } = useAchievements();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Загружаем данные параллельно
      const [topicsResponse, assignmentsResponse, submissionsResponse, statsResponse] = await Promise.all([
        apiClient.getTopics(),
        apiClient.getAssignments(),
        apiClient.getMySubmissions(),
        apiClient.getUserStats()
      ]);
      
      setTopics(topicsResponse.topics || []);
      setAssignments(assignmentsResponse.assignments || []);
      setSubmissions(submissionsResponse.submissions || []);
      
      if (statsResponse.success) {
        setUserStats(statsResponse.stats);
      }
      
      // Записываем посещение для достижений
      try {
        await apiClient.recordVisit();
      } catch (e) {
        console.error('Error recording visit:', e);
      }
      
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSubmissionForAssignment = useCallback((assignmentId) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  }, [submissions]);

  const getAssignmentStatus = useCallback((assignment) => {
    const submission = getSubmissionForAssignment(assignment.id);
    if (submission) {
      if (submission.is_graded) {
        return { status: 'graded', label: 'Оценено', color: 'default' };
      }
      return { status: 'submitted', label: 'Отправлено', color: 'secondary' };
    }
    if (assignment.is_overdue) {
      return { status: 'overdue', label: 'Просрочено', color: 'destructive' };
    }
    return { status: 'pending', label: 'Ожидает выполнения', color: 'outline' };
  }, [getSubmissionForAssignment]);

  const recentAssignments = assignments.slice(0, 3);
  const recentTopics = topics.slice(0, 3);
  const recentGrades = submissions.filter(s => s.is_graded).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <StudentNavigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-5 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-full mb-4" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentNavigation />
      
      {/* Уведомления о новых достижениях */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <AchievementNotification
            key={`${achievement.id}-${index}`}
            achievement={achievement}
            onClose={() => removeNewAchievement(achievement.id)}
            onViewAll={() => {
              setShowAchievements(true);
              removeNewAchievement(achievement.id);
            }}
          />
        ))}
      </AnimatePresence>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ошибка */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-6 shadow-lg rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  {error}
                  <Button variant="outline" size="sm" onClick={loadData} className="ml-4">
                    Повторить
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Приветствие и уровень */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Добро пожаловать, {user?.first_name}! 👋
                </h1>
                <p className="text-blue-100 mb-4">
                  Продолжайте свой путь к знаниям и получайте достижения
                </p>
                
                {/* Уровень и опыт */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-full p-2">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Уровень</p>
                      <p className="text-2xl font-bold">{userStats?.level || 1}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-full p-2">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Опыт</p>
                      <p className="text-2xl font-bold">{userStats?.total_xp || 0} XP</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-sm text-blue-100 mb-1">
                      <span>Прогресс уровня</span>
                      <span>{userStats?.level_progress || 0}%</span>
                    </div>
                    <Progress value={userStats?.level_progress || 0} className="h-2 bg-white/20" />
                  </div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowAchievements(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Достижения
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Статистические карточки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Темы изучено</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats?.topics_completed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Заданий выполнено</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats?.assignments_completed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Отличных оценок</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats?.perfect_scores || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Flame className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Дней подряд</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats?.daily_streak || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Последние задания */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6" />
                    <CardTitle>Последние задания</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/assignments')}
                    className="text-white hover:bg-white/20"
                  >
                    Все задания
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recentAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAssignments.map((assignment, index) => {
                      const status = getAssignmentStatus(assignment);
                      const submission = getSubmissionForAssignment(assignment.id);
                      
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {assignment.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {assignment.description.substring(0, 60)}...
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Target className="h-3 w-3 mr-1" />
                                Макс. балл: {assignment.max_score}
                              </span>
                              {assignment.due_date && (
                                <span className="flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={status.color} className="text-xs">
                              {status.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant={submission ? "outline" : "default"}
                              onClick={() => navigate(`/assignments/${assignment.id}`)}
                            >
                              {submission ? "Просмотреть" : "Выполнить"}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных заданий</h3>
                    <p className="text-gray-500">Проверьте позже или свяжитесь с преподавателем</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Правая колонка - Достижения и активность */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Последние достижения */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-6 w-6" />
                    <CardTitle>Последние достижения</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Новые
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {userStats?.assignments_completed >= 3 && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="bg-green-500 rounded-full p-2">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Первые успехи</p>
                        <p className="text-sm text-green-600">Выполнили 3 задания</p>
                      </div>
                    </div>
                  )}
                  
                  {userStats?.daily_streak >= 3 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Первые шаги</p>
                        <p className="text-sm text-blue-600">Посещали сайт 3 дня подряд</p>
                      </div>
                    </div>
                  )}
                  
                  {userStats?.first_perfect && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="bg-purple-500 rounded-full p-2">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-800">Первый успех</p>
                        <p className="text-sm text-purple-600">Получили первую отличную оценку</p>
                      </div>
                    </div>
                  )}
                  
                  {(!userStats?.assignments_completed || userStats.assignments_completed < 3) && 
                   (!userStats?.daily_streak || userStats.daily_streak < 3) && 
                   !userStats?.first_perfect && (
                    <div className="text-center py-4">
                      <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Продолжайте учиться для получения достижений</p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => setShowAchievements(true)}
                  className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Все достижения
                </Button>
              </CardContent>
            </Card>

            {/* Активность */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6" />
                  <CardTitle>Активность</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Заданий сегодня</span>
                    <span className="font-medium">{userStats?.assignments_today || 0}/3</span>
                  </div>
                  <Progress value={((userStats?.assignments_today || 0) / 3) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Дней подряд</span>
                    <span className="font-medium">{userStats?.daily_streak || 0} дней</span>
                  </div>
                  <Progress value={((userStats?.daily_streak || 0) / 7) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Тем изучено</span>
                    <span className="font-medium">{userStats?.topics_completed || 0}/15</span>
                  </div>
                  <Progress value={((userStats?.topics_completed || 0) / 15) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Модальное окно достижений */}
        <AnimatePresence>
          {showAchievements && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAchievements(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Достижения</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAchievements(false)}
                      className="p-2"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <Achievements userStats={userStats} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}; 