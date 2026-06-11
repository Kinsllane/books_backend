import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import api from '../services/api';
import type { BookEntry } from '../types/appTypes';

import ReviewForm from '../components/forms/ReviewForm';
import QuoteForm from '../components/forms/QuoteForm';

const BookDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeUser, setActiveUser } = useAuthStatus();

    const [book, setBook] = useState<BookEntry | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await api.getBookById(id);
                setBook({
                    id: data.id,
                    title: data.title,
                    author: data.author,
                    description: data.description,
                    coverImageUrl: data.coverImageUrl,
                    currentOwner: {
                        id: data.currentOwnerId,
                        name: data.currentOwner?.name || 'Unknown',
                    },
                    isForSale: data.isForSale,
                    isForTrade: data.isForTrade,
                    priceValue: data.priceValue ? parseFloat(data.priceValue) : undefined,
                    publicationYear: data.publicationYear,
                    genre: data.genre,
                    reviews: data.reviews || [],
                    quotes: data.quotes || [],
                });
            } catch (err) {
                console.error('Failed to load book:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const handleAddReview = async (text: string) => {
        if (activeUser && book) {
            try {
                await api.request(`/books/${book.id}/reviews`, {
                    method: 'POST',
                    body: JSON.stringify({ text }),
                });
                // Перезагружаем книгу
                const updatedBook = await api.getBookById(book.id);
                setBook({
                    ...book,
                    reviews: updatedBook.reviews || [],
                });
                setShowReviewForm(false);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleAddQuote = async (text: string) => {
        if (activeUser && book) {
            try {
                await api.request(`/books/${book.id}/quotes`, {
                    method: 'POST',
                    body: JSON.stringify({ text }),
                });
                const updatedBook = await api.getBookById(book.id);
                setBook({
                    ...book,
                    quotes: updatedBook.quotes || [],
                });
                setShowQuoteForm(false);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const handleBuyBook = async () => {
        if (!activeUser) {
            alert('Пожалуйста, войдите в систему, чтобы совершить покупку.');
            navigate('/login');
            return;
        }
        if (!book || !book.isForSale || !book.priceValue) {
            alert('Эта книга недоступна для покупки.');
            return;
        }

        try {
            await api.request(`/books/${book.id}/purchase`, {
                method: 'POST',
            });
            alert('Книга успешно куплена!');
            // Обновляем профиль и книгу
            const profile = await api.getProfile();
            setActiveUser({ ...activeUser, balance: parseFloat(profile.balance) });
            const updatedBook = await api.getBookById(book.id);
            setBook({
                ...book,
                currentOwner: {
                    id: updatedBook.currentOwnerId,
                    name: updatedBook.currentOwner?.name || '',
                },
                isForSale: updatedBook.isForSale,
            });
        } catch (err: any) {
            alert(err.message);
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

    if (isLoading) {
        return <div className="page-message">Загрузка...</div>;
    }

    if (!book) {
        return <div className="page-message">Книга не найдена.</div>;
    }

    const isOwner = activeUser?.id === book.currentOwner.id;
    const coverPath =
        !book.coverImageUrl ? '/book-cover-default.png' :
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
                        <Link to={`/user-profile/${book.currentOwner.id}`}>{book.currentOwner.name}</Link>
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
                        <strong>Жанр:</strong> {book.genre}
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
                    {book.reviews && book.reviews.length > 0 ? (
                        book.reviews.map((review: any) => (
                            <div key={review.id} className="content-card review-card">
                                <p className="content-text">"{review.text}"</p>
                                <div className="content-author">
                                    - <Link to={`/user-profile/${review.reviewerId || review.reviewer?.id}`}>
                                        {review.reviewer?.name || 'Unknown'}
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-content-message">Рецензий пока нет.</p>
                    )}
                    {activeUser && !isOwner &&
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
                    {book.quotes && book.quotes.length > 0 ? (
                        book.quotes.map((quote: any) => (
                            <div key={quote.id} className="content-card quote-card">
                                <p className="content-text">"{quote.text}"</p>
                                <div className="content-author">
                                    - <Link to={`/user-profile/${quote.quoterId || quote.quoter?.id}`}>
                                        {quote.quoter?.name || 'Unknown'}
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-content-message">Цитат пока нет.</p>
                    )}
                    {activeUser && !isOwner &&
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