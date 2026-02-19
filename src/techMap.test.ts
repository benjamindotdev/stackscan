import { describe, it, expect } from 'vitest';
import { techMap } from './techMap';
import { techDefinitions } from './techDefinitions';

describe('techMap', () => {
  it('should be populated', () => {
    expect(Object.keys(techMap).length).toBeGreaterThan(0);
  });

  it('should map typescript alias correctly', () => {
    expect(techMap['typescript']).toEqual({
      name: 'TypeScript',
      logo: 'language/typescript.svg',
      type: 'language'
    });
  });

  it('should include all aliases from definitions', () => {
    techDefinitions.forEach(def => {
      def.aliases.forEach(alias => {
        expect(techMap[alias]).toBeDefined();
        expect(techMap[alias].name).toBe(def.name);
      });
    });
  });
});
