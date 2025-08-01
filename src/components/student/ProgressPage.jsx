import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  BookOpen,
  FileText,
  Star,
  Calendar,
  Target,
  Award,
  Clock,
  CheckCircle,
  Users,
  Trophy,
  Zap,
  Flame,
  Crown,
  Medal,
  Heart,
  Lightbulb,
  Rocket,
  Gem,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { StudentNavigation } from './StudentNavigation';
import { apiClient } from '../../lib/api';

export const ProgressPage = () => {
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Симуляция данных пользователя
  const userStats = {
    daily_streak: 5,
    assignments_completed: 8,
    perfect_scores: 3,
    topics_completed: 7,
    assignments_today: 2,
    consistent_days: 3,
    first_perfect: true,
    early_submissions: 1,
    helpful_comments: 2,
    total_xp: 1250,
    level: 8,
    level_progress: 75,
    total_assignments: 15,
    total_topics: 12,
    average_score: 4.2,
    study_time: 45, // часы
    weekly_progress: [
      { day: 'Пн', completed: 2, total: 3 },
      { day: 'Вт', completed: 1, total: 2 },
      { day: 'Ср', completed: 3, total: 4 },
      { day: 'Чт', completed: 0, total: 1 },
      { day: 'Пт', completed: 2, total: 3 },
      { day: 'Сб', completed: 1, total: 2 },
      { day: 'Вс', completed: 0, total: 1 }
    ]
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getGradeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { color: 'bg-green-100 text-green-800', text: 'Отлично' };
    if (percentage >= 80) return { color: 'bg-blue-100 text-blue-800', text: 'Хорошо' };
    if (percentage >= 70) return { color: 'bg-yellow-100 text-yellow-800', text: 'Удовлетворительно' };
    return { color: 'bg-red-100 text-red-800', text: 'Неудовлетворительно' };
  };

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
              Ваш прогресс
            </h1>
            <p className="text-gray-600 text-lg">
              Отслеживайте свои достижения и анализируйте результаты обучения
            </p>
          </div>
        </motion.div>

        {/* Основные метрики */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Общий прогресс</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((userStats.assignments_completed / userStats.total_assignments) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Средний балл</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.average_score}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Время обучения</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.study_time}ч</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Flame className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Дней подряд</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.daily_streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Вкладки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm p-1 rounded-xl shadow-inner">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Обзор</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Задания</span>
              </TabsTrigger>
              <TabsTrigger value="topics" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Темы</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Аналитика</span>
              </TabsTrigger>
            </TabsList>

            {/* Вкладка "Обзор" */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Недельный прогресс */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Недельный прогресс</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userStats.weekly_progress.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">{day.day}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                style={{ width: `${(day.completed / day.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {day.completed}/{day.total}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Достижения */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5" />
                      <span>Последние достижения</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="bg-green-500 rounded-full p-2">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Первые успехи</p>
                          <p className="text-sm text-green-600">Выполнили 3 задания</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 rounded-full p-2">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Первые шаги</p>
                          <p className="text-sm text-blue-600">Посещали сайт 3 дня подряд</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="bg-purple-500 rounded-full p-2">
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">Первый успех</p>
                          <p className="text-sm text-purple-600">Получили первую отличную оценку</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Вкладка "Задания" */}
            <TabsContent value="assignments" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Результаты заданий</CardTitle>
                  <CardDescription>
                    Детальная информация о выполненных заданиях
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {submissions.filter(s => s.is_graded).map((submission, index) => {
                      const assignment = assignments.find(a => a.id === submission.assignment_id);
                      const gradeBadge = getGradeBadge(submission.score, assignment?.max_score || 100);
                      
                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {submission.assignment_title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              Отправлено: {new Date(submission.submitted_at).toLocaleDateString('ru-RU')}
                            </p>
                            {submission.feedback && (
                              <p className="text-sm text-gray-500 italic">
                                "{submission.feedback}"
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getGradeColor(submission.score, assignment?.max_score || 100)}`}>
                                {submission.score}
                              </div>
                              <div className="text-sm text-gray-500">
                                из {assignment?.max_score || 'N/A'}
                              </div>
                            </div>
                            <Badge className={gradeBadge.color}>
                              {gradeBadge.text}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка "Темы" */}
            <TabsContent value="topics" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Изученные темы</CardTitle>
                  <CardDescription>
                    Прогресс по изучению различных тем
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topics.map((topic, index) => {
                      const topicAssignments = assignments.filter(a => a.topic_id === topic.id);
                      const completedAssignments = submissions.filter(s => 
                        topicAssignments.some(a => a.id === s.assignment_id)
                      );
                      const progress = topicAssignments.length > 0 
                        ? (completedAssignments.length / topicAssignments.length) * 100 
                        : 0;

                      return (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                            <span className="text-sm text-gray-500">
                              {completedAssignments.length}/{topicAssignments.length} заданий
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Прогресс</span>
                              <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка "Аналитика" */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Статистика по времени */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Время обучения</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Общее время</span>
                        <span className="font-medium">{userStats.study_time} часов</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Среднее в день</span>
                        <span className="font-medium">1.2 часа</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Лучший день</span>
                        <span className="font-medium">3.5 часа</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Статистика по оценкам */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Распределение оценок</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Отличные (90-100%)</span>
                        <span className="font-medium text-green-600">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Хорошие (80-89%)</span>
                        <span className="font-medium text-blue-600">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Удовлетворительные (70-79%)</span>
                        <span className="font-medium text-yellow-600">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Неудовлетворительные (&lt;70%)</span>
                        <span className="font-medium text-red-600">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}; 