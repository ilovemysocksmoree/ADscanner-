import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CompanyTheme {
  name: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  email: string;
  logo?: string;
}

interface CompanyThemeContextType {
  companyTheme: CompanyTheme;
  updateCompanyTheme: (theme: Partial<CompanyTheme>) => void;
}

const defaultTheme: CompanyTheme = {
  name: 'ADScanner',
  companyName: 'ADScanner',
  primaryColor: '#2196f3',
  secondaryColor: '#f50057',
  email: 'contact@adscanner.com',
  logo: undefined
};

const CompanyThemeContext = createContext<CompanyThemeContextType>({
  companyTheme: defaultTheme,
  updateCompanyTheme: () => {}
});

export const useCompanyTheme = () => useContext(CompanyThemeContext);

interface CompanyThemeProviderProps {
  children: ReactNode;
}

export const CompanyThemeProvider: React.FC<CompanyThemeProviderProps> = ({ children }) => {
  const [companyTheme, setCompanyTheme] = useState<CompanyTheme>(() => {
    const savedTheme = localStorage.getItem('companyTheme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('companyTheme', JSON.stringify(companyTheme));
  }, [companyTheme]);

  const updateCompanyTheme = (theme: Partial<CompanyTheme>) => {
    setCompanyTheme(prevTheme => ({
      ...prevTheme,
      ...theme
    }));
  };

  return (
    <CompanyThemeContext.Provider value={{ companyTheme, updateCompanyTheme }}>
      {children}
    </CompanyThemeContext.Provider>
  );
}; 