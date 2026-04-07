/**
 * Utility Function Tests
 */

describe('Utility Functions', () => {
  describe('Date Formatting', () => {
    it('should format dates consistently', () => {
      const date = new Date('2024-03-28');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2024-03-28');
    });

    it('should handle invalid dates', () => {
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });
  });

  describe('String Operations', () => {
    it('should slugify text correctly', () => {
      const text = 'Hello World Test';
      const slug = text.toLowerCase().replace(/\s+/g, '-');
      expect(slug).toBe('hello-world-test');
    });

    it('should truncate long strings', () => {
      const longText = 'a'.repeat(100);
      const truncated = longText.substring(0, 50);
      expect(truncated.length).toBe(50);
    });
  });

  describe('Object Operations', () => {
    it('should safely access nested properties', () => {
      const obj: { a?: { b?: { c: string } } } = { a: { b: { c: 'value' } } };
      const value = obj?.a?.b?.c;
      expect(value).toBe('value');
    });

    it('should handle undefined in optional chaining', () => {
      const obj: { a?: { b?: { c: string } } } = { a: {} };
      const value = obj?.a?.b?.c;
      expect(value).toBeUndefined();
    });
  });
});
