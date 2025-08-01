import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Award,
  Clock,
  TrendingUp,
  Users,
  Lightbulb,
  Heart,
  Sparkles,
  Medal,
  Gem,
  Rocket,
  Shield
} from 'lucide-react';
import { apiClient } from '../../lib/api';

// Определение всех возможных достижений
const ACHIEVEMENTS = {
  // Достижения за посещения
  daily_streak_3: {
    id: 'daily_streak_3',
    title: 'Первые шаги',
    description: 'Посещайте сайт 3 дня подряд',
    icon: Calendar,
    category: 'Посещения',
    maxProgress: 3,
    reward: { xp: 50, badge: 'bronze' },
    color: 'from-orange-400 to-orange-600'
  },
  daily_streak_7: {
    id: 'daily_streak_7',
    title: 'Недельный марафон',
    description: 'Посещайте сайт 7 дней подряд',
    icon: Flame,
    category: 'Посещения',
    maxProgress: 7,
    reward: { xp: 150, badge: 'silver' },
    color: 'from-red-400 to-red-600'
  },
  daily_streak_30: {
    id: 'daily_streak_30',
    title: 'Месяц упорства',
    description: 'Посещайте сайт 30 дней подряд',
    icon: Crown,
    category: 'Посещения',
    maxProgress: 30,
    reward: { xp: 500, badge: 'gold' },
    color: 'from-yellow-400 to-yellow-600'
  },

  // Достижения за задания
  assignments_completed_3: {
    id: 'assignments_completed_3',
    title: 'Первые успехи',
    description: 'Выполните 3 задания',
    icon: CheckCircle,
    category: 'Задания',
    maxProgress: 3,
    reward: { xp: 100, badge: 'bronze' },
    color: 'from-green-400 to-green-600'
  },
  assignments_completed_10: {
    id: 'assignments_completed_10',
    title: 'Десятиборье',
    description: 'Выполните 10 заданий',
    icon: Target,
    category: 'Задания',
    maxProgress: 10,
    reward: { xp: 300, badge: 'silver' },
    color: 'from-blue-400 to-blue-600'
  },
  assignments_completed_25: {
    id: 'assignments_completed_25',
    title: 'Мастер заданий',
    description: 'Выполните 25 заданий',
    icon: Trophy,
    category: 'Задания',
    maxProgress: 25,
    reward: { xp: 750, badge: 'gold' },
    color: 'from-purple-400 to-purple-600'
  },

  // Достижения за оценки
  perfect_score_5: {
    id: 'perfect_score_5',
    title: 'Отличник',
    description: 'Получите 5 отличных оценок',
    icon: Star,
    category: 'Оценки',
    maxProgress: 5,
    reward: { xp: 200, badge: 'silver' },
    color: 'from-yellow-400 to-yellow-600'
  },
  perfect_score_15: {
    id: 'perfect_score_15',
    title: 'Супер отличник',
    description: 'Получите 15 отличных оценок',
    icon: Crown,
    category: 'Оценки',
    maxProgress: 15,
    reward: { xp: 600, badge: 'gold' },
    color: 'from-indigo-400 to-indigo-600'
  },

  // Достижения за темы
  topics_completed_5: {
    id: 'topics_completed_5',
    title: 'Любознательный',
    description: 'Изучите 5 тем',
    icon: BookOpen,
    category: 'Изучение',
    maxProgress: 5,
    reward: { xp: 150, badge: 'bronze' },
    color: 'from-teal-400 to-teal-600'
  },
  topics_completed_15: {
    id: 'topics_completed_15',
    title: 'Эрудит',
    description: 'Изучите 15 тем',
    icon: Lightbulb,
    category: 'Изучение',
    maxProgress: 15,
    reward: { xp: 400, badge: 'silver' },
    color: 'from-pink-400 to-pink-600'
  },

  // Достижения за скорость
  fast_learner: {
    id: 'fast_learner',
    title: 'Быстрый ученик',
    description: 'Выполните 3 задания за один день',
    icon: Zap,
    category: 'Скорость',
    maxProgress: 3,
    reward: { xp: 250, badge: 'silver' },
    color: 'from-cyan-400 to-cyan-600'
  },

  // Достижения за последовательность
  consistent_learner: {
    id: 'consistent_learner',
    title: 'Последовательный ученик',
    description: 'Выполняйте задания 5 дней подряд',
    icon: TrendingUp,
    category: 'Последовательность',
    maxProgress: 5,
    reward: { xp: 300, badge: 'silver' },
    color: 'from-emerald-400 to-emerald-600'
  },

  // Специальные достижения
  first_perfect: {
    id: 'first_perfect',
    title: 'Первый успех',
    description: 'Получите первую отличную оценку',
    icon: Medal,
    category: 'Специальные',
    maxProgress: 1,
    reward: { xp: 100, badge: 'bronze' },
    color: 'from-amber-400 to-amber-600'
  },
  early_bird: {
    id: 'early_bird',
    title: 'Ранняя пташка',
    description: 'Выполните задание до дедлайна',
    icon: Clock,
    category: 'Специальные',
    maxProgress: 1,
    reward: { xp: 75, badge: 'bronze' },
    color: 'from-lime-400 to-lime-600'
  },
  helpful_student: {
    id: 'helpful_student',
    title: 'Помощник',
    description: 'Помогите другим студентам (комментарии)',
    icon: Heart,
    category: 'Социальные',
    maxProgress: 5,
    reward: { xp: 200, badge: 'silver' },
    color: 'from-rose-400 to-rose-600'
  }
};

export const Achievements = ({ userStats }) => {
  const [achievements, setAchievements] = useState({});
  const [showUnlocked, setShowUnlocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка достижений с сервера
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Проверяем токен
        const token = localStorage.getItem('token');
        console.log('Токен из localStorage:', token ? 'Есть' : 'Нет');
        
        console.log('Начинаем загрузку достижений...');
        const response = await apiClient.getAchievements();
        console.log('Ответ от API достижений:', response);
        
        if (response.success) {
          setAchievements(response.achievements);
          console.log('Достижения успешно загружены:', response.achievements);
        } else {
          console.error('API вернул ошибку:', response);
          setError('Не удалось загрузить достижения');
        }
      } catch (error) {
        console.error('Ошибка загрузки достижений:', error);
        console.error('Детали ошибки:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setError(`Ошибка загрузки достижений: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  const categories = [
    { id: 'all', name: 'Все', icon: Trophy },
    { id: 'Посещения', name: 'Посещения', icon: Calendar },
    { id: 'Задания', name: 'Задания', icon: CheckCircle },
    { id: 'Оценки', name: 'Оценки', icon: Star },
    { id: 'Изучение', name: 'Изучение', icon: BookOpen },
    { id: 'Скорость', name: 'Скорость', icon: Zap },
    { id: 'Последовательность', name: 'Последовательность', icon: TrendingUp },
    { id: 'Специальные', name: 'Специальные', icon: Medal },
    { id: 'Социальные', name: 'Социальные', icon: Heart }
  ];

  const filteredAchievements = Object.values(achievements).filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    if (showUnlocked && !achievement.is_completed) {
      return false;
    }
    return true;
  });

  const completedCount = Object.values(achievements).filter(a => a.is_completed).length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка достижений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Достижения
            </h2>
            <p className="text-gray-600">Отслеживайте свой прогресс и получайте награды</p>
          </div>
        </div>
        
        <div className="flex justify-center items-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500">Получено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-gray-500">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((completedCount / totalCount) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Прогресс</div>
          </div>
        </div>
      </motion.div>

      {/* Фильтры */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </motion.div>

      {/* Переключатель показа */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Button
          variant={showUnlocked ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnlocked(!showUnlocked)}
          className="flex items-center space-x-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>{showUnlocked ? 'Показать все' : 'Только полученные'}</span>
        </Button>
      </motion.div>

      {/* Сетка достижений */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const Icon = ACHIEVEMENTS[achievement.id]?.icon || Trophy;
            const config = ACHIEVEMENTS[achievement.id];
            
            if (!config) return null;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  achievement.is_completed 
                    ? 'ring-2 ring-yellow-400 shadow-lg' 
                    : 'hover:shadow-md'
                }`}>
                  {/* Фоновая градиентная полоса */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color}`} />
                  
                  {/* Бейдж категории */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs">
                      {config.category}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full bg-gradient-to-r ${config.color} ${
                        achievement.is_completed ? 'animate-pulse' : ''
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          achievement.is_completed ? 'text-white' : 'text-white/80'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${
                          achievement.is_completed ? 'text-yellow-600' : 'text-gray-900'
                        }`}>
                          {config.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Прогресс */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Прогресс</span>
                        <span className="font-medium">
                          {achievement.current_progress} / {achievement.max_progress}
                        </span>
                      </div>
                      <Progress 
                        value={achievement.progress_percentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Награда */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {achievement.reward_xp} XP
                          </span>
                        </div>
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

                      {/* Статус */}
                      {achievement.is_completed ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Получено</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {Math.round(achievement.progress_percentage)}% готово
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Эффект завершения */}
                  {achievement.is_completed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 pointer-events-none" />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Пустое состояние */}
      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Trophy className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showUnlocked ? 'Нет полученных достижений' : 'Достижения не найдены'}
          </h3>
          <p className="text-gray-500">
            {showUnlocked 
              ? 'Продолжайте учиться, чтобы получить первые достижения!' 
              : 'Попробуйте изменить фильтры поиска'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}; 