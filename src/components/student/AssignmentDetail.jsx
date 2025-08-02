// src/components/student/AssignmentDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  GraduationCap,
  Upload,
  Download,
  Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';

export const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Form state
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAssignmentData();
  }, [id]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        apiClient.getAssignment(id),
        apiClient.getMySubmissions()
      ]);
      setAssignment(assignmentResponse.assignment);
      const existingSubmission = submissionsResponse.submissions?.find(
        sub => sub.assignment_id === parseInt(id)
      );
      setSubmission(existingSubmission);
      if (existingSubmission) {
        setSubmissionText(existingSubmission.content || '');
        if (existingSubmission.file_path) {
          setUploadedFile({
            file_path: existingSubmission.file_path,
            file_name: existingSubmission.file_name || existingSubmission.file_path
          });
        }
      }
      if (assignmentResponse.assignment.topic_id) {
        try {
          const topicResponse = await apiClient.getTopic(assignmentResponse.assignment.topic_id);
          setTopic(topicResponse.topic);
        } catch (topicError) {
          console.warn('Could not load topic:', topicError);
        }
      }
    } catch (error) {
      setError('Ошибка загрузки данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignment_id', id);

      const API_BASE_URL = 'https://tetrixuno.duckdns.org';

      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка загрузки файла');
      }

      const result = await response.json();
      setUploadedFile({
        file_path: result.file_path,
        file_name: result.file_name
      });

      return {
        file_path: result.file_path,
        file_name: result.file_name
      };
    } catch (error) {
      setError('Ошибка загрузки файла: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSubmissionFile(file);
      await handleFileUpload(file);
    }
  };

  const handleDownloadFile = (filePath, fileName) => {
    const API_BASE_URL ='https://tetrixuno.duckdns.org';
    const downloadUrl = `${API_BASE_URL}/api/files/download/${filePath}`;

    fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Файл не найден или доступ запрещён');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      setError('Ошибка скачивания файла: ' + error.message);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) {
      setError('Пожалуйста, введите ответ на задание');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const submissionData = {
        assignment_id: parseInt(id),
        content: submissionText.trim()
      };
      if (uploadedFile) {
        submissionData.file_path = uploadedFile.file_path;
        submissionData.file_name = uploadedFile.file_name;
      }
      
      if (submission) {
        await apiClient.updateSubmission(submission.id, submissionData);
        setSuccess('Ответ успешно обновлен!');
      } else {
        await apiClient.createSubmission(submissionData);
        setSuccess('Ответ успешно отправлен!');
        
        // Записываем достижение за отправку задания
        try {
          await apiClient.recordSubmission(parseInt(id));
        } catch (achievementError) {
          console.error('Error recording achievement:', achievementError);
          // Не прерываем выполнение из-за ошибки достижений
        }
      }
      
      await loadAssignmentData();
    } catch (error) {
      setError('Ошибка отправки: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getAssignmentStatus = () => {
    if (submission) {
      if (submission.is_graded) {
        return { status: 'graded', label: 'Оценено', color: 'default' };
      }
      return { status: 'submitted', label: 'Отправлено', color: 'secondary' };
    }
    if (assignment?.is_overdue) {
      return { status: 'overdue', label: 'Просрочено', color: 'destructive' };
    }
    return { status: 'pending', label: 'Ожидает выполнения', color: 'outline' };
  };

  const canSubmit = () => {
    return !assignment?.is_overdue || submission;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.p 
            className="text-gray-700 text-xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Загрузка задания...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Alert variant="destructive" className="max-w-md shadow-lg rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Alert className="max-w-md shadow-lg rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Задание не найдено</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  const status = getAssignmentStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                onClick={() => topic ? navigate(`/topics/${topic.id}`) : navigate('/')}
                className="mr-2 hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {topic && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button 
                onClick={() => navigate(`/topics/${topic.id}`)}
                className="hover:text-indigo-600 transition-colors duration-200 font-medium"
              >
                {topic.title}
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">{assignment.title}</span>
            </nav>
          </motion.div>
        )}

        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FileText className="h-8 w-8 text-indigo-500" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{assignment.title}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge 
                      variant={status.color} 
                      className="px-3 py-1 text-sm font-medium shadow-sm"
                    >
                      {status.label}
                    </Badge>
                  </motion.div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Максимальный балл: <span className="font-semibold">{assignment.max_score}</span>
                  </span>
                  {assignment.due_date && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Срок: {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {assignment.description && (
            <motion.p 
              className="text-gray-700 text-lg bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {assignment.description}
            </motion.p>
          )}
        </motion.div>

        {assignment.content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="mb-8 shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <CardTitle className="text-xl text-gray-800">Описание задания</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: assignment.content }} 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {submission && submission.is_graded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="mb-8 shadow-md rounded-xl border-l-4 border-l-green-500 bg-green-50">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-800">Задание оценено: {submission.score}/{assignment.max_score} баллов</span>
                      </div>
                      {submission.feedback && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                          <strong className="text-green-700">Комментарий преподавателя:</strong>
                          <p className="mt-1 text-gray-700">{submission.feedback}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="text-xl text-gray-800">
                {submission ? 'Ваш ответ' : 'Отправить ответ'}
              </CardTitle>
              <CardDescription>
                {submission 
                  ? 'Вы можете обновить свой ответ до окончания срока сдачи'
                  : 'Введите ваш ответ на задание'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="mb-4 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="mb-4 rounded-lg border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="submission-text" className="text-gray-700 font-medium">Ответ на задание</Label>
                  <Textarea
                    id="submission-text"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Введите ваш ответ здесь..."
                    rows={8}
                    disabled={submission?.is_graded || !canSubmit()}
                    className="mt-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <Label htmlFor="submission-file" className="text-gray-700 font-medium">Прикрепить файл (необязательно)</Label>
                  <div className="mt-2">
                    {uploadedFile ? (
                      <motion.div 
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          <span className="text-sm text-gray-700 font-medium truncate max-w-xs">{uploadedFile.file_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(uploadedFile.file_path, uploadedFile.file_name)}
                            className="border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Скачать
                          </Button>
                          {!submission?.is_graded && canSubmit() && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUploadedFile(null);
                                setSubmissionFile(null);
                              }}
                              className="border-red-300 text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              Удалить
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <div className="relative flex-1">
                          <Input
                            id="submission-file"
                            type="file"
                            onChange={handleFileChange}
                            disabled={submission?.is_graded || !canSubmit() || uploading}
                            accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg,.gif"
                            className="pl-10 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          />
                          <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {uploading && (
                          <div className="flex items-center space-x-2 text-sm text-indigo-600">
                            <motion.div 
                              className="rounded-full h-4 w-4 border-t-2 border-indigo-600"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            ></motion.div>
                            <span>Загрузка...</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Поддерживаемые форматы: TXT, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, изображения
                    </p>
                  </div>
                </div>
                {canSubmit() && !submission?.is_graded && (
                  <div className="flex justify-end pt-4">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={submitting || !submissionText.trim()}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all duration-300"
                      >
                        {submitting ? (
                          <>
                            <motion.div 
                              className="rounded-full h-4 w-4 border-t-2 border-white mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            ></motion.div>
                            Отправка...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {submission ? 'Обновить ответ' : 'Отправить ответ'}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                )}
                {assignment?.is_overdue && !submission && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Срок сдачи задания истек. Отправка ответа недоступна.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {submission?.is_graded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="rounded-lg border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Задание уже оценено. Изменение ответа недоступно.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </form>
              {submission && (
                <motion.div 
                  className="mt-6 pt-6 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      Отправлено: <span className="ml-1 font-medium">{new Date(submission.submitted_at).toLocaleString('ru-RU')}</span>
                    </p>
                    {submission.updated_at && submission.updated_at !== submission.submitted_at && (
                      <p className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        Обновлено: <span className="ml-1 font-medium">{new Date(submission.updated_at).toLocaleString('ru-RU')}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};
