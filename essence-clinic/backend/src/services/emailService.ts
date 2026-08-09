import nodemailer from 'nodemailer';

interface AppointmentEmailData {
  patientEmail: string;
  patientName: string;
  professionalName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const emailService = {
  async sendAppointmentConfirmation(data: AppointmentEmailData) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.log('Email service not configured, skipping email');
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f8fafc; padding: 20px; }
              .footer { background-color: #e2e8f0; padding: 10px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
              .button { background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💎 Confirmação de Agendamento</h1>
              </div>
              <div class="content">
                <p>Olá <strong>${data.patientName}</strong>,</p>
                <p>Seu agendamento foi confirmado com sucesso!</p>

                <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #1e40af; margin-top: 0;">Detalhes do Agendamento:</h3>
                  <p><strong>Profissional:</strong> ${data.professionalName}</p>
                  <p><strong>Data:</strong> ${new Date(data.appointmentDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Hora:</strong> ${data.appointmentTime}</p>
                  <p><strong>Clínica:</strong> ${data.clinicName}</p>
                </div>

                <p>Se você precisa cancelar ou reagendar, entre em contato conosco com antecedência.</p>
                <p style="color: #64748b; font-size: 14px;">Este é um email automático, por favor não responda.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${data.clinicName}. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: data.patientEmail,
        subject: `Agendamento confirmado - ${data.clinicName}`,
        html: htmlContent,
      });

      console.log(`Email sent to ${data.patientEmail} for appointment on ${data.appointmentDate}`);
    } catch (error) {
      console.error('Error sending appointment email:', error);
      throw error;
    }
  },
};
