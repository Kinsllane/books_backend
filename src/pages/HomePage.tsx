import React, { useState, useEffect } from 'react';
import BookCard from '../components/books/BookCard';
import api from '../services/api';
import { ALL_BOOK_GENRES, BookGenre, BookEntry } from '../types/appTypes';

const HomePage: React.FC = () => {
    const [booksToDisplay, setBooksToDisplay] = useState<BookEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<BookGenre | ''>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            setError('');
            try {
                const books = await api.getBooks();
                // Преобразуем данные API в формат BookEntry
                const booksFormatted: BookEntry[] = books.map((book: any) => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    coverImageUrl: book.coverImageUrl,
                    currentOwner: {
                        id: book.currentOwnerId,
                        name: book.currentOwner?.name || 'Unknown',
                    },
                    isForSale: book.isForSale,
                    isForTrade: book.isForTrade,
                    priceValue: book.priceValue ? parseFloat(book.priceValue) : undefined,
                    publicationYear: book.publicationYear,
                    genre: book.genre,
                    reviews: book.reviews || [],
                    quotes: book.quotes || [],
                }));
                setBooksToDisplay(booksFormatted);
            } catch (err: any) {
                console.error('Failed to load books:', err);
                setError('Не удалось загрузить книги');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Фильтрация на клиенте
    const filteredBooks = booksToDisplay.filter((book) => {
        const matchesSearchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
        return matchesSearchTerm && matchesGenre;
    });

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

            {isLoading && <p>Загрузка книг...</p>}
            {error && <p className="error-message">{error}</p>}
            
            <div className="book-grid">
                {!isLoading && filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => <BookCard key={book.id} book={book} />)
                ) : (
                    !isLoading && <p className="no-books-message">Книг по вашему запросу не найдено.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;