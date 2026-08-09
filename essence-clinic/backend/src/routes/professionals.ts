import { Router, Response } from 'express';
import { supabase } from '../index';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../middleware/auth';

const router = Router();

// List professionals
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ error: 'Failed to fetch professionals' });
  }
});

// Create professional
router.post('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('professionals')
      .insert([
        {
          clinic_id: req.user.clinic_id,
          ...req.body,
          active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating professional:', error);
    res.status(500).json({ error: 'Failed to create professional' });
  }
});

// Get professional by ID
router.get('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Professional not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching professional:', error);
    res.status(500).json({ error: 'Failed to fetch professional' });
  }
});

// Update professional
router.put('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('professionals')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Professional not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating professional:', error);
    res.status(500).json({ error: 'Failed to update professional' });
  }
});

// Delete professional
router.delete('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;

    res.json({ message: 'Professional deleted successfully' });
  } catch (error) {
    console.error('Error deleting professional:', error);
    res.status(500).json({ error: 'Failed to delete professional' });
  }
});

export default router;
