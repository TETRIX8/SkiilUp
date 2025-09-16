import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
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

export const DisciplinesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getDisciplines();
      setDisciplines(response.disciplines || []);
    } catch (error) {
      console.error("Ошибка загрузки дисциплин:", error);
      setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisciplineClick = (disciplineId) => {
    navigate(`/discipline/${disciplineId}`);
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
            Загрузка дисциплин...
          </motion.p>
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
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert variant="destructive" className="mb-6 shadow-lg rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  {error}
                  <Button variant="outline" size="sm" onClick={loadDisciplines} className="ml-4">
                    Повторить
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Выберите <span className="text-indigo-600">дисциплину</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Изучайте материалы, выполняйте задания и отслеживайте свой прогресс в каждой дисциплине
            </p>
          </div>
        </motion.div>

        {/* Disciplines Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {disciplines.length > 0 ? (
            disciplines.map((discipline, index) => (
              <motion.div
                key={discipline.id}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <Card 
                  className="h-full transition-all duration-300 hover:shadow-2xl cursor-pointer group border border-gray-200 rounded-2xl overflow-hidden bg-white"
                  onClick={() => handleDisciplineClick(discipline.id)}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 w-full"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition-colors">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {discipline.topics_count} тем
                      </Badge>
                    </div>
                    <CardTitle className="group-hover:text-indigo-600 transition-colors duration-300 text-xl leading-tight mt-4">
                      {discipline.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-base leading-relaxed mb-6">
                      {discipline.description}
                    </CardDescription>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md text-base py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisciplineClick(discipline.id);
                        }}
                      >
                        Изучать дисциплину
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-full"
            >
              <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-12 text-center text-gray-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-2xl font-medium mb-2">Дисциплины пока недоступны</h3>
                  <p className="text-lg">Проверьте позже или свяжитесь с администратором.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};