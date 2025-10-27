import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; 
import { useAuthStatus } from '../hooks/useAuthStatus';
import BookCard from '../components/books/BookCard';
import {
    availableBooks,
    activeTrades,
    findUserById,
    respondToTradeProposal,
    deleteBook,
    updateUserProfile
} from '../data/appData';
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

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newBio, setNewBio] = useState(''); 
    const [newAvatarDataUrl, setNewAvatarDataUrl] = useState<string | null>(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);


    const getBooksByOwnerId = (ownerId: string): BookEntry[] => {
        return availableBooks.filter(book => book.currentOwner.id === ownerId);
    };

    const getTradeOffersForUser = (userId: string): { incoming: BookTrade[], outgoing: BookTrade[] } => {
        const incoming = activeTrades.filter(trade => trade.recipient.id === userId && trade.status === 'pending');
        const outgoing = activeTrades.filter(trade => trade.initiator.id === userId && trade.status === 'pending');
        return { incoming, outgoing };
    };

    useEffect(() => {
        if (!displayUserId) {
            if (!activeUser) {
                navigate('/login');
            }
            return;
        }
        const userToDisplay = findUserById(displayUserId);
        if (!userToDisplay) {
            setErrorMessage('Пользователь не найден.');
            setDisplayUser(null);
            return;
        }
        setDisplayUser(userToDisplay);
        setDisplayUserBooks(getBooksByOwnerId(userToDisplay.id));
        if (isMyProfile && activeUser) {
            const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
            setIncomingTrades(incoming);
            setOutgoingTrades(outgoing);
            setNewBio(activeUser.bio || '' );
            setNewAvatarDataUrl(activeUser.avatarUrl || null);
        } else {
            setIncomingTrades([]);
            setOutgoingTrades([]);
        }
        setErrorMessage('');
        setSuccessMessage('');
        setIsEditingProfile(false); 
    }, [displayUserId, activeUser, navigate, availableBooks, activeTrades, isMyProfile]); 

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

   
    const handleTradeResponse = (tradeId: string, response: 'accepted' | 'rejected') => {
        setErrorMessage('');
        setSuccessMessage('');
        const result = respondToTradeProposal(tradeId, response);
        if (result.success) {
            setSuccessMessage(result.message);
            if (activeUser) {
                setDisplayUserBooks(getBooksByOwnerId(activeUser.id)); 
                const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
                setIncomingTrades(incoming);
                setOutgoingTrades(outgoing);
                const updatedUser = findUserById(activeUser.id);
                if (updatedUser) {
                    setActiveUser(updatedUser);
                    setDisplayUser(updatedUser); 
                }
            }
        } else {
            setErrorMessage(result.message);
        }
    };

   
    const handleCancelTrade = (tradeId: string) => {
        setErrorMessage('');
        setSuccessMessage('');
        const result = respondToTradeProposal(tradeId, 'cancelled');
        if (result.success) {
            setSuccessMessage(result.message);
            if (activeUser) {
                const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
                setIncomingTrades(incoming);
                setOutgoingTrades(outgoing);
            }
        } else {
            setErrorMessage(result.message);
        }
    };

   
    const handleDeleteBook = (bookId: string) => {
        if (!activeUser) {
            alert('Вы не авторизованы.');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
            const result = deleteBook(bookId, activeUser.id);
            if (result.success) {
                setSuccessMessage(result.message);
                setDisplayUserBooks(getBooksByOwnerId(activeUser.id)); 
                const { incoming, outgoing } = getTradeOffersForUser(activeUser.id);
                setIncomingTrades(incoming);
                setOutgoingTrades(outgoing);
            } else {
                setErrorMessage(result.message);
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
        } else {
            setNewAvatarDataUrl(activeUser?.avatarUrl || null); 
            setSelectedAvatarFile(null);
        }
    };

    
    const handleProfileSave = () => {
        if (!activeUser) return;

        setErrorMessage('');
        setSuccessMessage('');

        const updates: Partial<UserProfile> = {
            bio: newBio.trim()
        };

        if (newAvatarDataUrl) {
            updates.avatarUrl = newAvatarDataUrl;
        } else if (activeUser.avatarUrl) {
            updates.avatarUrl = '/default-avatar.png';
        }


        const result = updateUserProfile(activeUser.id, updates);
        if (result.success && result.user) {
            setActiveUser(result.user); 
            setDisplayUser(result.user); 
            setSuccessMessage('Профиль успешно обновлен!');
            setIsEditingProfile(false); 
        } else {
            setErrorMessage(result.message || 'Ошибка при обновлении профиля.');
        }
    };

   
    const getCoverPath = (imageUrl: string): string => {
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }
        return `/${imageUrl}`;
    };


    if (!displayUser) {
        return <div className="page-message">{errorMessage || 'Загрузка профиля...'}</div>;
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
                            aria-label="Биография пользователя"
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
                                    <p><strong><Link to={`/user-profile/${trade.initiator.id}`}>{trade.initiator.name}</Link></strong> хочет обменять свою книгу:</p> {/* <-- Ссылка на профиль инициатора */}
                                    <div className="trade-books-display">
                                        <div className="book-item">
                                            <Link to={`/book/${trade.initiatorBook.id}`}>
                                                <img src={getCoverPath(trade.initiatorBook.coverImageUrl)} alt={trade.initiatorBook.title} />
                                            </Link>
                                            <p>{trade.initiatorBook.title}</p>
                                        </div>
                                        <span className="trade-arrow">&harr;</span>
                                        <div className="book-item">
                                            <Link to={`/book/${trade.recipientBook.id}`}>
                                                <img src={getCoverPath(trade.recipientBook.coverImageUrl)} alt={trade.recipientBook.title} />
                                            </Link>
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
                                    <p>Вы предложили <strong><Link to={`/user-profile/${trade.recipient.id}`}>{trade.recipient.name}</Link></strong> обменять вашу книгу:</p> {/* <-- Ссылка на профиль получателя */}
                                    <div className="trade-books-display">
                                        <div className="book-item">
                                            <Link to={`/book/${trade.initiatorBook.id}`}>
                                                <img src={getCoverPath(trade.initiatorBook.coverImageUrl)} alt={trade.initiatorBook.title} />
                                            </Link>
                                            <p>{trade.initiatorBook.title}</p>
                                        </div>
                                        <span className="trade-arrow">&harr;</span>
                                        <div className="book-item">
                                            <Link to={`/book/${trade.recipientBook.id}`}>
                                                <img src={getCoverPath(trade.recipientBook.coverImageUrl)} alt={trade.recipientBook.title} />
                                            </Link>
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
