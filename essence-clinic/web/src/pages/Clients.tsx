import { useState, useEffect } from 'react';
import { Search, Plus, X, Camera, Clock, FileText, Users, TrendingUp, Calendar } from 'lucide-react';
import client from '@/api/client';
import '../styles/clients.css';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  value?: string;
}

interface Anamnesis {
  id: string;
  date: string;
  notes: string;
  professional: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo_url?: string;
  birth_date?: string;
  clinic_id: string;
  custom_fields?: CustomField[];
  anamneses?: Anamnesis[];
  created_at?: string;
  status?: 'active' | 'inactive' | 'prospect';
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'prospect'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'list' | 'details'>('list');
  const [activeTab, setActiveTab] = useState<'details' | 'anamnesis' | 'custom'>('details');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    photo_url: '',
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newAnamnesis, setNewAnamnesis] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active' || !c.status).length,
    newThisMonth: clients.filter(c => {
      if (!c.created_at) return false;
      const createdDate = new Date(c.created_at);
      const today = new Date();
      return createdDate.getMonth() === today.getMonth() &&
             createdDate.getFullYear() === today.getFullYear();
    }).length,
    inactive: clients.filter(c => c.status === 'inactive').length,
  };

  const getClientStatus = (c: Client) => {
    return c.status || 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'prospect': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '🟢 Ativo';
      case 'inactive': return '🔴 Inativo';
      case 'prospect': return '🟡 Prospect';
      default: return '⚪ Sem status';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const openNewClientForm = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', birth_date: '', photo_url: '' });
    setCustomFields([]);
    setShowForm(true);
  };

  const openEditForm = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      birth_date: c.birth_date || '',
      photo_url: c.photo_url || '',
    });
    setCustomFields(c.custom_fields || []);
    setShowForm(true);
  };

  const handleSaveClient = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      const payload = {
        ...formData,
        custom_fields: customFields,
      };

      if (editingClient) {
        await client.put(`/clients/${editingClient.id}`, payload);
        alert('✅ Paciente atualizado!');
      } else {
        await client.post('/clients', payload);
        alert('✅ Paciente criado!');
      }

      setShowForm(false);
      fetchClients();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar paciente');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza?')) return;

    try {
      await client.delete(`/clients/${id}`);
      alert('✅ Paciente deletado!');
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      alert('❌ Erro ao deletar');
    }
  };

  const addAnamnesis = async () => {
    if (!selectedClient || !newAnamnesis.trim()) return;

    try {
      const anamneses = [...(selectedClient.anamneses || [])];
      anamneses.push({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        notes: newAnamnesis,
        professional: 'Profissional',
      });

      await client.put(`/clients/${selectedClient.id}`, {
        anamneses,
      });

      setNewAnamnesis('');
      await fetchClients();
      const updated = clients.find(c => c.id === selectedClient.id);
      if (updated) setSelectedClient(updated);
    } catch (error) {
      alert('❌ Erro ao adicionar anamnese');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, photo_url: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="clients-loading">Carregando pacientes...</div>;
  }

  return (
    <div className="clients-container">
      {/* Top Stats */}
      <div className="clients-stats-bar">
        <div className="stat-card">
          <Users size={20} />
          <div>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-label">Total de Clientes</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={20} />
          <div>
            <p className="stat-value">{stats.active}</p>
            <p className="stat-label">Clientes Ativos</p>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={20} />
          <div>
            <p className="stat-value">{stats.newThisMonth}</p>
            <p className="stat-label">Novos este Mês</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={20} />
          <div>
            <p className="stat-value">{stats.inactive}</p>
            <p className="stat-label">Inativos</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="clients-tabs-header">
        <h1 style={{ margin: 0, marginRight: 'auto' }}>👥 Clientes</h1>
        <button onClick={openNewClientForm} className="btn-new-client">
          <Plus size={18} />
          Novo
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="clients-main-tabs">
        <button
          onClick={() => setActiveMainTab('list')}
          className={`main-tab ${activeMainTab === 'list' ? 'active' : ''}`}
        >
          📋 Clientes
        </button>
        {selectedClient && (
          <button
            onClick={() => setActiveMainTab('details')}
            className={`main-tab ${activeMainTab === 'details' ? 'active' : ''}`}
          >
            👤 Detalhes de {selectedClient.name}
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="clients-tab-content">
        {/* Clients List View */}
        {activeMainTab === 'list' && (
          <div className="clients-list-view">
            <div className="clients-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filters */}
            <div className="clients-filters">
              {(['all', 'active', 'inactive', 'prospect'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                >
                  {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : 'Prospects'}
                </button>
              ))}
            </div>

            <div className="clients-list">
              {filteredClients.length === 0 ? (
                <div className="clients-empty">
                  <p>Nenhum paciente encontrado</p>
                </div>
              ) : (
                filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClient(c);
                      setActiveMainTab('details');
                    }}
                    className={`clients-item ${selectedClient?.id === c.id ? 'active' : ''}`}
                  >
                    <div className="clients-item-avatar">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={c.name} />
                      ) : (
                        <span>{c.name[0]}</span>
                      )}
                    </div>
                    <div className="clients-item-info">
                      <div className="clients-item-name">{c.name}</div>
                      <div className="clients-item-email">{c.email}</div>
                      <div className="clients-item-phone">{c.phone}</div>
                      <div className="clients-item-date">
                        📅 {formatDate(c.created_at)}
                      </div>
                    </div>
                    <div className="clients-item-status" style={{ background: getStatusColor(getClientStatus(c)) }}>
                      {getStatusLabel(getClientStatus(c))}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Details View */}
        {activeMainTab === 'details' && selectedClient && (
          <div className="clients-details-view">
            <div className="client-detail-header">
              <button
                onClick={() => setSelectedClient(null)}
                className="btn-close"
              >
                <X size={20} />
              </button>
              <div className="client-detail-title">
                <h2>{selectedClient.name}</h2>
                <span className="client-status-badge" style={{ background: getStatusColor(getClientStatus(selectedClient)) }}>
                  {getStatusLabel(getClientStatus(selectedClient))}
                </span>
              </div>
              <div className="client-detail-actions">
                <button
                  onClick={() => openEditForm(selectedClient)}
                  className="btn-edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  className="btn-delete"
                >
                  🗑️ Deletar
                </button>
              </div>
            </div>

            {/* Client Info Card */}
            <div className="client-info-card">
              <div className="info-item">
                <span className="info-label">📧 Email:</span>
                <span className="info-value">{selectedClient.email || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📱 Telefone:</span>
                <span className="info-value">{selectedClient.phone || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🎂 Data de Nascimento:</span>
                <span className="info-value">{formatDate(selectedClient.birth_date) || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📅 Cadastro:</span>
                <span className="info-value">{formatDate(selectedClient.created_at) || '-'}</span>
              </div>
            </div>

            {/* Photo Section */}
            {selectedClient.photo_url && (
              <div className="client-photo">
                <img src={selectedClient.photo_url} alt={selectedClient.name} />
              </div>
            )}

            {/* Tabs */}
            <div className="client-tabs">
              <button
                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <FileText size={16} />
                Detalhes
              </button>
              <button
                className={`tab ${activeTab === 'anamnesis' ? 'active' : ''}`}
                onClick={() => setActiveTab('anamnesis')}
              >
                <Clock size={16} />
                Anamnese
              </button>
              {selectedClient.custom_fields && selectedClient.custom_fields.length > 0 && (
                <button
                  className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setActiveTab('custom')}
                >
                  Customizado
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="client-content">
              {activeTab === 'details' && (
                <div className="client-details">
                  <div className="detail-row">
                    <label>Email</label>
                    <p>{selectedClient.email}</p>
                  </div>
                  <div className="detail-row">
                    <label>Telefone</label>
                    <p>{selectedClient.phone}</p>
                  </div>
                  {selectedClient.birth_date && (
                    <div className="detail-row">
                      <label>Data de Nascimento</label>
                      <p>{new Date(selectedClient.birth_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  <div className="detail-row">
                    <label>Cadastro em</label>
                    <p>{new Date(selectedClient.created_at || '').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )}

              {activeTab === 'anamnesis' && (
                <div className="client-anamnesis">
                  <div className="anamnesis-form">
                    <textarea
                      placeholder="Adicionar nova anotação de anamnese..."
                      value={newAnamnesis}
                      onChange={(e) => setNewAnamnesis(e.target.value)}
                    />
                    <button
                      onClick={addAnamnesis}
                      className="btn-add-anamnesis"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="anamnesis-list">
                    {selectedClient.anamneses && selectedClient.anamneses.length > 0 ? (
                      selectedClient.anamneses.map((a) => (
                        <div key={a.id} className="anamnesis-item">
                          <div className="anamnesis-header">
                            <span className="anamnesis-date">
                              {new Date(a.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="anamnesis-professional">{a.professional}</span>
                          </div>
                          <p className="anamnesis-notes">{a.notes}</p>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">Nenhuma anotação de anamnese</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="client-custom-fields">
                  {selectedClient.custom_fields && selectedClient.custom_fields.length > 0 ? (
                    selectedClient.custom_fields.map((field) => (
                      <div key={field.id} className="custom-field">
                        <label>{field.name}</label>
                        <p>{field.value || '-'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="empty-message">Nenhum campo customizado</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingClient ? 'Editar' : 'Novo'} Paciente</h2>
              <button
                onClick={() => setShowForm(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Foto</label>
                <div className="photo-upload">
                  {formData.photo_url && (
                    <img src={formData.photo_url} alt="Preview" className="photo-preview" />
                  )}
                  <label className="upload-label">
                    <Camera size={18} />
                    Enviar Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="custom-fields-section">
                <h3>Campos Customizados</h3>
                {customFields.map((field, idx) => (
                  <div key={field.id} className="custom-field-input">
                    <label>{field.name}</label>
                    <input
                      type={field.type}
                      value={field.value || ''}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].value = e.target.value;
                        setCustomFields(updated);
                      }}
                      placeholder={field.name}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowForm(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClient}
                className="btn-save"
              >
                Salvar Paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
