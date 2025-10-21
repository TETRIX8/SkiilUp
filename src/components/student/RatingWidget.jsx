import React from 'react';
import { motion } from 'framer-motion';
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
  ArrowRight
} from 'lucide-react';

export const RatingWidget = ({ 
  myRating, 
  totalStudents, 
  onViewFullRating,
  compact = false 
}) => {
  if (!myRating) return null;

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-600">#{position}</span>;
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

  const getRankBadge = (position) => {
    if (position === 1) return { text: '🥇 1-е место', color: 'bg-yellow-100 text-yellow-800' };
    if (position === 2) return { text: '🥈 2-е место', color: 'bg-gray-100 text-gray-800' };
    if (position === 3) return { text: '🥉 3-е место', color: 'bg-amber-100 text-amber-800' };
    if (position <= 10) return { text: 'Топ-10', color: 'bg-blue-100 text-blue-800' };
    if (position <= 25) return { text: 'Топ-25', color: 'bg-green-100 text-green-800' };
    return { text: 'Участник', color: 'bg-gray-100 text-gray-800' };
  };

  const rankBadge = getRankBadge(myRating.position);
  const progressValue = totalStudents ? ((totalStudents - myRating.position + 1) / totalStudents) * 100 : 0;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getPositionColor(myRating.position)} text-white shadow-lg`}
                >
                  {getPositionIcon(myRating.position)}
                </motion.div>
                <div>
                  <p className="text-lg font-bold text-gray-900">#{myRating.position}</p>
                  <p className="text-sm text-gray-600">в рейтинге</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600 flex items-center">
                  <Gem className="h-4 w-4 mr-1" />
                  {myRating.total_score}
                </div>
                <div className={`flex items-center justify-end ${getChangeColor(myRating.change)}`}>
                  {getChangeIcon(myRating.change)}
                  <span className="ml-1 text-xs">{Math.abs(myRating.change)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <Progress value={progressValue} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Trophy className="h-6 w-6" />
              </motion.div>
              <CardTitle>Ваш рейтинг</CardTitle>
            </div>
            <Badge variant="secondary" className={rankBadge.color}>
              {rankBadge.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPositionColor(myRating.position)} text-white shadow-xl`}
                >
                  {getPositionIcon(myRating.position)}
                </motion.div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">#{myRating.position}</h3>
                  <p className="text-sm text-gray-600">Позиция в рейтинге</p>
                  <p className="text-xs text-gray-500">
                    из {totalStudents || 'неизвестно'} студентов
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2" />
                  {myRating.total_score}
                </div>
                <p className="text-sm text-gray-600">общий балл</p>
              </div>
            </div>

            {/* Прогресс */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Прогресс в рейтинге</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>

            {/* Изменение позиции */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Изменение позиции</span>
              <div className={`flex items-center ${getChangeColor(myRating.change)}`}>
                {getChangeIcon(myRating.change)}
                <span className="ml-2 text-lg font-bold">{Math.abs(myRating.change)}</span>
                <span className="ml-1 text-sm">
                  {myRating.change > 0 ? 'поднялись' : myRating.change < 0 ? 'опустились' : 'без изменений'}
                </span>
              </div>
            </div>

            {/* Кнопка перехода */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onViewFullRating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Посмотреть полный рейтинг
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
