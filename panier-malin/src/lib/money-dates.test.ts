import { describe, expect, it } from 'vitest';
import { discountPercent, formatCHF, parseCHF } from './money';
import { addDays, formatDate, isIsoDate, isStale, todayInZurich, validityStatus } from './dates';

describe('montants CHF', () => {
  it('formate au format suisse', () => {
    expect(formatCHF(450)).toBe('CHF 4.50');
    expect(formatCHF(5)).toBe('CHF 0.05');
    expect(formatCHF(123405)).toBe('CHF 1’234.05');
  });

  it('refuse les montants non entiers', () => {
    expect(() => formatCHF(4.5)).toThrow();
  });

  it('analyse les saisies sans passer par un flottant', () => {
    expect(parseCHF('4.50')).toBe(450);
    expect(parseCHF('4,5')).toBe(450);
    expect(parseCHF('CHF 12.–')).toBe(1200);
    expect(parseCHF('0.1')).toBe(10);
    expect(parseCHF('1’000.20')).toBe(100020);
    expect(parseCHF('-3')).toBeNull();
    expect(parseCHF('abc')).toBeNull();
    expect(parseCHF('1.234')).toBeNull();
  });

  it('calcule la réduction seulement avec un prix de référence cohérent', () => {
    expect(discountPercent(135, 165)).toBe(18); // 18.18 → 18 (jamais exagéré)
    expect(discountPercent(100, 200)).toBe(50);
    expect(discountPercent(100, null)).toBeNull();
    expect(discountPercent(200, 100)).toBeNull();
    expect(discountPercent(100, 100)).toBeNull();
  });
});

describe('dates Europe/Zurich', () => {
  it('donne la date civile suisse, pas la date UTC', () => {
    // 23:30 UTC le 31 mars = 01:30 le 1er avril à Zurich (heure d'été)
    expect(todayInZurich(new Date('2026-03-31T23:30:00Z'))).toBe('2026-04-01');
    // 23:30 UTC le 15 janvier = 00:30 le 16 janvier (heure d'hiver)
    expect(todayInZurich(new Date('2026-01-15T23:30:00Z'))).toBe('2026-01-16');
    expect(todayInZurich(new Date('2026-01-15T22:30:00Z'))).toBe('2026-01-15');
  });

  it('les bornes de validité sont incluses', () => {
    expect(validityStatus('2026-11-10', '2026-11-16', '2026-11-16')).toBe('active');
    expect(validityStatus('2026-11-10', '2026-11-16', '2026-11-10')).toBe('active');
    expect(validityStatus('2026-11-10', '2026-11-16', '2026-11-17')).toBe('expired');
    expect(validityStatus('2026-11-10', '2026-11-16', '2026-11-09')).toBe('upcoming');
  });

  it('valide et manipule les dates', () => {
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(formatDate('2026-11-16')).toBe('16.11.2026');
  });

  it('signale les offres non revérifiées', () => {
    const now = new Date('2026-11-16T12:00:00Z');
    expect(isStale('2026-11-15T12:00:00Z', now)).toBe(false);
    expect(isStale('2026-11-01T12:00:00Z', now)).toBe(true);
    expect(isStale('pas une date', now)).toBe(true);
  });
});
