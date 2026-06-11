import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; 

const UserLoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [errorMessage, setErrorMessage] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    
    const { signIn } = useAuthStatus(); 
    const navigate = useNavigate();

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setErrorMessage(''); 
        setIsLoading(true);

        try {
            const user = await signIn(username, password); 
            if (user) {
                navigate('/'); 
            } else {
                setErrorMessage('Неверное имя пользователя или пароль. Пожалуйста, попробуйте снова.');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Неверное имя пользователя или пароль. Пожалуйста, попробуйте снова.'); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container"> 
            <h2 className="form-title">Вход в аккаунт</h2> 
            <form onSubmit={handleLoginSubmit} className="auth-form"> 
                {errorMessage && <p className="error-message">{errorMessage}</p>} 
                
                <div className="form-group">
                    <label htmlFor="username">Имя пользователя:</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        aria-label="Имя пользователя"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        aria-label="Пароль"
                        disabled={isLoading}
                    />
                </div>
                
                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
            </form>
            
            <p className="form-footer-text">
                Ещё нет аккаунта? <Link to="/register" className="link-text">Зарегистрироваться</Link>
            </p>
        </div>
    );
};

export default UserLoginPage;