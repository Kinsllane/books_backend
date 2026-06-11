import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types/appTypes';
import api from '../services/api';

interface UserAuthContextType {
  activeUser: UserProfile | null;
  signIn: (username: string, pass: string) => Promise<UserProfile | null>;
  signOut: () => void;
  setActiveUser: (user: UserProfile | null) => void;
  isLoading: boolean;
}

export const UserAuthContext = createContext<UserAuthContextType>({
  activeUser: null,
  signIn: async () => null,
  signOut: () => {},
  setActiveUser: () => {},
  isLoading: true,
});

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // При загрузке проверить токен и получить профиль
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const user = await api.getProfile();
          // Преобразуем формат API в UserProfile
          const userProfile: UserProfile = {
            id: user.id,
            name: user.name,
            balance: typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance,
            registrationDate: user.registrationDate,
            role: user.role,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
          };
          setActiveUser(userProfile);
        } catch (error) {
          console.error('Failed to restore session:', error);
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('activeUserSession', JSON.stringify(activeUser));
    } else {
      localStorage.removeItem('activeUserSession');
    }
  }, [activeUser]);

  const signIn = useCallback(async (username: string, pass: string): Promise<UserProfile | null> => {
    try {
      const data = await api.login(username, pass);
      const userProfile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        balance: typeof data.user.balance === 'string' ? parseFloat(data.user.balance) : data.user.balance,
        registrationDate: data.user.registrationDate,
        role: data.user.role,
        avatarUrl: data.user.avatarUrl,
        bio: data.user.bio,
      };
      setActiveUser(userProfile);
      return userProfile;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    api.setToken(null);
    setActiveUser(null);
  }, []);

  return (
    <UserAuthContext.Provider value={{ activeUser, signIn, signOut, setActiveUser, isLoading }}>
      {children}
    </UserAuthContext.Provider>
  );
};