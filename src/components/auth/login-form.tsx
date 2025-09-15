
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
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLocalization();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if ((values.email === 'user@cardio.art' && values.password === 'password') || (values.email === 'root' && values.password === 'Zxasqw12#')) {
      // In a real app, you'd get a token from the server
      const is_admin = values.email === 'root';
      const user = { email: values.email, name: is_admin ? 'Admin' : 'Dr. Smith', avatar: 'https://picsum.photos/seed/avatar1/200/200', is_admin };
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('login.emailPlaceholder')} {...field} />
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
