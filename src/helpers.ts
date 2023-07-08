import { createHash } from 'crypto';

export function generateHash(value: string): string {
  const hash = createHash('sha256');
  hash.update(value);
  return hash.digest('hex').substr(0, 8);
}
