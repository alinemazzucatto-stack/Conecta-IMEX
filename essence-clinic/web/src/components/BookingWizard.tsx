import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface BookingFormData {
  procedure?: string;
  professional?: string;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Procedimento', description: 'Escolha o serviço desejado' },
  { number: 2, title: 'Profissional', description: 'Selecione o profissional' },
  { number: 3, title: 'Data', description: 'Escolha a data da consulta' },
  { number: 4, title: 'Horário', description: 'Selecione o horário disponível' },
  { number: 5, title: 'Confirmação', description: 'Confirme seus dados' },
];

const PROCEDURES = [
  { id: '1', name: 'Limpeza de Pele', duration: 60, price: 150 },
  { id: '2', name: 'Radiofrequência', duration: 45, price: 320 },
  { id: '3', name: 'Peeling Químico', duration: 50, price: 280 },
  { id: '4', name: 'Microagulhamento', duration: 60, price: 300 },
];

const PROFESSIONALS = [
  { id: '1', name: 'Camila Duarte' },
  { id: '2', name: 'Marina Silva' },
  { id: '3', name: 'Jessica Costa' },
];

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({});

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    console.log('Agendamento confirmado:', formData);
    alert('Agendamento realizado com sucesso! Verifique seu WhatsApp para confirmação.');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.procedure;
      case 2:
        return !!formData.professional;
      case 3:
        return !!formData.date;
      case 4:
        return !!formData.time;
      case 5:
        return !!formData.name && !!formData.phone;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex justify-between mb-8">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  step.number <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 transition ${
                    step.number < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
        {/* Step 1: Procedure */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {PROCEDURES.map((proc) => (
              <button
                key={proc.id}
                onClick={() => setFormData({ ...formData, procedure: proc.id })}
                className={`w-full p-4 text-left border-2 rounded-lg transition ${
                  formData.procedure === proc.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{proc.name}</h3>
                    <p className="text-sm text-gray-600">{proc.duration} minutos</p>
                  </div>
                  <p className="font-bold text-blue-500">R$ {proc.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Professional */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {PROFESSIONALS.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setFormData({ ...formData, professional: prof.id })}
                className={`w-full p-4 text-left border-2 rounded-lg transition ${
                  formData.professional === prof.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{prof.name}</h3>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Date */}
        {currentStep === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Escolha a data
            </label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Step 4: Time */}
        {currentStep === 4 && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Horários disponíveis
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                <button
                  key={time}
                  onClick={() => setFormData({ ...formData, time })}
                  className={`p-3 rounded-lg border-2 font-semibold transition ${
                    formData.time === time
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                WhatsApp com DDD
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98888-7777"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Resumo do Agendamento</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Procedimento:</strong>{' '}
                  {PROCEDURES.find((p) => p.id === formData.procedure)?.name}
                </p>
                <p>
                  <strong>Profissional:</strong>{' '}
                  {PROFESSIONALS.find((p) => p.id === formData.professional)?.name}
                </p>
                <p>
                  <strong>Data:</strong> {formData.date}
                </p>
                <p>
                  <strong>Horário:</strong> {formData.time}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChevronLeft size={20} />
          Voltar
        </button>

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            Próximo
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Confirmar Agendamento
          </button>
        )}
      </div>
    </div>
  );
}
