import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      setSuccess('Регистрация успешна! Ожидайте подтверждения администратора для доступа к системе.');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
        <CardDescription className="text-base">
          Создайте аккаунт для доступа к образовательной платформе
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="first_name" className="text-base font-medium">Имя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="Имя"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="pl-12 h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="last_name" className="text-base font-medium">Фамилия</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Фамилия"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="pl-12 h-12 text-base"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-medium">Пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={formData.password}
                onChange={handleChange}
                className="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-base font-medium">Подтвердите пароль</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Зарегистрироваться
          </Button>

          <div className="text-center">
            <div className="text-base text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToLogin}
                className="p-0 h-auto font-medium text-base"
              >
                Войти
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

