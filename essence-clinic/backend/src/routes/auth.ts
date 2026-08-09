import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../index';
import { AuthenticatedRequest, AuthResponse } from '../types';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Validation schemas
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

const generateTokens = (userId: string, clinicId: string, email: string, role: string) => {
  const payload = { user_id: userId, clinic_id: clinicId, email, role };

  const access_token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRATION || '15m'
  } as any);

  const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d'
  } as any);

  return { access_token, refresh_token };
};

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Get user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const { access_token, refresh_token } = generateTokens(
      userData.id,
      userData.clinic_id,
      userData.email,
      userData.role
    );

    // Get user data (without password)
    const { password_hash, ...user } = userData;

    res.json({
      user,
      access_token,
      refresh_token
    } as AuthResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

// Register (Create clinic + admin user)
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name, clinic_name } = registerSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create clinic
    const { data: clinicData, error: clinicError } = await supabase
      .from('clinics')
      .insert([
        {
          name: clinic_name,
          email: email,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (clinicError || !clinicData) {
      throw clinicError || new Error('Failed to create clinic');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create admin user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          clinic_id: clinicData.id,
          email,
          name,
          password_hash,
          role: 'admin'
        }
      ])
      .select()
      .single();

    if (userError || !userData) {
      throw userError || new Error('Failed to create user');
    }

    // Generate tokens
    const { access_token, refresh_token } = generateTokens(
      userData.id,
      userData.clinic_id,
      userData.email,
      userData.role
    );

    const { password_hash: _, ...user } = userData;

    res.status(201).json({
      user,
      access_token,
      refresh_token
    } as AuthResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Refresh token
router.post('/refresh', (req, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as any;

    const { access_token, refresh_token: new_refresh_token } = generateTokens(
      decoded.user_id,
      decoded.clinic_id,
      decoded.email,
      decoded.role
    );

    res.json({ access_token, refresh_token: new_refresh_token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, clinic_id, email, name, role, created_at, updated_at')
      .eq('id', req.user.user_id)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
