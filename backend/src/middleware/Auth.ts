import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If there is no token, reject the request immediately
  if (!token) {
    return res.status(401).json({ message: 'Access Token Missing. Please log in.' });
  }

  // Verify if the token is valid or expired
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired session token.' });
    }

    // Attach the decoded user payload (contains the user ID) directly to the request
    req.user = decodedUser as { id: string };
    
    // Pass control to the actual route handler
    next();
  });
};