import { describe, it, expect } from 'vitest';
import { DEFAULT_CATEGORY_ICONS } from './defaults';

describe('DEFAULT_CATEGORY_ICONS', () => {
  it('should be a record with string keys and string values', () => {
    Object.entries(DEFAULT_CATEGORY_ICONS).forEach(([key, value]) => {
      expect(typeof key).toBe('string');
      expect(typeof value).toBe('string');
      expect(key.length).toBeGreaterThan(0);
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('should contain expected default icon mappings', () => {
    expect(DEFAULT_CATEGORY_ICONS.ai).toBe('brain');
    expect(DEFAULT_CATEGORY_ICONS.auth).toBe('lock');
    expect(DEFAULT_CATEGORY_ICONS.utility).toBe('wrench');
  });
});
