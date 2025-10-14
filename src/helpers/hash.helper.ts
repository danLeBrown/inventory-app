import { compare, hashSync } from 'bcrypt';
import * as crypto from 'crypto';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
  return hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(
  password: string | undefined,
  hash: string | undefined,
): Promise<boolean> {
  if (!password || !hash) {
    return Promise.resolve(false);
  }

  return compare(password, hash);
}

/**
 * generate simple md5 hash from string
 * @param {string} string
 * @returns {string}
 */
export function generateSimpleHash(string: string): string {
  return crypto.createHash('sha256').update(string).digest('hex');
}
