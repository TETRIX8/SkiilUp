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
  Download
} from 'lucide-react';
import { StudentNavigation } from './StudentNavigation';
import { apiClient } from '../../lib/api';

export const GradesPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTopic, setSelectedTopic] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [assignmentsResponse, submissionsResponse, topicsResponse] = await Promise.all([
          apiClient.getAssignments(),
          apiClient.getMySubmissions(),
          apiClient.getTopics()
        ]);
        setAssignments(assignmentsResponse.assignments || []);
        setSubmissions(submissionsResponse.submissions || []);
        setTopics(topicsResponse.topics || []);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const gradedSubmissions = submissions.filter(s => s.is_graded);
  const totalAssignments = assignments.length;
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

  const getTopicProgress = (topicId) => {
    const topicAssignments = assignments.filter(a => a.topic_id === topicId);
    const topicSubmissions = submissions.filter(s => 
      topicAssignments.some(a => a.id === s.assignment_id && s.is_graded)
    );
    
    if (topicSubmissions.length === 0) return { progress: 0, average: 0 };
    
    const progress = topicAssignments.length > 0 ? (topicSubmissions.length / topicAssignments.length) * 100 : 0;
    let sumPct = 0;
    let count = 0;
    for (const s of topicSubmissions) {
      const a = topicAssignments.find(x => x.id === s.assignment_id);
      const max = a?.max_score || 100;
      if (max > 0 && s.score != null) {
        sumPct += (s.score / max) * 100;
        count += 1;
      }
    }
    const average = count ? sumPct / count : 0;
    
    return { progress, average: average.toFixed(1) };
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
              Просматривайте свои результаты и отслеживайте прогресс
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
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Средний балл</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
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

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Всего заданий</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Прогресс</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0}%
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
              <TabsTrigger value="topics" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>По темам</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Аналитика</span>
              </TabsTrigger>
            </TabsList>

            {/* Вкладка "Обзор" */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Распределение оценок */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Распределение оценок</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Отличные (90-100%)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${gradedSubmissions.length ? (gradeDistribution.excellent / gradedSubmissions.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-medium text-green-600">{gradeDistribution.excellent}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Хорошие (80-89%)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${gradedSubmissions.length ? (gradeDistribution.good / gradedSubmissions.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-medium text-blue-600">{gradeDistribution.good}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Удовлетворительные (70-79%)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${gradedSubmissions.length ? (gradeDistribution.satisfactory / gradedSubmissions.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-medium text-yellow-600">{gradeDistribution.satisfactory}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Неудовлетворительные (&lt;70%)</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${gradedSubmissions.length ? (gradeDistribution.poor / gradedSubmissions.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-medium text-red-600">{gradeDistribution.poor}</span>
                        </div>
                      </div>
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
              </div>
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

            {/* Вкладка "По темам" */}
            <TabsContent value="topics" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Прогресс по темам</CardTitle>
                  <CardDescription>
                    Ваши результаты по каждой теме
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topics.map((topic, index) => {
                      const { progress, average } = getTopicProgress(topic.id);
                      
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
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                Средний результат: <span className="font-medium text-blue-600">{average}%</span>
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
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