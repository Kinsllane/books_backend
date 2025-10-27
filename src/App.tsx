// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import AddBookFormPage from './pages/AddBookFormPage';
import EditBookFormPage from './pages/EditBookFormPage';
import ProposeTradePage from './pages/ProposeTradePage';
import UserProfilePage from './pages/UserProfilePage';
import AuthWrapper from './components/auth/AuthWrapper';
import PaymentPage from './pages/PaymentPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App: React.FC = () => {
    return (
        <div className="app-container">
            <AppHeader />
            <main className="app-main-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/book/:id" element={<BookDetailsPage />} />
                    <Route path="/login" element={<UserLoginPage />} />
                    <Route path="/register" element={<UserRegisterPage />} />
                    <Route path="/user-profile/:id" element={<UserProfilePage />} /> 

                    <Route
                        path="/add-book"
                        element={
                            <AuthWrapper>
                                <AddBookFormPage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/edit-book/:id"
                        element={
                            <AuthWrapper>
                                <EditBookFormPage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/propose-trade/:bookId"
                        element={
                            <AuthWrapper>
                                <ProposeTradePage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/my-profile"
                        element={
                            <AuthWrapper>
                                <UserProfilePage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/payment"
                        element={
                            <AuthWrapper>
                                <PaymentPage />
                            </AuthWrapper>
                        }
                    />
                    <Route
                        path="/admin-dashboard"
                        element={
                            <AuthWrapper>
                                <AdminDashboardPage />
                            </AuthWrapper>
                        }
                    />

                    <Route path="*" element={<h1 className="page-title">404: Страница не найдена</h1>} />
                </Routes>
            </main>
            <AppFooter />
        </div>
    );
};

export default App;
