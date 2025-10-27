import { useContext } from 'react';
import { UserAuthContext } from '../context/UserAuthContext'; 

export const useAuthStatus = () => {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error('useAuthStatus must be used within a UserAuthProvider');
    }
    return context;
};
