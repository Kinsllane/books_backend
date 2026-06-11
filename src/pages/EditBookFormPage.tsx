import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import api from '../services/api';
import { ALL_BOOK_GENRES, BookGenre } from '../types/appTypes';

// Предопределённые обложки для книг
const BOOK_COVERS = [
  '/book-cover-1.png',
  '/book-cover-2.png', 
  '/book-cover-3.png',
  '/book-cover-4.png',
  '/book-cover-5.png',
];

const EditBookFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeUser } = useAuthStatus();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isForSale, setIsForSale] = useState(false);
    const [priceValue, setPriceValue] = useState('');
    const [isForTrade, setIsForTrade] = useState(false);
    const [publicationYear, setPublicationYear] = useState('');
    const [genre, setGenre] = useState<BookGenre>(ALL_BOOK_GENRES[0]);
    const [loading, setLoading] = useState(true);
    const [bookNotFound, setBookNotFound] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [selectedCover, setSelectedCover] = useState<string>(BOOK_COVERS[0]);

    useEffect(() => {
        const fetchBook = async () => {
            if (!activeUser) {
                alert('Необходимо войти в систему для редактирования книги.');
                navigate('/login');
                return;
            }

            if (id) {
                try {
                    const book = await api.getBookById(id);
                    
                    if (book.currentOwnerId !== activeUser.id && activeUser.role !== 'admin') {
                        alert('У вас нет прав для редактирования этой книги.');
                        navigate('/');
                        return;
                    }

                    setTitle(book.title);
                    setAuthor(book.author);
                    setDescription(book.description);
                    setSelectedCover(book.coverImageUrl || BOOK_COVERS[0]);
                    setIsForSale(book.isForSale);
                    setPriceValue(book.priceValue ? String(book.priceValue) : '');
                    setIsForTrade(book.isForTrade);
                    setPublicationYear(String(book.publicationYear));
                    setGenre(book.genre || ALL_BOOK_GENRES[0]);
                    setLoading(false);
                } catch (err) {
                    setBookNotFound(true);
                    setLoading(false);
                }
            } else {
                setBookNotFound(true);
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, activeUser, navigate]);

    const handleCoverSelect = (coverUrl: string) => {
        setSelectedCover(coverUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!activeUser || !id) {
            alert('Ошибка: Пользователь не авторизован или ID книги отсутствует.');
            return;
        }

        if (isForSale && (!priceValue || Number(priceValue) <= 0)) {
            setError('Пожалуйста, укажите корректную цену для продажи (больше 0).');
            return;
        }

        if (!isForSale && !isForTrade) {
            setError('Выберите хотя бы один вариант: продажа или обмен.');
            return;
        }

        if (!publicationYear || Number(publicationYear) <= 0) {
            setError('Пожалуйста, укажите корректный год публикации.');
            return;
        }

        setIsSaving(true);
        try {
            await api.updateBook(id, {
                title,
                author,
                description,
                coverImageUrl: selectedCover,
                isForSale,
                priceValue: isForSale ? Number(priceValue) : undefined,
                isForTrade,
                publicationYear: Number(publicationYear),
                genre,
            });

            alert('Информация о книге успешно обновлена!');
            navigate(`/book/${id}`);
        } catch (err: any) {
            setError(err.message || 'Ошибка при обновлении книги');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="page-message">Загрузка данных книги...</div>;
    }

    if (bookNotFound) {
        return <div className="page-message">Книга для редактирования не найдена.</div>;
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Редактировать книгу</h2>
            <form onSubmit={handleSubmit} className="add-book-form">
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label htmlFor="title">Название:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        aria-label="Название книги"
                        disabled={isSaving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author">Автор:</label>
                    <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        aria-label="Автор книги"
                        disabled={isSaving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6}
                        aria-label="Описание книги"
                        disabled={isSaving}
                    />
                </div>

                <div className="form-group">
                    <label>Обложка книги:</label>
                    <div className="cover-selection-grid" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {BOOK_COVERS.map((cover, index) => (
                            <div 
                                key={index}
                                onClick={() => handleCoverSelect(cover)}
                                style={{ 
                                    cursor: 'pointer',
                                    border: selectedCover === cover ? '3px solid #4CAF50' : '2px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '5px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <img 
                                    src={cover} 
                                    alt={`Обложка ${index + 1}`} 
                                    style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="publicationYear">Год публикации:</label>
                    <input
                        type="number"
                        id="publicationYear"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        required
                        min="1"
                        max={new Date().getFullYear()}
                        aria-label="Год публикации книги"
                        disabled={isSaving}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Жанр:</label>
                    <select
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value as BookGenre)}
                        required
                        aria-label="Жанр книги"
                        disabled={isSaving}
                    >
                        {ALL_BOOK_GENRES.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group options-group">
                    <label>Опции размещения:</label>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="isForSale"
                            checked={isForSale}
                            onChange={(e) => setIsForSale(e.target.checked)}
                            aria-label="Выставить на продажу"
                            disabled={isSaving}
                        />
                        <label htmlFor="isForSale">Выставить на продажу</label>
                    </div>

                    {isForSale && (
                        <div className="form-group nested-group">
                            <label htmlFor="priceValue">Цена (₽):</label>
                            <input
                                type="number"
                                id="priceValue"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                required={isForSale}
                                min="1"
                                aria-label="Цена книги"
                                disabled={isSaving}
                            />
                        </div>
                    )}

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="isForTrade"
                            checked={isForTrade}
                            onChange={(e) => setIsForTrade(e.target.checked)}
                            aria-label="Выставить на обмен"
                            disabled={isSaving}
                        />
                        <label htmlFor="isForTrade">Выставить на обмен</label>
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={isSaving}>
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </form>
        </div>
    );
};

export default EditBookFormPage;