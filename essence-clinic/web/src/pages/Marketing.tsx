import { useState } from 'react';
import { Mail, MessageSquare, Share2, Eye, Send } from 'lucide-react';
import '../styles/marketing.css';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'instagram';
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
  sent_at?: string;
}

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Promoção Agosto 20% OFF',
      type: 'email',
      status: 'sent',
      recipients: 543,
      open_rate: 28,
      click_rate: 8,
      created_at: '2026-08-01',
      sent_at: '2026-08-05',
    },
    {
      id: '2',
      name: 'Lembrete Manutenção Facial',
      type: 'whatsapp',
      status: 'scheduled',
      recipients: 287,
      created_at: '2026-08-20',
    },
  ]);

  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as const,
    recipients: 'all',
    message: '',
    schedule_date: '',
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.message) {
      alert('Preencha todos os campos');
      return;
    }

    alert('✅ Campanha criada com sucesso!');
    setShowNewCampaign(false);
    setNewCampaign({ name: '', type: 'email', recipients: 'all', message: '', schedule_date: '' });
  };

  return (
    <div className="marketing-container">
      <div className="marketing-header">
        <div>
          <h1>📢 Campanhas & Marketing</h1>
          <p>Crie campanhas de email, WhatsApp e Instagram</p>
        </div>
        <button onClick={() => setShowNewCampaign(true)} className="btn-new">
          + Nova Campanha
        </button>
      </div>

      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="campaign-card">
            <div className="campaign-header">
              <h3>{campaign.name}</h3>
              <span className={`badge badge-${campaign.type}`}>
                {campaign.type === 'email' && '✉️ Email'}
                {campaign.type === 'whatsapp' && '💬 WhatsApp'}
                {campaign.type === 'instagram' && '📸 Instagram'}
              </span>
            </div>

            <div className="campaign-stats">
              <div className="stat">
                <label>Destinatários</label>
                <p>{campaign.recipients}</p>
              </div>
              {campaign.status === 'sent' && (
                <>
                  <div className="stat">
                    <label>Taxa Abertura</label>
                    <p>{campaign.open_rate}%</p>
                  </div>
                  <div className="stat">
                    <label>Taxa Clique</label>
                    <p>{campaign.click_rate}%</p>
                  </div>
                </>
              )}
            </div>

            <div className="campaign-footer">
              <span className={`status status-${campaign.status}`}>
                {campaign.status === 'draft' && '📝 Rascunho'}
                {campaign.status === 'scheduled' && '📅 Agendada'}
                {campaign.status === 'sent' && '✅ Enviada'}
              </span>
              <button className="btn-view">Ver Detalhes →</button>
            </div>
          </div>
        ))}
      </div>

      {showNewCampaign && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nova Campanha</h2>
              <button onClick={() => setShowNewCampaign(false)} className="btn-close">✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome da Campanha</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Ex: Promoção Agosto"
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
                >
                  <option value="email">📧 Email</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="instagram">📸 Instagram</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mensagem</label>
                <textarea
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                  placeholder="Escreva sua mensagem..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Agendar para (opcional)</label>
                <input
                  type="datetime-local"
                  value={newCampaign.schedule_date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, schedule_date: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowNewCampaign(false)} className="btn-cancel">Cancelar</button>
              <button onClick={handleCreateCampaign} className="btn-save">Criar Campanha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
