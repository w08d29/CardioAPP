
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocalization } from '@/context/localization-context';

const formSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    let user = null;

    if (values.login === 'root' && values.password === 'Zxasqw12#') {
      user = { email: 'root@cardio.art', name: 'Admin', avatar: 'https://picsum.photos/seed/avatar1/200/200', is_admin: true };
    } else if (values.login === 'user' && values.password === 'password') {
        user = { email: 'user@cardio.art', name: 'Dr. Smith', avatar: 'https://picsum.photos/seed/avatar2/200/200', is_admin: false };
    } else if (values.login === 'Test' && values.password === 'Test') {
        user = { email: 'test@cardio.art', name: 'Test User', avatar: 'https://picsum.photos/seed/avatar3/200/200', is_admin: false };
    }

    if (user) {
      localStorage.setItem('cardioart_user', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      toast({
        title: 'Error',
        description: t('login.error'),
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.loginLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('login.loginPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('login.loading') : t('login.button')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
