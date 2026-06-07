/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto';

// Extend Express Request type to support user injection
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Authentication bypass: always login as the default seeded user
  req.user = {
    id: 'user-default-1',
    email: 'sujalkarawade18@gmail.com',
    name: 'Sujal Karawade'
  };
  next();
}
