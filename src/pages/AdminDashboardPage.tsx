import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import api from '../services/api';
import BookCard from '../components/books/BookCard';
import { ALL_BOOK_GENRES, BookGenre } from '../types/appTypes';

interface UserItem {
    id: string;
    name: string;
    role: 'user' | 'admin';
}

interface BookItem {
    id: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string;
    currentOwner: { id: string; name: string };
    isForSale: boolean;
    isForTrade: boolean;
    priceValue?: number;
    publicationYear: number;
    genre: BookGenre;
    reviews: any[];
    quotes: any[];
}

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [books, setBooks] = useState<BookItem[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<BookItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<BookGenre | ''>('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!activeUser || activeUser.role !== 'admin') {
            alert('Доступ запрещен. Только администраторы могут просматривать эту страницу.');
            navigate('/');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const usersData = await api.getUsers();
                setUsers(usersData.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    role: u.role,
                })));

                const booksData = await api.getBooks();
                const formattedBooks: BookItem[] = booksData.map((b: any) => ({
                    id: b.id,
                    title: b.title,
                    author: b.author,
                    description: b.description,
                    coverImageUrl: b.coverImageUrl,
                    currentOwner: { id: b.currentOwnerId, name: b.currentOwner?.name || '' },
                    isForSale: b.isForSale,
                    isForTrade: b.isForTrade,
                    priceValue: b.priceValue ? parseFloat(b.priceValue) : undefined,
                    publicationYear: b.publicationYear,
                    genre: b.genre,
                    reviews: b.reviews || [],
                    quotes: b.quotes || [],
                }));
                setBooks(formattedBooks);
                setFilteredBooks(formattedBooks);
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [activeUser, navigate]);

    useEffect(() => {
        const filtered = books.filter((book) => {
            const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
            return matchesSearchTerm && matchesGenre;
        });
        setFilteredBooks(filtered);
    }, [books, searchTerm, selectedGenre]);

    const handleDeleteUser = async (userId: string) => {
        if (!activeUser) return;
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await api.deleteUser(userId);
                setMessage('Пользователь успешно удалён');
                setUsers(users.filter(u => u.id !== userId));
            } catch (err: any) {
                setMessage(err.message);
            }
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (!activeUser) return;
        if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
            try {
                await api.deleteBook(bookId);
                setMessage('Книга успешно удалена');
                setBooks(books.filter(b => b.id !== bookId));
            } catch (err: any) {
                setMessage(err.message);
            }
        }
    };

    if (isLoading) {
        return <div className="page-message">Загрузка...</div>;
    }

    if (!activeUser || activeUser.role !== 'admin') {
        return <div className="page-message">Доступ запрещен...</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Панель администратора</h2>
            {message && (
                <p className={message.includes('успешно') ? 'success-message' : 'error-message'}>
                    {message}
                </p>
            )}

            <section className="admin-section">
                <h3>Управление пользователями</h3>
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user.id} className="user-item">
                            <span>
                                <Link to={`/user-profile/${user.id}`}>{user.name}</Link> (Роль: {user.role})
                            </span>
                            {user.id !== activeUser.id && user.role !== 'admin' && (
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="action-button reject-button"
                                >
                                    Удалить
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            <section className="admin-section mt-4">
                <h3>Управление книгами</h3>
                <div className="search-bar mb-3">
                    <input
                        type="text"
                        placeholder="Поиск книг по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Поиск книг"
                    />
                    <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value as BookGenre | '')}
                        aria-label="Фильтр по жанру"
                        style={{ marginLeft: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        <option value="">Все жанры</option>
                        {ALL_BOOK_GENRES.map((genre) => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="book-grid">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <div key={book.id} className="admin-book-card-wrapper">
                                <BookCard book={book} />
                                <div className="admin-book-actions">
                                    <Link
                                        to={`/edit-book/${book.id}`}
                                        className="action-button primary-button edit-book-button"
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteBook(book.id)}
                                        className="action-button reject-button delete-book-button"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-books-message">Книг не найдено.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;