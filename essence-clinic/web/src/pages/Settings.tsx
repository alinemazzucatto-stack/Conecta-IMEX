import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import client from '@/api/client';

interface ClinicSettings {
  id: string;
  clinic_id: string;
  monday_start: string;
  monday_end: string;
  tuesday_start: string;
  tuesday_end: string;
  wednesday_start: string;
  wednesday_end: string;
  thursday_start: string;
  thursday_end: string;
  friday_start: string;
  friday_end: string;
  saturday_start: string;
  saturday_end: string;
  sunday_start: string;
  sunday_end: string;
  appointment_interval: number;
  appointment_duration: number;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  clinic_id: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme, toggleMode, setFontSize, updateColors, resetTheme } = useTheme();
  const [tab, setTab] = useState<'clinic' | 'holidays' | 'customization'>('clinic');
  const [loading, setLoading] = useState(true);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '' });
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const defaultSettings = {
    id: null,
    clinic_id: '',
    monday_start: '08:00',
    monday_end: '18:00',
    tuesday_start: '08:00',
    tuesday_end: '18:00',
    wednesday_start: '08:00',
    wednesday_end: '18:00',
    thursday_start: '08:00',
    thursday_end: '18:00',
    friday_start: '08:00',
    friday_end: '18:00',
    saturday_start: '09:00',
    saturday_end: '13:00',
    sunday_start: 'closed',
    sunday_end: 'closed',
    appointment_interval: 30,
    appointment_duration: 60
  };

  useEffect(() => {
    // Load defaults immediately
    setClinicSettings(defaultSettings as any);
    setLoading(false);

    // Try to fetch from API in background
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const [settingsData, holidaysData] = await Promise.all([
        client.get('/settings/clinic', { signal: controller.signal }),
        client.get('/settings/holidays', { signal: controller.signal })
      ]);

      clearTimeout(timeout);

      const settings = settingsData.data || defaultSettings;
      setClinicSettings(settings as any);
      setHolidays(holidaysData.data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Keep default values on error
    }
  };

  const handleSaveSettings = async () => {
    if (!clinicSettings) return;

    try {
      if (clinicSettings.id) {
        await client.put(`/settings/clinic/${clinicSettings.id}`, clinicSettings);
        alert('✅ Configurações atualizadas com sucesso!');
      } else {
        await client.post('/settings/clinic', clinicSettings);
        alert('✅ Configurações criadas com sucesso!');
      }
      fetchSettings();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('❌ Erro ao salvar configurações');
    }
  };

  const handleSaveHoliday = async () => {
    if (!holidayForm.date || !holidayForm.name.trim()) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      if (editingHoliday) {
        await client.put(`/settings/holidays/${editingHoliday.id}`, holidayForm);
        alert('✅ Feriado atualizado!');
      } else {
        await client.post('/settings/holidays', holidayForm);
        alert('✅ Feriado adicionado!');
      }
      setShowHolidayModal(false);
      setHolidayForm({ date: '', name: '' });
      setEditingHoliday(null);
      fetchSettings();
    } catch (error) {
      console.error('Erro ao salvar feriado:', error);
      alert('❌ Erro ao salvar feriado');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Deletar este feriado?')) return;

    try {
      await client.delete(`/settings/holidays/${id}`);
      alert('✅ Feriado deletado!');
      fetchSettings();
    } catch (error) {
      console.error('Erro ao deletar feriado:', error);
      alert('❌ Erro ao deletar feriado');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando configurações...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: '1.5rem',
          padding: '0.5rem 1rem',
          background: '#0891b2',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        ← Voltar
      </button>

      <h1 style={{ margin: '0 0 2rem 0', color: '#1e40af' }}>⚙️ Configurações da Clínica</h1>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {(['clinic', 'holidays', 'customization'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.75rem 1.5rem',
              background: tab === t ? '#1e40af' : '#e2e8f0',
              color: tab === t ? 'white' : '#0f172a',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {t === 'clinic' && '⏰ Horários'}
            {t === 'holidays' && '📅 Feriados'}
            {t === 'customization' && '🎨 Customização'}
          </button>
        ))}
      </div>

      {/* Horários de Funcionamento */}
      {tab === 'clinic' && clinicSettings ? (
        <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>⏰ Horários de Funcionamento</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {DAYS.map((day, i) => (
              <div key={day} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af', fontSize: '1rem' }}>
                  {DAY_NAMES[i]}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Abertura</label>
                    <input
                      type="time"
                      value={(clinicSettings as any)[`${day}_start`] || '08:00'}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, [`${day}_start`]: e.target.value } as any)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Fechamento</label>
                    <input
                      type="time"
                      value={(clinicSettings as any)[`${day}_end`] || '18:00'}
                      onChange={(e) => setClinicSettings({ ...clinicSettings, [`${day}_end`]: e.target.value } as any)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Configurações Adicionais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>⏱️ Intervalo entre Consultas (minutos)</label>
              <input
                type="number"
                value={clinicSettings.appointment_interval}
                onChange={(e) => setClinicSettings({ ...clinicSettings, appointment_interval: parseInt(e.target.value) })}
                min="5"
                step="5"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', fontSize: '1rem' }}
              />
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#065f46' }}>Tempo mínimo entre agendamentos</p>
            </div>

            <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>⌛ Duração Padrão da Consulta (minutos)</label>
              <input
                type="number"
                value={clinicSettings.appointment_duration}
                onChange={(e) => setClinicSettings({ ...clinicSettings, appointment_duration: parseInt(e.target.value) })}
                min="15"
                step="15"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fcd34d', fontSize: '1rem' }}
              />
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#92400e' }}>Duração padrão de cada consulta</p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            style={{
              padding: '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            💾 Salvar Configurações
          </button>
        </div>
      ) : null}

      {/* Feriados */}
      {tab === 'holidays' && (
        <div>
          <button
            onClick={() => {
              setEditingHoliday(null);
              setHolidayForm({ date: '', name: '' });
              setShowHolidayModal(true);
            }}
            style={{
              marginBottom: '1.5rem',
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            + Novo Feriado
          </button>

          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {holidays.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Nenhum feriado cadastrado
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Data</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((holiday) => (
                    <tr key={holiday.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem' }}>
                        {new Date(holiday.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '1rem' }}>{holiday.name}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingHoliday(holiday);
                            setHolidayForm({ date: holiday.date, name: holiday.name });
                            setShowHolidayModal(true);
                          }}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal de Feriado */}
          {showHolidayModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ marginTop: 0 }}>{editingHoliday ? 'Editar' : 'Novo'} Feriado</h2>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Data</label>
                  <input
                    type="date"
                    value={holidayForm.date}
                    onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Descrição</label>
                  <input
                    type="text"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    placeholder="Ex: Natal, Ano Novo"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setShowHolidayModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#e2e8f0',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveHoliday}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customização de Tema */}
      {tab === 'customization' && (
        <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>🎨 Customização de Tema</h2>

          {/* Modo Claro/Escuro */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>🌓 Modo</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => toggleMode()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: theme.mode === 'light' ? '#fbbf24' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {theme.mode === 'light' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Modo atual: {theme.mode === 'light' ? 'Claro' : 'Escuro'}
            </p>
          </div>

          {/* Tamanho de Fonte */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📝 Tamanho de Fonte</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              {(['small', 'normal', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  style={{
                    padding: '1rem',
                    background: theme.fontSize === size ? '#1e40af' : '#e2e8f0',
                    color: theme.fontSize === size ? 'white' : '#0f172a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: size === 'small' ? '13px' : size === 'large' ? '18px' : '16px'
                  }}
                >
                  {size === 'small' && 'Pequeno'}
                  {size === 'normal' && 'Normal'}
                  {size === 'large' && 'Grande'}
                </button>
              ))}
            </div>
          </div>

          {/* Cores Customizáveis */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>🎨 Cores</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cor Primária</label>
                <input
                  type="color"
                  value={theme.colors.primary}
                  onChange={(e) => updateColors({ primary: e.target.value })}
                  style={{ width: '100%', height: '50px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>{theme.colors.primary}</p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cor Secundária</label>
                <input
                  type="color"
                  value={theme.colors.secondary}
                  onChange={(e) => updateColors({ secondary: e.target.value })}
                  style={{ width: '100%', height: '50px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>{theme.colors.secondary}</p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cor do Texto</label>
                <input
                  type="color"
                  value={theme.colors.text}
                  onChange={(e) => updateColors({ text: e.target.value })}
                  style={{ width: '100%', height: '50px', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>{theme.colors.text}</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>👁️ Preview</h3>
            <div style={{
              padding: '1.5rem',
              background: theme.colors.background,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: theme.colors.primary }}>Título de Exemplo</h4>
              <p style={{ margin: '0.5rem 0', color: theme.colors.text }}>Este é um preview de como o tema ficará com as cores selecionadas.</p>
              <button style={{
                padding: '0.5rem 1rem',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}>
                Botão de Exemplo
              </button>
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => resetTheme()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🔄 Restaurar Padrão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
