/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';

/**
 * Hash password using PBKDF2 with custom salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compare password with stored PBKDF2 hash
 */
export function comparePassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch (err) {
    return false;
  }
}

/**
 * Simple token encryption / verification signature for JWT-like Auth
 */
export function generateToken(payload: { id: string; email: string; name: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  
  // High-performance secret
  const secret = process.env.JWT_SECRET || 'clientsphere-default-production-key-secret-2026';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${header}.${payloadStr}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${payloadStr}.${signature}`;
}

/**
 * Verify simple JWT token
 */
export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payloadStr, signature] = parts;
    const secret = process.env.JWT_SECRET || 'clientsphere-default-production-key-secret-2026';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${header}.${payloadStr}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name
    };
  } catch (err) {
    return null;
  }
}
