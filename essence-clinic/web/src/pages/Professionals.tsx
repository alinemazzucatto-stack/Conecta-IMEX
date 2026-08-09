import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  clinic_id: string;
  active?: boolean;
  created_at?: string;
}

export default function Professionals() {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const data = await client.get('/professionals');
      setProfessionals(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      alert('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const openNewProfessionalModal = () => {
    setFormData({ name: '', specialty: '', email: '', phone: '' });
    setEditingProfessional(null);
    setShowModal(true);
  };

  const openEditModal = (p: Professional) => {
    setEditingProfessional(p);
    setFormData({
      name: p.name,
      specialty: p.specialty,
      email: p.email || '',
      phone: p.phone || '',
    });
    setShowModal(true);
  };

  const handleSaveProfessional = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    if (!formData.specialty.trim()) {
      alert('Especialidade é obrigatória');
      return;
    }

    try {
      if (editingProfessional) {
        await client.put(`/professionals/${editingProfessional.id}`, formData);
        alert('✅ Profissional atualizado com sucesso!');
      } else {
        await client.post('/professionals', formData);
        alert('✅ Profissional criado com sucesso!');
      }

      setShowModal(false);
      setEditingProfessional(null);
      fetchProfessionals();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      alert('❌ Erro ao salvar profissional');
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este profissional?')) return;

    try {
      await client.delete(`/professionals/${id}`);
      alert('✅ Profissional deletado com sucesso!');
      fetchProfessionals();
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      alert('❌ Erro ao deletar profissional');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando profissionais...</div>;
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
        <h1 style={{ margin: 0, color: '#1e40af' }}>👨‍⚕️ Gerenciar Profissionais</h1>
        <button
          onClick={openNewProfessionalModal}
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
          + Novo Profissional
        </button>
      </div>

      {/* Lista de Profissionais */}
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {professionals.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p>Nenhum profissional cadastrado</p>
            <p style={{ fontSize: '0.875rem' }}>Clique em "+ Novo Profissional" para adicionar</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Nome</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Especialidade</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e40af' }}>Telefone</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#1e40af' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{p.specialty}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{p.email || '-'}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{p.phone || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => openEditModal(p)}
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
                      onClick={() => handleDeleteProfessional(p.id)}
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
            <h2 style={{ marginTop: 0 }}>{editingProfessional ? 'Editar' : 'Novo'} Profissional</h2>

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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Especialidade</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="Ex: Clínica Geral, Dermatologia"
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
                onClick={handleSaveProfessional}
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
