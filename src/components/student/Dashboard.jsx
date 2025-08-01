// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Импортируем framer-motion
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  BookOpenCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { StatsCards } from '@/components/dashboard/StatsCards';

// Иконки для вкладок
const tabIcons = {
  topics: BookOpen,
  assignments: FileText,
  grades: Trophy
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('topics'); // Состояние для активной вкладки

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [topicsResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
        apiClient.getTopics(),
        apiClient.getAssignments(),
        apiClient.getMySubmissions()
      ]);
      setTopics(topicsResponse.topics || []);
      setAssignments(assignmentsResponse.assignments || []);
      setSubmissions(submissionsResponse.submissions || []);
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

  const renderSkeletonCards = (count) => {
    return Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  // Анимированный загрузочный экран
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.header 
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-md"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-5 w-24 hidden sm:block" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </motion.header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center">
                        <Skeleton className="h-7 w-7 rounded-full" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="flex justify-center">
                <Skeleton className="h-9 w-full max-w-md" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderSkeletonCards(6)}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Анимированный заголовок */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <motion.h1 
                className="text-lg sm:text-xl font-bold text-gray-900 truncate bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Образовательная платформа
              </motion.h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="sr-only">Открыть меню пользователя</span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 shadow-xl rounded-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Анимированное сообщение об ошибке */}
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

        {/* Анимированный приветственный блок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать, <span className="text-indigo-600">{user?.first_name}</span>!
            </h2>
            <p className="text-gray-600">
              Здесь вы можете изучать материалы, выполнять задания и отслеживать свой прогресс.
            </p>
          </div>
        </motion.div>

        {/* Анимированные статистические карточки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Темы</p>
                      <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Задания</p>
                      <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Выполнено</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {submissions.filter(s => s.is_graded).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Средний балл</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {submissions.filter(s => s.is_graded).length > 0 
                          ? (submissions.reduce((sum, s) => sum + (s.is_graded ? s.score : 0), 0) / 
                             submissions.filter(s => s.is_graded).length).toFixed(1)
                          : '0.0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Анимированные вкладки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-inner">
              {Object.entries(tabIcons).map(([key, Icon]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {key === 'topics' && 'Темы'}
                  {key === 'assignments' && 'Задания'}
                  {key === 'grades' && 'Оценки'}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Вкладка "Темы" */}
            <TabsContent value="topics" className="space-y-6 mt-6">
              <AnimatePresence mode="wait">
                {topics.length > 0 ? (
                  <motion.div
                    key="topics-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {topics.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className="transition-all duration-300 hover:shadow-xl cursor-pointer group border border-gray-200 rounded-2xl overflow-hidden"
                          onClick={() => navigate(`/topics/${topic.id}`)}
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 w-full"></div>
                          <CardHeader>
                            <CardTitle className="group-hover:text-indigo-600 transition-colors duration-300">
                              {topic.title}
                            </CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-500 flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {topic.assignments_count} заданий
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/topics/${topic.id}`);
                                  }}
                                >
                                  Изучить
                                </Button>
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="topics-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg rounded-2xl overflow-hidden">
                      <CardContent className="p-12 text-center text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-1">Темы пока недоступны</h3>
                        <p className="text-sm">Проверьте позже или свяжитесь с преподавателем.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Вкладка "Задания" */}
            <TabsContent value="assignments" className="space-y-6 mt-6">
              <AnimatePresence mode="wait">
                {assignments.length > 0 ? (
                  <motion.div
                    key="assignments-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {assignments.map((assignment, index) => {
                      const status = getAssignmentStatus(assignment);
                      const submission = getSubmissionForAssignment(assignment.id);
                      return (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                        >
                          <Card className="transition-all duration-300 hover:shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
                            <CardContent className="p-4 sm:p-6">
                              <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {assignment.title}
                                  </h3>
                                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Target className="h-4 w-4 mr-1" />
                                      Макс. балл: {assignment.max_score}
                                    </span>
                                    {assignment.due_date && (
                                      <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Срок: {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                                      </span>
                                    )}
                                    {submission && submission.is_graded && (
                                      <span className="text-green-600 font-medium flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Оценка: {submission.score}/{assignment.max_score}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <Badge 
                                      variant={status.color} 
                                      className="px-3 py-1 text-sm font-medium shadow-sm"
                                    >
                                      {status.label}
                                    </Badge>
                                  </motion.div>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button 
                                      size="sm" 
                                      variant={submission ? "outline" : "default"}
                                      className={submission 
                                        ? "border-indigo-300 text-indigo-600 hover:bg-indigo-50" 
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                                      }
                                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                                    >
                                      {submission ? "Просмотреть" : "Выполнить"}
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="assignments-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg rounded-2xl overflow-hidden">
                      <CardContent className="p-12 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-1">Задания пока недоступны</h3>
                        <p className="text-sm">Проверьте позже или свяжитесь с преподавателем.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Вкладка "Оценки" */}
            <TabsContent value="grades" className="space-y-6 mt-6">
              <AnimatePresence mode="wait">
                {submissions.filter(s => s.is_graded).length > 0 ? (
                  <motion.div
                    key="grades-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {submissions.filter(s => s.is_graded).map((submission, index) => {
                      const relatedAssignment = assignments.find(a => a.id === submission.assignment_id);
                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: -5 }}
                        >
                          <Card className="transition-all duration-300 hover:shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 w-full"></div>
                            <CardContent className="p-4 sm:p-6">
                              <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {submission.assignment_title}
                                  </h3>
                                  {submission.feedback ? (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                                        <BookOpenCheck className="h-4 w-4 mr-1" />
                                        Обратная связь:
                                      </p>
                                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {submission.feedback}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 mb-3 italic flex items-center">
                                      <BookOpenCheck className="h-4 w-4 mr-1" />
                                      Обратная связь отсутствует
                                    </p>
                                  )}
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Отправлено: {new Date(submission.submitted_at).toLocaleDateString('ru-RU')}
                                  </div>
                                </div>
                                <div className="text-center sm:text-right mt-4 sm:mt-0">
                                  <div className="inline-flex flex-col items-center justify-center">
                                    <div className="text-3xl font-bold text-green-600">
                                      {submission.score}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      из {relatedAssignment?.max_score || 'N/A'}
                                    </div>
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      <Badge 
                                        variant="secondary" 
                                        className="mt-2 bg-green-100 text-green-800 hover:bg-green-200"
                                      >
                                        {Math.round((submission.score / (relatedAssignment?.max_score || 100)) * 100)}%
                                      </Badge>
                                    </motion.div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="grades-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg rounded-2xl overflow-hidden">
                      <CardContent className="p-12 text-center text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-1">Оценок пока нет</h3>
                        <p className="text-sm">Выполните задания, чтобы получить оценки.</p>
                        <motion.div
                          className="mt-6"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            onClick={() => setActiveTab('assignments')}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                          >
                            Перейти к заданиям
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};