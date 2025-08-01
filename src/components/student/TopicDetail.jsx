import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Импортируем framer-motion для анимаций
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Варианты анимаций
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Задержка между анимациями дочерних элементов
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

export const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [topic, setTopic] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTopicData();
  }, [id]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const [topicResponse, assignmentsResponse, submissionsResponse] = await Promise.all([
        apiClient.getTopic(id),
        apiClient.getAssignments(),
        apiClient.getMySubmissions()
      ]);

      setTopic(topicResponse.topic);
      // Filter assignments for this topic
      const topicAssignments = assignmentsResponse.assignments?.filter(
        assignment => assignment.topic_id === parseInt(id)
      ) || [];
      setAssignments(topicAssignments);
      setSubmissions(submissionsResponse.submissions || []);
    } catch (error) {
      setError('Ошибка загрузки данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  const getAssignmentStatus = (assignment) => {
    const submission = getSubmissionForAssignment(assignment.id);
    if (submission) {
      if (submission.is_graded) {
        return { status: 'graded', label: 'Оценено', color: 'default' };
      }
      return { status: 'submitted', label: 'Отправлено', color: 'secondary' };
    }
    if (assignment.is_overdue) {
      return { status: 'overdue', label: 'Просрочено', color: 'destructive' };
    }
    return { status: 'pending', label: 'Ожидает выполнения', color: 'outline' };
  };

  // Проверяем, завершена ли тема (все задания выполнены)
  const isTopicCompleted = () => {
    if (assignments.length === 0) return false;
    return assignments.every(assignment => {
      const submission = getSubmissionForAssignment(assignment.id);
      return submission && submission.is_graded;
    });
  };

  // Записываем достижение за завершение темы
  const recordTopicCompletion = async () => {
    if (isTopicCompleted()) {
      try {
        await apiClient.recordTopicCompletion(parseInt(id));
      } catch (error) {
        console.error('Error recording topic completion:', error);
      }
    }
  };

  // Проверяем завершение темы при изменении данных
  useEffect(() => {
    if (!loading && assignments.length > 0) {
      recordTopicCompletion();
    }
  }, [assignments, submissions, loading]);

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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
            Загрузка...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Alert variant="destructive" className="max-w-md shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Alert className="max-w-md shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Тема не найдена</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" // Градиентный фон
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm" // Стекло, тень, закрепление
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="mr-2 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-md" // Градиент, тень
              >
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl font-bold text-gray-900 truncate bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700" // Градиентный текст
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
                className="border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm" // Тень при наведении
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Header */}
        <motion.div
          variants={itemVariants}
          className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200" // Карточка с тенью и рамкой
        >
          <div className="flex items-start space-x-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="bg-blue-100 p-3 rounded-lg" // Фон и скругление
            >
              <BookOpen className="h-8 w-8 text-blue-600" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-gray-900"
              >
                {topic.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mt-3 text-lg"
              >
                {topic.description}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Topic Content with Markdown Support */}
        {topic.content && (
          <motion.div variants={itemVariants}>
            <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"> {/* Тень и анимация */}
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-xl font-semibold text-gray-800">Материалы темы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none p-6 bg-white rounded-lg">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <motion.h1 variants={itemVariants} className="text-3xl font-bold mt-6 mb-4 text-gray-900" {...props} />,
                      h2: ({node, ...props}) => <motion.h2 variants={itemVariants} className="text-2xl font-bold mt-5 mb-3 text-gray-800" {...props} />,
                      h3: ({node, ...props}) => <motion.h3 variants={itemVariants} className="text-xl font-bold mt-4 mb-2 text-gray-700" {...props} />,
                      p: ({node, ...props}) => <motion.p variants={itemVariants} className="mb-4 leading-relaxed text-gray-600" {...props} />,
                      ul: ({node, ...props}) => <motion.ul variants={itemVariants} className="list-disc list-inside mb-4 space-y-2 text-gray-600" {...props} />,
                      ol: ({node, ...props}) => <motion.ol variants={itemVariants} className="list-decimal list-inside mb-4 space-y-2 text-gray-600" {...props} />,
                      li: ({node, ...props}) => <motion.li variants={itemVariants} className="ml-4" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600" {...props} />,
                      table: ({node, ...props}) => <table className="min-w-full border-collapse border border-gray-300 my-4 rounded-lg overflow-hidden shadow-sm" {...props} />,
                      th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold text-gray-700" {...props} />,
                      td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2 text-gray-600" {...props} />,
                    }}
                  >
                    {topic.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Assignments Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 mb-6 flex items-center"
          >
            Задания по теме ({assignments.length})
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full"
            >
              {assignments.length}
            </motion.span>
          </motion.h3>
          {assignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="shadow-md">
                <CardContent className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  По этой теме пока нет заданий
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment);
                const submission = getSubmissionForAssignment(assignment.id);
                return (
                  <motion.div
                    key={assignment.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} // Подъем и тень при наведении
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300"
                  >
                    <CardContent
                      className="p-5 sm:p-6 cursor-pointer"
                      onClick={() => handleAssignmentClick(assignment.id)}
                    >
                      <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-start">
                        <div className="flex-1">
                          <motion.h4
                            variants={itemVariants}
                            className="text-lg font-semibold text-gray-900 mb-2"
                          >
                            {assignment.title}
                          </motion.h4>
                          <motion.p
                            variants={itemVariants}
                            className="text-gray-600 mb-3"
                          >
                            {assignment.description}
                          </motion.p>
                          <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500"
                          >
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1.5 text-gray-400" />
                              Максимальный балл: {assignment.max_score}
                            </span>
                            {assignment.due_date && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                                Срок: {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                              </span>
                            )}
                            {submission && submission.is_graded && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center text-green-600 font-medium"
                              >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Оценка: {submission.score}/{assignment.max_score}
                              </motion.span>
                            )}
                          </motion.div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0">
                          <Badge
                            variant={status.color}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status.status === 'graded'
                                ? 'bg-green-100 text-green-800'
                                : status.status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : status.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {status.label}
                          </Badge>
                          <Button
                            size="sm"
                            variant={submission ? "outline" : "default"}
                            className={`transition-all duration-200 ${
                              submission
                                ? 'border-blue-500 text-blue-600 hover:bg-blue-50'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {submission ? "Просмотреть" : "Выполнить"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>
    </motion.div>
  );
};