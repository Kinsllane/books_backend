import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { retrieveBookById, updateBook } from '../data/appData';
import type { BookEntry } from '../types/appTypes';
import { ALL_BOOK_GENRES, BookGenre } from '../types/appTypes'; // Импортируем жанры

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
    const [genre, setGenre] = useState<BookGenre>(ALL_BOOK_GENRES[0]); // <-- НОВОЕ СОСТОЯНИЕ
    const [loading, setLoading] = useState(true);
    const [bookNotFound, setBookNotFound] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!activeUser) {
            alert('Необходимо войти в систему для редактирования книги.');
            navigate('/login');
            return;
        }

        if (id) {
            const bookToEdit = retrieveBookById(id);
            if (bookToEdit) {
                if (bookToEdit.currentOwner.id !== activeUser.id && activeUser.role !== 'admin') {
                    alert('У вас нет прав для редактирования этой книги.');
                    navigate('/');
                    return;
                }

                setTitle(bookToEdit.title);
                setAuthor(bookToEdit.author);
                setDescription(bookToEdit.description);
                setCoverImageUrl(bookToEdit.coverImageUrl);
                setIsForSale(bookToEdit.isForSale);
                setPriceValue(bookToEdit.priceValue ? String(bookToEdit.priceValue) : '');
                setIsForTrade(bookToEdit.isForTrade);
                setPublicationYear(String(bookToEdit.publicationYear));
                setGenre(bookToEdit.genre); // <-- УСТАНАВЛИВАЕМ ЖАНР
                setLoading(false);
            } else {
                setBookNotFound(true);
                setLoading(false);
            }
        } else {
            setBookNotFound(true);
            setLoading(false);
        }
    }, [id, activeUser, navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeUser || !id) {
            alert('Ошибка: Пользователь не авторизован или ID книги отсутствует.');
            return;
        }

        if (isForSale && (!priceValue || Number(priceValue) <= 0)) {
            alert('Пожалуйста, укажите корректную цену для продажи (больше 0).');
            return;
        }

        if (!publicationYear || Number(publicationYear) <= 0) {
            alert('Пожалуйста, укажите корректный год публикации (больше 0).');
            return;
        }

        const updatedBookData = {
            title,
            author,
            description,
            coverImageUrl: coverImageUrl || '/book-cover-default.png',
            isForSale,
            priceValue: isForSale ? Number(priceValue) : undefined,
            isForTrade,
            publicationYear: Number(publicationYear),
            genre, // <-- ДОБАВЛЯЕМ ЖАНР
        };

        const result = updateBook(id, updatedBookData, activeUser.id);

        if (result.success) {
            alert('Информация о книге успешно обновлена!');
            navigate(`/book/${id}`);
        } else {
            alert(`Ошибка обновления: ${result.message}`);
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
                <div className="form-group">
                    <label htmlFor="title">Название:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        aria-label="Название книги"
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
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="coverFile">Загрузить обложку (файл):</label>
                    <input
                        type="file"
                        id="coverFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        aria-label="Загрузить файл обложки"
                    />
                    {selectedFile && <p className="info-message">Выбран файл: {selectedFile.name}</p>}
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
                    />
                </div>

                {/* НОВОЕ ПОЛЕ: Жанр */}
                <div className="form-group">
                    <label htmlFor="genre">Жанр:</label>
                    <select
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value as BookGenre)}
                        required
                        aria-label="Жанр книги"
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
                        />
                        <label htmlFor="isForTrade">Выставить на обмен</label>
                    </div>
                </div>

                <button type="submit" className="submit-button">
                    Сохранить изменения
                </button>
            </form>
        </div>
    );
};

export default EditBookFormPage;
