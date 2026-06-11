export interface UserProfile {
    id: string;
    name: string;
    password?: string;
    balance: number;
    registrationDate: string;
    role: 'user' | 'admin';
    avatarUrl?: string; 
    bio?: string;       
}

export interface BookReview {
    id: string;
    text: string;
    reviewer: UserProfile;
}

export interface BookQuote {
    id: string;
    text: string;
    quoter: UserProfile;
}
export type BookGenre =
    | 'Фантастика'
    | 'Фэнтези'
    | 'Детектив'
    | 'Триллер'
    | 'Ужасы'
    | 'Роман'
    | 'Приключения'
    | 'Научная литература'
    | 'Биография'
    | 'История'
    | 'Поэзия'
    | 'Драма'
    | 'Детская литература'
    | 'Классика'
    | 'Саморазвитие'
    | 'Кулинария'
    | 'Искусство'
    | 'Путешествия'
    | 'Юмор'
    | 'Другое';
export const ALL_BOOK_GENRES: BookGenre[] = [
    'Фантастика',
    'Фэнтези',
    'Детектив',
    'Триллер',
    'Ужасы',
    'Роман',
    'Приключения',
    'Научная литература',
    'Биография',
    'История',
    'Поэзия',
    'Драма',
    'Детская литература',
    'Классика',
    'Саморазвитие',
    'Кулинария',
    'Искусство',
    'Путешествия',
    'Юмор',
    'Другое',
];
export interface BookEntry {
    id: string;
    title: string;
    author: string;
    description: string;
    coverImageUrl: string;
    currentOwner: Pick<UserProfile, 'id' | 'name'>;
    isForSale: boolean;
    isForTrade: boolean;
    priceValue?: number;
    reviews: BookReview[];
    quotes: BookQuote[];
    publicationYear: number;
    genre: BookGenre;
}

export interface BookTrade {
    id: string;
    initiator: Pick<UserProfile, 'id' | 'name'>;
    initiatorBook: Pick<BookEntry, 'id' | 'title' | 'coverImageUrl'>;
    recipient: Pick<UserProfile, 'id' | 'name'>;
    recipientBook: Pick<BookEntry, 'id' | 'title' | 'coverImageUrl'>;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}
