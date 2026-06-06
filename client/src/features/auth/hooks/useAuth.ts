import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextDef';

/**
 * Hook that consumes the AuthContext to access the current authentication state and actions.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}