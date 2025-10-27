import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

describe('Utility Functions Tests', () => {
  describe('JWT Token Operations', () => {
    const secret = 'test-secret';
    
    it('should generate a JWT token', () => {
      const payload = { userId: 'user-123' };
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify a valid JWT token', () => {
      const payload = { userId: 'user-123' };
      const token = jwt.sign(payload, secret);
      
      const decoded = jwt.verify(token, secret) as any;
      
      expect(decoded.userId).toBe('user-123');
    });

    it('should reject an invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, secret);
      }).toThrow();
    });

    it('should reject a token with wrong secret', () => {
      const payload = { userId: 'user-123' };
      const token = jwt.sign(payload, secret);
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'plainpassword';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should successfully compare correct password', async () => {
      const password = 'plainpassword';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await bcrypt.compare(password, hashedPassword);
      
      expect(result).toBe(true);
    });

    it('should fail to compare incorrect password', async () => {
      const password = 'plainpassword';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(result).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'plainpassword';
      
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);
      
      expect(hash1).not.toBe(hash2);
      
      // Both should verify against the original password
      const verify1 = await bcrypt.compare(password, hash1);
      const verify2 = await bcrypt.compare(password, hash2);
      
      expect(verify1).toBe(true);
      expect(verify2).toBe(true);
    });

    it('should handle password comparison edge cases', async () => {
      const emptyPassword = '';
      const hashedPassword = await bcrypt.hash('somepassword', 12);
      
      const result = await bcrypt.compare(emptyPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
});

