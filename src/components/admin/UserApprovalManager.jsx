import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export const UserApprovalManager = ({ onStatsUpdate }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [pendingResponse, allResponse] = await Promise.all([
        apiClient.getPendingUsers(),
        apiClient.getAllUsers()
      ]);

      setPendingUsers(pendingResponse.users || []);
      setAllUsers(allResponse.users || []);
    } catch (error) {
      setError('Ошибка загрузки пользователей: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setProcessingUserId(userId);
      setError('');
      setSuccess('');

      await apiClient.approveUser(userId);
      
      setSuccess('Пользователь успешно подтвержден');
      await loadUsers();
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      setError('Ошибка подтверждения пользователя: ' + error.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRejectUser = async (userId) => {
    if (!confirm('Вы уверены, что хотите отклонить этого пользователя? Учетная запись будет удалена.')) {
      return;
    }

    try {
      setProcessingUserId(userId);
      setError('');
      setSuccess('');

      await apiClient.rejectUser(userId);
      
      setSuccess('Пользователь отклонен и удален');
      await loadUsers();
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      setError('Ошибка отклонения пользователя: ' + error.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      setProcessingUserId(userId);
      setError('');
      setSuccess('');

      await apiClient.toggleUserVerification(userId);
      
      setSuccess('Статус пользователя изменен');
      await loadUsers();
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      setError('Ошибка изменения статуса: ' + error.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Pending Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Ожидающие подтверждения ({pendingUsers.length})</span>
          </CardTitle>
          <CardDescription>
            Новые пользователи, которые ожидают подтверждения администратора
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Нет пользователей, ожидающих подтверждения</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Зарегистрирован: {formatDate(user.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(user.id)}
                        disabled={processingUserId === user.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectUser(user.id)}
                        disabled={processingUserId === user.id}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Все пользователи ({allUsers.length})</span>
          </CardTitle>
          <CardDescription>
            Управление всеми пользователями системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div key={user.id} className={`border rounded-lg p-4 ${
                user.is_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <Badge variant="outline" className={
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор'}
                      </Badge>
                      <Badge variant={user.is_verified ? 'default' : 'secondary'}>
                        {user.is_verified ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Подтвержден
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Не подтвержден
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Зарегистрирован: {formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {user.role !== 'admin' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVerification(user.id)}
                        disabled={processingUserId === user.id}
                      >
                        {user.is_verified ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Отозвать
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Подтвердить
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

