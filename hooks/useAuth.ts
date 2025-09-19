'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authApi, ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'lister';
  phone?: string;
  company?: string;
  about?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('auth_token');
    console.log('Initializing auth, token found:', !!storedToken);

    if (storedToken) {
      setToken(storedToken);
      try {
        console.log('Attempting to fetch user profile...');
        const userData = await authApi.getProfile();
        console.log('User profile fetched successfully:', userData);
        setUser(userData as any);

        // Redirection automatique pour les admins
        if (userData.role === 'admin' && !window.location.pathname.startsWith('/admin')) {
          console.log('Admin user detected, redirecting to admin dashboard');
          setTimeout(() => router.push('/admin'), 100);
        }

        // Redirection automatique pour les listers
        if (userData.role === 'lister' && !window.location.pathname.startsWith('/dashboard') && !window.location.pathname.startsWith('/admin')) {
          console.log('Lister user detected, redirecting to dashboard');
          setTimeout(() => router.push('/dashboard'), 100);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      }
    } else {
      console.log('No token found, user not authenticated');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user as any);
      setToken(response.token);

      // Redirection automatique après login
      if (response.user.role === 'admin') {
        console.log('Admin login detected, redirecting to admin dashboard');
        setTimeout(() => router.push('/admin'), 100);
      } else if (response.user.role === 'lister') {
        console.log('Lister login detected, redirecting to dashboard');
        setTimeout(() => router.push('/dashboard'), 100);
      } else {
        // Pour les clients, rediriger vers l'accueil
        setTimeout(() => router.push('/'), 100);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterUserData) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        role: userData.role,
        phone: userData.phone,
        company: userData.company,
        about: userData.about,
      });
      setUser(response.user as any);
      setToken(response.token);

      // Redirection automatique après inscription
      if (response.user.role === 'admin') {
        console.log('Admin registration detected, redirecting to admin dashboard');
        setTimeout(() => router.push('/admin'), 100);
      } else if (response.user.role === 'lister') {
        console.log('Lister registration detected, redirecting to dashboard');
        setTimeout(() => router.push('/dashboard'), 100);
      } else {
        // Pour les clients, rediriger vers l'accueil
        setTimeout(() => router.push('/'), 100);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors) {
          const errorMessages = Object.values(error.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(error.message);
      }
      throw new Error('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData as any);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  return {
    user,
    token,
    login,
    register,
    logout,
    loading,
    refreshUser,
  };
}

export { AuthContext };
export type { RegisterUserData };