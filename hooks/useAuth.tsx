import { createContext, useContext } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  register: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Mock temporaire pour useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context) return context;

  return {
    user: {
      id: 1,
      name: 'Admin Test',
      email: 'admin@test.com',
      role: 'admin',
      status: 'active'
    },
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvcmVnaXN0ZXIiLCJpYXQiOjE3NTgyMTM2NTMsImV4cCI6MTc1ODMwMDA1MywibmJmIjoxNzU4MjEzNjUzLCJqdGkiOiJXUmZDN1JtNmJ0RnMzRVF5Iiwic3ViIjoiNSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.RqS_IEJpmq3pZV8nCoCMyU6FzyOVmw9e-yvlsETcDzQ',
    loading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {}
  };
};

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const useAuthProvider = () => ({
  user: {
    id: 1,
    name: 'Admin Test',
    email: 'admin@test.com',
    role: 'admin',
    status: 'active'
  },
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvcmVnaXN0ZXIiLCJpYXQiOjE3NTgyMTM2NTMsImV4cCI6MTc1ODMwMDA1MywibmJmIjoxNzU4MjEzNjUzLCJqdGkiOiJXUmZDN1JtNmJ0RnMzRVF5Iiwic3ViIjoiNSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.RqS_IEJpmq3pZV8nCoCMyU6FzyOVmw9e-yvlsETcDzQ',
  loading: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {}
});