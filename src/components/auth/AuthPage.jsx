import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { BookOpen, GraduationCap } from 'lucide-react';

export const AuthPage = () => {
  const [currentForm, setCurrentForm] = useState('login'); // 'login', 'register', 'forgot'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 mobile-optimized">
      <div className="w-full max-w-6xl container-mobile">
        {/* Mobile-first layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center space-y-8 lg:space-y-0">
          {/* Left side - Branding */}
          <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="bg-primary rounded-full p-3">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Образовательная платформа
              </h1>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                Учитесь и развивайтесь вместе с нами
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                Современная платформа для обучения с интерактивными материалами, 
                заданиями и персональным подходом к каждому ученику.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 hidden lg:grid">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Интерактивные уроки</h3>
                  <p className="text-sm text-gray-600">Изучайте материалы в удобном формате</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <GraduationCap className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Практические задания</h3>
                  <p className="text-sm text-gray-600">Закрепляйте знания на практике</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="w-full order-1 lg:order-2">
            {currentForm === 'login' && (
              <LoginForm
                onSwitchToRegister={() => setCurrentForm('register')}
                onSwitchToForgotPassword={() => setCurrentForm('forgot')}
              />
            )}
            
            {currentForm === 'register' && (
              <RegisterForm
                onSwitchToLogin={() => setCurrentForm('login')}
              />
            )}
            
            {currentForm === 'forgot' && (
              <ForgotPasswordForm
                onSwitchToLogin={() => setCurrentForm('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

