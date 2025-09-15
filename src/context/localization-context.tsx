
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';

const translations = { en, ru };

type Language = 'en' | 'ru';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string,
    ...args: any[]) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('cardioart_lang') as Language;
    if (storedLang && ['en', 'ru'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('cardioart_lang', lang);
  };
  
  const t = useCallback((key: string, ...args: any[]): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key;
      }
    }

    if (typeof result === 'string' && args.length > 0) {
      return result.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    }
    
    return result || key;
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
