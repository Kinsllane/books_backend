const API_BASE = 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({ error: 'Unknown error', details: [] }));
      
      // Формируем детальное сообщение об ошибке
      let errorMessage = errorData.error || 'Request failed';
      
      // Если есть детали валидации, добавляем их к сообщению
      if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        const validationMessages = errorData.details.map((sourceError: any) => {
          if (sourceError.errors && Array.isArray(sourceError.errors)) {
            return sourceError.errors.map((err: any) => `${err.path}: ${err.message}`).join('; ');
          }
          return '';
        }).filter(Boolean).join('; ');
        
        if (validationMessages) {
          errorMessage = `${errorMessage}: ${validationMessages}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Для 204 No Content возвращаем пустой объект
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // Auth
  async login(username: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(username: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.request<any>('/users/profile');
  }

  async updateProfile(updates: { bio?: string; avatarUrl?: string }) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async topUpBalance(amount: number) {
    return this.request<any>('/users/balance/top-up', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async deleteUser(userId: string) {
    return this.request<any>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Books
  async getBooks(params?: { search?: string; genre?: string; forSale?: boolean; forTrade?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.genre) query.set('genre', params.genre);
    if (params?.forSale !== undefined) query.set('forSale', String(params.forSale));
    if (params?.forTrade !== undefined) query.set('forTrade', String(params.forTrade));
    
    const queryStr = query.toString();
    return this.request<any[]>(`/books${queryStr ? `?${queryStr}` : ''}`);
  }

  async getBookById(id: string) {
    return this.request<any>(`/books/${id}`);
  }

  async createBook(bookData: {
    title: string;
    author: string;
    description?: string;
    coverImageUrl?: string;
    isForSale: boolean;
    isForTrade: boolean;
    priceValue?: number;
    publicationYear?: number;
    genre?: string;
  }) {
    return this.request<any>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: string, bookData: Partial<{
    title: string;
    author: string;
    description: string;
    coverImageUrl: string;
    isForSale: boolean;
    isForTrade: boolean;
    priceValue: number;
    publicationYear: number;
    genre: string;
  }>) {
    return this.request<any>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id: string) {
    return this.request<any>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyBooks() {
    return this.request<any[]>('/books/user/my-books');
  }

  // Trades
  async getMyTrades() {
    return this.request<any[]>('/trades/my-trades');
  }

  async getIncomingTrades() {
    return this.request<any[]>('/trades/incoming');
  }

  async getOutgoingTrades() {
    return this.request<any[]>('/trades/outgoing');
  }

  async proposeTrade(initiatorBookId: string, recipientBookId: string) {
    return this.request<any>('/trades/propose', {
      method: 'POST',
      body: JSON.stringify({ initiatorBookId, recipientBookId }),
    });
  }

  async respondToTrade(tradeId: string, response: 'accepted' | 'rejected') {
    return this.request<any>(`/trades/${tradeId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    });
  }

  async cancelTrade(tradeId: string) {
    return this.request<any>(`/trades/${tradeId}/cancel`, {
      method: 'DELETE',
    });
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }
}

export const api = new ApiService();
export default api;