import React, { createContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/appTypes';
import { authenticateUser, findUserById } from '../data/appData'; 
interface UserAuthContextType {
    activeUser: UserProfile | null;
    signIn: (username: string, pass: string) => UserProfile | null;
    signOut: () => void;
    setActiveUser: (user: UserProfile | null) => void;
}
export const UserAuthContext = createContext<UserAuthContextType>({
    activeUser: null,
    signIn: () => null,
    signOut: () => {},
    setActiveUser: () => {}
});
export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeUser, setActiveUser] = useState<UserProfile | null>(() => {
        const storedUser = localStorage.getItem('activeUserSession');
        try {
            if (storedUser) {
                const parsedUser: UserProfile = JSON.parse(storedUser);
                const foundUser = findUserById(parsedUser.id);
                if (foundUser) {
                    return { ...foundUser }; 
                }
            }
            return null; 
        } catch (error) {
            console.error("Failed to parse stored user from localStorage:", error);
            return null;
        }
    });

    useEffect(() => {
        if (activeUser) {
            const { password, ...userToStore } = activeUser;
            localStorage.setItem('activeUserSession', JSON.stringify(userToStore));
        } else {
            localStorage.removeItem('activeUserSession');
        }
    }, [activeUser]);
    const signIn = (username: string, pass: string): UserProfile | null => {
        const user = authenticateUser(username, pass);
        if (user) {
            const { password, ...userToStore } = user;
            setActiveUser(userToStore);
            return userToStore;
        }
        return null;
    };
    const signOut = () => {
        setActiveUser(null);
    };
    return (
        <UserAuthContext.Provider value={{ activeUser, signIn, signOut, setActiveUser }}>
            {children}
        </UserAuthContext.Provider>
    );
};
