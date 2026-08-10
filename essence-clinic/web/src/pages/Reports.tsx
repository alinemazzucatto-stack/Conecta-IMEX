import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import '../styles/reports.css';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<'revenue' | 'clients' | 'appointments' | 'professionals'>('revenue');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-08-31' });

  const reports = [
    { id: 'revenue', name: 'Faturamento', icon: '💰', color: 'from-green-500 to-green-600' },
    { id: 'clients', name: 'Crescimento Clientes', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { id: 'appointments', name: 'Agendamentos', icon: '📅', color: 'from-purple-500 to-purple-600' },
    { id: 'professionals', name: 'Performance Profissionais', icon: '⭐', color: 'from-pink-500 to-pink-600' },
  ];

  const revenueData = [
    { month: 'Jan', value: 12000 },
    { month: 'Fev', value: 15000 },
    { month: 'Mar', value: 18000 },
    { month: 'Abr', value: 16000 },
    { month: 'Mai', value: 22000 },
    { month: 'Jun', value: 25000 },
    { month: 'Jul', value: 28000 },
    { month: 'Ago', value: 31000 },
  ];

  const clientStats = {
    total: 1243,
    new_this_month: 45,
    inactive: 23,
    growth_percentage: 12.5,
  };

  const appointmentStats = {
    total: 287,
    this_month: 42,
    average_per_day: 1.9,
    cancellation_rate: 5.2,
  };

  const professionalStats = [
    { name: 'Dra. Ana Silva', appointments: 95, rating: 4.8, revenue: 12500 },
    { name: 'Dra. Camila Duarte', appointments: 87, rating: 4.7, revenue: 11200 },
    { name: 'Dra. Marina Costa', appointments: 105, rating: 4.9, revenue: 13800 },
  ];

  const handleExportPDF = () => {
    alert('📄 Exportando relatório em PDF...');
  };

  const handleExportExcel = () => {
    alert('📊 Exportando dados para Excel...');
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Relatórios & Analytics</h1>
        <div className="header-actions">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="date-input"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="date-input"
          />
          <button onClick={handleExportPDF} className="btn-export">
            <Download size={18} /> PDF
          </button>
          <button onClick={handleExportExcel} className="btn-export">
            <Download size={18} /> Excel
          </button>
        </div>
      </div>

      <div className="reports-nav">
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id as any)}
            className={`report-tab ${selectedReport === report.id ? 'active' : ''}`}
          >
            <span className="icon">{report.icon}</span>
            {report.name}
          </button>
        ))}
      </div>

      <div className="reports-content">
        {selectedReport === 'revenue' && (
          <div className="report-section">
            <h2>💰 Análise de Faturamento</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <label>Total do Período</label>
                <p>R$ 166.000</p>
                <span className="trend">+18% vs período anterior</span>
              </div>
              <div className="stat-card">
                <label>Média Mensal</label>
                <p>R$ 20.750</p>
                <span className="trend">Tendência positiva</span>
              </div>
              <div className="stat-card">
                <label>Maior Mês</label>
                <p>Agosto (R$ 31.000)</p>
                <span className="trend">+11% crescimento</span>
              </div>
            </div>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Gráfico de faturamento mensal</p>
            </div>
          </div>
        )}

        {selectedReport === 'clients' && (
          <div className="report-section">
            <h2>👥 Crescimento de Clientes</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <label>Total de Clientes</label>
                <p>{clientStats.total}</p>
                <span className="trend">+{clientStats.growth_percentage}% crescimento</span>
              </div>
              <div className="stat-card">
                <label>Novos Este Mês</label>
                <p>+{clientStats.new_this_month}</p>
                <span className="trend">Taxa de conversão</span>
              </div>
              <div className="stat-card">
                <label>Inativos</label>
                <p>{clientStats.inactive}</p>
                <span className="trend">Últimos 90 dias</span>
              </div>
            </div>
            <div className="chart-placeholder">
              <PieChart size={48} />
              <p>Distribuição de clientes</p>
            </div>
          </div>
        )}

        {selectedReport === 'appointments' && (
          <div className="report-section">
            <h2>📅 Análise de Agendamentos</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <label>Agendamentos</label>
                <p>{appointmentStats.total}</p>
                <span className="trend">Este período</span>
              </div>
              <div className="stat-card">
                <label>Este Mês</label>
                <p>{appointmentStats.this_month}</p>
                <span className="trend">Média: {appointmentStats.average_per_day} por dia</span>
              </div>
              <div className="stat-card">
                <label>Taxa de Cancelamento</label>
                <p>{appointmentStats.cancellation_rate}%</p>
                <span className="trend">Abaixo da média</span>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'professionals' && (
          <div className="report-section">
            <h2>⭐ Performance dos Profissionais</h2>
            <div className="professionals-table">
              <div className="table-header">
                <span>Profissional</span>
                <span>Agendamentos</span>
                <span>Rating</span>
                <span>Faturamento</span>
              </div>
              {professionalStats.map((prof, idx) => (
                <div key={idx} className="table-row">
                  <span className="name">{prof.name}</span>
                  <span>{prof.appointments}</span>
                  <span className="rating">⭐ {prof.rating}</span>
                  <span className="revenue">R$ {prof.revenue.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
