import { Router, Response } from 'express';
import { supabase } from '../index';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../middleware/auth';
import { whatsappService } from '../services/whatsappService';

const router = Router();

// List appointments
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', req.user.clinic_id)
      .order('date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment
router.post('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { professional_id, client_id, date, time, notes } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          clinic_id: req.user.clinic_id,
          professional_id,
          client_id,
          date,
          time,
          notes,
          status: 'scheduled'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    try {
      if (client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('name, phone')
          .eq('id', client_id)
          .single();

        const { data: professionalData } = await supabase
          .from('professionals')
          .select('name')
          .eq('id', professional_id)
          .single();

        if (clientData?.phone && professionalData?.name) {
          await whatsappService.sendAppointmentNotification({
            patientPhone: clientData.phone,
            patientName: clientData.name,
            professionalName: professionalData.name,
            appointmentDate: date,
            appointmentTime: time,
            clinicName: 'Essence Clinic'
          });
        }
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp notification:', whatsappError);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get appointment by ID
router.get('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment
router.put('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    try {
      if (data.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('name, phone')
          .eq('id', data.client_id)
          .single();

        const { data: professionalData } = await supabase
          .from('professionals')
          .select('name')
          .eq('id', data.professional_id)
          .single();

        if (clientData?.phone && professionalData?.name) {
          await whatsappService.sendAppointmentNotification({
            patientPhone: clientData.phone,
            patientName: clientData.name,
            professionalName: professionalData.name,
            appointmentDate: data.date,
            appointmentTime: data.time,
            clinicName: 'Essence Clinic'
          });
        }
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp appointment update:', whatsappError);
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { data: appointmentData } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id)
      .single();

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id)
      .eq('clinic_id', req.user.clinic_id);

    if (error) throw error;

    try {
      if (appointmentData?.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('name, phone')
          .eq('id', appointmentData.client_id)
          .single();

        const { data: professionalData } = await supabase
          .from('professionals')
          .select('name')
          .eq('id', appointmentData.professional_id)
          .single();

        if (clientData?.phone && professionalData?.name) {
          await whatsappService.sendCancellationNotification({
            patientPhone: clientData.phone,
            patientName: clientData.name,
            professionalName: professionalData.name,
            appointmentDate: appointmentData.date,
            appointmentTime: appointmentData.time,
            clinicName: 'Essence Clinic',
            reason: req.body.reason
          });
        }
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp cancellation notification:', whatsappError);
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
