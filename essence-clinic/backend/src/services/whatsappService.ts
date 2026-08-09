import twilio from 'twilio';

interface AppointmentNotificationData {
  patientPhone: string;
  patientName: string;
  professionalName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
}

let twilioClient: ReturnType<typeof twilio> | null = null;

const initTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

export const whatsappService = {
  async sendAppointmentNotification(data: AppointmentNotificationData) {
    try {
      const client = initTwilioClient();

      if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
        console.log('WhatsApp service not configured, skipping notification');
        return;
      }

      // Format phone number to E.164 format if needed (e.g., +55 11 98765-4321 -> +5511987654321)
      const phoneNumber = data.patientPhone
        .replace(/[^\d+]/g, '')
        .replace(/\s/g, '');

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      // Format date to readable format
      const appointmentDate = new Date(data.appointmentDate);
      const dateStr = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const message = `Olá ${data.patientName}! 👋\n\n` +
        `Seu agendamento foi confirmado com sucesso! ✅\n\n` +
        `📋 *Detalhes do Agendamento:*\n` +
        `👨‍⚕️ Profissional: ${data.professionalName}\n` +
        `📅 Data: ${dateStr}\n` +
        `🕐 Hora: ${data.appointmentTime}\n` +
        `🏥 Clínica: ${data.clinicName}\n\n` +
        `Se precisar cancelar ou reagendar, entre em contato conosco com antecedência.\n\n` +
        `Até logo! 😊`;

      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${formattedPhone}`,
        body: message,
      });

      console.log(`WhatsApp message sent to ${formattedPhone} for appointment on ${data.appointmentDate}`);
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw error;
    }
  },

  async sendCancellationNotification(data: {
    patientPhone: string;
    patientName: string;
    professionalName: string;
    appointmentDate: string;
    appointmentTime: string;
    clinicName: string;
    reason?: string;
  }) {
    try {
      const client = initTwilioClient();

      if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
        console.log('WhatsApp service not configured, skipping notification');
        return;
      }

      const phoneNumber = data.patientPhone
        .replace(/[^\d+]/g, '')
        .replace(/\s/g, '');

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const appointmentDate = new Date(data.appointmentDate);
      const dateStr = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let message = `Olá ${data.patientName}! 👋\n\n` +
        `Seu agendamento foi cancelado. ❌\n\n` +
        `📋 *Agendamento Cancelado:*\n` +
        `👨‍⚕️ Profissional: ${data.professionalName}\n` +
        `📅 Data: ${dateStr}\n` +
        `🕐 Hora: ${data.appointmentTime}\n`;

      if (data.reason) {
        message += `\n📝 Motivo: ${data.reason}\n`;
      }

      message += `\nPara reagendar, entre em contato conosco.\n\n`;
      message += `Obrigado! 😊`;

      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${formattedPhone}`,
        body: message,
      });

      console.log(`WhatsApp cancellation notification sent to ${formattedPhone}`);
    } catch (error) {
      console.error('Error sending WhatsApp cancellation notification:', error);
      throw error;
    }
  }
};
