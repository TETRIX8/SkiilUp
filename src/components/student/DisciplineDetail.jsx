import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  LogOut, 
  GraduationCap, 
  User,
  Settings,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export const DisciplineDetail = () => {
  const { disciplineId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [discipline, setDiscipline] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDisciplineData();
  }, [disciplineId]);

  const loadDisciplineData = async () => {
    try {
      setLoading(true);
      setError('');
      const [disciplineResponse, topicsResponse] = await Promise.all([
        apiClient.getDiscipline(disciplineId),
        apiClient.getTopicsByDiscipline(disciplineId)
      ]);

      setDiscipline(disciplineResponse.discipline);
      setTopics(topicsResponse.topics || []);
    } catch (error) {
      console.error("Ошибка загрузки данных дисциплины:", error);
      setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-6"
          ></motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-medium text-gray-700"
          >
            Загрузка...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Alert variant="destructive" className="max-w-md shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="mr-2 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <motion.h1 
                className="text-lg sm:text-xl font-bold text-gray-900 truncate bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Образовательная платформа
              </motion.h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="sr-only">Открыть меню пользователя</span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 shadow-xl rounded-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discipline Header */}
        {discipline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200"
          >
            <div className="flex items-start space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="bg-blue-100 p-3 rounded-lg"
              >
                <BookOpen className="h-8 w-8 text-blue-600" />
              </motion.div>
              <div className="flex-1">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  {discipline.name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 text-lg"
                >
                  {discipline.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {topics.length} {topics.length === 1 ? 'тема' : topics.length < 5 ? 'темы' : 'тем'}
                  </Badge>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Topics Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 mb-6 flex items-center"
          >
            Темы дисциплины
          </motion.h3>
          
          {topics.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="shadow-md">
                <CardContent className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">По этой дисциплине пока нет тем</h4>
                  <p>Проверьте позже или свяжитесь с преподавателем</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Card 
                    className="h-full transition-all duration-300 hover:shadow-xl cursor-pointer group border border-gray-200 rounded-2xl overflow-hidden"
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 w-full"></div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {topic.assignments_count} заданий
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-green-600 transition-colors duration-300 leading-tight">
                        {topic.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Преподаватель: {topic.teacher_name}
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopicClick(topic.id);
                            }}
                          >
                            Изучить
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};