import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; 
import { useAuthStatus } from '../hooks/useAuthStatus';
import BookCard from '../components/books/BookCard';
import api from '../services/api';
import type { BookEntry, BookTrade, UserProfile } from '../types/appTypes';

const UserProfilePage: React.FC = () => {
    const { id: userIdFromParams } = useParams<{ id: string }>(); 
    const { activeUser, setActiveUser } = useAuthStatus();
    const navigate = useNavigate();
    const displayUserId = userIdFromParams || activeUser?.id;
    const isMyProfile = activeUser?.id === displayUserId;

    const [displayUser, setDisplayUser] = useState<UserProfile | null>(null); 
    const [displayUserBooks, setDisplayUserBooks] = useState<BookEntry[]>([]); 
    const [incomingTrades, setIncomingTrades] = useState<BookTrade[]>([]);
    const [outgoingTrades, setOutgoingTrades] = useState<BookTrade[]>([]);
    const [showTopUpForm, setShowTopUpForm] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newBio, setNewBio] = useState(''); 
    const [newAvatarDataUrl, setNewAvatarDataUrl] = useState<string | null>(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!displayUserId) {
                if (!activeUser) {
                    navigate('/login');
                }
                return;
            }

            setIsLoading(true);
            try {
                // Получаем данные пользователя
                const user = await api.getUserById(displayUserId);
                const userProfile: UserProfile = {
                    id: user.id,
                    name: user.name,
                    balance: typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance,
                    registrationDate: user.registrationDate,
                    role: user.role,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio,
                };
                setDisplayUser(userProfile);

                // Получаем книги пользователя
                const books = await api.getBooks({ search: '' });
                const userBooks: BookEntry[] = books
                    .filter((b: any) => b.currentOwnerId === displayUserId)
                    .map((book: any) => ({
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        description: book.description,
                        coverImageUrl: book.coverImageUrl,
                        currentOwner: {
                            id: book.currentOwnerId,
                            name: userProfile.name,
                        },
                        isForSale: book.isForSale,
                        isForTrade: book.isForTrade,
                        priceValue: book.priceValue ? parseFloat(book.priceValue) : undefined,
                        publicationYear: book.publicationYear,
                        genre: book.genre,
                        reviews: book.reviews || [],
                        quotes: book.quotes || [],
                    }));
                setDisplayUserBooks(userBooks);

                // Для своего профиля получаем обмены
                if (isMyProfile && activeUser) {
                    try {
                        const incoming = await api.getIncomingTrades();
                        const outgoing = await api.getOutgoingTrades();
                        
                        // Форматируем обмены
                        const formatTrades = (trades: any[]): BookTrade[] => trades.map(t => ({
                            id: t.id,
                            initiator: { id: t.initiatorId, name: t.initiator?.name || '' },
                            initiatorBook: { 
                                id: t.initiatorBookId, 
                                title: t.initiatorBook?.title || '',
                                coverImageUrl: t.initiatorBook?.coverImageUrl || '',
                            },
                            recipient: { id: t.recipientId, name: t.recipient?.name || '' },
                            recipientBook: { 
                                id: t.recipientBookId, 
                                title: t.recipientBook?.title || '',
                                coverImageUrl: t.recipientBook?.coverImageUrl || '',
                            },
                            status: t.status,
                        }));

                        setIncomingTrades(formatTrades(incoming));
                        setOutgoingTrades(formatTrades(outgoing));
                        setNewBio(activeUser.bio || '');
                        setNewAvatarDataUrl(activeUser.avatarUrl || null);
                    } catch (e) {
                        console.error('Failed to load trades:', e);
                    }
                }
            } catch (err: any) {
                console.error('Failed to load profile:', err);
                setErrorMessage('Не удалось загрузить профиль');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [displayUserId, activeUser, navigate, isMyProfile]);

    const handleTopUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const amount = Number(topUpAmount);
        if (!activeUser) { 
            setErrorMessage('Пользователь не авторизован.');
            return;
        }
        if (amount <= 0 || isNaN(amount)) {
            setErrorMessage('Пожалуйста, введите корректную сумму для пополнения (больше 0).');
            return;
        }

        navigate('/payment', { state: { amount: amount } });
    };

    const handleTradeResponse = async (tradeId: string, response: 'accepted' | 'rejected') => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const result = await api.respondToTrade(tradeId, response);
            setSuccessMessage(response === 'accepted' ? 'Обмен принят!' : 'Обмен отклонён');
            
            // Обновляем список обменов
            const incoming = await api.getIncomingTrades();
            const formatTrades = (trades: any[]): BookTrade[] => trades.map(t => ({
                id: t.id,
                initiator: { id: t.initiatorId, name: t.initiator?.name || '' },
                initiatorBook: { id: t.initiatorBookId, title: t.initiatorBook?.title || '', coverImageUrl: t.initiatorBook?.coverImageUrl || '' },
                recipient: { id: t.recipientId, name: t.recipient?.name || '' },
                recipientBook: { id: t.recipientBookId, title: t.recipientBook?.title || '', coverImageUrl: t.recipientBook?.coverImageUrl || '' },
                status: t.status,
            }));
            setIncomingTrades(formatTrades(incoming));

            // Обновляем баланс
            const profile = await api.getProfile();
            if (activeUser) {
                setActiveUser({ ...activeUser, balance: parseFloat(profile.balance) });
            }
        } catch (err: any) {
            setErrorMessage(err.message);
        }
    };

    const handleCancelTrade = async (tradeId: string) => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await api.cancelTrade(tradeId);
            setSuccessMessage('Обмен отменён');
            
            const outgoing = await api.getOutgoingTrades();
            const formatTrades = (trades: any[]): BookTrade[] => trades.map(t => ({
                id: t.id,
                initiator: { id: t.initiatorId, name: t.initiator?.name || '' },
                initiatorBook: { id: t.initiatorBookId, title: t.initiatorBook?.title || '', coverImageUrl: t.initiatorBook?.coverImageUrl || '' },
                recipient: { id: t.recipientId, name: t.recipient?.name || '' },
                recipientBook: { id: t.recipientBookId, title: t.recipientBook?.title || '', coverImageUrl: t.recipientBook?.coverImageUrl || '' },
                status: t.status,
            }));
            setOutgoingTrades(formatTrades(outgoing));
        } catch (err: any) {
            setErrorMessage(err.message);
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (!activeUser) {
            alert('Вы не авторизованы.');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
            try {
                await api.deleteBook(bookId);
                setSuccessMessage('Книга удалена');
                setDisplayUserBooks(displayUserBooks.filter(b => b.id !== bookId));
            } catch (err: any) {
                setErrorMessage(err.message);
            }
        }
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения (PNG, JPG, JPEG, GIF).');
                setNewAvatarDataUrl(activeUser?.avatarUrl || null); 
                setSelectedAvatarFile(null);
                return;
            }

            setSelectedAvatarFile(file); 
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatarDataUrl(reader.result as string);
            };
            reader.onerror = () => {
                alert('Не удалось прочитать файл.');
                setNewAvatarDataUrl(activeUser?.avatarUrl || null);
                setSelectedAvatarFile(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSave = async () => {
        if (!activeUser) return;

        setErrorMessage('');
        setSuccessMessage('');

        try {
            await api.updateProfile({ bio: newBio.trim() });
            
            // Обновляем локальный стейт
            const updatedUser = { ...activeUser, bio: newBio.trim() };
            setActiveUser(updatedUser);
            setDisplayUser(updatedUser);
            setSuccessMessage('Профиль успешно обновлён!');
            setIsEditingProfile(false);
        } catch (err: any) {
            setErrorMessage(err.message || 'Ошибка при обновлении профиля.');
        }
    };

    const getCoverPath = (imageUrl: string): string => {
        if (!imageUrl) return '/book-cover-default.png';
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }
        return `/${imageUrl}`;
    };

    if (isLoading) {
        return <div className="page-message">Загрузка профиля...</div>;
    }

    if (!displayUser) {
        return <div className="page-message">{errorMessage || 'Пользователь не найден'}</div>;
    }

    return (
        <div className="profile-page-container">
            <div className="profile-header-section">
                <div className="profile-avatar-wrapper">
                    <img
                        src={displayUser.avatarUrl || '/default-avatar.png'}
                        alt={`${displayUser.name}'s avatar`}
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info-main">
                    <h1 className="profile-name">{displayUser.name}</h1>
                    <p className="profile-role">Роль: {displayUser.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                    {isMyProfile && ( 
                        <p className="profile-balance">Баланс: <strong>{displayUser.balance}₽</strong></p>
                    )}
                    <p className="profile-registration-date">Зарегистрирован: {displayUser.registrationDate}</p>
                    <div className="profile-bio">
                        <h3>О себе:</h3>
                        <p>{displayUser.bio || 'Пользователь пока не добавил информацию о себе.'}</p>
                    </div>
                    {isMyProfile && (
                        <button onClick={() => setIsEditingProfile(true)} className="action-button primary-button edit-profile-button">
                            Редактировать профиль
                        </button>
                    )}
                </div>
            </div>

            {isMyProfile && isEditingProfile && (
                <div className="profile-edit-form form-container">
                    <h3>Редактировать профиль</h3>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <div className="form-group">
                        <label htmlFor="avatarUpload">Изменить аватар:</label>
                        <input
                            type="file"
                            id="avatarUpload"
                            accept="image/*"
                            onChange={handleAvatarFileChange}
                            aria-label="Загрузить новый аватар"
                        />
                        {newAvatarDataUrl && (
                            <div className="avatar-preview">
                                <p>Предпросмотр аватара:</p>
                                <img src={newAvatarDataUrl} alt="Предпросмотр аватара" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%', marginTop: '10px', border: '1px solid #ddd' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Биография:</label>
                        <textarea
                            id="bio"
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            placeholder="Расскажите немного о себе..."
                            rows={4}
                            aria-label="Биография польз��вателя"
                        />
                    </div>

                    <div className="form-actions">
                        <button onClick={handleProfileSave} className="submit-button">Сохранить</button>
                        <button onClick={() => setIsEditingProfile(false)} className="cancel-button">Отмена</button>
                    </div>
                </div>
            )}

            {isMyProfile && ( 
                <section className="balance-section">
                    <h2 className="section-title">Управление балансом</h2>
                    {!showTopUpForm && (
                        <button onClick={() => setShowTopUpForm(true)} className="action-button primary-button">Пополнить баланс</button>
                    )}
                    {showTopUpForm && (
                        <form onSubmit={handleTopUpSubmit} className="top-up-form">
                            <input
                                type="number"
                                value={topUpAmount}
                                onChange={e => setTopUpAmount(e.target.value)}
                                placeholder="Сумма пополнения"
                                min="1"
                                required
                                aria-label="Сумма пополнения"
                            />
                            <button type="submit" className="submit-button">Перейти к оплате</button>
                            <button type="button" onClick={() => setShowTopUpForm(false)} className="cancel-button">Отмена</button>
                        </form>
                    )}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </section>
            )}

            {isMyProfile && ( 
                <section className="trades-section">
                    <h2 className="section-title">Предложения обмена</h2>

                    <h3>Входящие предложения:</h3>
                    {incomingTrades.length > 0 ? (
                        <div className="trade-list">
                            {incomingTrades.map(trade => (
                                <div key={trade.id} className="trade-offer-card">
                                    <p><strong>{trade.initiator.name}</strong> хочет обменять свою книгу:</p>
                                    <div className="trade-books-display">
                                        <div className="book-item">
                                            <img src={getCoverPath(trade.initiatorBook.coverImageUrl)} alt={trade.initiatorBook.title} />
                                            <p>{trade.initiatorBook.title}</p>
                                        </div>
                                        <span className="trade-arrow">&harr;</span>
                                        <div className="book-item">
                                            <img src={getCoverPath(trade.recipientBook.coverImageUrl)} alt={trade.recipientBook.title} />
                                            <p>на вашу: {trade.recipientBook.title}</p>
                                        </div>
                                    </div>
                                    <div className="trade-actions">
                                        <button onClick={() => handleTradeResponse(trade.id, 'accepted')} className="action-button accept-button">Принять</button>
                                        <button onClick={() => handleTradeResponse(trade.id, 'rejected')} className="action-button reject-button">Отклонить</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-content-message">Нет входящих предложений обмена.</p>
                    )}

                    <h3>Исходящие предложения:</h3>
                    {outgoingTrades.length > 0 ? (
                        <div className="trade-list">
                            {outgoingTrades.map(trade => (
                                <div key={trade.id} className="trade-offer-card">
                                    <p>Вы предложили <strong>{trade.recipient.name}</strong> обменять вашу книгу:</p>
                                    <div className="trade-books-display">
                                        <div className="book-item">
                                            <img src={getCoverPath(trade.initiatorBook.coverImageUrl)} alt={trade.initiatorBook.title} />
                                            <p>{trade.initiatorBook.title}</p>
                                        </div>
                                        <span className="trade-arrow">&harr;</span>
                                        <div className="book-item">
                                            <img src={getCoverPath(trade.recipientBook.coverImageUrl)} alt={trade.recipientBook.title} />
                                            <p>на: {trade.recipientBook.title}</p>
                                        </div>
                                    </div>
                                    <div className="trade-actions">
                                        <button onClick={() => handleCancelTrade(trade.id)} className="action-button cancel-button">Отменить предложение</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-content-message">Нет исходящих предложений обмена.</p>
                    )}
                </section>
            )}

            <section className="my-books-section">
                <h2 className="section-title">{isMyProfile ? 'Мои книги' : `Книги пользователя ${displayUser.name}`}</h2>
                {displayUserBooks.length > 0 ? (
                    <div className="book-grid">
                        {displayUserBooks.map(book => (
                            <div key={book.id} className="my-book-card-wrapper">
                                <BookCard book={book} />
                                {isMyProfile && (       
                                    <button
                                        onClick={() => handleDeleteBook(book.id)}
                                        className="action-button reject-button delete-book-button"
                                    >
                                        Удалить
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-content-message">{isMyProfile ? 'У вас пока нет книг.' : `У пользователя ${displayUser.name} пока нет книг.`} {isMyProfile && <Link to="/add-book" className="link-text">Добавить книгу?</Link>}</p>
                )}
            </section>
        </div>
    );
};

export default UserProfilePage;