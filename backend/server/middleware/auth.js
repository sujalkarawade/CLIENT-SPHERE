/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { verifyToken } from '../utils/crypto.js';

export function authMiddleware(req, res, next) {
  // Authentication bypass: always login as the default seeded user
  req.user = {
    id: 'user',
    email: 'admin@crm.com',
    name: 'Sujal Karawade'
  };
  next();
}