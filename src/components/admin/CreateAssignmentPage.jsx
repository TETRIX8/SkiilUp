import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '../../lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export const CreateAssignmentPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    topic_id: '',
    title: '',
    description: '',
    instructions: '',
    max_score: 100,
    due_date: ''
  });

  useEffect(() => {
    loadTopics();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic_id || !formData.title || !formData.instructions) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const submitData = {
        ...formData,
        topic_id: parseInt(formData.topic_id),
        max_score: parseInt(formData.max_score),
        due_date: formData.due_date || null
      };

      await apiClient.createAssignment(submitData);
      setSuccess('Задание успешно создано!');
      
      // Перенаправляем через 2 секунды
      setTimeout(() => {
        navigate('/admin/assignments');
      }, 2000);
    } catch (error) {
      setError('Ошибка создания задания: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибки при изменении полей
    if (error) setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-6"
          ></motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-medium text-gray-700"
          >
            Загрузка тем...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/assignments')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Назад</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Создание нового задания</h1>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="shadow-lg rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="shadow-lg rounded-xl border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="text-xl">Основная информация</CardTitle>
                  <CardDescription className="text-blue-100">
                    Заполните основную информацию о задании
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic_id" className="text-gray-700 font-medium">
                        Тема *
                      </Label>
                      <Select 
                        value={formData.topic_id} 
                        onValueChange={(value) => handleInputChange('topic_id', value)}
                        required
                      >
                        <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-indigo-500">
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
                      <Label htmlFor="title" className="text-gray-700 font-medium">
                        Название задания *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Введите название задания"
                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700 font-medium">
                      Краткое описание
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Краткое описание задания"
                      className="border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_score" className="text-gray-700 font-medium">
                        Максимальный балл
                      </Label>
                      <Input
                        id="max_score"
                        type="number"
                        min="1"
                        value={formData.max_score}
                        onChange={(e) => handleInputChange('max_score', e.target.value)}
                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-gray-700 font-medium">
                        Срок сдачи (необязательно)
                      </Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Instructions with Markdown Editor */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Инструкции для выполнения</CardTitle>
                      <CardDescription className="text-green-100">
                        Используйте Markdown для форматирования инструкций
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview ? 'Скрыть' : 'Показать'} предварительный просмотр
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Label className="text-gray-700 font-medium">
                      Инструкции *
                    </Label>
                    
                    {showPreview ? (
                      <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[400px]">
                        <div className="prose prose-sm max-w-none">
                          <MDEditor.Markdown 
                            source={formData.instructions} 
                            style={{ padding: 0 }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div data-color-mode="light">
                        <MDEditor
                          value={formData.instructions}
                          onChange={(value) => handleInputChange('instructions', value || '')}
                          height={400}
                          preview="edit"
                          className="border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mt-2">
                      <p className="font-medium mb-2">Поддерживаемые возможности Markdown:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>**жирный текст**</strong> и <em>*курсив*</em></li>
                        <li>Заголовки: # Заголовок 1, ## Заголовок 2</li>
                        <li>Списки: - элемент списка</li>
                        <li>Код: `код` или блоки кода</li>
                        <li>Ссылки: [текст](url)</li>
                        <li>Изображения: ![alt](url)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/assignments')}
                className="px-6 py-2"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Создать задание
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}; 