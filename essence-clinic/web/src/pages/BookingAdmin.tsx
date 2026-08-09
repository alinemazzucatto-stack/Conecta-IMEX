import { useState, useEffect } from 'react';
import { ChevronRight, Copy, Save } from 'lucide-react';

interface BookingSettings {
  customUrl: string;
  enabled: boolean;
  lunchStart: string;
  lunchEnd: string;
  daySettings: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
}

const DAYS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function BookingAdmin() {
  const [settings, setSettings] = useState<BookingSettings>({
    customUrl: 'agendamentominhaclínica',
    enabled: true,
    lunchStart: '12:00',
    lunchEnd: '13:00',
    daySettings: {
      segunda: { start: '09:00', end: '18:00' },
      terça: { start: '09:00', end: '18:00' },
      quarta: { start: '09:00', end: '18:00' },
      quinta: { start: '09:00', end: '18:00' },
      sexta: { start: '09:00', end: '18:00' },
      sábado: { start: '09:00', end: '14:00' },
      domingo: { start: '00:00', end: '00:00' },
    },
  });

  const [saved, setSaved] = useState(false);

  const publicUrl = `https://essence.app/${settings.customUrl}`;

  const handleSave = () => {
    localStorage.setItem('bookingSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ⚙️ Agendamento Online
        </h1>
        <p className="text-gray-600">
          Configure o link público e horários de atendimento
        </p>
      </div>

      {/* Status Toggle */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Status</h2>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">
              {settings.enabled ? '✅ Online' : '❌ Offline'}
            </span>
          </label>
        </div>
        <p className="text-sm text-gray-600">
          {settings.enabled
            ? 'Clientes podem se agendar através do link público'
            : 'Link público desativado temporariamente'}
        </p>
      </div>

      {/* Public URL */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Seu Link Público</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.customUrl}
            onChange={(e) => setSettings({ ...settings, customUrl: e.target.value })}
            placeholder="agendamentominhaclínica"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={copyUrl}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Copy size={20} />
            Copiar
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-600">{publicUrl}</p>
      </div>

      {/* Lunch Hours */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Horário de Almoço</h2>
        <p className="text-sm text-gray-600 mb-4">
          Clientes não conseguem se agendar neste intervalo
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">De</label>
            <input
              type="time"
              value={settings.lunchStart}
              onChange={(e) => setSettings({ ...settings, lunchStart: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Até</label>
            <input
              type="time"
              value={settings.lunchEnd}
              onChange={(e) => setSettings({ ...settings, lunchEnd: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Days and Hours */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Dias e Horários de Atendimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DAYS.map((day, idx) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{DAY_LABELS[idx]}</h3>
              <div className="flex gap-3">
                <input
                  type="time"
                  value={settings.daySettings[day].start}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      daySettings: {
                        ...settings.daySettings,
                        [day]: { ...settings.daySettings[day], start: e.target.value },
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={settings.daySettings[day].start === '00:00'}
                />
                <span className="flex items-center text-gray-500">−</span>
                <input
                  type="time"
                  value={settings.daySettings[day].end}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      daySettings: {
                        ...settings.daySettings,
                        [day]: { ...settings.daySettings[day], end: e.target.value },
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={settings.daySettings[day].start === '00:00'}
                />
              </div>
              <label className="flex items-center mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.daySettings[day].start === '00:00'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({
                        ...settings,
                        daySettings: {
                          ...settings.daySettings,
                          [day]: { start: '00:00', end: '00:00' },
                        },
                      });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-xs text-gray-600">Fechado</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 font-semibold"
      >
        <Save size={20} />
        Salvar Configurações
      </button>

      {saved && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✅ Configurações salvas com sucesso!
        </div>
      )}
    </div>
  );
}
