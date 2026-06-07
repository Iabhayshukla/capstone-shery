/**
 * AuthContextDef.ts — Defines the AuthContext and its type.
 * Kept in a separate file from the AuthProvider so that fast refresh
 * works correctly: AuthContext.tsx can export only the component,
 * while this file exports only the context and its type.
 */
import { createContext } from 'react';
import type { AuthUser, LoginCredentials, SignUpCredentials } from '../types/auth.types';

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
