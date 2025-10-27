import * as Joi from 'joi';

describe('Validation Tests', () => {
  describe('User Registration Schema', () => {
    const registerSchema = Joi.object({
      username: Joi.string().min(3).max(100).required(),
      password: Joi.string().min(6).max(255).required()
    });

    it('should validate correct registration data', () => {
      const validData = {
        username: 'testuser',
        password: 'password123'
      };

      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject short password', () => {
      const invalidData = {
        username: 'testuser',
        password: '12345'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('6');
    });

    it('should reject short username', () => {
      const invalidData = {
        username: 'ab',
        password: 'password123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject missing fields', () => {
      const invalidData = {
        username: 'testuser'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Book Schema', () => {
    const bookSchema = Joi.object({
      title: Joi.string().min(1).max(255).required(),
      author: Joi.string().min(1).max(255).required(),
      isbn: Joi.string().max(20).optional(),
      genre: Joi.string().max(100).optional(),
      description: Joi.string().optional(),
      price: Joi.number().min(0).optional(),
      stained: Joi.boolean().optional(),
      forSale: Joi.boolean().optional(),
      forTrade: Joi.boolean().optional()
    });

    it('should validate correct book data', () => {
      const validData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
        genre: 'Fiction',
        description: 'A test book',
        price: 100,
        forSale: true,
        forTrade: false
      };

      const { error } = bookSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject book without title', () => {
      const invalidData = {
        author: 'Test Author'
      };

      const { error } = bookSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject negative price', () => {
      const invalidData = {
        title: 'Test Book',
        author: 'Test Author',
        price: -10
      };

      const { error } = bookSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should accept book with minimal data', () => {
      const minimalData = {
        title: 'Test Book',
        author: 'Test Author'
      };

      const { error } = bookSchema.validate(minimalData);
      expect(error).toBeUndefined();
    });
  });

  describe('Balance Top-up Schema', () => {
    const topUpSchema = Joi.object({
      amount: Joi.number().positive().max(10000).required()
    });

    it('should validate correct amount', () => {
      const validData = { amount: 500 };
      const { error } = topUpSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject negative amount', () => {
      const invalidData = { amount: -100 };
      const { error } = topUpSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject amount over limit', () => {
      const invalidData = { amount: 20000 };
      const { error } = topUpSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject zero amount', () => {
      const invalidData = { amount: 0 };
      const { error } = topUpSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});

