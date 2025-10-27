import React from 'react';
import { FaHeart, FaGithub, FaTelegram, FaBook } from 'react-icons/fa';

const AppFooter: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <FaBook className="logo-icon" />
                            <span>BookTradeIlya</span>
                        </div>
                        <p className="footer-slogan">
                            Крупнейшая платформа для обмена книгами между любителями чтения
                        </p>
                        <div className="social-links">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                                <FaGithub className="social-icon" />
                            </a>
                            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer">
                                <FaTelegram className="social-icon" />
                            </a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <div className="links-column">
                            <h4 className="links-title">Навигация</h4>
                            <ul>
                                <li><a href="/">Главная</a></li>
                                <li><a href="/catalog">Каталог книг</a></li>
                                <li><a href="/how-it-works">Как это работает</a></li>
                                <li><a href="/faq">FAQ</a></li>
                            </ul>
                        </div>
                        <div className="links-column">
                            <h4 className="links-title">Помощь</h4>
                            <ul>
                                <li><a href="/support">Поддержка</a></li>
                                <li><a href="/rules">Правила сервиса</a></li>
                                <li><a href="/privacy">Политика конфиденциальности</a></li>
                                <li><a href="/contacts">Контакты</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        &copy; {new Date().getFullYear()} BookTradeIlya. Все права защищены.
                    </div>
                    <div className="made-with">
                        Разработано с <FaHeart className="heart-icon" /> для любителей книг
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;