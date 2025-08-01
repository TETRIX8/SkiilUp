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
  Eye, 
  BookOpen,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';

export const TopicManager = ({ onStatsUpdate }) => {
  const [topics, setTopics] = useState([]);
  const [disciplines, setDisciplines] = useState([]); // Добавлено
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    discipline_id: '' // Добавлено
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadTopics();
    loadDisciplines(); // Добавлено
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTopics();
      setTopics(response.topics || []);
    } catch (error) {
      setError('Ошибка загрузки тем: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDisciplines = async () => { // Добавлено
    try {
      const response = await apiClient.getDisciplines();
      setDisciplines(response.disciplines || response);
    } catch (error) {
      console.error('Ошибка загрузки дисциплин:', error);
      setError('Ошибка загрузки дисциплин: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    // Проверка обязательного поля
    if (!formData.discipline_id) {
      setError('Пожалуйста, выберите дисциплину');
      setFormLoading(false);
      return;
    }

    try {
      if (editingTopic) {
        await apiClient.updateTopic(editingTopic.id, formData);
      } else {
        await apiClient.createTopic(formData);
      }
      await loadTopics();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description,
      content: topic.content,
      discipline_id: topic.discipline_id || '' // Добавлено
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (topicId) => {
    if (!confirm('Вы уверены, что хотите удалить эту тему?')) return;
    try {
      await apiClient.deleteTopic(topicId);
      await loadTopics();
    } catch (error) {
      setError('Ошибка удаления темы: ' + error.message);
    }
  };

  const handlePreview = (content) => {
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      content: '',
      discipline_id: '' // Добавлено
    });
    setEditingTopic(null);
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
          <p className="text-gray-600">Загрузка тем...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Управление темами</h3>
          <p className="text-gray-600">Создавайте и редактируйте учебные материалы</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать тему
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? 'Редактировать тему' : 'Создать новую тему'}
              </DialogTitle>
              <DialogDescription>
                {editingTopic 
                  ? 'Внесите изменения в существующую тему'
                  : 'Заполните информацию для создания новой темы'
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
              
              {/* Добавлено поле выбора дисциплины */}
              <div className="space-y-2">
                <Label htmlFor="discipline_id">Дисциплина *</Label>
                <select
                  id="discipline_id"
                  value={formData.discipline_id}
                  onChange={(e) => setFormData({ ...formData, discipline_id: parseInt(e.target.value) || '' })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Выберите дисциплину</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Название темы *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название темы"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание темы"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="content">Содержание (Markdown) *</Label>
                <div data-color-mode="light" className="w-full border rounded-md overflow-hidden">
                  <MDEditor
                    id="content"
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value || '' })}
                    height={400}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Поддерживается Markdown разметка: **жирный**, *курсив*, # Заголовки, - списки и т.д.
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="ml-2"
                    onClick={() => handlePreview(formData.content)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Внешний предпросмотр
                  </Button>
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Отмена
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTopic ? 'Сохранить изменения' : 'Создать тему'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Предпросмотр содержимого</DialogTitle>
            <DialogDescription>
              Как будет отображаться содержимое темы
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-gray max-w-none p-4 border rounded-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {previewContent || 'Нет содержимого для отображения'}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      {error && !isDialogOpen && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Заданий: {topic.assignments_count || 0}</span>
                  <span>Автор: {topic.teacher_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">
                    {new Date(topic.created_at).toLocaleDateString('ru-RU')}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePreview(topic.content)}
                      title="Предпросмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(topic)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(topic.id)}
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
      
      {topics.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет созданных тем</h3>
            <p className="text-gray-600 mb-4">
              Создайте первую тему, чтобы начать добавлять учебные материалы
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать первую тему
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};