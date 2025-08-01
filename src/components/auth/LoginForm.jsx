import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

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

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
        <CardDescription className="text-base">
          Введите ваши данные для входа в образовательную платформу
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                placeholder="Ваш пароль"
                value={formData.password}
                onChange={handleChange}
                className="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Войти
          </Button>

          <div className="text-center space-y-3">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToForgotPassword}
              className="text-base h-auto p-2"
            >
              Забыли пароль?
            </Button>
            
            <div className="text-base text-muted-foreground">
              Нет аккаунта?{' '}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                className="p-0 h-auto font-medium text-base"
              >
                Зарегистрироваться
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

