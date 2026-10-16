import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '../types/student.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';
import { safeStorage } from '../utils/safeStorage.ts';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<AuthResult>;
  quickDemoLogin: () => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'academyos_admin_token';
const USER_KEY = 'academyos_admin_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error, info } = useToast();

  useEffect(() => {
    // Check safeStorage on mount
    try {
      const savedToken = safeStorage.getItem(TOKEN_KEY);
      const savedUser = safeStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      safeStorage.removeItem(TOKEN_KEY);
      safeStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResult> => {
    try {
      const cleanEmail = (email || '').trim();
      const cleanPass = (pass || '').trim();

      const response = await api.login(cleanEmail, cleanPass);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        
        safeStorage.setItem(TOKEN_KEY, response.token);
        safeStorage.setItem(USER_KEY, JSON.stringify(response.user));
        
        success('Logged In Successfully', `Welcome back, ${response.user.name}.`);
        return { success: true };
      }
      return { 
        success: false, 
        error: response.error || 'Authentication failed. Please verify credentials.' 
      };
    } catch (err: any) {
      const errMsg = err?.error || err?.message || 'Failed to authenticate administrator.';
      error('Authentication Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const quickDemoLogin = async (): Promise<AuthResult> => {
    return login('admin@academy.edu', 'admin123');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    safeStorage.removeItem(TOKEN_KEY);
    safeStorage.removeItem(USER_KEY);
    info('Logged Out', 'Your administrator session has ended.');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        isLoading,
        user,
        token,
        login,
        quickDemoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
