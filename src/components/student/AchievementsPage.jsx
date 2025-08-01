import React from 'react';
import { motion } from 'framer-motion';
import { StudentNavigation } from './StudentNavigation';
import { Achievements } from './Achievements';

export const AchievementsPage = () => {
  // Симуляция данных пользователя для достижений
  const userStats = {
    daily_streak: 5,
    assignments_completed: 8,
    perfect_scores: 3,
    topics_completed: 7,
    assignments_today: 2,
    consistent_days: 3,
    first_perfect: true,
    early_submissions: 1,
    helpful_comments: 2,
    total_xp: 1250,
    level: 8,
    level_progress: 75
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Achievements userStats={userStats} />
        </motion.div>
      </main>
    </div>
  );
}; 