import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Star,
  Calendar,
  BookOpen,
  CheckCircle,
  Target,
  Zap,
  Flame,
  Crown,
  Medal,
  Heart,
  X,
  Sparkles
} from 'lucide-react';

const achievementIcons = {
  daily_streak_3: Calendar,
  daily_streak_7: Flame,
  daily_streak_30: Crown,
  assignments_completed_3: CheckCircle,
  assignments_completed_10: Target,
  assignments_completed_25: Trophy,
  perfect_score_5: Star,
  perfect_score_15: Crown,
  topics_completed_5: BookOpen,
  topics_completed_15: BookOpen,
  fast_learner: Zap,
  consistent_learner: Target,
  first_perfect: Medal,
  early_bird: Calendar,
  helpful_student: Heart
};

const achievementColors = {
  daily_streak_3: 'from-orange-400 to-orange-600',
  daily_streak_7: 'from-red-400 to-red-600',
  daily_streak_30: 'from-yellow-400 to-yellow-600',
  assignments_completed_3: 'from-green-400 to-green-600',
  assignments_completed_10: 'from-blue-400 to-blue-600',
  assignments_completed_25: 'from-purple-400 to-purple-600',
  perfect_score_5: 'from-yellow-400 to-yellow-600',
  perfect_score_15: 'from-indigo-400 to-indigo-600',
  topics_completed_5: 'from-teal-400 to-teal-600',
  topics_completed_15: 'from-pink-400 to-pink-600',
  fast_learner: 'from-cyan-400 to-cyan-600',
  consistent_learner: 'from-emerald-400 to-emerald-600',
  first_perfect: 'from-amber-400 to-amber-600',
  early_bird: 'from-lime-400 to-lime-600',
  helpful_student: 'from-rose-400 to-rose-600'
};

export const AchievementNotification = ({ achievement, onClose, onViewAll }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Автоматически скрываем уведомление через 5 секунд
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300); // Ждем окончания анимации
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleViewAll = () => {
    setIsVisible(false);
    setTimeout(() => {
      onViewAll();
      onClose();
    }, 300);
  };

  const Icon = achievementIcons[achievement.id] || Trophy;
  const colorClass = achievementColors[achievement.id] || 'from-blue-400 to-blue-600';

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className={`bg-gradient-to-r ${colorClass} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2 animate-pulse">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{achievement.title}</h3>
                  <p className="text-white/90 text-sm">{achievement.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  +{achievement.reward_xp} XP
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    achievement.reward_badge === 'gold' ? 'border-yellow-400 text-yellow-600' :
                    achievement.reward_badge === 'silver' ? 'border-gray-400 text-gray-600' :
                    'border-orange-400 text-orange-600'
                  }`}
                >
                  {achievement.reward_badge === 'gold' ? 'Золото' :
                   achievement.reward_badge === 'silver' ? 'Серебро' : 'Бронза'}
                </Badge>
              </div>
              
              <Button
                size="sm"
                onClick={handleViewAll}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Trophy className="h-3 w-3 mr-1" />
                Все достижения
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}; 