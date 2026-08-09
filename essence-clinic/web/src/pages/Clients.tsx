import { useState, useEffect } from 'react';
import { Search, Plus, X, Camera, Clock, FileText } from 'lucide-react';
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
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
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

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

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
      {/* Left Panel - Clients List */}
      <div className="clients-panel-left">
        <div className="clients-header">
          <h1>👥 Clientes</h1>
          <button
            onClick={openNewClientForm}
            className="btn-new-client"
          >
            <Plus size={18} />
            Novo
          </button>
        </div>

        <div className="clients-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                onClick={() => setSelectedClient(c)}
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
                  <div className="clients-item-phone">{c.phone}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Client Details */}
      <div className="clients-panel-right">
        {selectedClient ? (
          <>
            <div className="client-detail-header">
              <button
                onClick={() => setSelectedClient(null)}
                className="btn-close"
              >
                <X size={20} />
              </button>
              <h2>{selectedClient.name}</h2>
              <div className="client-detail-actions">
                <button
                  onClick={() => openEditForm(selectedClient)}
                  className="btn-edit"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  className="btn-delete"
                >
                  Deletar
                </button>
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
          </>
        ) : (
          <div className="client-empty-state">
            <p>Selecione um paciente para ver detalhes</p>
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
