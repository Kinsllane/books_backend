import { v4 as generateUniqueId } from 'uuid';
import type { BookEntry, UserProfile, BookReview, BookQuote, BookTrade, BookGenre } from '../types/appTypes'; // Импортируем BookGenre
import { ALL_BOOK_GENRES } from '../types/appTypes'; // Импортируем ALL_BOOK_GENRES

const LS_PREFIX = 'bookswap_';
const loadData = <T>(key: string, defaultData: T): T => {
    try {
        const storedData = localStorage.getItem(LS_PREFIX + key);
        if (key === 'registeredUsers' && storedData) {
            const parsedData: UserProfile[] = JSON.parse(storedData);
            return parsedData.map(user => ({
                ...user,
                role: user.role || 'user',
                avatarUrl: user.avatarUrl || '/default-avatar.png',
                bio: user.bio || ''
            })) as T;
        }
        // Добавляем обработку для книг, чтобы убедиться, что у них есть жанр
        if (key === 'availableBooks' && storedData) {
            const parsedData: BookEntry[] = JSON.parse(storedData);
            return parsedData.map(book => ({
                ...book,
                genre: book.genre || ALL_BOOK_GENRES[0] // Устанавливаем жанр по умолчанию, если его нет
            })) as T;
        }
        return storedData ? JSON.parse(storedData) : defaultData;
    } catch (error) {
        console.error(`Ошибка загрузки данных из localStorage для ключа ${key}:`, error);
        return defaultData;
    }
};
const saveData = <T>(key: string, data: T) => {
    try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
    } catch (error) {
        console.error(`Ошибка сохранения данных в localStorage для ключа ${key}:`, error);
    }
};
const DEFAULT_USERS: UserProfile[] = [
    {
        id: 'usr-admin',
        name: 'admin',
        password: 'adminpassword',
        balance: 9999,
        registrationDate: '2023-01-01',
        role: 'admin',
        avatarUrl: '/default-avatar.png',
        bio: 'Главный администратор системы BookSwap.'
    },
];
const DEFAULT_BOOKS: BookEntry[] = [];

export let registeredUsers: UserProfile[] = loadData('registeredUsers', DEFAULT_USERS);
export let availableBooks: BookEntry[] = loadData('availableBooks', DEFAULT_BOOKS);
export let activeTrades: BookTrade[] = loadData('activeTrades', []);


availableBooks.forEach(book => {
    const owner = registeredUsers.find(u => u.id === book.currentOwner.id);
    if (owner) {
        book.currentOwner = owner;
    } else {
        console.warn(`Владелец книги "${book.title}" (ID: ${book.id}) не найден. Назначаем первого пользователя (админа).`);
        book.currentOwner = registeredUsers[0];
    }
    // Убедимся, что у книги есть жанр при инициализации
    if (!book.genre) {
        book.genre = ALL_BOOK_GENRES[0]; // Устанавливаем жанр по умолчанию
    }
    book.reviews.forEach(review => {
        const reviewer = registeredUsers.find(u => u.id === review.reviewer.id);
        if (reviewer) {
            review.reviewer = reviewer;
        } else {
            console.warn(`Рецензент рецензии ${review.id} для книги "${book.title}" не найден.`);
            review.reviewer = registeredUsers[0];
        }
    });
    book.quotes.forEach(quote => {
        const quoter = registeredUsers.find(u => u.id === quote.quoter.id);
        if (quoter) {
            quote.quoter = quoter;
        } else {
            console.warn(`Автор цитаты ${quote.id} для книги "${book.title}" не найден.`);
            quote.quoter = registeredUsers[0];
        }
    });
});

activeTrades.forEach(trade => {
    const initiator = registeredUsers.find(u => u.id === trade.initiator.id);
    if (initiator) {
        trade.initiator = initiator;
    } else {
        console.warn(`Инициатор обмена ${trade.id} не найден. Обмен будет отклонен.`);
        trade.status = 'rejected';
    }

    const recipient = registeredUsers.find(u => u.id === trade.recipient.id);
    if (recipient) {
        trade.recipient = recipient;
    } else {
        console.warn(`Получатель обмена ${trade.id} не найден. Обмен будет отклонен.`);
        trade.status = 'rejected';
    }
    const initiatorBook = availableBooks.find(b => b.id === trade.initiatorBook.id);
    if (initiatorBook) {
        trade.initiatorBook = initiatorBook;
    } else {
        console.warn(`Книга инициатора обмена ${trade.id} не найдена. Обмен будет отклонен.`);
        trade.status = 'rejected';
    }
    const recipientBook = availableBooks.find(b => b.id === trade.recipientBook.id);
    if (recipientBook) {
        trade.recipientBook = recipientBook;
    } else {
        console.warn(`Книга получателя обмена ${trade.id} не найдена. Обмен будет отклонен.`);
        trade.status = 'rejected';
    }
});
export const authenticateUser = (username: string, password_raw: string): UserProfile | undefined => {
    return registeredUsers.find(user => user.name === username && user.password === password_raw);
};
export const findUserByUsername = (username: string): UserProfile | undefined => {
    return registeredUsers.find(user => user.name.toLowerCase() === username.toLowerCase());
};
export const findUserById = (userId: string | undefined): UserProfile | undefined => {
    if (!userId) return undefined;
    return registeredUsers.find(user => user.id === userId);
};
export const registerNewUser = (username: string, password_raw: string): UserProfile => {
    const newUser: UserProfile = {
        id: `usr-${generateUniqueId()}`,
        name: username,
        password: password_raw,
        balance: 500,
        registrationDate: new Date().toISOString().split('T')[0],
        role: 'user',
        avatarUrl: '/default-avatar.png',
        bio: ''
    };
    registeredUsers.push(newUser);
    saveData('registeredUsers', registeredUsers);
    return newUser;
};
export const topUpUserBalance = (userId: string, amount: number): { success: boolean, message: string, user?: UserProfile } => {
    if (amount <= 0) {
        return { success: false, message: "Сумма пополнения должна быть положительной." };
    }
    const user = findUserById(userId);
    if (!user) {
        return { success: false, message: "Пользователь не найден." };
    }
    user.balance += amount;
    saveData('registeredUsers', registeredUsers);
    return { success: true, message: `Баланс успешно пополнен на ${amount}₽.`, user };
};
export const updateUserProfile = (userId: string, updates: Partial<UserProfile>): { success: boolean, message: string, user?: UserProfile } => {
    const userIndex = registeredUsers.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return { success: false, message: "Пользователь не найден." };
    }

    const user = registeredUsers[userIndex];
    registeredUsers[userIndex] = { ...user, ...updates };
    saveData('registeredUsers', registeredUsers);
    return { success: true, message: "Профиль успешно обновлен.", user: registeredUsers[userIndex] };
};

export const deleteUser = (userIdToDelete: string, adminId: string): { success: boolean, message: string } => {
    const adminUser = findUserById(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
        return { success: false, message: "У вас нет прав администратора для удаления пользователей." };
    }

    if (userIdToDelete === adminId) {
        return { success: false, message: "Администратор не может удалить сам себя." };
    }

    const userIndex = registeredUsers.findIndex(user => user.id === userIdToDelete);
    if (userIndex === -1) {
        return { success: false, message: "Пользователь не найден." };
    }

    const userToDelete = registeredUsers[userIndex];
    const defaultOwner = registeredUsers.find(u => u.role === 'admin');
    if (!defaultOwner) {
        return { success: false, message: "Ошибка: Администратор для переназначения книг не найден." };
    }
    availableBooks.forEach(book => {
        if (book.currentOwner.id === userToDelete.id) {
            book.currentOwner = defaultOwner;
        }
    });
    registeredUsers.splice(userIndex, 1);
    saveData('registeredUsers', registeredUsers);
    saveData('availableBooks', availableBooks);
    const initialActiveTradesLength = activeTrades.length;
    activeTrades = activeTrades.filter(trade =>
        trade.initiator.id !== userIdToDelete && trade.recipient.id !== userIdToDelete
    );
    if (activeTrades.length !== initialActiveTradesLength) {
        saveData('activeTrades', activeTrades);
    }
    return { success: true, message: `Пользователь ${userToDelete.name} успешно удален.` };
};


export const retrieveBookById = (bookId: string | undefined): BookEntry | undefined => {
    if (!bookId) return undefined;
    return availableBooks.find(book => book.id === bookId);
};
export const addNewBook = (bookDetails: Omit<BookEntry, 'id' | 'currentOwner' | 'reviews' | 'quotes'>, owner: UserProfile): BookEntry => {
    const newBook: BookEntry = {
        ...bookDetails,
        id: `book-${generateUniqueId()}`,
        currentOwner: owner,
        reviews: [],
        quotes: [],
        genre: bookDetails.genre || ALL_BOOK_GENRES[0], // Убедимся, что жанр установлен
    };
    availableBooks = [newBook, ...availableBooks];
    saveData('availableBooks', availableBooks);
    return newBook;
};

export const updateBook = (
    bookId: string,
    updatedDetails: Omit<BookEntry, 'id' | 'currentOwner' | 'reviews' | 'quotes'>,
    userId: string
): { success: boolean, message: string, updatedBook?: BookEntry } => {
    const bookIndex = availableBooks.findIndex(book => book.id === bookId);

    if (bookIndex === -1) {
        return { success: false, message: "Книга не найдена." };
    }

    const existingBook = availableBooks[bookIndex];
    const actingUser = findUserById(userId);

    if (!actingUser || (existingBook.currentOwner.id !== userId && actingUser.role !== 'admin')) {
        return { success: false, message: "У вас нет прав для редактирования этой книги." };
    }

    const updatedBook: BookEntry = {
        ...existingBook,
        ...updatedDetails,
        priceValue: updatedDetails.isForSale ? updatedDetails.priceValue : undefined,
        genre: updatedDetails.genre, // Обновляем жанр
    };

    availableBooks[bookIndex] = updatedBook;
    saveData('availableBooks', availableBooks);

    return { success: true, message: "Информация о книге успешно обновлена.", updatedBook };
};
export const deleteBook = (bookId: string, userId: string): { success: boolean, message: string } => {
    const bookIndex = availableBooks.findIndex(book => book.id === bookId);

    if (bookIndex === -1) {
        return { success: false, message: "Книга не найдена." };
    }

    const bookToDelete = availableBooks[bookIndex];
    const actingUser = findUserById(userId);
    if (!actingUser || (bookToDelete.currentOwner.id !== userId && actingUser.role !== 'admin')) {
        return { success: false, message: "У вас нет прав для удаления этой книги." };
    }

    availableBooks.splice(bookIndex, 1);
    saveData('availableBooks', availableBooks);
    const initialActiveTradesLength = activeTrades.length;
    activeTrades = activeTrades.filter(trade =>
        trade.initiatorBook.id !== bookId && trade.recipientBook.id !== bookId
    );
    if (activeTrades.length !== initialActiveTradesLength) {
        saveData('activeTrades', activeTrades);
    }
    return { success: true, message: "Книга успешно удалена." };
};



export const addReviewToBook = (bookId: string, text: string, reviewer: UserProfile): BookReview => {
    const book = retrieveBookById(bookId);
    const newReview: BookReview = { id: `rev-${generateUniqueId()}`, text, reviewer };
    if (book) {
        book.reviews.push(newReview);
        saveData('availableBooks', availableBooks); // Сохраняем изменения
    }
    return newReview;
};


export const addQuoteToBook = (bookId: string, text: string, quoter: UserProfile): BookQuote => {
    const book = retrieveBookById(bookId);
    const newQuote: BookQuote = { id: `qte-${generateUniqueId()}`, text, quoter };
    if (book) {
        book.quotes.push(newQuote);
        saveData('availableBooks', availableBooks); // Сохраняем изменения
    }
    return newQuote;
};


export const purchaseBook = (bookId: string, buyerId: string): { success: boolean, message: string, book?: BookEntry, buyer?: UserProfile } => {
    const book = retrieveBookById(bookId);
    const buyer = findUserById(buyerId);

    if (!book || !buyer || !book.priceValue) {
        return { success: false, message: "Книга или покупатель не найдены, или книга не имеет цены." };
    }

    const seller = findUserById(book.currentOwner.id);

    if (!seller) {
        return { success: false, message: "Продавец книги не найден." };
    }

    if (buyer.balance < book.priceValue) {
        return { success: false, message: "Недостаточно средств на балансе для покупки." };
    }

    buyer.balance -= book.priceValue;
    seller.balance += book.priceValue;
    book.currentOwner = buyer;
    book.isForSale = false;
    book.isForTrade = false;

    saveData('registeredUsers', registeredUsers);
    saveData('availableBooks', availableBooks);

    return { success: true, message: "Покупка книги успешно совершена!", book, buyer };
};

export const getUserTradeProposals = (userId: string): { incoming: BookTrade[], outgoing: BookTrade[] } => {
    const incoming = activeTrades.filter(t => t.recipient.id === userId && t.status === 'pending');
    const outgoing = activeTrades.filter(t => t.initiator.id === userId && t.status === 'pending');
    return { incoming, outgoing };
};

export const createNewTradeProposal = (initiatorId: string, initiatorBookId: string, recipientBookId: string): { success: boolean, message: string } => {
    const initiator = findUserById(initiatorId);
    const initiatorBook = retrieveBookById(initiatorBookId);
    const recipientBook = retrieveBookById(recipientBookId);

    if (!initiator || !initiatorBook || !recipientBook) {
        return { success: false, message: "Ошибка: Недостаточно данных для создания предложения обмена." };
    }
    const recipient = recipientBook.currentOwner;
    const existingTrade = activeTrades.find(t =>
        t.status === 'pending' &&
        ((t.initiator.id === initiator.id && t.initiatorBook.id === initiatorBook.id && t.recipientBook.id === recipientBook.id) ||
         (t.initiator.id === recipient.id && t.initiatorBook.id === recipientBook.id && t.recipientBook.id === initiatorBook.id))
    );

    if (existingTrade) {
        return { success: false, message: "Такое предложение обмена уже существует и ожидает ответа." };
    }
    const newTrade: BookTrade = {
        id: `trade-${generateUniqueId()}`,
        initiator,
        initiatorBook,
        recipient,
        recipientBook,
        status: 'pending'

    };
    activeTrades.push(newTrade);
    saveData('activeTrades', activeTrades); // Сохраняем изменения
    return { success: true, message: "Предложение обмена успешно отправлено!" };
};

export const respondToTradeProposal = (tradeId: string, response: 'accepted' | 'rejected' | 'cancelled'): { success: boolean, message: string } => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade) {
        return { success: false, message: "Предложение обмена не найдено." };
    }

    if (response === 'accepted') {
        const { initiatorBook, recipientBook } = trade;

        const tempOwner = initiatorBook.currentOwner;
        initiatorBook.currentOwner = recipientBook.currentOwner;
        recipientBook.currentOwner = tempOwner;
        initiatorBook.isForSale = false;
        initiatorBook.isForTrade = false;
        recipientBook.isForSale = false;
        recipientBook.isForTrade = false;
        trade.status = 'accepted';
        saveData('availableBooks', availableBooks);
        saveData('activeTrades', activeTrades);

        return { success: true, message: "Обмен успешно завершен!" };
    } else {
        trade.status = response;
        saveData('activeTrades', activeTrades);
        const message = response === 'rejected' ? "Предложение обмена отклонено." : "Предложение обмена отменено.";
        return { success: true, message };
    }
};
