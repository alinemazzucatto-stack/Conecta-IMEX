import { Router, Response } from 'express';
import { supabase } from '../index';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Get clinic settings
router.get('/clinic', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('clinic_settings')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (error) {
    console.error('Error fetching clinic settings:', error);
    res.status(500).json({ error: 'Failed to fetch clinic settings' });
  }
});

// Create or update clinic settings
router.post('/clinic', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if settings already exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('clinic_settings')
      .select('id')
      .eq('clinic_id', req.user.clinic_id)
      .single();

    let result;
    if (existingSettings && !checkError) {
      // Update existing settings
      result = await supabase
        .from('clinic_settings')
        .update(req.body)
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from('clinic_settings')
        .insert([
          {
            clinic_id: req.user.clinic_id,
            ...req.body
          }
        ])
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.status(201).json(result.data);
  } catch (error) {
    console.error('Error creating clinic settings:', error);
    res.status(500).json({ error: 'Failed to create clinic settings' });
  }
});

// Update clinic settings
router.put('/clinic/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('clinic_settings')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating clinic settings:', error);
    res.status(500).json({ error: 'Failed to update clinic settings' });
  }
});

// Get holidays
router.get('/holidays', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

// Create holiday
router.post('/holidays', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('holidays')
      .insert([
        {
          clinic_id: req.user.clinic_id,
          ...req.body
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating holiday:', error);
    res.status(500).json({ error: 'Failed to create holiday' });
  }
});

// Update holiday
router.put('/holidays/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('holidays')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating holiday:', error);
    res.status(500).json({ error: 'Failed to update holiday' });
  }
});

// Delete holiday
router.delete('/holidays/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;
    res.json({ message: 'Holiday deleted' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

export default router;
