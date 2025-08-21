import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StudentNavigation } from './StudentNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Sparkles,
  Rocket,
  Wrench,
  ShieldCheck,
  GitBranch,
  Bell,
  Trophy,
  Calendar as CalendarIcon,
  FileText,
  BookOpen,
  Stars,
  Zap,
  Folder,
  ExternalLink
} from 'lucide-react';

export const CommunityPage = () => {
  const updates = useMemo(() => ([
    {
      id: 'upd-1',
      date: '2025-08-15',
      title: 'Уведомления о достижениях',
      description: 'Добавлен колокольчик с поповером, счётчик непросмотренных и отметка «прочитано».',
      icon: Bell,
      tag: 'UX'
    },
    {
      id: 'upd-2',
      date: '2025-08-15',
      title: 'Календарь и дедлайны',
      description: 'Исправлена логика дедлайнов с учётом локального времени, обновлена подсветка срочных задач.',
      icon: CalendarIcon,
      tag: 'Fix'
    },
    {
      id: 'upd-3',
      date: '2025-08-10',
      title: 'Достижения',
      description: 'Поп-ап уведомления показываются только для новых и непросмотренных достижений.',
      icon: Trophy,
      tag: 'Feature'
    },
  ]), []);

  const features = [
    { id: 'feat-assignments', title: 'Задания', description: 'Создание и сдача заданий с оценкой.', icon: FileText, color: 'from-blue-500 to-indigo-600' },
    { id: 'feat-topics', title: 'Темы', description: 'Изучение дисциплин и тем.', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { id: 'feat-calendar', title: 'Календарь', description: 'Дедлайны, срочность и планирование.', icon: CalendarIcon, color: 'from-amber-500 to-orange-600' },
    { id: 'feat-achievements', title: 'Достижения', description: 'Серия наград и прогресс.', icon: Trophy, color: 'from-pink-500 to-rose-600' },
    { id: 'feat-performance', title: 'Быстрая работа', description: 'Современная UI-анимация и плавность.', icon: Zap, color: 'from-cyan-500 to-sky-600' },
    { id: 'feat-quality', title: 'Надёжность', description: 'Безопасность и стабильность.', icon: ShieldCheck, color: 'from-slate-600 to-gray-700' },
  ];

  const repoRoot = 'https://github.com/TETRIX8/SkiilUp';
  const repoFiles = [
    { name: 'src', type: 'dir', url: `${repoRoot}/tree/main/src` },
    { name: 'public', type: 'dir', url: `${repoRoot}/tree/main/public` },
    { name: 'dist', type: 'dir', url: `${repoRoot}/tree/main/dist` },
    { name: 'README.md', type: 'file', url: `${repoRoot}/blob/main/README.md` },
    { name: 'package.json', type: 'file', url: `${repoRoot}/blob/main/package.json` },
    { name: 'vite.config.js', type: 'file', url: `${repoRoot}/blob/main/vite.config.js` },
    { name: 'tailwind.config.js', type: 'file', url: `${repoRoot}/blob/main/tailwind.config.js` },
    { name: 'vercel.json', type: 'file', url: `${repoRoot}/blob/main/vercel.json` },
  ];

  const formatDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <StudentNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Сообщество сайта
            </h1>
            <p className="mt-2 text-gray-600">
              Все последние обновления проекта и обзор основного функционала
            </p>
            <div className="mt-3 inline-flex items-center gap-2">
              <Badge className="bg-black text-white">Автор: A-K project</Badge>
              <Badge variant="secondary" className="bg-white/60">Release Notes</Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Updates timeline */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Последние обновления
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  {updates.map((u, idx) => {
                    const Icon = u.icon || Sparkles;
                    return (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md"
                      >
                        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg p-2">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">{u.title}</h3>
                            <Badge variant="outline" className="text-xs">{u.tag}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{u.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(u.date)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features and GitHub */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Основной функционал
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((f, idx) => {
                    const Icon = f.icon;
                    return (
                      <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <div className={`p-4 rounded-xl border bg-white hover:shadow-md transition-shadow`}>
                          <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-r ${f.color} text-white mb-2`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <h4 className="font-semibold text-gray-900">{f.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{f.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* GitHub repo section */}
            <Card className="shadow-lg rounded-2xl overflow-hidden mt-6">
              <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                <CardTitle className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <GitBranch className="h-5 w-5" /> Код на GitHub
                  </span>
                  <a href={repoRoot} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline decoration-white/50">
                    Открыть репозиторий
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {repoFiles.map((item) => (
                    <a
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <span className="inline-flex items-center gap-3 text-sm font-medium text-gray-800">
                        {item.type === 'dir' ? (
                          <Folder className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-indigo-600" />
                        )}
                        {item.name}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Ссылка на репозиторий: {repoRoot}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}; 