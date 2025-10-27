import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; 
import { findUserByUsername, registerNewUser } from '../data/appData'; 

const UserRegisterPage: React.FC = () => {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [errorMessage, setErrorMessage] = useState(''); 
    
    const { setActiveUser } = useAuthStatus(); 
    const navigate = useNavigate(); 
    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault(); 
        setErrorMessage(''); 

        if (password !== confirmPassword) {
            setErrorMessage('Пароли не совпадают. Пожалуйста, проверьте.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Пароль должен быть не менее 6 символов.');
            return;
        }

        if (findUserByUsername(username)) {
            setErrorMessage('Пользователь с таким именем уже существует. Пожалуйста, выберите другое имя.');
            return;
        }

        const newUser = registerNewUser(username, password);
        
        const { password: _, ...userToStore } = newUser; 
        setActiveUser(userToStore);

        alert('Регистрация прошла успешно! Вы вошли в систему.'); 
        navigate('/'); 
    };

    return (
        <div className="form-container"> 
            <h2 className="form-title">Регистрация нового аккаунта</h2> 
            <form onSubmit={handleRegisterSubmit} className="auth-form"> 
                {errorMessage && <p className="error-message">{errorMessage}</p>} 
                
                <div className="form-group">
                    <label htmlFor="reg-username">Имя пользователя:</label>
                    <input 
                        type="text" 
                        id="reg-username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        aria-label="Имя пользователя"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="reg-password">Пароль:</label>
                    <input 
                        type="password" 
                        id="reg-password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        aria-label="Пароль"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirm-password">Подтвердите пароль:</label>
                    <input 
                        type="password" 
                        id="confirm-password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        aria-label="Подтвердите пароль"
                    />
                </div>
                
                <button type="submit" className="submit-button">Зарегистрироваться</button>
            </form>
            
            <p className="form-footer-text">
                Уже есть аккаунт? <Link to="/login" className="link-text">Войти</Link>
            </p>
        </div>
    );
};

export default UserRegisterPage;
