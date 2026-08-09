import { Router, Response } from 'express';
import { supabase } from '../index';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../middleware/auth';

const router = Router();

// List services
router.get('/services', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create service
router.post('/services', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('services')
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
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service
router.put('/services/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('services')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
router.delete('/services/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// List transactions (income/expenses)
router.get('/transactions', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create transaction
router.post('/transactions', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('financial_transactions')
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
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/transactions/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('financial_transactions')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/transactions/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get financial summary
router.get('/summary', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data: transactions, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;

    const income = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const expenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const balance = income - expenses;

    res.json({
      total_income: income,
      total_expenses: expenses,
      balance: balance,
      total_transactions: transactions.length
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

export default router;
