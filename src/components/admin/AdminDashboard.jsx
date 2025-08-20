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
  const [backupError, setBackupError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResults, setVerifyResults] = useState(null);
  const [verifyError, setVerifyError] = useState('');

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

  const handleVerifyFiles = async () => {
    setVerifyLoading(true);
    setVerifyError('');
    setVerifyResults(null);

    try {
      const API_BASE_HOST = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
        ? import.meta.env.VITE_BACKEND_URL
        : ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL)
          ? process.env.REACT_APP_BACKEND_URL
          : 'https://tetrixuno.ddns.net');

      const response = await fetch(`${API_BASE_HOST}/api/files/verify-all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to verify files');
      }

      const results = await response.json();
      setVerifyResults(results);
      console.log('File verification results:', results);
    } catch (err) {
      console.error("File verification failed:", err);
      setVerifyError(err.message || 'Failed to verify files');
    } finally {
      setVerifyLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-sm">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
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
              <Button variant="outline" size="sm" onClick={logout} className="hover:bg-red-50">
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
          <Alert variant="destructive" className="mb-6 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Добро пожаловать, {user?.first_name}!
          </h2>
          <p className="text-gray-600">
            Управляйте образовательным контентом и отслеживайте прогресс учеников.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[{
            icon: BookOpen,
            color: 'from-blue-500 to-indigo-600',
            label: 'Темы',
            value: stats.topics
          },{
            icon: FileText,
            color: 'from-green-500 to-emerald-600',
            label: 'Задания',
            value: stats.assignments
          },{
            icon: CheckCircle,
            color: 'from-purple-500 to-fuchsia-600',
            label: 'Отправлено работ',
            value: stats.submissions
          },{
            icon: Users,
            color: 'from-amber-500 to-orange-600',
            label: 'Активные ученики',
            value: stats.students
          }].map(({icon:Icon,color,label,value}, idx) => (
            <Card key={idx} className="shadow-sm border border-gray-100/60 bg-white/70 backdrop-blur">
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow`}></div>
                  <div className="-ml-9 flex items-center">
                    <Icon className="h-6 w-6 text-white relative ml-3" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{label}</p>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- СЕКЦИЯ РЕЗЕРВНОГО КОПИРОВАНИЯ --- */}
        <Card className="mb-8 shadow-sm border border-gray-100/60 bg-white/80 backdrop-blur">
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
              <Alert variant="destructive" className="mb-4 shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{backupError}</AlertDescription>
              </Alert>
            )}

            {/* Ошибки восстановления */}
            {restoreError && (
              <Alert variant="destructive" className="mb-4 shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{restoreError}</AlertDescription>
              </Alert>
            )}

            {/* Сообщения об успехе восстановления */}
            {restoreSuccess && (
              <Alert className="mb-4 bg-green-50 border-green-200 shadow-sm">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{restoreSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Карточка создания резервной копии */}
              <Card className="border border-gray-100/60">
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
              <Card className="border border-gray-100/60">
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
                      disabled={!selectedFile || restoreLoading}
                      className="w-full"
                    >
                      {restoreLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Восстанавливаю...
                        </>
                      ) : (
                        'Восстановить базу данных'
                      )}
                    </Button>
                    {restoreError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{restoreError}</AlertDescription>
                      </Alert>
                    )}
                    {restoreSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{restoreSuccess}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Карточка проверки целостности файлов */}
              <Card className="border border-gray-100/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5" />
                    Проверить целостность файлов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Проверьте целостность всех загруженных файлов в системе.
                  </p>
                  <div className="space-y-4">
                    <Button
                      onClick={handleVerifyFiles}
                      disabled={verifyLoading}
                      className="w-full"
                    >
                      {verifyLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Проверяю...
                        </>
                      ) : (
                        'Проверить все файлы'
                      )}
                    </Button>
                    
                    {verifyError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{verifyError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {verifyResults && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{verifyResults.valid_files}</div>
                            <div className="text-green-700">Целые файлы</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{verifyResults.invalid_files}</div>
                            <div className="text-red-700">Поврежденные</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{verifyResults.total_size_mb}</div>
                            <div className="text-blue-700">МБ всего</div>
                          </div>
                        </div>
                        
                        {verifyResults.invalid_files > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Обнаружено {verifyResults.invalid_files} поврежденных файлов. 
                              Рекомендуется выполнить очистку.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Показать детали проверки
                          </summary>
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {verifyResults.results.map((result, index) => (
                              <div key={index} className={`p-2 rounded text-xs ${
                                result.is_valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}>
                                <div className="font-medium">{result.filename}</div>
                                <div>{result.message}</div>
                                {result.size > 0 && <div>Размер: {(result.size / 1024).toFixed(1)} KB</div>}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
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

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur shadow-inner">
            <TabsTrigger value="users" className="data-[state=active]:shadow data-[state=active]:border">Управление пользователями</TabsTrigger>
            <TabsTrigger value="topics" className="data-[state=active]:shadow data-[state=active]:border">Управление темами</TabsTrigger>
            <TabsTrigger value="assignments" className="data-[state=active]:shadow data-[state=active]:border">Управление заданиями</TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:shadow data-[state=active]:border">Проверка работ</TabsTrigger>
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
