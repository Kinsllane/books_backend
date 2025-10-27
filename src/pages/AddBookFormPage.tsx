import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { addNewBook } from '../data/appData';
import { ALL_BOOK_GENRES, BookGenre } from '../types/appTypes'; // Импортируем жанры

const AddBookFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeUser  } = useAuthStatus();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageDataUrl, setCoverImageDataUrl] = useState<string | null>(null);
    const [isForSale, setIsForSale] = useState(false);
    const [priceValue, setPriceValue] = useState('');
    const [isForTrade, setIsForTrade] = useState(false);
    const [publicationYear, setPublicationYear] = useState<string>(''); 
    const [genre, setGenre] = useState<BookGenre>(ALL_BOOK_GENRES[0]); // Добавляем состояние для жанра

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения (PNG, JPG, JPEG, GIF).');
                setCoverImageDataUrl(null);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImageDataUrl(reader.result as string);
            };
            reader.onerror = () => {
                alert('Не удалось прочитать файл.');
                setCoverImageDataUrl(null);
            };
            reader.readAsDataURL(file);
        } else {
            setCoverImageDataUrl(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeUser ) {
            alert('Необходимо войти в систему, чтобы добавить книгу.');
            navigate('/login');
            return;
        }

        if (isForSale && (!priceValue || Number(priceValue) <= 0)) {
            alert('Пожалуйста, укажите корректную цену для продажи (больше 0).');
            return;
        }

        const year = Number(publicationYear);
        if (isNaN(year) || year <= 0 || year > new Date().getFullYear() + 5) {
            alert('Пожалуйста, укажите корректный год публикации.');
            return;
        }

        const finalCoverImageUrl = coverImageDataUrl || '/book-cover-default.png';

        const newBookData = {
            title,
            author,
            description,
            coverImageUrl: finalCoverImageUrl,
            isForSale,
            priceValue: isForSale ? Number(priceValue) : undefined,
            isForTrade,
            publicationYear: year,
            genre // Добавляем жанр
        };

        addNewBook(newBookData, activeUser );

        alert('Книга успешно добавлена в каталог!');
        navigate('/');
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Добавить новую книгу</h2>
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
                    <label htmlFor="publicationYear">Год публикации:</label>
                    <input
                        type="number"
                        id="publicationYear"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        required
                        min="1" 
                        max={new Date().getFullYear() + 5} 
                        aria-label="Год публикации книги"
                    />
                </div>

                {/* Добавляем выпадающий список для выбора жанра */}
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

                <div className="form-group">
                    <label htmlFor="coverImage">Обложка книги (файл):</label>
                    <input
                        type="file"
                        id="coverImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        aria-label="Загрузить обложку книги"
                    />
                    {coverImageDataUrl && (
                        <div className="cover-preview">
                            <p>Предпросмотр обложки:</p>
                            <img src={coverImageDataUrl} alt="Предпросмотр обложки" style={{ maxWidth: '150px', maxHeight: '200px', marginTop: '10px', border: '1px solid #ddd' }} />
                        </div>
                    )}
                    {!coverImageDataUrl && (
                        <p className="info-message" style={{ marginTop: '10px' }}>
                            Если обложка не выбрана, будет использована стандартная.
                        </p>
                    )}
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

                <button type="submit" className="submit-button">Разместить книгу</button>
            </form>
        </div>
    );
};

export default AddBookFormPage;
