import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../../hooks/useAuthStatus';

const AppHeader: React.FC = () => {
    const { activeUser, signOut } = useAuthStatus();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        signOut();
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <Link to="/" className="app-logo">
                    <img src="/logo.png" alt="BookSwap Logo" className="logo-img" />
                    <div className="logo-text">
                        <span className="logo-title">BookTradeIlya</span>
                        <span className="logo-subtitle">Обменивайтесь книгами</span>
                    </div>
                </Link>
                
                <nav className="main-nav">
                    <div className="nav-links">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        >
                            <i className="fas fa-home"></i> Главная
                        </NavLink>
                        
                        {activeUser && (
                            <>
                                {activeUser.role === 'admin' && (
                                    <NavLink 
                                        to="/admin-dashboard" 
                                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                    >
                                        <i className="fas fa-cog"></i> Админ
                                    </NavLink>
                                )}
                                <NavLink 
                                    to="/my-profile" 
                                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                >
                                    <i className="fas fa-user"></i> Профиль
                                </NavLink>
                                <NavLink 
                                    to="/add-book" 
                                    className="nav-link add-book-btn"
                                >
                                    <i className="fas fa-plus-circle"></i> Добавить книгу
                                </NavLink>
                            </>
                        )}
                    </div>
                    
                    <div className="user-section">
                        {activeUser ? (
                            <div className="user-profile">
                                <div className="user-info">
                                    <span className="user-greeting">Привет, {activeUser.name}!</span>
                                    <div className="user-balance">
                                        <i className="fas fa-coins"></i> {activeUser.balance}₽
                                    </div>
                                </div>
                                <button 
                                    onClick={handleLogout} 
                                    className="logout-btn">Выйти
                                
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="auth-links">
                                <NavLink 
                                    to="/login" 
                                    className={({ isActive }) => isActive ? 'auth-link active' : 'auth-link'}
                                >
                                    Войти
                                </NavLink>
                                <NavLink 
                                    to="/register" 
                                    className={({ isActive }) => isActive ? 'auth-link register-btn' : 'auth-link register-btn'}
                                >
                                    Регистрация
                                </NavLink>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default AppHeader;