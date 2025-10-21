import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Users, 
  Target, 
  Award,
  Zap,
  Flame,
  Rocket,
  Gem,
  Sparkles,
  BarChart3,
  Calendar,
  BookOpen,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRating } from '../../hooks/useRating';

export const RatingPage = () => {
  const { user } = useAuth();
  const {
    studentsRating,
    myRating,
    leaderboard,
    ratingStats,
    loading,
    error,
    refreshing,
    refreshRating,
    getMyPosition,
    getMyScore,
    getMyChange,
    getTotalStudents,
    getAverageScore,
    getTopScore,
    getActiveStudents
  } = useRating();

  const [activeTab, setActiveTab] = useState('overall');

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getPositionColor = (position) => {
    if (position === 1) return 'from-yellow-400 to-yellow-600';
    if (position === 2) return 'from-gray-300 to-gray-500';
    if (position === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-400 to-blue-600';
  };

  const getScoreProgress = (score) => {
    const maxScore = getTopScore() || 1000;
    return Math.min((score / maxScore) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-5 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="inline-block"
            >
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              🏆 Рейтинг студентов
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-gray-600 mb-6"
            >
              Соревнуйтесь с однокурсниками и поднимайтесь в рейтинге!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button
                onClick={refreshRating}
                disabled={refreshing}
                variant="outline"
                className="mb-6 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Обновить рейтинг
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-6 shadow-lg">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: Users, color: 'blue', label: 'Всего студентов', value: getTotalStudents() },
            { icon: Target, color: 'green', label: 'Средний балл', value: getAverageScore() },
            { icon: Trophy, color: 'purple', label: 'Максимальный балл', value: getTopScore() },
            { icon: Award, color: 'orange', label: 'Активных студентов', value: getActiveStudents() }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* My Rating */}
        {myRating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle className="flex items-center">
                  <Star className="h-6 w-6 mr-2" />
                  Ваш рейтинг
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    Личный
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold text-blue-600 mb-2 flex items-center justify-center">
                      <Crown className="h-8 w-8 mr-2" />
                      #{myRating.position}
                    </div>
                    <p className="text-sm text-gray-600">Позиция в рейтинге</p>
                    <Progress 
                      value={((getTotalStudents() - myRating.position + 1) / getTotalStudents()) * 100} 
                      className="mt-2 h-2"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center">
                      <Zap className="h-8 w-8 mr-2" />
                      {myRating.total_score}
                    </div>
                    <p className="text-sm text-gray-600">Общий балл</p>
                    <Progress 
                      value={getScoreProgress(myRating.total_score)} 
                      className="mt-2 h-2"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className={`text-4xl font-bold mb-2 flex items-center justify-center ${getChangeColor(myRating.change)}`}>
                      {getChangeIcon(myRating.change)}
                      <span className="ml-2">{Math.abs(myRating.change)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Изменение позиции</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {myRating.change > 0 ? 'Поднялись' : myRating.change < 0 ? 'Опустились' : 'Без изменений'}
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Rating Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur shadow-inner">
              <TabsTrigger value="overall" className="data-[state=active]:shadow data-[state=active]:border">
                <BarChart3 className="h-4 w-4 mr-2" />
                Общий рейтинг
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:shadow data-[state=active]:border">
                <Trophy className="h-4 w-4 mr-2" />
                Топ-50
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overall">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
                    Общий рейтинг студентов
                  </CardTitle>
                  <CardDescription>
                    Полный рейтинг всех студентов по общему количеству баллов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {studentsRating.map((student, index) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          whileHover={{ x: 5, scale: 1.02 }}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                            student.user_id === user?.id 
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg' 
                              : 'bg-white border-gray-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getPositionColor(student.position)} text-white shadow-lg`}
                            >
                              {getPositionIcon(student.position)}
                            </motion.div>
                            <div>
                              <h3 className="font-semibold text-gray-900 flex items-center">
                                {student.name}
                                {student.user_id === user?.id && (
                                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                                    Вы
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              {student.group && (
                                <p className="text-xs text-gray-500">Группа: {student.group}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 flex items-center">
                                <Gem className="h-5 w-5 mr-1 text-yellow-500" />
                                {student.total_score}
                              </div>
                              <p className="text-sm text-gray-600">баллов</p>
                              <Progress 
                                value={getScoreProgress(student.total_score)} 
                                className="mt-1 h-1 w-20"
                              />
                            </div>
                            
                            <div className="text-right">
                              <div className={`flex items-center justify-end ${getChangeColor(student.change)}`}>
                                {getChangeIcon(student.change)}
                                <span className="ml-1 text-sm font-medium">
                                  {Math.abs(student.change)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">изменение</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                    Топ-50 студентов
                  </CardTitle>
                  <CardDescription>
                    Лучшие студенты по общему количеству баллов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {leaderboard.map((student, index) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                            student.user_id === user?.id 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' 
                              : 'bg-white border-gray-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getPositionColor(student.position)} text-white shadow-lg`}
                            >
                              {getPositionIcon(student.position)}
                            </motion.div>
                            <div>
                              <h3 className="font-semibold text-gray-900 flex items-center">
                                {student.user?.name || `Студент #${student.user_id}`}
                                {student.user_id === user?.id && (
                                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                                    Вы
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{student.user?.email || 'Неизвестно'}</p>
                              {student.user?.group && (
                                <p className="text-xs text-gray-500">Группа: {student.user.group}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 flex items-center">
                                <Sparkles className="h-5 w-5 mr-1 text-purple-500" />
                                {student.total_score}
                              </div>
                              <p className="text-sm text-gray-600">баллов</p>
                            </div>
                            
                            <div className="text-right">
                              <div className={`flex items-center justify-end ${getChangeColor(student.change)}`}>
                                {getChangeIcon(student.change)}
                                <span className="ml-1 text-sm font-medium">
                                  {Math.abs(student.change)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">изменение</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};