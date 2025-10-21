import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Gem,
  Sparkles,
  Zap,
  Flame,
  Rocket,
  Award,
  Target,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useRating } from '../../hooks/useRating';
import { RatingWidget } from './RatingWidget';
import { RatingList } from './RatingList';

export const RatingShowcase = () => {
  const {
    studentsRating,
    myRating,
    leaderboard,
    ratingStats,
    loading,
    error,
    refreshing,
    refreshRating,
    getTotalStudents,
    getAverageScore,
    getTopScore,
    getActiveStudents
  } = useRating();

  const [showAnimation, setShowAnimation] = useState(true);
  const [currentView, setCurrentView] = useState('overview');

  useEffect(() => {
    // Автоматически скрыть анимацию через 3 секунды
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getPositionColor = (position) => {
    if (position === 1) return 'from-yellow-400 to-yellow-600';
    if (position === 2) return 'from-gray-300 to-gray-500';
    if (position === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-400 to-blue-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-center"
        >
          <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Загрузка рейтинга...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Анимированный заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center mb-12"
        >
          <motion.div
            animate={showAnimation ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ 
              duration: 2, 
              repeat: showAnimation ? Infinity : 0,
              repeatDelay: 1
            }}
            className="inline-block mb-6"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 shadow-2xl">
              <Trophy className="h-20 w-20 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            🏆 Система рейтинга
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Соревнуйтесь с однокурсниками, отслеживайте прогресс и получайте награды за отличную учебу!
          </motion.p>
        </motion.div>

        {/* Статистика */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { 
              icon: Users, 
              color: 'blue', 
              label: 'Всего студентов', 
              value: getTotalStudents(),
              animation: { rotate: [0, 10, -10, 0] }
            },
            { 
              icon: Target, 
              color: 'green', 
              label: 'Средний балл', 
              value: getAverageScore(),
              animation: { scale: [1, 1.1, 1] }
            },
            { 
              icon: Trophy, 
              color: 'purple', 
              label: 'Максимальный балл', 
              value: getTopScore(),
              animation: { y: [0, -5, 0] }
            },
            { 
              icon: Award, 
              color: 'orange', 
              label: 'Активных студентов', 
              value: getActiveStudents(),
              animation: { rotate: [0, 360] }
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-l-blue-500 bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <motion.div
                      animate={stat.animation}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      className={`bg-${stat.color}-100 p-4 rounded-full`}
                    >
                      <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                    </motion.div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Ваш рейтинг */}
        {myRating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mb-12"
          >
            <RatingWidget 
              myRating={myRating}
              totalStudents={getTotalStudents()}
              onViewFullRating={() => setCurrentView('full')}
            />
          </motion.div>
        )}

        {/* Топ-3 студентов */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mb-12"
          >
            <Card className="shadow-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                  <Crown className="h-8 w-8 mr-3 text-yellow-500" />
                  Топ-3 студентов
                  <Crown className="h-8 w-8 ml-3 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {leaderboard.slice(0, 3).map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6 + index * 0.2, duration: 0.6 }}
                      whileHover={{ y: -10, scale: 1.05 }}
                      className={`relative ${
                        index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
                      }`}
                    >
                      {/* Пьедестал */}
                      <div className={`h-${20 - index * 5} bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg mb-4`}></div>
                      
                      <Card className={`shadow-xl ${
                        index === 0 ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' :
                        index === 1 ? 'border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100' :
                        'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50'
                      }`}>
                        <CardContent className="p-6 text-center">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPositionColor(student.position)} text-white shadow-xl mb-4`}
                          >
                            {getPositionIcon(student.position)}
                          </motion.div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {student.user?.name || `Студент #${student.user_id}`}
                          </h3>
                          
                          <div className="text-3xl font-bold text-purple-600 flex items-center justify-center mb-2">
                            <Gem className="h-6 w-6 mr-2" />
                            {student.total_score}
                          </div>
                          
                          <p className="text-sm text-gray-600">баллов</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Полный рейтинг */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-2xl">
                  <BarChart3 className="h-8 w-8 mr-3" />
                  Полный рейтинг студентов
                </CardTitle>
                <Button
                  onClick={refreshRating}
                  disabled={refreshing}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Обновить
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <RatingList 
                students={studentsRating}
                currentUserId={myRating?.user_id}
                maxScore={getTopScore()}
                showTop={20}
                animated={true}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
