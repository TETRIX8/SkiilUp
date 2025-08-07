import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  FileText,
  Clock,
  Target
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiClient } from '../../lib/api';

export const AssignmentManager = ({ onStatsUpdate }) => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleDelete = async (assignmentId) => {
    try {
      await apiClient.deleteAssignment(assignmentId);
      await loadData();
      if (onStatsUpdate) onStatsUpdate();
    } catch (error) {
      setError('Ошибка удаления: ' + error.message);
    }
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.title : 'Неизвестная тема';
  };

  const getAssignmentStatus = (assignment) => {
    if (assignment.is_overdue) {
      return { label: 'Просрочено', color: 'destructive' };
    }
    return { label: 'Активно', color: 'default' };
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
        
        <Button 
          onClick={() => navigate('/admin/assignments/create')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать задание
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => {
          const status = getAssignmentStatus(assignment);
          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="bg-indigo-100 p-3 rounded-xl">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <Badge variant={status.color} className="text-xs">
                      {status.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight mt-4 group-hover:text-indigo-600 transition-colors duration-300">
                    {assignment.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {assignment.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="h-4 w-4 mr-2" />
                      <span>Макс. балл: {assignment.max_score}</span>
                    </div>
                    {assignment.due_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Срок: {new Date(assignment.due_date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Тема:</span> {getTopicName(assignment.topic_id)}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить задание?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Задание будет удалено навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(assignment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">Задания пока не созданы</h3>
          <p className="text-gray-400">Создайте первое задание для учеников</p>
        </motion.div>
      )}
    </div>
  );
};

