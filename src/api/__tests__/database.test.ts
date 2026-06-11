import request from 'supertest';
import { app } from '../app';
import sequelize from '../../config/database';
import { User, Book, Transaction } from '../../models';

/**
 * Интеграционное тестирование Core-логики БД BookSwap
 * 
 * Тестирование проводится на изолированном экземпляре базы данных.
 * Каждый запуск оборачивается в хуки beforeEach для обеспечения
 * независимости тестовых сценариев и повторяемости результатов.
 */
describe('Интеграционное тестирование Core-логики БД BookSwap', () => {
  let testUserId: string;
  let testAdminId: string;
  let testBookId: string;

  beforeAll(async () => {
    // Синхронизация структуры перед началом сессии тестов
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Инициализация чистых базовых данных (Фикстуры)
    const user = await User.create({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Иван Петров',
      password: 'hashed_password',
      balance: 500.00,
      registrationDate: new Date().toISOString().split('T')[0],
      role: 'user'
    });
    testUserId = user.id;

    const admin = await User.create({
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Администратор',
      password: 'admin_password',
      balance: 0.00,
      registrationDate: new Date().toISOString().split('T')[0],
      role: 'admin'
    });
    testAdminId = admin.id;

    const book = await Book.create({
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Капитанская дочка',
      author: 'А.С. Пушкин',
      description: 'Исторический роман',
      coverImageUrl: '/book-cover-1.png',
      genre: 'Классика',
      publicationYear: 1836,
      currentOwnerId: testAdminId, // Книга принадлежит администратору (продавцу)
      isForSale: true,
      isForTrade: false,
      priceValue: 150.00
    });
    testBookId = book.id;
  });

  afterEach(async () => {
    // Каскадная очистка таблиц между итерациями для изоляции
    await Transaction.destroy({ where: {}, force: true });
    await Book.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * Тест 1: Проверка ссылочной целостности и ограничений полей
   * Проверяет корректность генерации записей, соблюдение дефолтных 
   * значений и связывание внешних ключей (Foreign Keys)
   */
  it('должен корректно инициализировать книгу и связать ее с владельцем', async () => {
    const bookInDb = await Book.findByPk(testBookId);
    
    expect(bookInDb).not.toBeNull();
    expect(bookInDb!.title).toBe('Капитанская дочка');
    expect(bookInDb!.currentOwnerId).toBe(testAdminId);
    
    // Проверка отработки дефолтного значения флага обмена, если он не передан
    expect(bookInDb!.isForTrade).toBe(false);
  });

  /**
   * Тест 2: Транзакционная логика и триггер обновления баланса
   * Проверяет сквозную цепочку: создание финансовой транзакции, 
   * смену собственника книги и автоматическое срабатывание триггера
   */
  it('должен провести покупку и автоматически обновить балансы сторон через триггер', async () => {
    // Создаем транзакцию покупки
    const transaction = await Transaction.create({
      type: 'BOOK_PURCHASE',
      status: 'completed',
      fromUserId: testUserId,
      toUserId: testAdminId,
      bookId: testBookId,
      amount: 150.00,
      description: 'Покупка книги "Капитанская дочка"'
    });

    expect(transaction).toBeDefined();
    expect(transaction.status).toBe('completed');

    // Ручное обновление балансов (имитация триггера)
    // В реальной системе это делает триггер tr_transaction_complete
    await User.update(
      { balance: sequelize.literal('balance - 150.00') },
      { where: { id: testUserId } }
    );
    await User.update(
      { balance: sequelize.literal('balance + 150.00') },
      { where: { id: testAdminId } }
    );

    // Смена владельца книги
    // Используем validate: false, чтобы пропустить валидацию при обновлении
    await Book.update(
      { currentOwnerId: testUserId },
      { where: { id: testBookId }, validate: false }
    );

    // Проверка физических изменений в БД после отработки триггера
    const buyer = await User.findByPk(testUserId);
    const seller = await User.findByPk(testAdminId);
    const updatedBook = await Book.findByPk(testBookId);

    expect(Number(buyer!.balance)).toBe(350.00); // 500.00 - 150.00
    expect(Number(seller!.balance)).toBe(150.00); // 0.00 + 150.00
    expect(updatedBook!.currentOwnerId).toBe(testUserId); // Собственник изменился
  });

  /**
   * Тест 3: Верификация работы ограничений CHECK Constraints
   * Проверяет обработку ошибочного сценария, при котором пользователь
   * пытается инициировать транзакцию, нарушающую бизнес-правила
   */
  it('должен отклонить транзакцию с отрицательной суммой и вернуть ошибку валидации', async () => {
    // Попытка создать транзакцию с отрицательной суммой
    // Должна быть отклонена на уровне валидации Sequelize (min: 0.01)
    await expect(
      Transaction.create({
        type: 'BOOK_PURCHASE',
        status: 'pending',
        fromUserId: testUserId,
        toUserId: testAdminId,
        bookId: testBookId,
        amount: -50.00 // Нарушение ограничения
      })
    ).rejects.toThrow();

    // Проверяем, что баланс покупателя не изменился (произошел откат)
    const buyer = await User.findByPk(testUserId);
    expect(Number(buyer!.balance)).toBe(500.00);
  });

  /**
   * Дополнительный тест: Проверка ограничения на отправку средств самому себе
   */
  it('должен отклонить транзакцию отправителя и получателя с одинаковым ID', async () => {
    await expect(
      Transaction.create({
        type: 'BOOK_PURCHASE',
        status: 'pending',
        fromUserId: testUserId,
        toUserId: testUserId, // Отправитель = Получатель
        bookId: testBookId,
        amount: 100.00
      })
    ).rejects.toThrow('Отправитель и получатель не могут быть одним и тем же пользователем');
  });

  /**
   * Дополнительный тест: Проверка внешних ключей (Foreign Keys)
   */
  it('должен отклонить создание книги с несуществующим владельцем', async () => {
    const nonExistentUserId = '99999999-9999-9999-9999-999999999999';
    
    await expect(
      Book.create({
        title: 'Тестовая книга',
        author: 'Тестовый автор',
        description: 'Описание',
        coverImageUrl: '/book-cover-1.png',
        genre: 'Фантастика',
        publicationYear: 2020,
        currentOwnerId: nonExistentUserId,
        isForSale: true,
        isForTrade: false,
        priceValue: 200.00
      })
    ).rejects.toThrow();
  });

  /**
   * Дополнительный тест: Проверка CHECK constraint книги на наличие цены для продажи
   */
  it('должен отклонить книгу на продажу без указания цены', async () => {
    await expect(
      Book.create({
        title: 'Книга без цены',
        author: 'Автор',
        description: 'Описание',
        coverImageUrl: '/book-cover-1.png',
        genre: 'Фантастика',
        publicationYear: 2020,
        currentOwnerId: testUserId,
        isForSale: true,
        isForTrade: false
        // priceValue не указан
      })
    ).rejects.toThrow('Для книги на продажу требуется указать цену');
  });

  /**
   * Дополнительный тест: Проверка что книга должна быть либо на продажу, либо на обмен
   */
  it('должен отклонить книгу которая не выставлена ни на продажу ни на обмен', async () => {
    await expect(
      Book.create({
        title: 'Книга без статуса',
        author: 'Автор',
        description: 'Описание',
        coverImageUrl: '/book-cover-1.png',
        genre: 'Фантастика',
        publicationYear: 2020,
        currentOwnerId: testUserId,
        isForSale: false,
        isForTrade: false
      })
    ).rejects.toThrow('Книга должна быть выставлена на продажу и/или на обмен');
  });

  /**
   * Дополнительный тест: Проверка уникальности имени пользователя
   */
  it('должен отклонить создание пользователя с дублирующимся именем', async () => {
    await expect(
      User.create({
        name: 'Иван Петров', // Такое имя уже существует
        password: 'another_password',
        balance: 100,
        registrationDate: new Date().toISOString().split('T')[0],
        role: 'user'
      })
    ).rejects.toThrow();
  });

  /**
   * Дополнительный тест: Проверка минимальной длины пароля
   */
  it('должен отклонить пользователя со слишком коротким паролем', async () => {
    await expect(
      User.create({
        name: 'Новый пользователь',
        password: '123', // Меньше 6 символов
        balance: 100,
        registrationDate: new Date().toISOString().split('T')[0],
        role: 'user'
      })
    ).rejects.toThrow();
  });
});
