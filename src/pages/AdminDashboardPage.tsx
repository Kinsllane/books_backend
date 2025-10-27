import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { registeredUsers, deleteUser, availableBooks, deleteBook } from '../data/appData';
import BookCard from '../components/books/BookCard';
import { ALL_BOOK_GENRES, BookGenre } from '../types/appTypes'; // Импортируем жанры

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus();
    const [users, setUsers] = useState(registeredUsers);
    const [books, setBooks] = useState(availableBooks);
    const [filteredBooks, setFilteredBooks] = useState(availableBooks);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<BookGenre | ''>(''); // <-- НОВОЕ СОСТОЯНИЕ
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!activeUser || activeUser.role !== 'admin') {
            alert('Доступ запрещен. Только администраторы могут просматривать эту страницу.');
            navigate('/');
            return;
        }
        setUsers([...registeredUsers]);
        const currentBooks = [...availableBooks];
        const filtered = currentBooks.filter((book) => {
            const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
            return matchesSearchTerm && matchesGenre;
        });
        setBooks(currentBooks);
        setFilteredBooks(filtered);
    }, [activeUser, navigate, registeredUsers, availableBooks, searchTerm, selectedGenre]); // Добавляем selectedGenre в зависимости

    const handleDeleteUser = (userId: string) => {
        if (!activeUser) return;
        if (
            window.confirm(
                'Вы уверены, что хотите удалить этого пользователя? Все его книги будут переназначены, а обмены удалены.'
            )
        ) {
            const result = deleteUser(userId, activeUser.id);
            setMessage(result.message);
            if (result.success) {
                setUsers([...registeredUsers]);
                const currentBooks = [...availableBooks];
                const filtered = currentBooks.filter((book) => {
                    const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
                    return matchesSearchTerm && matchesGenre;
                });
                setBooks(currentBooks);
                setFilteredBooks(filtered);
            }
        }
    };
    const handleDeleteBook = (bookId: string) => {
        if (!activeUser) return;

        if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
            const result = deleteBook(bookId, activeUser.id);
            setMessage(result.message);
            if (result.success) {
                const currentBooks = [...availableBooks];
                const filtered = currentBooks.filter((book) => {
                    const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
                    return matchesSearchTerm && matchesGenre;
                });
                setBooks(currentBooks);
                setFilteredBooks(filtered);
            }
        }
    };

    if (!activeUser || activeUser.role !== 'admin') {
        return <div className="page-message">Загрузка или доступ запрещен...</div>;
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
                                <Link to={`/user-profile/${user.id}`}>{user.name}</Link> (ID: {user.id}, Роль:{' '}
                                {user.role})
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
                <p className="info-message">Администратор может редактировать любую книгу, а так же удалять их.</p>
                <div className="search-bar mb-3">
                    <input
                        type="text"
                        placeholder="Поиск книг по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Поиск книг в админ-панели"
                    />
                    {/* НОВОЕ ПОЛЕ: Выбор жанра */}
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
                        <p className="no-books-message">Книг по вашему запросу не найдено.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminDashboardPage;
