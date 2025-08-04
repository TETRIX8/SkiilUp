import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Target, Clock as ClockIcon } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export const AssignmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [assignmentsResponse, submissionsResponse] = await Promise.all([
          apiClient.getAssignments(),
          apiClient.getMySubmissions(),
        ]);
        setAssignments(assignmentsResponse.assignments || []);
        setSubmissions(submissionsResponse.submissions || []);
      } catch (err) {
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  const getAssignmentStatus = (assignment) => {
    const submission = getSubmissionForAssignment(assignment.id);
    if (!submission) return { label: 'Не выполнено', color: 'secondary' };
    if (submission.is_graded) return { label: 'Проверено', color: 'success' };
    return { label: 'Отправлено', color: 'default' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка заданий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Все задания
        </motion.h2>
        {error && (
          <div className="mb-6 text-center text-red-600 font-medium">{error}</div>
        )}
        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment, index) => {
              const status = getAssignmentStatus(assignment);
              const submission = getSubmissionForAssignment(assignment.id);
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="flex flex-col md:flex-row items-center justify-between p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex-1 w-full">
                      <h4 className="font-semibold text-gray-900 mb-1">{assignment.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{assignment.description?.substring(0, 80)}...</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          Макс. балл: {assignment.max_score}
                        </span>
                        {assignment.due_date && (
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 md:ml-6">
                      <Badge variant={status.color} className="text-xs mb-2 md:mb-0">{status.label}</Badge>
                      <Button
                        size="sm"
                        variant={submission ? "outline" : "default"}
                        onClick={() => navigate(`/assignments/${assignment.id}`)}
                      >
                        {submission ? "Просмотреть" : "Выполнить"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных заданий</h3>
            <p className="text-gray-500">Проверьте позже или свяжитесь с преподавателем</p>
          </div>
        )}
      </div>
    </div>
  );
}; 