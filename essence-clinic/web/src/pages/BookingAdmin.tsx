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
    <div className="p-8 booking-admin-container">
      <div className="booking-admin-header">
        <h1>⚙️ Agendamento Online</h1>
        <p>Configure o link público e horários de atendimento para seus clientes</p>
      </div>

      {/* Status Toggle */}
      <div className="config-card">
        <h2>Status do Agendamento</h2>
        <p>
          {settings.enabled
            ? '✅ Clientes podem se agendar através do link público'
            : '❌ Link público desativado temporariamente'}
        </p>
        <div className="status-toggle">
          <span className="font-medium text-gray-900">
            {settings.enabled ? 'Online' : 'Offline'}
          </span>
          <label className="status-toggle-switch">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Public URL */}
      <div className="config-card">
        <h2>Seu Link Público</h2>
        <p>Compartilhe este link com seus clientes para que eles possam se agendar online</p>
        <div className="url-input-group">
          <input
            type="text"
            value={settings.customUrl}
            onChange={(e) => setSettings({ ...settings, customUrl: e.target.value })}
            placeholder="agendamentominhaclínica"
          />
          <button onClick={copyUrl} className="url-copy-btn">
            <Copy size={18} />
            Copiar
          </button>
        </div>
        <div className="public-url-display">{publicUrl}</div>
      </div>

      {/* Lunch Hours */}
      <div className="config-card">
        <h2>Horário de Almoço</h2>
        <p>
          Clientes não conseguem se agendar durante este período
        </p>
        <div className="time-input-grid">
          <div className="time-input-group">
            <label>Início</label>
            <input
              type="time"
              value={settings.lunchStart}
              onChange={(e) => setSettings({ ...settings, lunchStart: e.target.value })}
            />
          </div>
          <div className="time-input-group">
            <label>Fim</label>
            <input
              type="time"
              value={settings.lunchEnd}
              onChange={(e) => setSettings({ ...settings, lunchEnd: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Days and Hours */}
      <div className="config-card">
        <h2>Dias e Horários de Atendimento</h2>
        <p>Configure os horários de funcionamento para cada dia da semana</p>
        <div className="days-grid">
          {DAYS.map((day, idx) => (
            <div key={day} className="day-card">
              <h3>{DAY_LABELS[idx]}</h3>
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
                disabled={settings.daySettings[day].start === '00:00'}
                placeholder="Início"
              />
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
                disabled={settings.daySettings[day].start === '00:00'}
                placeholder="Fim"
              />
              <label className="day-closed-label">
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
                />
                <span>Fechado</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} className="save-button">
        <Save size={20} />
        Salvar Configurações
      </button>

      {saved && (
        <div className="success-message">
          ✅ Configurações salvas com sucesso!
        </div>
      )}
    </div>
  );
}
