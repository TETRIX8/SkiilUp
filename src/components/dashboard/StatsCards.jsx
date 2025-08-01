// src/components/dashboard/StatsCards.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, CheckCircle, Clock } from 'lucide-react';

// Отдельный компонент для одной статистической карточки
const StatCard = ({ icon: Icon, title, value, color }) => (
  <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center">
        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${color}`} />
        <div className="ml-3 sm:ml-4">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Основной компонент для группы статистических карточек
export const StatsCards = ({ topics, assignments, submissions }) => {
  const gradedCount = submissions.filter(s => s.is_graded).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      <StatCard
        icon={BookOpen}
        title="Доступные темы"
        value={topics.length}
        color="text-blue-500"
      />
      <StatCard
        icon={FileText}
        title="Всего заданий"
        value={assignments.length}
        color="text-green-500"
      />
      <StatCard
        icon={CheckCircle}
        title="Выполнено"
        value={submissions.length}
        color="text-purple-500"
      />
      <StatCard
        icon={Clock}
        title="Оценено"
        value={gradedCount}
        color="text-orange-500"
      />
    </div>
  );
};
