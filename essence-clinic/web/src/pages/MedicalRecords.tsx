import { useState, useEffect } from 'react';
import { Plus, FileText, Download, X, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import client from '@/api/client';
import '../styles/medical-records.css';

interface Field {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  label: string;
  required?: boolean;
  options?: string[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  fields: Field[];
}

interface MedicalRecord {
  id: string;
  client_id: string;
  client_name: string;
  template_id: string;
  template_name: string;
  date: string;
  professional: string;
  data: Record<string, any>;
  notes?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'anamnesis',
    name: 'Anamnese',
    description: 'Entrevista inicial com histórico médico completo',
    color: 'from-cyan-400 to-blue-600',
    icon: '📋',
    fields: [
      { id: 'chief_complaint', name: 'chief_complaint', type: 'text', label: 'Queixa Principal', required: true },
      { id: 'history', name: 'history', type: 'textarea', label: 'História da Doença Atual', required: true },
      { id: 'past_medical', name: 'past_medical', type: 'textarea', label: 'Antecedentes Pessoais', required: false },
      { id: 'allergies', name: 'allergies', type: 'textarea', label: 'Alergias', required: false },
      { id: 'medications', name: 'medications', type: 'textarea', label: 'Medicações em Uso', required: false },
      { id: 'lifestyle', name: 'lifestyle', type: 'textarea', label: 'Estilo de Vida', required: false },
    ],
  },
  {
    id: 'evaluation',
    name: 'Avaliação',
    description: 'Avaliação clínica e exame físico',
    color: 'from-cyan-400 to-blue-600',
    icon: '🔍',
    fields: [
      { id: 'vital_signs', name: 'vital_signs', type: 'textarea', label: 'Sinais Vitais (PA, FC, Temp, FR)', required: true },
      { id: 'physical_exam', name: 'physical_exam', type: 'textarea', label: 'Exame Físico', required: true },
      { id: 'observations', name: 'observations', type: 'textarea', label: 'Observações Clínicas', required: false },
      { id: 'assessment', name: 'assessment', type: 'textarea', label: 'Diagnóstico/Avaliação', required: true },
      { id: 'tests', name: 'tests', type: 'textarea', label: 'Testes Realizados', required: false },
    ],
  },
  {
    id: 'evolution',
    name: 'Evolução',
    description: 'Anotação de evolução do tratamento',
    color: 'from-cyan-400 to-blue-600',
    icon: '📈',
    fields: [
      { id: 'current_status', name: 'current_status', type: 'textarea', label: 'Estado Atual', required: true },
      { id: 'treatment_response', name: 'treatment_response', type: 'textarea', label: 'Resposta ao Tratamento', required: true },
      { id: 'changes', name: 'changes', type: 'textarea', label: 'Mudanças Observadas', required: false },
      { id: 'next_steps', name: 'next_steps', type: 'textarea', label: 'Próximos Passos', required: false },
    ],
  },
  {
    id: 'procedure',
    name: 'Procedimento',
    description: 'Registro de procedimento realizado',
    color: 'from-cyan-400 to-blue-600',
    icon: '💉',
    fields: [
      { id: 'procedure_name', name: 'procedure_name', type: 'text', label: 'Procedimento Realizado', required: true },
      { id: 'materials', name: 'materials', type: 'textarea', label: 'Materiais Utilizados', required: true },
      { id: 'technique', name: 'technique', type: 'textarea', label: 'Técnica Utilizada', required: true },
      { id: 'duration', name: 'duration', type: 'number', label: 'Duração (minutos)', required: false },
      { id: 'complications', name: 'complications', type: 'textarea', label: 'Complicações (se houver)', required: false },
      { id: 'post_care', name: 'post_care', type: 'textarea', label: 'Cuidados Pós-Procedimento', required: true },
    ],
  },
];

export default function MedicalRecords() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client_id');
  const clientName = searchParams.get('client_name');

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');

  useEffect(() => {
    fetchRecords();
  }, [clientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      if (clientId) {
        // Simulando busca por cliente
        const mockRecords: MedicalRecord[] = [
          {
            id: '1',
            client_id: clientId,
            client_name: clientName || 'Cliente',
            template_id: 'anamnesis',
            template_name: 'Anamnese',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            professional: 'Dra. Ana Silva',
            data: { chief_complaint: 'Dor de cabeça', history: 'Começou há 3 dias' },
          },
        ];
        setRecords(mockRecords);
      }
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({});
  };

  const handleFormChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSaveRecord = async () => {
    if (!selectedTemplate) return;

    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      client_id: clientId || 'unknown',
      client_name: clientName || 'Cliente',
      template_id: selectedTemplate.id,
      template_name: selectedTemplate.name,
      date: new Date().toISOString().split('T')[0],
      professional: 'Profissional Atual',
      data: formData,
    };

    setRecords([newRecord, ...records]);
    setShowForm(false);
    setSelectedTemplate(null);
    setFormData({});

    try {
      await client.post('/medical-records', newRecord);
      alert('✅ Ficha salva com sucesso!');
    } catch (error) {
      alert('✅ Ficha criada (backend offline)');
    }
  };

  const exportPDF = (record: MedicalRecord) => {
    const template = TEMPLATES.find(t => t.id === record.template_id);
    if (!template) return;

    const content = `
FICHA CLÍNICA - ${template.name.toUpperCase()}
${'='.repeat(50)}

PACIENTE: ${record.client_name}
DATA: ${new Date(record.date).toLocaleDateString('pt-BR')}
PROFISSIONAL: ${record.professional}

INFORMAÇÕES:
${Object.entries(record.data)
  .map(([key, value]) => {
    const field = template.fields.find(f => f.id === key);
    return `${field?.label || key}: ${value}`;
  })
  .join('\n')}

ASSINADO: ________________________
DATA: __/__/____
    `;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `ficha-${record.template_name}-${record.date}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredRecords = records
    .filter(r => !filterType || r.template_id === filterType)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return <div className="records-loading">Carregando fichas...</div>;
  }

  return (
    <div className="records-container">
      {/* Header */}
      <div className="records-header">
        <div>
          <h1>📄 Fichas Clínicas</h1>
          {clientName && <p className="records-subtitle">Paciente: {clientName}</p>}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-new-record"
        >
          <Plus size={18} />
          Nova Ficha
        </button>
      </div>

      {/* Main Content */}
      <div className="records-content">
        {/* Left Panel - List */}
        <div className="records-list-panel">
          <div className="records-filters">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos os tipos</option>
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="date_desc">Mais recentes</option>
              <option value="date_asc">Mais antigos</option>
            </select>
          </div>

          <div className="records-list">
            {filteredRecords.length === 0 ? (
              <div className="records-empty">
                <p>Nenhuma ficha encontrada</p>
              </div>
            ) : (
              filteredRecords.map(record => {
                const template = TEMPLATES.find(t => t.id === record.template_id);
                return (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`record-item ${selectedRecord?.id === record.id ? 'active' : ''}`}
                  >
                    <div className="record-item-icon">
                      {template?.icon}
                    </div>
                    <div className="record-item-info">
                      <div className="record-item-type">{record.template_name}</div>
                      <div className="record-item-date">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="records-detail-panel">
          {selectedRecord ? (
            <>
              <div className="record-detail-header">
                <h2>{selectedRecord.template_name}</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="btn-close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="record-detail-info">
                <div className="info-row">
                  <label>Data</label>
                  <p>{new Date(selectedRecord.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="info-row">
                  <label>Profissional</label>
                  <p>{selectedRecord.professional}</p>
                </div>
              </div>

              <div className="record-detail-content">
                {selectedRecord.data && Object.entries(selectedRecord.data).map(([key, value]) => {
                  const template = TEMPLATES.find(t => t.id === selectedRecord.template_id);
                  const field = template?.fields.find(f => f.id === key);
                  return (
                    <div key={key} className="detail-field">
                      <label>{field?.label || key}</label>
                      <p>{value}</p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => exportPDF(selectedRecord)}
                className="btn-export"
              >
                <Download size={18} />
                Exportar como Texto
              </button>
            </>
          ) : (
            <div className="record-empty-state">
              <p>Selecione uma ficha para ver detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      {showForm && !selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content modal-templates">
            <div className="modal-header">
              <h2>Selecionar Template de Ficha</h2>
              <button
                onClick={() => setShowForm(false)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="templates-grid">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`template-card bg-gradient-to-br ${template.color}`}
                >
                  <div className="template-icon">{template.icon}</div>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <div className="template-action">Selecionar →</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content modal-form">
            <div className="modal-header">
              <h2>{selectedTemplate.name}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedTemplate(null);
                  setFormData({});
                }}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {selectedTemplate.fields.map(field => (
                <div key={field.id} className="form-group">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>

                  {field.type === 'textarea' && (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                      placeholder={`Escrever ${field.label.toLowerCase()}...`}
                      rows={4}
                    />
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                      placeholder={field.label}
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                      placeholder={field.label}
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleFormChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      checked={formData[field.id] || false}
                      onChange={(e) => handleFormChange(field.id, e.target.checked)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedTemplate(null);
                  setFormData({});
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRecord}
                className="btn-save"
              >
                Salvar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
