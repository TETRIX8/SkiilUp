import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { StudentNavigation } from './StudentNavigation';

// Фиксированное расписание
const scheduleData = {
  wednesday: {
    day: 'Среда',
    date: 'Среда',
    lessons: [
      {
        id: 1,
        time: '9:00 - 10:20',
        subject: 'Операционные системы и среды',
        room: 'Аудитория 101',
        disciplineId: 'os-systems'
      },
      {
        id: 2,
        time: '10:25 - 11:45',
        subject: 'Архитектура аппаратных средств',
        room: 'Аудитория 102',
        disciplineId: 'hardware-architecture'
      },
      {
        id: 3,
        time: '12:15 - 13:35',
        subject: 'Операционные системы и среды',
        room: 'Аудитория 101',
        disciplineId: 'os-systems'
      },
      {
        id: 4,
        time: '14:05 - 15:25',
        subject: 'Архитектура аппаратных средств',
        room: 'Аудитория 102',
        disciplineId: 'hardware-architecture'
      }
    ]
  },
  thursday: {
    day: 'Четверг',
    date: 'Четверг',
    lessons: [
      {
        id: 1,
        time: '9:00 - 10:20',
        subject: 'Информационные технологии',
        room: 'Аудитория 103',
        disciplineId: 'information-tech'
      },
      {
        id: 2,
        time: '10:25 - 11:45',
        subject: 'Основы алгоритмизации и программирования',
        room: 'Аудитория 104',
        disciplineId: 'programming-basics'
      }
    ]
  },
  friday: {
    day: 'Пятница',
    date: 'Пятница',
    lessons: [
      {
        id: 1,
        time: '9:00 - 10:00',
        subject: 'Компьютерные сети',
        room: 'Аудитория 105',
        disciplineId: 'computer-networks'
      },
      {
        id: 2,
        time: '10:05 - 11:05',
        subject: 'Компьютерные сети',
        room: 'Аудитория 105',
        disciplineId: 'computer-networks'
      }
    ]
  }
};

const daysOfWeek = ['wednesday', 'thursday', 'friday'];

export const SchedulePage = () => {
  const navigate = useNavigate();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCurrentLesson, setIsCurrentLesson] = useState(false);

  // Обновляем время каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Обновляем каждую минуту

    return () => clearInterval(timer);
  }, []);

  // Проверяем, идет ли сейчас пара
  useEffect(() => {
    const checkCurrentLesson = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 5 = пятница
      
      // Определяем, какой день недели сейчас
      let dayKey = null;
      if (currentDay === 3) dayKey = 'wednesday'; // среда
      else if (currentDay === 4) dayKey = 'thursday'; // четверг
      else if (currentDay === 5) dayKey = 'friday'; // пятница
      
      if (!dayKey) {
        setIsCurrentLesson(false);
        return;
      }

      const daySchedule = scheduleData[dayKey];
      const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM
      
      const isInLesson = daySchedule.lessons.some(lesson => {
        const [startTime, endTime] = lesson.time.split(' - ');
        return currentTimeStr >= startTime && currentTimeStr <= endTime;
      });
      
      setIsCurrentLesson(isInLesson);
    };

    checkCurrentLesson();
  }, [currentTime]);

  const getCurrentDaySchedule = () => {
    const now = new Date();
    const currentDay = now.getDay();
    
    if (currentDay === 3) return 'wednesday';
    if (currentDay === 4) return 'thursday';
    if (currentDay === 5) return 'friday';
    
    return daysOfWeek[currentDayIndex];
  };

  const currentSchedule = scheduleData[getCurrentDaySchedule()];

  const isCurrentLessonTime = (lesson) => {
    const now = new Date();
    const currentDay = now.getDay();
    
    if (currentDay !== 3 && currentDay !== 4 && currentDay !== 5) return false;
    
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const [startTime, endTime] = lesson.time.split(' - ');
    
    return currentTimeStr >= startTime && currentTimeStr <= endTime;
  };

  const handleLessonClick = (disciplineId) => {
    // Переходим к дисциплине
    navigate(`/discipline/${disciplineId}`);
  };

  const nextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % daysOfWeek.length);
  };

  const prevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + daysOfWeek.length) % daysOfWeek.length);
  };

  const getDayName = (dayKey) => {
    const dayNames = {
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница'
    };
    return dayNames[dayKey] || dayKey;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Расписание занятий
              </h1>
              <p className="text-gray-600">
                Расписание на неделю с возможностью перехода к дисциплинам
              </p>
            </div>
            
            {/* Индикатор текущей пары */}
            {isCurrentLesson && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span className="font-medium">Идет пара</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Навигация по дням */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevDay}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Предыдущий</span>
            </Button>
            
            <div className="flex space-x-2">
              {daysOfWeek.map((dayKey, index) => (
                <Button
                  key={dayKey}
                  variant={index === currentDayIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDayIndex(index)}
                  className="px-4"
                >
                  {getDayName(dayKey)}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextDay}
              className="flex items-center space-x-2"
            >
              <span>Следующий</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Расписание на выбранный день */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6" />
                  <div>
                    <CardTitle>{currentSchedule.day}</CardTitle>
                    <CardDescription className="text-indigo-100">
                      Расписание занятий
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {currentSchedule.lessons.length} пар
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {currentSchedule.lessons.length > 0 ? (
                <div className="space-y-4">
                  {currentSchedule.lessons.map((lesson, index) => {
                    const isCurrent = isCurrentLessonTime(lesson);
                    
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isCurrent
                            ? 'border-red-500 bg-red-50 shadow-lg'
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                        onClick={() => handleLessonClick(lesson.disciplineId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 rounded-lg ${
                                isCurrent ? 'bg-red-100' : 'bg-indigo-100'
                              }`}>
                                <Clock className={`h-5 w-5 ${
                                  isCurrent ? 'text-red-600' : 'text-indigo-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className={`font-semibold text-lg ${
                                  isCurrent ? 'text-red-800' : 'text-gray-900'
                                }`}>
                                  {lesson.subject}
                                </h3>
                                <p className={`text-sm ${
                                  isCurrent ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {lesson.time}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{lesson.room}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4" />
                                <span>Пара {lesson.id}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {isCurrent && (
                              <Badge variant="destructive" className="animate-pulse">
                                Сейчас идет
                              </Badge>
                            )}
                            <ArrowRight className={`h-5 w-5 ${
                              isCurrent ? 'text-red-600' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет занятий
                  </h3>
                  <p className="text-gray-500">
                    В этот день занятий не запланировано
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Информационное сообщение */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6"
        >
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Совет:</strong> Нажмите на любую пару, чтобы перейти к изучению дисциплины и её тем.
              Текущая пара выделена красным цветом.
            </AlertDescription>
          </Alert>
        </motion.div>
      </main>
    </div>
  );
};
