/**
 * Dates de validité en Europe/Zurich. Les promotions sont valables du `validFrom`
 * au `validUntil` inclus, en jours civils suisses (indépendamment du fuseau du visiteur).
 */

export const ZURICH_TZ = 'Europe/Zurich';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** Date civile du jour à Zurich, au format YYYY-MM-DD. */
export function todayInZurich(now: Date = new Date()): string {
  // en-CA produit le format AAAA-MM-JJ.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZURICH_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  if (!isIsoDate(isoDate)) throw new RangeError(`Date invalide : ${isoDate}`);
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export type ValidityStatus = 'upcoming' | 'active' | 'expired';

export function validityStatus(validFrom: string, validUntil: string, today: string): ValidityStatus {
  if (today < validFrom) return 'upcoming';
  if (today > validUntil) return 'expired';
  return 'active';
}

/** Format suisse : 16.11.2026 */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

/** Format court : « lu 16.11. » */
export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number];
  const weekday = new Intl.DateTimeFormat('fr-CH', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace('.', '');
  return `${weekday} ${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.`;
}

/** Horodatage → « 16.11.2026, 09:30 » à l'heure de Zurich. */
export function formatDateTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('fr-CH', {
    timeZone: ZURICH_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoTimestamp));
}

/**
 * Une offre est considérée « non fraîche » si sa dernière vérification date de plus
 * de `maxAgeHours`. Sa fraîcheur ne peut alors plus être garantie.
 */
export function isStale(lastVerifiedAt: string, now: Date, maxAgeHours = 7 * 24): boolean {
  const verified = Date.parse(lastVerifiedAt);
  if (Number.isNaN(verified)) return true;
  return now.getTime() - verified > maxAgeHours * 3_600_000;
}
