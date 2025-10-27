import React, { useState, useEffect } from 'react';
import BookCard from '../components/books/BookCard';
import { availableBooks } from '../data/appData';
import { ALL_BOOK_GENRES, BookGenre } from '../types/appTypes'; // Импортируем жанры

const HomePage: React.FC = () => {
    const [booksToDisplay, setBooksToDisplay] = useState(availableBooks);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<BookGenre | ''>(''); // <-- НОВОЕ СОСТОЯНИЕ

    useEffect(() => {
        const filteredBooks = availableBooks.filter((book) => {
            const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
            return matchesSearchTerm && matchesGenre;
        });
        setBooksToDisplay(filteredBooks);
    }, [searchTerm, selectedGenre, availableBooks]); // Добавляем selectedGenre в зависимости

    return (
        <div className="home-page-container">
            <h1 className="page-title">Каталог книг</h1>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Введите название..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Поиск книг"
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
                {booksToDisplay.length > 0 ? (
                    booksToDisplay.map((book) => <BookCard key={book.id} book={book} />)
                ) : (
                    <p className="no-books-message">Книг по вашему запросу не найдено.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
