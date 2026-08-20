import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { localAuthService } from '../services/localAuth';
import { AuthenticatedRequest, AuthResponse } from '../types';
import { verifyToken } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  clinic_name: z.string().min(2, 'Clinic name must be at least 2 characters')
});

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name, clinic_name } = registerSchema.parse(req.body);

    const user = await localAuthService.register(email, password, name, clinic_name);

    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        clinic_name: clinic_name
      },
      access_token: token,
      refresh_token: token
    } as AuthResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(400).json({ error: (error as Error).message });
    }
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await localAuthService.login(email, password);

    res.json({
      user: result.user,
      access_token: result.token,
      refresh_token: result.token
    } as AuthResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(401).json({ error: (error as Error).message });
    }
  }
});

// Get current user
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await localAuthService.getUser(req.userId!);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
