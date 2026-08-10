import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import client from '@/api/client';

interface Appointment {
  id: string;
  professional_id: string;
  client_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const PROFESSIONALS: Professional[] = [
  { id: '999405ac-b258-48ce-9085-c64c3731a526', name: 'Dr. Roberto', specialty: 'Clínica Geral' },
  { id: 'f8b2086c-18ab-4d04-adc7-4defa95a1832', name: 'Dra. Mônica', specialty: 'Dermatologia' },
  { id: '8996d973-8106-4eb7-9ceb-6d144f3e5d18', name: 'Dr. Pedro', specialty: 'Cardiologia' },
];

const COLORS = {
  '999405ac-b258-48ce-9085-c64c3731a526': '#0052CC',
  'f8b2086c-18ab-4d04-adc7-4defa95a1832': '#00A8D8',
  '8996d973-8106-4eb7-9ceb-6d144f3e5d18': '#00D4FF',
};

type ViewType = 'day' | 'week' | 'month';

export default function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(
    `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
  );
  const [viewType, setViewType] = useState<ViewType>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filterProfessional, setFilterProfessional] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    professional_id: '999405ac-b258-48ce-9085-c64c3731a526',
    client_id: '',
    time: '14:00',
    date: '',
    notes: '',
  });

  // Carregar agendamentos e clientes do API
  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await client.get('/appointments');
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      // Fallback para dados hardcoded
      setAppointments([
        {
          id: '1',
          professional_id: '1',
          client_id: 'joao',
          date: '2026-07-30',
          time: '14:00',
          status: 'scheduled',
          notes: 'João Silva - Clínica Geral'
        },
        {
          id: '2',
          professional_id: '2',
          client_id: 'maria',
          date: '2026-07-31',
          time: '10:00',
          status: 'scheduled',
          notes: 'Maria Santos - Dermatologia'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await client.get('/clients');
      setClients(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients([]);
    }
  };

  const getAppointmentsForDay = (dateStr: string) => {
    return appointments.filter((apt) => {
      const [year, month, day] = apt.date.split('-');
      const aptDate = `${day}/${month}/${year}`;
      const match = aptDate === dateStr;

      if (filterProfessional) {
        return match && apt.professional_id === filterProfessional;
      }
      return match;
    });
  };

  const openNewAppointmentModal = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    setFormData({
      professional_id: '999405ac-b258-48ce-9085-c64c3731a526',
      client_id: '',
      date: `${year}-${month}-${day}`,
      time: '14:00',
      notes: '',
    });
    setEditingAppointment(null);
    setShowModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      professional_id: appointment.professional_id,
      client_id: appointment.client_id,
      time: appointment.time,
      date: appointment.date,
      notes: appointment.notes || '',
    });
    setShowModal(true);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveAppointment = async () => {
    if (!formData.client_id.trim()) {
      showToast('❌ Selecione um paciente', 'error');
      return;
    }

    try {
      if (editingAppointment) {
        await client.put(`/appointments/${editingAppointment.id}`, {
          professional_id: formData.professional_id,
          client_id: formData.client_id,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
        });
        showToast('✅ Agendamento atualizado com sucesso!', 'success');
      } else {
        await client.post('/appointments', {
          professional_id: formData.professional_id,
          client_id: formData.client_id,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
        });
        showToast('✅ Agendamento criado com sucesso!', 'success');
      }

      setShowModal(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      showToast('❌ Erro ao salvar agendamento', 'error');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!editingAppointment) return;

    if (!window.confirm('Tem certeza que deseja deletar este agendamento?')) return;

    try {
      await client.delete(`/appointments/${editingAppointment.id}`);
      setShowModal(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      alert('Erro ao deletar agendamento');
    }
  };

  const handleCancelAppointment = async () => {
    if (!editingAppointment) return;

    try {
      await client.put(`/appointments/${editingAppointment.id}`, {
        status: 'cancelled',
        notes: `[CANCELADO] ${cancelReason ? 'Motivo: ' + cancelReason : 'Sem motivo informado'}`
      });
      showToast('✅ Agendamento cancelado com sucesso!', 'success');
      setShowModal(false);
      setShowCancelModal(false);
      setEditingAppointment(null);
      setCancelReason('');
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      showToast('❌ Erro ao cancelar agendamento', 'error');
    }
  };

  const handleConfirmAppointment = async () => {
    if (!editingAppointment) return;

    try {
      await client.put(`/appointments/${editingAppointment.id}`, {
        status: 'confirmed'
      });
      showToast('✅ Agendamento confirmado com sucesso!', 'success');
      setShowModal(false);
      setEditingAppointment(null);
      setConfirmingAppointmentId(null);
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      showToast('❌ Erro ao confirmar agendamento', 'error');
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      const dayAppointments = getAppointmentsForDay(dateStr);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          style={{
            padding: '1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
        >
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{day}</div>

          {/* Badge com número de agendamentos */}
          {dayAppointments.length > 0 && (
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              width: 'fit-content'
            }}>
              {dayAppointments.length} agend.
            </div>
          )}

          {dayAppointments.length > 0 ? (
            dayAppointments.slice(0, 2).map((apt, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: COLORS[apt.professional_id as keyof typeof COLORS],
                  color: 'white',
                  borderRadius: '3px',
                  marginBottom: '0.25rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {apt.time}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Livre</div>
          )}
        </div>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getWeekDates = () => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1);
    const weekStart = new Date(date.setDate(diff));
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      weekDates.push(d);
    }
    return weekDates;
  };

  const formatDateString = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getAppointmentsForWeek = () => {
    const weekDates = getWeekDates();
    const weekAppointments: Record<string, Appointment[]> = {};

    weekDates.forEach(date => {
      const dateStr = formatDateString(date);
      weekAppointments[dateStr] = getAppointmentsForDay(dateStr);
    });

    return { weekDates, weekAppointments };
  };

  const dayAppointments = getAppointmentsForDay(selectedDate);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando agendamentos...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Voltar */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: '1.5rem',
          padding: '0.5rem 1rem',
          background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        ← Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📅 Calendário de Agendamentos</h1>
        <button
          onClick={() => openNewAppointmentModal(selectedDate)}
          style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          + Novo Agendamento
        </button>
      </div>

      {/* View Selector */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setViewType('day')}
          style={{
            padding: '0.5rem 1.5rem',
            background: viewType === 'day' ? 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)' : '#f1f5f9',
            color: viewType === 'day' ? 'white' : '#0f172a',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          📅 Dia {viewType === 'day' && '✓'}
        </button>
        <button
          onClick={() => setViewType('week')}
          style={{
            padding: '0.5rem 1.5rem',
            background: viewType === 'week' ? 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)' : '#f1f5f9',
            color: viewType === 'week' ? 'white' : '#0f172a',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          📆 Semana {viewType === 'week' && '✓'}
        </button>
        <button
          onClick={() => setViewType('month')}
          style={{
            padding: '0.5rem 1.5rem',
            background: viewType === 'month' ? 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)' : '#f1f5f9',
            color: viewType === 'month' ? 'white' : '#0f172a',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          📋 Mês {viewType === 'month' && '✓'}
        </button>
      </div>

      {/* Filtro por Profissional */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: 600 }}>Filtrar por profissional:</label>
        <select
          value={filterProfessional || ''}
          onChange={(e) => setFilterProfessional(e.target.value || null)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            cursor: 'pointer'
          }}
        >
          <option value="">Todos</option>
          {PROFESSIONALS.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.name}
            </option>
          ))}
        </select>
      </div>

      {/* Navegação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            if (viewType === 'day') newDate.setDate(newDate.getDate() - 1);
            else if (viewType === 'week') newDate.setDate(newDate.getDate() - 7);
            else newDate.setMonth(newDate.getMonth() - 1);
            setCurrentDate(newDate);
          }}
          style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
          ← Anterior
        </button>
        <h2 style={{ margin: 0, fontSize: '1.25rem', background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {viewType === 'day'
            ? currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            : viewType === 'week'
            ? `Semana de ${getWeekDates()[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} a ${getWeekDates()[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => {
            const newDate = new Date(currentDate);
            if (viewType === 'day') newDate.setDate(newDate.getDate() + 1);
            else if (viewType === 'week') newDate.setDate(newDate.getDate() + 7);
            else newDate.setMonth(newDate.getMonth() + 1);
            setCurrentDate(newDate);
          }}
          style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
          Próximo →
        </button>
      </div>

      {/* MONTH VIEW */}
      {viewType === 'month' && (
        <>
          {/* Cabeçalho Dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day) => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 700, padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendário Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
            {renderCalendar()}
          </div>
        </>
      )}

      {/* WEEK VIEW */}
      {viewType === 'week' && (
        <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {getWeekDates().map((date, idx) => {
              const dateStr = formatDateString(date);
              const dayAppts = getAppointmentsForDay(dateStr);
              const dayName = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][date.getDay() === 0 ? 6 : date.getDay() - 1];

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewType('day');
                  }}
                  style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    minHeight: '150px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {dayName} {date.getDate()}
                  </div>
                  {dayAppts.length > 0 && (
                    <div style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      width: 'fit-content'
                    }}>
                      {dayAppts.length} agend.
                    </div>
                  )}
                  {dayAppts.length > 0 ? (
                    dayAppts.slice(0, 3).map((apt, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          background: COLORS[apt.professional_id as keyof typeof COLORS],
                          color: 'white',
                          borderRadius: '3px',
                          marginBottom: '0.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {apt.time}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>✓ Livre</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewType === 'day' && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0, 82, 204, 0.03)', borderRadius: '0.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>📅 Agendamentos - {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(() => {
              const dayStr = formatDateString(currentDate);
              const dayAppts = getAppointmentsForDay(dayStr);
              return dayAppts.length > 0 ? (
                dayAppts.map((apt) => {
                  const prof = PROFESSIONALS.find((p) => p.id === apt.professional_id);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => openEditModal(apt)}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '0.5rem',
                        borderLeft: `3px solid ${COLORS[apt.professional_id as keyof typeof COLORS]}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: 0.8
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseOut={(e) => (e.currentTarget.style.opacity = '0.8')}
                    >
                      <div style={{ width: '12px', background: COLORS[apt.professional_id as keyof typeof COLORS], borderRadius: '2px' }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{apt.notes || 'Agendamento'}</div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {apt.time} - {prof?.name} • {prof?.specialty}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background:
                            apt.status === 'confirmed' ? '#dcfce7' :
                            apt.status === 'scheduled' ? '#fef3c7' :
                            apt.status === 'cancelled' ? '#fee2e2' :
                            '#dbeafe',
                          color:
                            apt.status === 'confirmed' ? '#065f46' :
                            apt.status === 'scheduled' ? '#92400e' :
                            apt.status === 'cancelled' ? '#991b1b' :
                            '#0c4a6e',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {apt.status === 'confirmed' ? '✓ Confirmado' :
                         apt.status === 'scheduled' ? '⏳ Pendente' :
                         apt.status === 'cancelled' ? '✕ Cancelado' :
                         '✓ Realizado'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p>Nenhum agendamento para este dia</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}


      {/* Modal */}
      {showModal && (
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
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingAppointment ? 'Editar' : 'Novo'} Agendamento</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Profissional</label>
              <select
                value={formData.professional_id}
                onChange={(e) => setFormData({ ...formData, professional_id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              >
                {PROFESSIONALS.map((prof) => (
                  <option key={prof.id} value={prof.id}>{prof.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Paciente</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              >
                <option value="">Selecione um paciente</option>
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', minHeight: '80px' }}
                placeholder="Nome do paciente, observações..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  minWidth: '80px',
                  padding: '0.75rem',
                  background: '#e2e8f0',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Fechar
              </button>
              {editingAppointment && (
                <>
                  {editingAppointment.status === 'scheduled' && (
                    <button
                      onClick={handleConfirmAppointment}
                      style={{
                        flex: 1,
                        minWidth: '80px',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      ✓ Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setCancelReason('');
                      setShowCancelModal(true);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: '0.75rem',
                      background: '#FA8500',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAppointment}
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: '0.75rem',
                      background: '#E81123',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Deletar
                  </button>
                </>
              )}
              <button
                onClick={handleSaveAppointment}
                style={{
                  flex: 1,
                  minWidth: '80px',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)',
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

      {/* Modal de Cancelamento */}
      {showCancelModal && editingAppointment && (
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
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#FA8500' }}>⚠️ Cancelar Agendamento</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Tem certeza que deseja cancelar este agendamento?
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Motivo do cancelamento (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Ex: Paciente solicitou cancelamento, mudança de horário, etc..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
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
                Voltar
              </button>
              <button
                onClick={handleCancelAppointment}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#FA8500',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: toast.type === 'success' ? 'linear-gradient(135deg, #00D4FF 0%, #0052CC 100%)' : '#E81123',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          zIndex: 2000,
          animation: 'slideIn 0.3s ease-out',
        }}>
          <span style={{ fontSize: '1.25rem' }}>
            {toast.type === 'success' ? '✅' : '❌'}
          </span>
          <span>{toast.message}</span>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
