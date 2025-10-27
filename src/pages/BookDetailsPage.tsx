import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import {
    retrieveBookById,
    addReviewToBook,
    addQuoteToBook,
    purchaseBook,
    availableBooks,
} from '../data/appData';

import ReviewForm from '../components/forms/ReviewForm';
import QuoteForm from '../components/forms/QuoteForm';

const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeUser, setActiveUser } = useAuthStatus();

    const [book, setBook] = useState(() => retrieveBookById(id));
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);

    useEffect(() => {
        setBook(retrieveBookById(id));
    }, [id, availableBooks]);

    const handleAddReview = (text: string) => {
        if (activeUser && book) {
            addReviewToBook(book.id, text, activeUser);
            setBook(retrieveBookById(book.id));
            setShowReviewForm(false);
        }
    };

    const handleAddQuote = (text: string) => {
        if (activeUser && book) {
            addQuoteToBook(book.id, text, activeUser);
            setBook(retrieveBookById(book.id));
            setShowQuoteForm(false);
        }
    };

    const handleBuyBook = () => {
        if (!activeUser) {
            alert('Пожалуйста, войдите в систему, чтобы совершить покупку.');
            navigate('/login');
            return;
        }
        if (!book || !book.isForSale || !book.priceValue) {
            alert('Эта книга недоступна для покупки.');
            return;
        }

        const result = purchaseBook(book.id, activeUser.id);
        if (result.success) {
            alert(result.message);
            setBook(result.book || retrieveBookById(book.id));
            if (result.buyer) {
                const { password, ...userToStore } = result.buyer;
                setActiveUser(userToStore);
            }
        } else {
            alert(result.message);
        }
    };

    const handleProposeTrade = () => {
        if (!activeUser) {
            alert('Пожалуйста, войдите в систему, чтобы предложить обмен.');
            navigate('/login');
            return;
        }
        if (book) {
            navigate(`/propose-trade/${book.id}`);
        }
    };

    if (!book) {
        return <div className="page-message">Книга не найдена.</div>;
    }
    const isOwner = activeUser?.id === book.currentOwner.id;
    const coverPath =
        book.coverImageUrl.startsWith('http') || book.coverImageUrl.startsWith('data:image/')
            ? book.coverImageUrl
            : `/${book.coverImageUrl}`;

    return (
        <div className="book-detail-page">
            <div className="book-main-info">
                <div className="book-cover-area">
                    <img src={coverPath} alt={`Обложка ${book.title}`} className="book-cover-large" />
                </div>
                <div className="book-text-info">
                    <h1 className="book-title">{book.title}</h1>
                    <h2 className="book-author">{book.author}</h2>
                    <p className="book-owner">
                        <strong>Владелец:</strong>{' '}
                        <Link to={`/user-profile/${book.currentOwner.id}`}>{book.currentOwner.name}</Link>{' '}
                        {/* <-- ИЗМЕНЕНИЕ ЗДЕСЬ */}
                    </p>
                    {book.isForSale && book.priceValue && (
                        <p className="book-price">
                            <strong>Цена:</strong> {book.priceValue}₽
                        </p>
                    )}
                    <p className="book-description">{book.description}</p>
                    <p className="book-publication-year">
                        <strong>Год публикации:</strong> {book.publicationYear}
                    </p>
                    <p className="book-genre">
                        <strong>Жанр:</strong> {book.genre} {/* <-- ОТОБРАЖАЕМ ЖАНР */}
                    </p>

                    <div className="book-actions">
                        {book.isForSale && !isOwner && (
                            <button onClick={handleBuyBook} className="action-button buy-button">
                                Купить
                            </button>
                        )}
                        {book.isForTrade && !isOwner && (
                            <button onClick={handleProposeTrade} className="action-button trade-button">
                                Предложить обмен
                            </button>
                        )}
                        {isOwner && (
                            <>
                                <p className="owner-message">
                                    <em>Это ваша книга.</em>
                                </p>
                                <Link
                                    to={`/edit-book/${book.id}`}
                                    className="action-button primary-button edit-button"
                                >
                                    Редактировать
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="book-additional-sections">
                <section className="reviews-section">
                    <h3 className="section-title">Рецензии</h3>
                    {book.reviews.length > 0 ? (
                        book.reviews.map((review) => (
                            <div key={review.id} className="content-card review-card">
                                <p className="content-text">"{review.text}"</p>
                                <div className="content-author">
                                    -{' '}
                                    <Link to={`/user-profile/${review.reviewer.id}`}>
                                        {review.reviewer.name}
                                    </Link>{' '}
                                    {/* <-- ИЗМЕНЕНИЕ ЗДЕСЬ */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-content-message">Рецензий пока нет.</p>
                    )}
                    {activeUser &&
                        (!showReviewForm ? (
                            <button onClick={() => setShowReviewForm(true)} className="add-content-button">
                                Добавить рецензию
                            </button>
                        ) : (
                            <ReviewForm onSubmit={handleAddReview} onCancel={() => setShowReviewForm(false)} />
                        ))}
                </section>

                <section className="quotes-section">
                    <h3 className="section-title">Цитаты</h3>
                    {book.quotes.length > 0 ? (
                        book.quotes.map((quote) => (
                            <div key={quote.id} className="content-card quote-card">
                                <p className="content-text">"{quote.text}"</p>
                                <div className="content-author">
                                    -{' '}
                                    <Link to={`/user-profile/${quote.quoter.id}`}>
                                        {quote.quoter.name}
                                    </Link>{' '}
                                    {/* <-- ИЗМЕНЕНИЕ ЗДЕСЬ */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-content-message">Цитат пока нет.</p>
                    )}
                    {activeUser &&
                        (!showQuoteForm ? (
                            <button onClick={() => setShowQuoteForm(true)} className="add-content-button">
                                Добавить цитату
                            </button>
                        ) : (
                            <QuoteForm onSubmit={handleAddQuote} onCancel={() => setShowQuoteForm(false)} />
                        ))}
                </section>
            </div>
        </div>
    );
};

export default BookDetailsPage;
