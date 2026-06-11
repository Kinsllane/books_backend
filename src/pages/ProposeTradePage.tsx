import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; 
import api from '../services/api';

const ProposeTradePage: React.FC = () => {
    const { bookId: targetBookId } = useParams<{ bookId: string }>(); 
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus(); 

    const [targetBook, setTargetBook] = useState<any>(null); 
    const [myTradableBooks, setMyTradableBooks] = useState<any[]>([]); 
    const [selectedMyBookId, setSelectedMyBookId] = useState<string>(''); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!targetBookId) {
                setErrorMessage('ID книги не указан');
                setIsLoading(false);
                return;
            }

            try {
                // Получаем целевую книгу
                const book = await api.getBookById(targetBookId);
                setTargetBook(book);

                // Получаем свои книги
                const myBooks = await api.getMyBooks();
                const tradable = myBooks.filter((b: any) => b.isForTrade);
                setMyTradableBooks(tradable);

                if (tradable.length > 0) {
                    setSelectedMyBookId(tradable[0].id);
                }
            } catch (err: any) {
                setErrorMessage(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [targetBookId, activeUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!activeUser) {
            setErrorMessage('Вы не авторизованы.');
            return;
        }

        if (!targetBookId || !selectedMyBookId) {
            setErrorMessage('Пожалуйста, выберите свою книгу для обмена.');
            return;
        }

        if (targetBook?.currentOwner.id === activeUser.id) {
            setErrorMessage('Вы не можете обменять книгу сами с собой.');
            return;
        }

        try {
            await api.proposeTrade(selectedMyBookId, targetBookId);
            setSuccessMessage('Предложение обмена отправлено! Вы будете перенаправлены на главную страницу.');
            setTimeout(() => navigate('/'), 3000);
        } catch (err: any) {
            setErrorMessage(err.message);
        }
    };

    if (isLoading) {
        return <div className="page-message">Загрузка...</div>;
    }

    if (!targetBook) {
        return <div className="page-message">Книга не найдена.</div>;
    }

    if (myTradableBooks.length === 0) {
        return (
            <div className="form-container">
                <h2 className="form-title">Предложение обмена</h2>
                <p className="info-message">У вас нет книг, доступных для обмена.</p>
                <p className="info-message">Вы можете <Link to="/add-book" className="link-text">добавить книгу</Link> и пометить её как доступную для обмена.</p>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Предложение обмена</h2>
            <p className="info-message">Вы хотите обменять одну из своих книг на <strong>"{targetBook.title}"</strong> автора {targetBook.author}.</p>

            <form onSubmit={handleSubmit} className="trade-form">
                <div className="form-group">
                    <label htmlFor="myBook">Выберите вашу книгу для обмена:</label>
                    <select
                        id="myBook"
                        value={selectedMyBookId}
                        onChange={e => setSelectedMyBookId(e.target.value)}
                        required
                        aria-label="Моя книга для обмена"
                    >
                        {myTradableBooks.map((book) => ( 
                            <option key={book.id} value={book.id}>
                                {book.title} - {book.author}
                            </option>
                        ))}
                    </select>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <button type="submit" className="submit-button" disabled={!!successMessage}>
                    Отправить предложение
                </button>
            </form>
        </div>
    );
};

export default ProposeTradePage;