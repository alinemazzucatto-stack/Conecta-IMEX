import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinic_id: string;
  created_at?: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await client.get('/clients');
      setClients(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      alert('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const openNewClientModal = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingClient(null);
    setShowModal(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
    });
    setShowModal(true);
  };

  const handleSaveClient = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      if (editingClient) {
        await client.put(`/clients/${editingClient.id}`, formData);
        alert('✅ Paciente atualizado com sucesso!');
      } else {
        await client.post('/clients', formData);
        alert('✅ Paciente criado com sucesso!');
      }

      setShowModal(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('❌ Erro ao salvar paciente');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este paciente?')) return;

    try {
      await client.delete(`/clients/${id}`);
      alert('✅ Paciente deletado com sucesso!');
      fetchClients();
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      alert('❌ Erro ao deletar paciente');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando pacientes...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Voltar */}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#1e40af' }}>👥 Gerenciar Pacientes</h1>
        <button
          onClick={openNewClientModal}
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
          + Novo Paciente
        </button>
      </div>

      {/* Lista de Pacientes */}
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {clients.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p>Nenhum paciente cadastrado</p>
            <p style={{ fontSize: '0.875rem' }}>Clique em "+ Novo Paciente" para adicionar</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Nome</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Telefone</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#1e40af' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>{c.name}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{c.email}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{c.phone}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => openEditModal(c)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        marginRight: '0.5rem'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClient(c.id)}
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
            <h2 style={{ marginTop: 0 }}>{editingClient ? 'Editar' : 'Novo'} Paciente</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="Nome completo"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="email@exemplo.com"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleSaveClient}
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
  );
}
