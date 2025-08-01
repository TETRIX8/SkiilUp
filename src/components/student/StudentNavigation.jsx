import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BookOpen,
  GraduationCap,
  Home,
  Trophy,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Star,
  Zap,
  Heart,
  Bookmark,
  FileText,
  CheckCircle,
  Clock,
  Users,
  MessageCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Главная',
    icon: Home,
    path: '/',
    description: 'Обзор прогресса и статистика'
  },
  {
    id: 'disciplines',
    label: 'Дисциплины',
    icon: BookOpen,
    path: '/disciplines',
    description: 'Изучение предметов'
  },
  {
    id: 'assignments',
    label: 'Задания',
    icon: FileText,
    path: '/assignments',
    description: 'Выполнение заданий'
  },
  {
    id: 'grades',
    label: 'Оценки',
    icon: Star,
    path: '/grades',
    description: 'Ваши результаты'
  },
  {
    id: 'achievements',
    label: 'Достижения',
    icon: Trophy,
    path: '/achievements',
    description: 'Ваши награды'
  },
  {
    id: 'calendar',
    label: 'Календарь',
    icon: Calendar,
    path: '/calendar',
    description: 'Расписание и дедлайны'
  },
  {
    id: 'progress',
    label: 'Прогресс',
    icon: TrendingUp,
    path: '/progress',
    description: 'Детальная статистика'
  },
  {
    id: 'community',
    label: 'Сообщество',
    icon: Users,
    path: '/community',
    description: 'Общение с однокурсниками'
  }
];

const quickActions = [
  {
    id: 'notifications',
    label: 'Уведомления',
    icon: Bell,
    action: () => console.log('Notifications')
  },
  {
    id: 'search',
    label: 'Поиск',
    icon: Search,
    action: () => console.log('Search')
  },
  {
    id: 'help',
    label: 'Помощь',
    icon: HelpCircle,
    action: () => console.log('Help')
  }
];

export const StudentNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const currentPath = location.pathname;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Десктопная навигация */}
      <div className="hidden lg:block">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Логотип и основная навигация */}
              <div className="flex items-center space-x-4 lg:space-x-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 lg:space-x-3 cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1.5 lg:p-2 shadow-md">
                    <GraduationCap className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    SkillUp
                  </span>
                </motion.div>

                <div className="flex items-center space-x-1">
                  {navigationItems.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleNavigation(item.path)}
                          className={`relative px-2 lg:px-4 py-2 rounded-lg transition-all duration-200 text-xs lg:text-sm ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          <span className="hidden sm:inline">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="ml-1 lg:ml-2 bg-red-500 text-white text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                              initial={false}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Правая часть - быстрые действия и профиль */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Быстрые действия */}
                <div className="flex items-center space-x-1 lg:space-x-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={action.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={action.action}
                          className="relative p-1.5 lg:p-2 rounded-full hover:bg-gray-100"
                        >
                          <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                          {action.badge && (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5"
                            >
                              {action.badge}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Профиль пользователя */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1">
                      <User className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                    </div>
                    <span className="text-xs lg:text-sm font-medium text-gray-700 hidden sm:inline">
                      {user?.first_name}
                    </span>
                  </Button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 lg:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-3 lg:px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        
                        <div className="py-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigate('/profile');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full justify-start px-3 lg:px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            <User className="h-4 w-4 mr-3" />
                            Профиль
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigate('/settings');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full justify-start px-3 lg:px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Настройки
                          </Button>
                        </div>
                        
                        <div className="border-t border-gray-100 py-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-start px-3 lg:px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Выйти
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Мобильная навигация */}
      <div className="lg:hidden">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 lg:h-16">
              {/* Логотип */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 lg:space-x-3 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-1.5 lg:p-2 shadow-md">
                  <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <span className="text-base lg:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  SkillUp
                </span>
              </motion.div>

              {/* Правая часть - уведомления и меню */}
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-1.5 lg:p-2 rounded-full hover:bg-gray-100"
                  >
                    <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                  </Button>
                </motion.div>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 lg:p-2 rounded-full hover:bg-gray-100"
                      >
                        <Menu className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">SkillUp</span>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-4">
                      {/* Профиль пользователя */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Навигация */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                          Навигация
                        </p>
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentPath === item.path;
                          
                          return (
                            <motion.div
                              key={item.id}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-200 ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                <Icon className="h-4 w-4 mr-3" />
                                <div className="flex-1 text-left">
                                  <div className="flex items-center justify-between">
                                    <span>{item.label}</span>
                                    {item.badge && (
                                      <Badge 
                                        variant="secondary" 
                                        className="bg-red-500 text-white text-xs"
                                      >
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs opacity-75 mt-1">{item.description}</p>
                                </div>
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Быстрые действия */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
                          Быстрые действия
                        </p>
                        {quickActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <motion.div
                              key={action.id}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={action.action}
                                className="w-full justify-start px-4 py-3 rounded-lg hover:bg-gray-100"
                              >
                                <Icon className="h-4 w-4 mr-3" />
                                <div className="flex items-center justify-between flex-1">
                                  <span>{action.label}</span>
                                  {action.badge && (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-red-500 text-white text-xs"
                                    >
                                      {action.badge}
                                    </Badge>
                                  )}
                                </div>
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Выход */}
                      <div className="pt-4 border-t border-gray-200">
                        <motion.div
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-start px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Выйти
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}; 