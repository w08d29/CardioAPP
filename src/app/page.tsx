import { LoginForm } from '@/components/auth/login-form';
import { HeartPulse } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">CardioArt</h1>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 bg-secondary/40">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      <footer className="p-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CardioArt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
