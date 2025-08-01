// src/components/admin/SubjectManager.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2,
  BookOpen, // Иконка для дисциплины
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export const SubjectManager = ({ onStatsUpdate }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSubjects(); // Нужно добавить в apiClient
      setSubjects(response.subjects || []);
    } catch (error) {
      setError('Ошибка загрузки дисциплин: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingSubject) {
        await apiClient.updateSubject(editingSubject.id, formData); // Нужно добавить в apiClient
      } else {
        await apiClient.createSubject(formData); // Нужно добавить в apiClient
      }
      
      await loadSubjects();
      setIsDialogOpen(false);
      resetForm();
      if (onStatsUpdate) onStatsUpdate(); // Обновляем статистику в дашборде
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '' // Убедитесь, что description не undefined
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (subjectId) => {
    if (!confirm('Вы уверены, что хотите удалить эту дисциплину? Это удалит все связанные темы.')) return;

    try {
      await apiClient.deleteSubject(subjectId); // Нужно добавить в apiClient
      await loadSubjects();
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      setError('Ошибка удаления дисциплины: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingSubject(null);
    setError('');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка дисциплин...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Управление дисциплинами</h3>
          <p className="text-gray-600">Создавайте и редактируйте дисциплины</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать дисциплину
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Редактировать дисциплину' : 'Создать новую дисциплину'}
              </DialogTitle>
              <DialogDescription>
                {editingSubject 
                  ? 'Внесите изменения в существующую дисциплину'
                  : 'Заполните информацию для создания новой дисциплины'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Название дисциплины *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название дисциплины"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание дисциплины"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Отмена
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSubject ? 'Сохранить изменения' : 'Создать дисциплину'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !isDialogOpen && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{subject.name}</CardTitle>
                  <CardDescription>{subject.description}</CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Тем: {subject.topics_count || 0}</span> {/* Предполагается, что это поле есть в to_dict модели Subject */}
                  <span>Создана: {new Date(subject.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  {/* <Badge variant="secondary">
                    {new Date(subject.created_at).toLocaleDateString('ru-RU')}
                  </Badge> */}
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(subject)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет созданных дисциплин</h3>
            <p className="text-gray-600 mb-4">
              Создайте первую дисциплину, чтобы начать добавлять темы
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую дисциплину
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
