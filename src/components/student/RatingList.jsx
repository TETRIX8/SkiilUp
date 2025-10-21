import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
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
  User
} from 'lucide-react';

export const RatingList = ({ 
  students, 
  currentUserId, 
  maxScore = 1000,
  showTop = 10,
  animated = true 
}) => {
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

  const getScoreProgress = (score) => {
    return Math.min((score / maxScore) * 100, 100);
  };

  const getRankBadge = (position) => {
    if (position === 1) return { text: '🥇', color: 'bg-yellow-100 text-yellow-800' };
    if (position === 2) return { text: '🥈', color: 'bg-gray-100 text-gray-800' };
    if (position === 3) return { text: '🥉', color: 'bg-amber-100 text-amber-800' };
    if (position <= 10) return { text: '⭐', color: 'bg-blue-100 text-blue-800' };
    return { text: '📊', color: 'bg-gray-100 text-gray-800' };
  };

  const displayedStudents = students.slice(0, showTop);

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {displayedStudents.map((student, index) => {
          const rankBadge = getRankBadge(student.position);
          const isCurrentUser = student.user_id === currentUserId;
          
          return (
            <motion.div
              key={student.id}
              initial={animated ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: animated ? index * 0.1 : 0, 
                duration: 0.4 
              }}
              whileHover={animated ? { x: 5, scale: 1.02 } : {}}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                isCurrentUser 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg' 
                  : 'bg-white border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${getPositionColor(student.position)} text-white shadow-lg relative`}
                >
                  {getPositionIcon(student.position)}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge variant="secondary" className={`text-xs ${rankBadge.color}`}>
                      {rankBadge.text}
                    </Badge>
                  </motion.div>
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    {student.name || student.user?.name || `Студент #${student.user_id}`}
                    {isCurrentUser && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                          Вы
                        </Badge>
                      </motion.div>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {student.email || student.user?.email || 'Неизвестно'}
                  </p>
                  {student.group && (
                    <p className="text-xs text-gray-500">Группа: {student.group}</p>
                  )}
                  
                  {/* Прогресс-бар */}
                  <div className="mt-2">
                    <Progress 
                      value={getScoreProgress(student.total_score)} 
                      className="h-1 w-32"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Баллы */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 flex items-center">
                    <Gem className="h-5 w-5 mr-1 text-yellow-500" />
                    {student.total_score}
                  </div>
                  <p className="text-sm text-gray-600">баллов</p>
                </div>
                
                {/* Изменение позиции */}
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
          );
        })}
      </AnimatePresence>
      
      {/* Показать больше студентов */}
      {students.length > showTop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showTop * 0.1 + 0.5 }}
          className="text-center py-4"
        >
          <div className="text-sm text-gray-500">
            И еще {students.length - showTop} студентов...
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const AnimatedRatingCard = ({ student, position, isCurrentUser = false }) => {
  const getPositionIcon = (pos) => {
    switch (pos) {
      case 1: return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2: return <Medal className="h-8 w-8 text-gray-400" />;
      case 3: return <Medal className="h-8 w-8 text-amber-600" />;
      default: return <span className="text-2xl font-bold text-gray-600">#{pos}</span>;
    }
  };

  const getPositionColor = (pos) => {
    if (pos === 1) return 'from-yellow-400 to-yellow-600';
    if (pos === 2) return 'from-gray-300 to-gray-500';
    if (pos === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-400 to-blue-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-xl' 
          : 'bg-white border-gray-200 shadow-lg hover:shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPositionColor(position)} text-white shadow-xl`}
          >
            {getPositionIcon(position)}
          </motion.div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {student.name || student.user?.name || `Студент #${student.user_id}`}
            </h3>
            <p className="text-gray-600">{student.email || student.user?.email}</p>
            {student.group && (
              <p className="text-sm text-gray-500">Группа: {student.group}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600 flex items-center">
            <Sparkles className="h-6 w-6 mr-2" />
            {student.total_score}
          </div>
          <p className="text-sm text-gray-600">баллов</p>
        </div>
      </div>
    </motion.div>
  );
};
