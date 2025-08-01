import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { apiClient } from '../../lib/api';

export const AssignmentManager = ({ onStatsUpdate }) => {
  const [assignments, setAssignments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    topic_id: '',
    title: '',
    description: '',
    instructions: '',
    max_score: 100,
    due_date: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse, topicsResponse] = await Promise.all([
        apiClient.getAssignments(),
        apiClient.getTopics()
      ]);
      
      setAssignments(assignmentsResponse.assignments || []);
      setTopics(topicsResponse.topics || []);
    } catch (error) {
      setError('Ошибка загрузки данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        topic_id: parseInt(formData.topic_id),
        max_score: parseInt(formData.max_score),
        due_date: formData.due_date || null
      };

      if (editingAssignment) {
        await apiClient.updateAssignment(editingAssignment.id, submitData);
      } else {
        await apiClient.createAssignment(submitData);
      }
      
      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      topic_id: assignment.topic_id.toString(),
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      max_score: assignment.max_score,
      due_date: assignment.due_date ? assignment.due_date.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return;

    try {
      await apiClient.deleteAssignment(assignmentId);
      await loadData();
    } catch (error) {
      setError('Ошибка удаления задания: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      topic_id: '',
      title: '',
      description: '',
      instructions: '',
      max_score: 100,
      due_date: ''
    });
    setEditingAssignment(null);
    setError('');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.title : 'Неизвестная тема';
  };

  const getAssignmentStatus = (assignment) => {
    if (assignment.is_overdue) {
      return { label: 'Просрочено', color: 'destructive' };
    }
    if (assignment.due_date) {
      const dueDate = new Date(assignment.due_date);
      const now = new Date();
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) {
        return { label: 'Просрочено', color: 'destructive' };
      } else if (daysLeft <= 3) {
        return { label: `${daysLeft} дн.`, color: 'secondary' };
      } else {
        return { label: `${daysLeft} дн.`, color: 'outline' };
      }
    }
    return { label: 'Без срока', color: 'outline' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка заданий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Управление заданиями</h3>
          <p className="text-gray-600">Создавайте и редактируйте задания для учеников</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать задание
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? 'Редактировать задание' : 'Создать новое задание'}
              </DialogTitle>
              <DialogDescription>
                {editingAssignment 
                  ? 'Внесите изменения в существующее задание'
                  : 'Заполните информацию для создания нового задания'
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
                <Label htmlFor="topic_id">Тема</Label>
                <Select 
                  value={formData.topic_id} 
                  onValueChange={(value) => setFormData({ ...formData, topic_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тему" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Название задания</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название задания"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание задания"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Инструкции</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Подробные инструкции для выполнения задания"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_score">Максимальный балл</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min="1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Срок сдачи (необязательно)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Отмена
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAssignment ? 'Сохранить изменения' : 'Создать задание'}
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

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);
          
          return (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      <Badge variant={status.color}>{status.label}</Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{assignment.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Тема: {getTopicName(assignment.topic_id)}
                      </span>
                      <span>Макс. балл: {assignment.max_score}</span>
                      <span>Отправлено: {assignment.submissions_count || 0}</span>
                      {assignment.due_date && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(assignment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет созданных заданий</h3>
            <p className="text-gray-600 mb-4">
              {topics.length === 0 
                ? 'Сначала создайте тему, чтобы добавить к ней задания'
                : 'Создайте первое задание для ваших учеников'
              }
            </p>
            {topics.length > 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первое задание
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

