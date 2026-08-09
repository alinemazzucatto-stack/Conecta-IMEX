import BookingWizard from '@/components/BookingWizard';

export default function PublicBooking() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-5xl">💎</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Essence Clinic
          </h1>
          <p className="text-gray-600 text-lg">
            Agende seu atendimento online
          </p>
        </div>

        {/* Booking Wizard */}
        <BookingWizard />

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Receba a confirmação do seu agendamento via WhatsApp
          </p>
          <p className="mt-2">
            © 2024 Essence Clinic. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
