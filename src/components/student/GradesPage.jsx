import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  FileText,
  BookOpen,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  MessageCircle,
  Eye,
  Download,
  Trophy,
  Zap,
  Users,
  BookMarked
} from 'lucide-react';
import { StudentNavigation } from './StudentNavigation';
import { apiClient } from '../../lib/api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';

export const GradesPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [assignmentsResponse, submissionsResponse, disciplinesResponse] = await Promise.all([
          apiClient.getAssignments(),
          apiClient.getMySubmissions(),
          apiClient.getDisciplines()
        ]);
        setAssignments(assignmentsResponse.assignments || []);
        setSubmissions(submissionsResponse.submissions || []);
        setDisciplines(disciplinesResponse.disciplines || []);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const gradedSubmissions = submissions.filter(s => s.is_graded);
  const totalAssignments = 100; // Максимум 100 баллов за дисциплину
  const completedAssignments = gradedSubmissions.length;
  const averageScore = gradedSubmissions.length > 0 
    ? (() => {
        let sumPct = 0;
        let count = 0;
        for (const s of gradedSubmissions) {
          const a = assignments.find(x => x.id === s.assignment_id);
          const max = a?.max_score || 100;
          if (max > 0 && s.score != null) {
            sumPct += (s.score / max) * 100;
            count += 1;
          }
        }
        return count ? (sumPct / count).toFixed(1) : 0;
      })()
    : 0;

  const getGradeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { color: 'bg-green-100 text-green-800', text: 'Отлично', grade: 'A' };
    if (percentage >= 80) return { color: 'bg-blue-100 text-blue-800', text: 'Хорошо', grade: 'B' };
    if (percentage >= 70) return { color: 'bg-yellow-100 text-yellow-800', text: 'Удовлетворительно', grade: 'C' };
    return { color: 'bg-red-100 text-red-800', text: 'Неудовлетворительно', grade: 'D' };
  };

  const getDisciplineProgress = (disciplineId) => {
    // Получаем все задания для данной дисциплины
    const disciplineAssignments = assignments.filter(a => {
      // Предполагаем, что у задания есть связь с дисциплиной через topic
      // Нужно найти тему, которая принадлежит данной дисциплине
      return a.discipline_id === disciplineId || a.topic?.discipline_id === disciplineId;
    });
    
    const disciplineSubmissions = submissions.filter(s => 
      disciplineAssignments.some(a => a.id === s.assignment_id && s.is_graded)
    );
    
    if (disciplineSubmissions.length === 0) return { progress: 0, average: 0, totalScore: 0 };
    
    // Рассчитываем прогресс как процент выполненных заданий от общего количества
    const progress = disciplineAssignments.length > 0 ? (disciplineSubmissions.length / disciplineAssignments.length) * 100 : 0;
    
    // Рассчитываем средний балл
    let sumPct = 0;
    let count = 0;
    let totalScore = 0;
    for (const s of disciplineSubmissions) {
      const a = disciplineAssignments.find(x => x.id === s.assignment_id);
      const max = a?.max_score || 100;
      if (max > 0 && s.score != null) {
        sumPct += (s.score / max) * 100;
        totalScore += s.score;
        count += 1;
      }
    }
    const average = count ? sumPct / count : 0;
    
    return { 
      progress, 
      average: average.toFixed(1), 
      totalScore: totalScore.toFixed(0),
      maxPossibleScore: disciplineAssignments.reduce((sum, a) => sum + (a.max_score || 100), 0)
    };
  };

  const gradeDistribution = {
    excellent: gradedSubmissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignment_id);
      return assignment && (s.score / assignment.max_score) * 100 >= 90;
    }).length,
    good: gradedSubmissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignment_id);
      return assignment && (s.score / assignment.max_score) * 100 >= 80 && (s.score / assignment.max_score) * 100 < 90;
    }).length,
    satisfactory: gradedSubmissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignment_id);
      return assignment && (s.score / assignment.max_score) * 100 >= 70 && (s.score / assignment.max_score) * 100 < 80;
    }).length,
    poor: gradedSubmissions.filter(s => {
      const assignment = assignments.find(a => a.id === s.assignment_id);
      return assignment && (s.score / assignment.max_score) * 100 < 70;
    }).length
  };

  // Данные для круговой диаграммы распределения оценок
  const pieChartData = [
    { name: 'Отлично (90-100%)', value: gradeDistribution.excellent, color: '#10B981' },
    { name: 'Хорошо (80-89%)', value: gradeDistribution.good, color: '#3B82F6' },
    { name: 'Удовлетворительно (70-79%)', value: gradeDistribution.satisfactory, color: '#F59E0B' },
    { name: 'Неудовлетворительно (<70%)', value: gradeDistribution.poor, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Данные для столбчатой диаграммы по дисциплинам
  const disciplineData = disciplines.map(discipline => {
    const { progress, average, totalScore, maxPossibleScore } = getDisciplineProgress(discipline.id);
    return {
      name: discipline.name,
      progress: Math.round(progress),
      average: parseFloat(average),
      totalScore: parseFloat(totalScore),
      maxScore: maxPossibleScore,
      scorePercentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
    };
  });

  // Данные для линейной диаграммы прогресса
  const progressData = [
    { month: 'Сент', progress: 10 },
    { month: 'Окт', progress: 25 },
    { month: 'Нояб', progress: 40 },
    { month: 'Дек', progress: 60 },
    { month: 'Янв', progress: 75 },
    { month: 'Фев', progress: 85 },
    { month: 'Март', progress: 95 }
  ];

  // Данные для области прогресса по времени
  const areaChartData = [
    { name: 'Неделя 1', completed: 2, total: 10 },
    { name: 'Неделя 2', completed: 5, total: 15 },
    { name: 'Неделя 3', completed: 8, total: 20 },
    { name: 'Неделя 4', completed: 12, total: 25 },
    { name: 'Неделя 5', completed: 18, total: 30 },
    { name: 'Неделя 6', completed: 25, total: 35 },
    { name: 'Неделя 7', completed: 32, total: 40 },
    { name: 'Неделя 8', completed: 40, total: 45 }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
              Мои оценки
            </h1>
            <p className="text-gray-600 text-lg">
              Просматривайте свои результаты и отслеживайте прогресс по дисциплинам
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
          <Card className="shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Средний балл</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Выполнено</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Максимум баллов</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-amber-500 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Прогресс</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((completedAssignments / totalAssignments) * 100)}%
                  </p>
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
              <TabsTrigger value="disciplines" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>По дисциплинам</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Аналитика</span>
              </TabsTrigger>
            </TabsList>

            {/* Вкладка "Обзор" */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Круговая диаграмма распределения оценок */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Распределение оценок</span>
                    </CardTitle>
                    <CardDescription>
                      Визуализация ваших результатов по категориям
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {pieChartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-gray-600">{item.name}</span>
                          </div>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Столбчатая диаграмма по дисциплинам */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Результаты по дисциплинам</span>
                    </CardTitle>
                    <CardDescription>
                      Средний балл и прогресс по каждой дисциплине (макс. 100 баллов)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disciplineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="scorePercentage" fill="#3B82F6" name="Баллы (%)" />
                          <Bar dataKey="progress" fill="#10B981" name="Прогресс (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Линейная диаграмма прогресса */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Динамика прогресса</span>
                  </CardTitle>
                  <CardDescription>
                    Ваш прогресс по месяцам обучения
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="completed" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Выполнено" />
                        <Area type="monotone" dataKey="total" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Всего заданий" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Последние оценки */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Последние оценки</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gradedSubmissions.slice(0, 5).map((submission, index) => {
                      const assignment = assignments.find(a => a.id === submission.assignment_id);
                      const gradeBadge = getGradeBadge(submission.score, assignment?.max_score || 100);
                      
                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {submission.assignment_title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(submission.submitted_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getGradeColor(submission.score, assignment?.max_score || 100)}`}>
                                {submission.score}
                              </div>
                              <div className="text-xs text-gray-500">
                                из {assignment?.max_score || 'N/A'}
                              </div>
                            </div>
                            <Badge className={gradeBadge.color}>
                              {gradeBadge.grade}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка "Задания" */}
            <TabsContent value="assignments" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Все оценки</CardTitle>
                  <CardDescription>
                    Детальная информация о всех выполненных заданиях
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gradedSubmissions.map((submission, index) => {
                      const assignment = assignments.find(a => a.id === submission.assignment_id);
                      const gradeBadge = getGradeBadge(submission.score, assignment?.max_score || 100);
                      
                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
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
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-500 italic">
                                  "{submission.feedback}"
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${getGradeColor(submission.score, assignment?.max_score || 100)}`}>
                                {submission.score}
                              </div>
                              <div className="text-sm text-gray-500">
                                из {assignment?.max_score || 'N/A'}
                              </div>
                            </div>
                            <div className="text-center">
                              <Badge className={gradeBadge.color}>
                                {gradeBadge.text}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {gradeBadge.grade}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка "По дисциплинам" */}
            <TabsContent value="disciplines" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Прогресс по дисциплинам</CardTitle>
                  <CardDescription>
                    Ваши результаты по каждой дисциплине (максимум 100 баллов за дисциплину)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {disciplines.map((discipline, index) => {
                      const { progress, average, totalScore, maxPossibleScore } = getDisciplineProgress(discipline.id);
                      
                      return (
                        <motion.div
                          key={discipline.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{discipline.name}</h4>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                Средний результат: <span className="font-medium text-blue-600">{average}%</span>
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{discipline.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{totalScore}</div>
                              <div className="text-sm text-gray-600">Набрано баллов</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{maxPossibleScore}</div>
                              <div className="text-sm text-gray-600">Максимум баллов</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">
                                {maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0}%
                              </div>
                              <div className="text-sm text-gray-600">Процент выполнения</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Прогресс выполнения</span>
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
                {/* Тренд оценок */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Тренд оценок</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Ваши оценки показывают стабильный рост успеваемости
                      </p>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="progress" stroke="#3B82F6" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full" style={{ width: '75%' }} />
                        </div>
                        <span className="text-sm font-medium text-green-600">+15%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Рекомендации */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Рекомендации</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Отлично!</strong> Продолжайте в том же духе
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Совет:</strong> Обратите внимание на задания с низкими оценками
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Цель:</strong> Попробуйте улучшить средний балл до 4.5
                        </p>
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