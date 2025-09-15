
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  email: string;
  name: string;
  avatar: string;
  is_admin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('cardioart_user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('cardioart_user');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const logout = () => {
    localStorage.removeItem('cardioart_user');
    setUser(null);
    router.push('/');
  };

  return { user, loading, logout };
}

export function useRequireAuth(redirectUrl = '/') {
    const { user, loading } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !user) {
        router.push(redirectUrl);
      }
    }, [user, loading, router, redirectUrl]);
  
    return { user, loading };
  }
