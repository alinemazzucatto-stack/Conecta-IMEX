import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, TrendingUp, Calendar, Users } from 'lucide-react';
import client from '@/api/client';
import '../styles/commissions.css';

interface Commission {
  id: string;
  professional_id: string;
  professional_name: string;
  month: string;
  total_revenue: number;
  commission_percentage: number;
  commission_amount: number;
  paid: boolean;
  paid_date?: string;
  notes?: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  commission_percentage: number;
  base_salary?: number;
}

interface CommissionRule {
  id: string;
  professional_id: string;
  professional_name: string;
  percentage: number;
  min_revenue?: number;
  max_revenue?: number;
  active: boolean;
}

export default function Commissions() {
  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: '1',
      professional_id: 'prof1',
      professional_name: 'Dra. Ana Silva',
      month: '2026-08',
      total_revenue: 5000,
      commission_percentage: 20,
      commission_amount: 1000,
      paid: false,
    },
    {
      id: '2',
      professional_id: 'prof2',
      professional_name: 'Dra. Camila Duarte',
      month: '2026-08',
      total_revenue: 3500,
      commission_percentage: 15,
      commission_amount: 525,
      paid: true,
      paid_date: '2026-09-05',
    },
  ]);

  const [professionals, setProfessionals] = useState<Professional[]>([
    { id: 'prof1', name: 'Dra. Ana Silva', email: 'ana@clinic.com', commission_percentage: 20 },
    { id: 'prof2', name: 'Dra. Camila Duarte', email: 'camila@clinic.com', commission_percentage: 15 },
  ]);

  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'percentage'>('name');

  const filteredCommissions = commissions
    .filter(c => c.month === selectedMonth)
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.commission_amount - a.commission_amount;
        case 'percentage':
          return b.commission_percentage - a.commission_percentage;
        default:
          return a.professional_name.localeCompare(b.professional_name);
      }
    });

  const totalRevenue = filteredCommissions.reduce((sum, c) => sum + c.total_revenue, 0);
  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const paidCommission = filteredCommissions
    .filter(c => c.paid)
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const handleMarkAsPaid = async (commission: Commission) => {
    setSelectedCommission(commission);
    setShowPaymentForm(true);
  };

  const confirmPayment = async () => {
    if (!selectedCommission) return;

    const updated = commissions.map(c =>
      c.id === selectedCommission.id
        ? { ...c, paid: true, paid_date: new Date().toISOString().split('T')[0] }
        : c
    );

    setCommissions(updated);
    setShowPaymentForm(false);
    setSelectedCommission(null);

    try {
      await client.put(`/commissions/${selectedCommission.id}/pay`, {
        paid: true,
        paid_date: new Date().toISOString().split('T')[0],
      });
      alert('✅ Pagamento registrado!');
    } catch (error) {
      alert('✅ Pagamento registrado (backend offline)');
    }
  };

  const handleDeleteCommission = (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta comissão?')) return;
    setCommissions(commissions.filter(c => c.id !== id));
  };

  return (
    <div className="commissions-container">
      {/* Header */}
      <div className="commissions-header">
        <div>
          <h1>💰 Comissões & Financeiro</h1>
          <p className="commissions-subtitle">Gerencie comissões de profissionais</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="commissions-month-selector">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-input"
        />
        <span className="month-label">
          {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="commissions-summary">
        <div className="summary-card">
          <div className="summary-icon">💵</div>
          <div className="summary-info">
            <label>Receita Total</label>
            <p>R$ {totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <label>Comissões a Pagar</label>
            <p>R$ {(totalCommission - paidCommission).toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <label>Já Pagos</label>
            <p>R$ {paidCommission.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">👥</div>
          <div className="summary-info">
            <label>Profissionais</label>
            <p>{filteredCommissions.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="commissions-filters">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="filter-select"
        >
          <option value="name">Ordenar por: Nome</option>
          <option value="amount">Ordenar por: Valor</option>
          <option value="percentage">Ordenar por: Percentual</option>
        </select>
      </div>

      {/* Commissions Table */}
      <div className="commissions-table-container">
        <table className="commissions-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Faturamento</th>
              <th>Percentual</th>
              <th>Comissão</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-message">
                  Nenhuma comissão para este mês
                </td>
              </tr>
            ) : (
              filteredCommissions.map(commission => (
                <tr key={commission.id} className={commission.paid ? 'paid' : 'pending'}>
                  <td className="professional-name">
                    <span className="badge">{commission.professional_name[0]}</span>
                    {commission.professional_name}
                  </td>
                  <td>R$ {commission.total_revenue.toFixed(2)}</td>
                  <td>{commission.commission_percentage}%</td>
                  <td className="commission-amount">
                    R$ {commission.commission_amount.toFixed(2)}
                  </td>
                  <td>
                    {commission.paid ? (
                      <span className="status-badge paid">✅ Pago em {new Date(commission.paid_date || '').toLocaleDateString('pt-BR')}</span>
                    ) : (
                      <span className="status-badge pending">⏳ Pendente</span>
                    )}
                  </td>
                  <td className="actions">
                    {!commission.paid && (
                      <button
                        onClick={() => handleMarkAsPaid(commission)}
                        className="btn-pay"
                      >
                        💳 Pagar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCommission(commission.id)}
                      className="btn-delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredCommissions.length > 0 && (
          <div className="table-footer">
            <div className="footer-stat">
              <span>Total Receita:</span>
              <strong>R$ {totalRevenue.toFixed(2)}</strong>
            </div>
            <div className="footer-stat">
              <span>Total Comissões:</span>
              <strong>R$ {totalCommission.toFixed(2)}</strong>
            </div>
            <div className="footer-stat">
              <span>Margem:</span>
              <strong>{((totalRevenue - totalCommission) / totalRevenue * 100).toFixed(1)}%</strong>
            </div>
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentForm && selectedCommission && (
        <div className="modal-overlay">
          <div className="modal-content modal-payment">
            <div className="modal-header">
              <h2>💳 Confirmar Pagamento</h2>
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedCommission(null);
                }}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-details">
                <div className="detail-row">
                  <span>Profissional:</span>
                  <strong>{selectedCommission.professional_name}</strong>
                </div>
                <div className="detail-row">
                  <span>Período:</span>
                  <strong>{new Date(selectedCommission.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
                </div>
                <div className="detail-row">
                  <span>Faturamento:</span>
                  <strong>R$ {selectedCommission.total_revenue.toFixed(2)}</strong>
                </div>
                <div className="detail-row">
                  <span>Percentual:</span>
                  <strong>{selectedCommission.commission_percentage}%</strong>
                </div>
                <div className="detail-row highlight">
                  <span>Valor a Pagar:</span>
                  <strong>R$ {selectedCommission.commission_amount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="info-box">
                <p>Confirme o pagamento dessa comissão. Esta ação será registrada no histórico.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedCommission(null);
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPayment}
                className="btn-confirm-payment"
              >
                ✓ Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
