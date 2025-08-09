import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Неверная или истекшая ссылка для восстановления. Пожалуйста, запросите новую.');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess('Пароль успешно изменён. Теперь вы можете войти с новым паролем.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.message || 'Не удалось изменить пароль. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center space-y-8 lg:space-y-0">
          <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">Сброс пароля</h2>
              <p className="text-lg text-gray-600">Придумайте новый надёжный пароль для входа в систему</p>
            </div>
          </div>

          <div className="w-full order-1 lg:order-2">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Новый пароль</CardTitle>
                <CardDescription>
                  Введите новый пароль. Ссылка действительна ограниченное время.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!token && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Неверная или истекшая ссылка. Запросите новую на странице «Забыли пароль?»
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4">
                    <AlertDescription className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" /> {success}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Новый пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Введите новый пароль"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Повторите пароль"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !token}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить пароль
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => navigate('/')}
                      className="text-sm"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Вернуться ко входу
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 