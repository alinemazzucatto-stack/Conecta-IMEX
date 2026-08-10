import { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCw, AlertCircle, Check, X } from 'lucide-react';
import client from '@/api/client';
import '../styles/packages.css';

interface Session {
  id: string;
  date: string;
  professional: string;
  notes?: string;
}

interface Package {
  id: string;
  client_id: string;
  client_name: string;
  name: string;
  description: string;
  total_sessions: number;
  used_sessions: number;
  price: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'completed';
  sessions: Session[];
  created_at?: string;
}

const PACKAGE_TEMPLATES = [
  { name: '5 Sessões', sessions: 5, price: 250, description: 'Plano básico' },
  { name: '10 Sessões', sessions: 10, price: 450, description: 'Plano popular' },
  { name: '15 Sessões', sessions: 15, price: 600, description: 'Plano completo' },
  { name: '20 Sessões', sessions: 20, price: 750, description: 'Plano premium' },
  { name: 'Mensal Ilimitado', sessions: 999, price: 300, description: 'Acesso ilimitado por mês' },
];

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'completed'>('active');
  const [newSessionNotes, setNewSessionNotes] = useState('');

  const [formData, setFormData] = useState({
    client_name: '',
    package_template: '',
    custom_sessions: '',
    custom_price: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockPackages: Package[] = [
        {
          id: '1',
          client_id: 'client1',
          client_name: 'Maria Silva',
          name: '10 Sessões',
          description: 'Plano popular',
          total_sessions: 10,
          used_sessions: 3,
          price: 450,
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          sessions: [
            { id: '1', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], professional: 'Dra. Ana' },
            { id: '2', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], professional: 'Dra. Ana' },
            { id: '3', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], professional: 'Dra. Camila' },
          ],
        },
      ];
      setPackages(mockPackages);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    if (!formData.client_name || !formData.package_template) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const template = PACKAGE_TEMPLATES.find(t => t.name === formData.package_template);
    if (!template) return;

    const newPackage: Package = {
      id: Date.now().toString(),
      client_id: 'client_' + Date.now(),
      client_name: formData.client_name,
      name: template.name,
      description: template.description,
      total_sessions: template.sessions,
      used_sessions: 0,
      price: template.price,
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: 'active',
      sessions: [],
      created_at: new Date().toISOString(),
    };

    setPackages([newPackage, ...packages]);
    setShowForm(false);
    setFormData({
      client_name: '',
      package_template: '',
      custom_sessions: '',
      custom_price: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    try {
      await client.post('/packages', newPackage);
      alert('✅ Pacote criado com sucesso!');
    } catch (error) {
      alert('✅ Pacote criado (backend offline)');
    }
  };

  const handleAddSession = async () => {
    if (!selectedPackage || selectedPackage.used_sessions >= selectedPackage.total_sessions) {
      alert('Todas as sessões já foram utilizadas');
      return;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      professional: 'Profissional Atual',
      notes: newSessionNotes,
    };

    const updatedPackage = {
      ...selectedPackage,
      used_sessions: selectedPackage.used_sessions + 1,
      sessions: [...selectedPackage.sessions, newSession],
    };

    setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p));
    setSelectedPackage(updatedPackage);
    setNewSessionNotes('');
    setShowSessionForm(false);

    try {
      await client.put(`/packages/${selectedPackage.id}`, updatedPackage);
      alert('✅ Sessão registrada!');
    } catch (error) {
      alert('✅ Sessão registrada (backend offline)');
    }
  };

  const handleDeletePackage = (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este pacote?')) return;
    setPackages(packages.filter(p => p.id !== id));
    setSelectedPackage(null);
    alert('✅ Pacote deletado');
  };

  const handleRenewPackage = async () => {
    if (!selectedPackage) return;

    const updatedPackage = {
      ...selectedPackage,
      used_sessions: 0,
      sessions: [],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const,
    };

    setPackages(packages.map(p => p.id === selectedPackage.id ? updatedPackage : p));
    setSelectedPackage(updatedPackage);
    alert('✅ Pacote renovado');
  };

  const filteredPackages = packages.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const getProgressColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 80) return '#ef4444';
    if (percentage >= 50) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return <div className="packages-loading">Carregando pacotes...</div>;
  }

  return (
    <div className="packages-container">
      {/* Header */}
      <div className="packages-header">
        <div>
          <h1>📦 Pacotes & Controle</h1>
          <p className="packages-subtitle">Gerencie pacotes de sessões e acompanhe o uso</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-new-package">
          <Plus size={18} />
          Novo Pacote
        </button>
      </div>

      {/* Main Content */}
      <div className="packages-content">
        {/* Left Panel - List */}
        <div className="packages-list-panel">
          <div className="packages-filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="completed">Completos</option>
              <option value="expired">Expirados</option>
            </select>
          </div>

          <div className="packages-list">
            {filteredPackages.length === 0 ? (
              <div className="packages-empty">
                <p>Nenhum pacote encontrado</p>
              </div>
            ) : (
              filteredPackages.map(pkg => {
                const percentage = (pkg.used_sessions / pkg.total_sessions) * 100;
                const isExpired = new Date(pkg.end_date) < new Date();

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`package-item ${selectedPackage?.id === pkg.id ? 'active' : ''}`}
                  >
                    <div className="package-item-header">
                      <div className="package-item-title">{pkg.name}</div>
                      <div className="package-item-client">{pkg.client_name}</div>
                    </div>
                    <div className="package-item-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: getProgressColor(pkg.used_sessions, pkg.total_sessions),
                          }}
                        />
                      </div>
                      <div className="progress-text">
                        {pkg.used_sessions}/{pkg.total_sessions}
                      </div>
                    </div>
                    {isExpired && (
                      <div className="package-expired-badge">Expirado</div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="packages-detail-panel">
          {selectedPackage ? (
            <>
              <div className="package-detail-header">
                <div>
                  <h2>{selectedPackage.name}</h2>
                  <p className="package-detail-client">{selectedPackage.client_name}</p>
                </div>
                <div className="package-detail-status">
                  <span className={`badge badge-${selectedPackage.status}`}>
                    {selectedPackage.status === 'active' && '🟢 Ativo'}
                    {selectedPackage.status === 'completed' && '✅ Completo'}
                    {selectedPackage.status === 'expired' && '⏰ Expirado'}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="package-progress-section">
                <h3>Uso de Sessões</h3>
                <div className="large-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((selectedPackage.used_sessions / selectedPackage.total_sessions) * 100, 100)}%`,
                        backgroundColor: getProgressColor(selectedPackage.used_sessions, selectedPackage.total_sessions),
                      }}
                    />
                  </div>
                  <div className="progress-stats">
                    <div className="stat">
                      <span className="label">Usadas</span>
                      <span className="value">{selectedPackage.used_sessions}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Restantes</span>
                      <span className="value">{selectedPackage.total_sessions - selectedPackage.used_sessions}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Total</span>
                      <span className="value">{selectedPackage.total_sessions}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="package-info-section">
                <div className="info-row">
                  <label>Preço</label>
                  <p>R$ {selectedPackage.price.toFixed(2)}</p>
                </div>
                <div className="info-row">
                  <label>Data de Início</label>
                  <p>{new Date(selectedPackage.start_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="info-row">
                  <label>Data de Vencimento</label>
                  <p>{new Date(selectedPackage.end_date).toLocaleDateString('pt-BR')}</p>
                </div>
                {new Date(selectedPackage.end_date) < new Date() && (
                  <div className="info-alert">
                    <AlertCircle size={18} />
                    <span>Este pacote expirou em {new Date(selectedPackage.end_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {/* Sessions Section */}
              <div className="package-sessions-section">
                <div className="sessions-header">
                  <h3>Histórico de Sessões</h3>
                  {selectedPackage.used_sessions < selectedPackage.total_sessions && (
                    <button
                      onClick={() => setShowSessionForm(true)}
                      className="btn-add-session"
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  )}
                </div>

                <div className="sessions-list">
                  {selectedPackage.sessions.length === 0 ? (
                    <p className="empty-message">Nenhuma sessão registrada</p>
                  ) : (
                    selectedPackage.sessions.map((session, idx) => (
                      <div key={session.id} className="session-item">
                        <div className="session-number">#{idx + 1}</div>
                        <div className="session-info">
                          <div className="session-date">
                            {new Date(session.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="session-professional">
                            {session.professional}
                          </div>
                          {session.notes && (
                            <div className="session-notes">{session.notes}</div>
                          )}
                        </div>
                        <div className="session-check">
                          <Check size={18} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="package-actions">
                {selectedPackage.status === 'active' && selectedPackage.used_sessions >= selectedPackage.total_sessions && (
                  <button onClick={handleRenewPackage} className="btn-renew">
                    <RotateCw size={18} />
                    Renovar Pacote
                  </button>
                )}
                <button
                  onClick={() => handleDeletePackage(selectedPackage.id)}
                  className="btn-delete-pkg"
                >
                  <Trash2 size={18} />
                  Deletar Pacote
                </button>
              </div>
            </>
          ) : (
            <div className="package-empty-state">
              <p>Selecione um pacote para ver detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* New Package Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Novo Pacote</h2>
              <button
                onClick={() => setShowForm(false)}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Paciente *</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Nome do paciente"
                />
              </div>

              <div className="form-group">
                <label>Selecionar Template *</label>
                <select
                  value={formData.package_template}
                  onChange={(e) => setFormData({ ...formData, package_template: e.target.value })}
                >
                  <option value="">Escolher template...</option>
                  {PACKAGE_TEMPLATES.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name} - R$ {t.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data de Início</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Data de Vencimento</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
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
                onClick={handleCreatePackage}
                className="btn-save"
              >
                Criar Pacote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showSessionForm && selectedPackage && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Adicionar Sessão</h2>
              <button
                onClick={() => {
                  setShowSessionForm(false);
                  setNewSessionNotes('');
                }}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea
                  value={newSessionNotes}
                  onChange={(e) => setNewSessionNotes(e.target.value)}
                  placeholder="Adicione observações sobre a sessão..."
                  rows={4}
                />
              </div>
              <div className="session-preview">
                <p><strong>Sessão:</strong> {selectedPackage.used_sessions + 1}/{selectedPackage.total_sessions}</p>
                <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowSessionForm(false);
                  setNewSessionNotes('');
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSession}
                className="btn-save"
              >
                Registrar Sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
