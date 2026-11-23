import { describe, expect, it } from 'vitest';
import { initialsOf } from './profileFigures';

describe('initialsOf', () => {
  it('uses the first and last name and skips titles', () => {
    expect(initialsOf('Dr Agnes Wanjiru')).toBe('AW');
    expect(initialsOf('Mercy Chebet Rotich')).toBe('MR');
    expect(initialsOf('Brian')).toBe('B');
    expect(initialsOf('')).toBe('?');
  });
});