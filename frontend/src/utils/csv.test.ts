import { describe, it, expect } from 'vitest';
import { processCsvContent } from './csv';

describe('CSV Processing Logic', () => {
  it('should parse valid emails from a single column CSV', () => {
    const csvData = `email,name\njohn@example.com,John\nalice@example.com,Alice`;
    const result = processCsvContent(csvData);
    
    expect(result.detected).toBe(2);
    expect(result.valid).toBe(2);
    expect(result.invalid).toBe(0);
    expect(result.duplicates).toBe(0);
    expect(result.validEmails).toEqual(['john@example.com', 'alice@example.com']);
  });

  it('should detect invalid emails', () => {
    const csvData = `email\njohn@example.com\nnot-an-email\n@broken.com\nvalid@domain.co`;
    const result = processCsvContent(csvData);
    
    expect(result.detected).toBe(4);
    expect(result.valid).toBe(2);
    expect(result.invalid).toBe(2);
    expect(result.duplicates).toBe(0);
    expect(result.validEmails).toEqual(['john@example.com', 'valid@domain.co']);
  });

  it('should remove duplicates case-insensitively', () => {
    const csvData = `email\nTest@example.com\nTEST@EXAMPLE.COM\nother@example.com\ntest@example.com`;
    const result = processCsvContent(csvData);
    
    expect(result.detected).toBe(4);
    expect(result.valid).toBe(2); // Test@example.com and other@example.com
    expect(result.invalid).toBe(0);
    expect(result.duplicates).toBe(2);
    expect(result.validEmails).toEqual(['Test@example.com', 'other@example.com']);
  });

  it('should scan for emails if no email header exists', () => {
    const csvData = `random,data\nsomething,john@example.com\nalice@example.com,other`;
    const result = processCsvContent(csvData);
    
    expect(result.detected).toBe(2);
    expect(result.valid).toBe(2);
    expect(result.invalid).toBe(0);
    expect(result.duplicates).toBe(0);
    expect(result.validEmails).toEqual(['john@example.com', 'alice@example.com']);
  });

  it('should handle raw lists separated by newlines without headers', () => {
    const txtData = `john@example.com\nalice@example.com\nbob@example.com`;
    const result = processCsvContent(txtData);
    
    expect(result.detected).toBe(3);
    expect(result.valid).toBe(3);
    expect(result.validEmails).toContain('bob@example.com');
  });
});
