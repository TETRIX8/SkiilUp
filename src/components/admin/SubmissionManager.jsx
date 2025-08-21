import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  Star,
  User,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export const SubmissionManager = ({ onStatsUpdate }) => {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: ''
  });
  const [gradeLoading, setGradeLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, assignmentsResponse] = await Promise.all([
        apiClient.getSubmissions(),
        apiClient.getAssignments()
      ]);
      
      setSubmissions(submissionsResponse.submissions || []);
      setAssignments(assignmentsResponse.assignments || []);
    } catch (error) {
      setError('Ошибка загрузки данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = (submission) => {
    setGradingSubmission(submission);
    setGradeData({
      score: submission.score || '',
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setGradeLoading(true);
    setError('');

    try {
      await apiClient.updateSubmission(gradingSubmission.id, {
        score: parseInt(gradeData.score),
        feedback: gradeData.feedback
      });
      
      await loadData();
      setIsGradeDialogOpen(false);
      resetGradeForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setGradeLoading(false);
    }
  };

  const resetGradeForm = () => {
    setGradeData({ score: '', feedback: '' });
    setGradingSubmission(null);
    setError('');
  };

  const handleGradeDialogClose = () => {
    setIsGradeDialogOpen(false);
    resetGradeForm();
  };

  const getAssignmentInfo = (assignmentId) => {
    return assignments.find(a => a.id === assignmentId) || {};
  };

  const getSubmissionStatus = (submission) => {
    if (submission.is_graded) {
      return { label: 'Оценено', color: 'default', icon: CheckCircle };
    }
    return { label: 'Ожидает проверки', color: 'secondary', icon: Clock };
  };

  const handleDownloadFile = async (filePath, fileName) => {
    const API_BASE_HOST = 'https://tetrixuno.ddns.net';
    const downloadUrl = `${API_BASE_HOST}/api/files/download/${filePath}`;
    
    try {
      setError(''); // Clear previous errors
      setSuccess('Начинаю скачивание файла...');
      
      // Сначала проверяем целостность файла
      const verifyUrl = `${API_BASE_HOST}/api/files/verify/${filePath}`;
      const verifyResponse = await fetch(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        if (!verifyData.is_valid) {
          throw new Error(`Файл поврежден: ${verifyData.message}`);
        }
        console.log('File verification passed:', verifyData);
      } else {
        console.warn('File verification failed, proceeding with download anyway');
      }
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      // Check if response has content
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        throw new Error('Файл пустой или поврежден');
      }

      // Проверяем, что файл действительно скачивается
      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Показываем прогресс для больших файлов
        if (contentLength && contentLength > 1024 * 1024) { // > 1MB
          const progress = Math.round((receivedLength / contentLength) * 100);
          setSuccess(`Скачивание: ${progress}%`);
        }
      }
      
      // Собираем файл из чанков
      const blob = new Blob(chunks);
      
      // Check if blob is empty
      if (blob.size === 0) {
        throw new Error('Файл пустой или поврежден');
      }
      
      // Проверяем размер скачанного файла
      if (contentLength && blob.size !== parseInt(contentLength)) {
        console.warn(`Size mismatch: expected ${contentLength}, got ${blob.size}`);
        if (blob.size < parseInt(contentLength) * 0.9) { // Если скачалось меньше 90%
          throw new Error('Файл скачан не полностью. Попробуйте еще раз.');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setSuccess(`Файл успешно скачан! Размер: ${(blob.size / (1024 * 1024)).toFixed(2)} MB`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Download error:', error);
      setError('Ошибка скачивания файла: ' + error.message);
      setSuccess(''); // Очищаем сообщение об успехе
    }
  };

  const filterSubmissions = (filter) => {
    switch (filter) {
      case 'pending':
        return submissions.filter(s => !s.is_graded);
      case 'graded':
        return submissions.filter(s => s.is_graded);
      default:
        return submissions;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка работ...</p>
        </div>
      </div>
    );
  }

  const pendingSubmissions = filterSubmissions('pending');
  const gradedSubmissions = filterSubmissions('graded');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Проверка работ</h3>
          <p className="text-gray-600">Просматривайте и оценивайте работы учеников</p>
        </div>
      </div>

      {error && !isGradeDialogOpen && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && !isGradeDialogOpen && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ожидают проверки</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSubmissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Проверено</p>
                <p className="text-2xl font-bold text-gray-900">{gradedSubmissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Средний балл</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gradedSubmissions.length > 0 
                    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Ожидают проверки ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Проверенные ({gradedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Все работы ({submissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <SubmissionsList 
            submissions={pendingSubmissions}
            assignments={assignments}
            onGrade={handleGrade}
            showGradeButton={true}
          />
        </TabsContent>

        <TabsContent value="graded">
          <SubmissionsList 
            submissions={gradedSubmissions}
            assignments={assignments}
            onGrade={handleGrade}
            showGradeButton={true}
          />
        </TabsContent>

        <TabsContent value="all">
          <SubmissionsList 
            submissions={submissions}
            assignments={assignments}
            onGrade={handleGrade}
            showGradeButton={true}
          />
        </TabsContent>
      </Tabs>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Оценить работу</DialogTitle>
            <DialogDescription>
              {gradingSubmission && (
                <>
                  Ученик: {gradingSubmission.student_name} | 
                  Задание: {getAssignmentInfo(gradingSubmission.assignment_id).title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {gradingSubmission && (
            <div className="space-y-4">
              {/* Submission Content */}
              <div className="space-y-2">
                <Label>Содержание работы:</Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="whitespace-pre-wrap">{gradingSubmission.content}</p>
                </div>
              </div>

              {/* Attached File */}
              {gradingSubmission.file_path && (
                <div className="space-y-2">
                  <Label>Прикрепленный файл:</Label>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {gradingSubmission.file_name || gradingSubmission.file_path}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(gradingSubmission.file_path, gradingSubmission.file_name || gradingSubmission.file_path)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Скачать
                    </Button>
                  </div>
                </div>
              )}

              {/* Grade Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Оценка</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max={getAssignmentInfo(gradingSubmission.assignment_id).max_score || 100}
                      value={gradeData.score}
                      onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                      placeholder={`Макс: ${getAssignmentInfo(gradingSubmission.assignment_id).max_score || 100}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Максимальный балл</Label>
                    <div className="p-2 bg-gray-100 rounded text-center font-medium">
                      {getAssignmentInfo(gradingSubmission.assignment_id).max_score || 100}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Комментарий (необязательно)</Label>
                  <Textarea
                    id="feedback"
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    placeholder="Оставьте комментарий для ученика..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleGradeDialogClose}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={gradeLoading}>
                    {gradeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить оценку
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for submissions list
const SubmissionsList = ({ submissions, assignments, onGrade, showGradeButton }) => {
  const getAssignmentInfo = (assignmentId) => {
    return assignments.find(a => a.id === assignmentId) || {};
  };

  const getSubmissionStatus = (submission) => {
    if (submission.is_graded) {
      return { label: 'Оценено', color: 'default', icon: CheckCircle };
    }
    return { label: 'Ожидает проверки', color: 'secondary', icon: Clock };
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет работ</h3>
          <p className="text-gray-600">
            В этой категории пока нет отправленных работ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const status = getSubmissionStatus(submission);
        const assignment = getAssignmentInfo(submission.assignment_id);
        const StatusIcon = status.icon;
        
        return (
          <Card key={submission.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title || 'Неизвестное задание'}
                    </h3>
                    <Badge variant={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                    {submission.is_graded && (
                      <Badge variant="outline">
                        {submission.score}/{assignment.max_score || 100}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {submission.student_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(submission.submitted_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-2">{submission.content}</p>
                    {submission.file_path && (
                      <div className="mt-2 flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          Прикреплен файл: {submission.file_name || submission.file_path}
                        </span>
                      </div>
                    )}
                    {submission.feedback && (
                      <p className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                        <strong>Комментарий:</strong> {submission.feedback}
                      </p>
                    )}
                  </div>
                </div>
                
                {showGradeButton && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={submission.is_graded ? "outline" : "default"}
                      onClick={() => onGrade(submission)}
                    >
                      {submission.is_graded ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Изменить оценку
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Оценить
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
