import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus'; 
import {
    retrieveBookById,
    createNewTradeProposal, 
    availableBooks 
} from '../data/appData'; 
import type { BookEntry } from '../types/appTypes'; 

const ProposeTradePage: React.FC = () => {
    const { bookId: targetBookId } = useParams<{ bookId: string }>(); 
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus(); 

    const [targetBook, setTargetBook] = useState<BookEntry | null>(null); 
    const [myTradableBooks, setMyTradableBooks] = useState<BookEntry[]>([]); 
    const [selectedMyBookId, setSelectedMyBookId] = useState<string>(''); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const getBooksByOwnerId = (ownerId: string): BookEntry[] => {
        return availableBooks.filter(book => book.currentOwner.id === ownerId);
    };

    useEffect(() => {
        const foundTargetBook = retrieveBookById(targetBookId); 
        if (foundTargetBook) {
            setTargetBook(foundTargetBook);
        } else {
            setErrorMessage('Целевая книга для обмена не найдена.');
            return;
        }

        if (activeUser) {
            const userBooks = getBooksByOwnerId(activeUser.id).filter((book: BookEntry) => book.isForTrade); 
            setMyTradableBooks(userBooks);
            if (userBooks.length > 0) {
                setSelectedMyBookId(userBooks[0].id);
            }
        }
    }, [targetBookId, activeUser, availableBooks]); 

    const handleSubmit = (e: React.FormEvent) => {
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

        const result = createNewTradeProposal(activeUser.id, selectedMyBookId, targetBookId);

        if (result.success) {
            setSuccessMessage(result.message + ' Вы будете перенаправлены на главную страницу.');
            setTimeout(() => navigate('/'), 3000);
        } else {
            setErrorMessage(result.message);
        }
    };

    if (!targetBook) {
        return <div className="page-message">Загрузка или книга не найдена...</div>;
    }

    if (myTradableBooks.length === 0) {
        return (
            <div className="form-container">
                <h2 className="form-title">Предложение обмена</h2>
                <p className="info-message">У вас нет книг, доступных для обмена.</p>
                <p className="info-message">Вы можете <Link to="/add-book" className="link-text">добавить книгу</Link> и пометить ее как доступную для обмена.</p>
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
                        {myTradableBooks.map((book: BookEntry) => ( 
                            <option key={book.id} value={book.id}>
                                {book.title}
                            </option>
                        ))}
                    </select>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <button type="submit" className="submit-button" disabled={!!successMessage}>Отправить предложение</button>
            </form>
        </div>
    );
};

export default ProposeTradePage;
