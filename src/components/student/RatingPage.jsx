import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, TrendingUp, Users, Award, Zap } from 'lucide-react';

const RatingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
            Рейтинг студентов
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Отслеживайте свой прогресс и соревнуйтесь с одногруппниками
          </p>
        </motion.div>

        {/* Основная карточка "Скоро будет" */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Card className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="mx-auto mb-4"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-6 shadow-lg">
                  <Trophy className="h-16 w-16 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                Скоро будет!
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Мы работаем над созданием системы рейтинга студентов
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="space-y-4"
              >
                <div className="flex justify-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
                >
                  <Zap className="h-5 w-5" />
                  <span>В разработке</span>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Предварительный просмотр функций */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Функция 1 */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Рейтинг по предметам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Отслеживайте свой прогресс по каждому предмету отдельно
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Функция 2 */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mx-auto mb-4"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Сравнение с группой
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Сравнивайте свои результаты с одногруппниками
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Функция 3 */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mx-auto mb-4"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-full p-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Достижения и награды
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Получайте награды за отличную учебу и активность
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
            <CardContent className="p-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Что вас ждет в системе рейтинга?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      ✓
                    </Badge>
                    <span className="text-gray-700">Еженедельные обновления рейтинга</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓
                    </Badge>
                    <span className="text-gray-700">Детальная статистика по предметам</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      ✓
                    </Badge>
                    <span className="text-gray-700">История изменений рейтинга</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      ✓
                    </Badge>
                    <span className="text-gray-700">Мотивационные награды</span>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export { RatingPage };
