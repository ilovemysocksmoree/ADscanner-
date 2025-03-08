import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
];

type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: Language[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      const parsed = JSON.parse(savedLanguage);
      i18n.changeLanguage(parsed.code); // Initialize i18n with saved language
      return parsed;
    }
    // Default to English
    i18n.changeLanguage('en');
    return languages[0];
  });

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language.code);
    localStorage.setItem('language', JSON.stringify(language));
    document.documentElement.lang = language.code;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage: handleLanguageChange,
      availableLanguages: languages,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 