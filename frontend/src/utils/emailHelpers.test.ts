import { describe, it, expect } from 'vitest';
import { getLocalPart } from './emailHelpers';

describe('emailHelpers - getLocalPart', () => {
  it('should return empty string if recipient is undefined', () => {
    expect(getLocalPart(undefined)).toBe('');
  });

  it('should extract the local part of an email', () => {
    expect(getLocalPart('test.user@reachinbox.ai')).toBe('test.user');
  });

  it('should return the original string if no @ symbol exists', () => {
    expect(getLocalPart('invalid-email-format')).toBe('invalid-email-format');
  });

  it('should handle emails with multiple domains correctly', () => {
    expect(getLocalPart('hello@sub.domain.com')).toBe('hello');
  });
});
