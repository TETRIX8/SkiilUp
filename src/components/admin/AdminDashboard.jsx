// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  FileText,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  LogOut,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  Database, // Импортируем иконку для резервного копирования
  Download, // Импортируем иконку загрузки
  Upload   // Импортируем иконку выгрузки
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import { TopicManager } from './TopicManager';
import { AssignmentManager } from './AssignmentManager';
import { SubmissionManager } from './SubmissionManager';
import { UserApprovalManager } from './UserApprovalManager';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    topics: 0,
    assignments: 0,
    submissions: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояния для резервного копирования
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupError, setBackupError] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [topicsResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
        apiClient.getTopics(),
        apiClient.getAssignments(),
        apiClient.getSubmissions()
      ]);
      setStats({
        topics: topicsResponse.topics?.length || 0,
        assignments: assignmentsResponse.assignments?.length || 0,
        submissions: submissionsResponse.submissions?.length || 0,
        students: new Set(submissionsResponse.submissions?.map(s => s.student_id) || []).size
      });
    } catch (error) {
      setError('Ошибка загрузки статистики: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Функции для резервного копирования
  const handleBackup = async () => {
    setBackupLoading(true);
    setBackupError('');
    try {
      await apiClient.backupDatabase();
      // Сообщение об успехе обрабатывается внутри apiClient.backupDatabase
    } catch (err) {
      console.error("Backup failed:", err);
      setBackupError(err.message || 'Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/sql' && !file.name.endsWith('.sql')) {
        setRestoreError('Please select a .sql file');
        setSelectedFile(null);
        event.target.value = null; // Сбросить input
        return;
      }
      setSelectedFile(file);
      setRestoreError(''); // Очистить ошибку, если файл правильный
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setRestoreError('Please select a backup file first');
      return;
    }

    setRestoreLoading(true);
    setRestoreError('');
    setRestoreSuccess('');

    try {
      const response = await apiClient.restoreDatabase(selectedFile);
      console.log("Restore response:", response);
      setRestoreSuccess(response.message || 'Database restored successfully. You may need to reload the page.');
      setSelectedFile(null); // Сбросить выбор файла
      // Опционально: сбросить значение input файла, если он есть в DOM
      const fileInput = document.getElementById('restore-file-input');
      if (fileInput) fileInput.value = '';
      
      // Перезагрузить статистику после восстановления
      loadStats();
    } catch (err) {
      console.error("Restore failed:", err);
      setRestoreError(err.message || 'Failed to restore database');
    } finally {
      setRestoreLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-full p-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Административная панель
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.role === 'admin' ? 'Администратор' : 'Преподаватель'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user?.first_name}!
          </h2>
          <p className="text-gray-600">
            Управляйте образовательным контентом и отслеживайте прогресс учеников.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Темы</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.topics}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Задания</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.assignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Отправлено работ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.submissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Активные ученики</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- СЕКЦИЯ РЕЗЕРВНОГО КОПИРОВАНИЯ --- */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Резервное копирование базы данных
            </CardTitle>
            <CardDescription>
              Создание и восстановление резервных копий всей информации в системе.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Ошибки резервного копирования */}
            {backupError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{backupError}</AlertDescription>
              </Alert>
            )}

            {/* Ошибки восстановления */}
            {restoreError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{restoreError}</AlertDescription>
              </Alert>
            )}

            {/* Сообщения об успехе восстановления */}
            {restoreSuccess && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{restoreSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Карточка создания резервной копии */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-5 w-5" />
                    Создать резервную копию
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Скачайте полную резервную копию текущей базы данных в формате SQL.
                  </p>
                  <Button
                    onClick={handleBackup}
                    disabled={backupLoading}
                    className="w-full"
                  >
                    {backupLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Создание...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Скачать .sql файл
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Карточка восстановления из резервной копии */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5" />
                    Восстановить из файла
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Загрузите ранее созданную резервную копию (.sql) для восстановления данных.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="restore-file-input" className="block text-sm font-medium text-gray-900 mb-2">
                        Выберите файл резервной копии
                      </label>
                      <input
                        id="restore-file-input"
                        type="file"
                        accept=".sql"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-600
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-primary-foreground
                          hover:file:bg-primary/90
                        "
                        disabled={restoreLoading}
                      />
                      {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600">
                          Выбран файл: <span className="font-medium">{selectedFile.name}</span>
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleRestore}
                      disabled={restoreLoading || !selectedFile}
                      className="w-full"
                    >
                      {restoreLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Восстановление...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Восстановить базу данных
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Важно
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                Восстановление базы данных из резервной копии заменит все текущие данные.
                Убедитесь, что у вас есть резервная копия текущего состояния, если это необходимо.
                После восстановления может потребоваться перезагрузка страницы или приложения.
              </p>
            </div>
          </CardContent>
        </Card>
        {/* -------------------------------------------------- */}

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Управление пользователями</TabsTrigger>
            <TabsTrigger value="topics">Управление темами</TabsTrigger>
            <TabsTrigger value="assignments">Управление заданиями</TabsTrigger>
            <TabsTrigger value="submissions">Проверка работ</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UserApprovalManager onStatsUpdate={loadStats} />
          </TabsContent>
          <TabsContent value="topics">
            <TopicManager onStatsUpdate={loadStats} />
          </TabsContent>
          <TabsContent value="assignments">
            <AssignmentManager onStatsUpdate={loadStats} />
          </TabsContent>
          <TabsContent value="submissions">
            <SubmissionManager onStatsUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};