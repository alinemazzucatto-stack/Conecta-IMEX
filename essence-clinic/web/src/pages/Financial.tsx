import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client';
import jsPDF from 'jspdf';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  clinic_id: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  clinic_id: string;
}

interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  total_transactions: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export default function Financial() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'dashboard' | 'kpis' | 'goals' | 'reports' | 'services' | 'transactions' | 'analytics'>('dashboard');
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [financialGoal, setFinancialGoal] = useState<number | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
  });

  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesData, transactionsData, summaryData] = await Promise.all([
        client.get('/financial/services'),
        client.get('/financial/transactions'),
        client.get('/financial/summary'),
      ]);
      setServices(servicesData.data || []);
      setTransactions(transactionsData.data || []);
      setSummary(summaryData.data || null);

      // Calcular dados mensais
      const txData = transactionsData.data || [];
      const months: { [key: string]: { income: number; expense: number } } = {};

      txData.forEach((tx: Transaction) => {
        const [year, month] = tx.date.split('-');
        const key = `${month}/${year}`;
        if (!months[key]) months[key] = { income: 0, expense: 0 };
        if (tx.type === 'income') months[key].income += tx.amount;
        else months[key].expense += tx.amount;
      });

      const sortedMonths = Object.entries(months)
        .sort((a, b) => {
          const [aMonth, aYear] = a[0].split('/');
          const [bMonth, bYear] = b[0].split('/');
          return new Date(aYear + '-' + aMonth).getTime() - new Date(bYear + '-' + bMonth).getTime();
        })
        .map(([month, data]) => ({ month, ...data }));

      setMonthlyData(sortedMonths);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  // Análises Avançadas
  const calculatePLReport = () => {
    const plData = monthlyData.map(m => ({
      month: m.month,
      income: m.income,
      expense: m.expense,
      profit: m.income - m.expense,
      marginPercent: m.income > 0 ? ((m.income - m.expense) / m.income * 100).toFixed(1) : 0
    }));
    return plData;
  };

  const calculatePeriodComparison = () => {
    if (monthlyData.length < 2) return null;
    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];

    return {
      current,
      previous,
      incomeChange: ((current.income - previous.income) / (previous.income || 1) * 100).toFixed(1),
      expenseChange: ((current.expense - previous.expense) / (previous.expense || 1) * 100).toFixed(1),
      profitChange: ((current.income - current.expense - (previous.income - previous.expense)) / (Math.abs(previous.income - previous.expense) || 1) * 100).toFixed(1)
    };
  };

  const calculateCashFlowForecast = () => {
    if (monthlyData.length === 0) return [];
    const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length;
    const avgExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0) / monthlyData.length;

    const forecast = [];
    const lastMonth = monthlyData[monthlyData.length - 1];
    const [lastMonthNum, lastYear] = lastMonth.month.split('/');

    for (let i = 1; i <= 3; i++) {
      const nextDate = new Date(parseInt(lastYear), parseInt(lastMonthNum) + i - 1);
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const year = nextDate.getFullYear();

      forecast.push({
        month: `${month}/${year}`,
        income: parseFloat(avgIncome.toFixed(2)),
        expense: parseFloat(avgExpense.toFixed(2)),
        profit: parseFloat((avgIncome - avgExpense).toFixed(2))
      });
    }
    return forecast;
  };

  const calculateCategoryAnalysis = () => {
    const categories: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach(tx => {
      const cat = tx.category || 'Sem categoria';
      if (!categories[cat]) categories[cat] = { income: 0, expense: 0 };
      if (tx.type === 'income') categories[cat].income += tx.amount;
      else categories[cat].expense += tx.amount;
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      ...data,
      total: data.income + data.expense,
      percentage: summary ? ((data.income + data.expense) / (summary.total_income + summary.total_expenses) * 100).toFixed(1) : 0
    }));
  };

  const calculateAdvancedMetrics = () => {
    if (!summary || monthlyData.length === 0) return null;

    const totalIncome = summary.total_income;
    const totalExpense = summary.total_expenses;
    const avgMonthlyIncome = totalIncome / monthlyData.length;
    const avgMonthlyExpense = totalExpense / monthlyData.length;

    return {
      profitMargin: totalIncome > 0 ? ((summary.balance / totalIncome) * 100).toFixed(1) : 0,
      expenseRatio: totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0,
      avgMonthlyIncome: avgMonthlyIncome.toFixed(2),
      avgMonthlyExpense: avgMonthlyExpense.toFixed(2),
      avgMonthlyProfit: (avgMonthlyIncome - avgMonthlyExpense).toFixed(2),
      runway: avgMonthlyExpense > 0 ? (summary.balance / avgMonthlyExpense).toFixed(1) : 'N/A'
    };
  };

  const handleSaveService = async () => {
    if (!serviceForm.name.trim() || !serviceForm.price) {
      alert('Preencha nome e preço');
      return;
    }

    try {
      if (editingService) {
        await client.put(`/financial/services/${editingService.id}`, serviceForm);
        alert('✅ Serviço atualizado!');
      } else {
        await client.post('/financial/services', serviceForm);
        alert('✅ Serviço criado!');
      }
      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({ name: '', description: '', price: '' });
      fetchData();
    } catch (error) {
      alert('❌ Erro ao salvar serviço');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Deletar este serviço?')) return;
    try {
      await client.delete(`/financial/services/${id}`);
      alert('✅ Serviço deletado!');
      fetchData();
    } catch (error) {
      alert('❌ Erro ao deletar serviço');
    }
  };

  const handleSaveTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.description) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      const data = { ...transactionForm, amount: parseFloat(transactionForm.amount) };
      if (editingTransaction) {
        await client.put(`/financial/transactions/${editingTransaction.id}`, data);
        alert('✅ Transação atualizada!');
      } else {
        await client.post('/financial/transactions', data);
        alert('✅ Transação criada!');
      }
      setShowTransactionModal(false);
      setEditingTransaction(null);
      setTransactionForm({
        type: 'income',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
      });
      fetchData();
    } catch (error) {
      alert('❌ Erro ao salvar transação');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Deletar esta transação?')) return;
    try {
      await client.delete(`/financial/transactions/${id}`);
      alert('✅ Transação deletada!');
      fetchData();
    } catch (error) {
      alert('❌ Erro ao deletar transação');
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('Nenhuma transação para exportar');
      return;
    }

    const headers = ['Data', 'Tipo', 'Descrição', 'Valor', 'Categoria'];
    const rows = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString('pt-BR'),
      tx.type === 'income' ? 'Receita' : 'Despesa',
      tx.description,
      tx.amount.toFixed(2).replace('.', ','),
      tx.category || 'Sem categoria'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const exportToPDF = () => {
    if (!summary) {
      alert('Nenhum dado para exportar');
      return;
    }

    const doc = new jsPDF();
    let yPosition = 20;

    // Cabeçalho
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('💎 ESSENCE CLINIC', 15, 15);
    doc.setFontSize(12);
    doc.text('Relatório Financeiro', 15, 25);
    doc.setTextColor(0, 0, 0);

    yPosition = 45;

    // Data do Relatório
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 15, yPosition);
    yPosition += 15;

    // Título da Seção
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text('📊 Resumo Executivo', 15, yPosition);
    yPosition += 12;

    // Box de Resumo
    doc.setFillColor(240, 245, 255);
    doc.rect(15, yPosition, 180, 50, 'F');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text(`Receita Total: R$ ${summary.total_income.toFixed(2)}`, 20, yPosition + 8);
    doc.text(`Despesas Total: R$ ${summary.total_expenses.toFixed(2)}`, 20, yPosition + 18);
    doc.text(`Saldo: R$ ${summary.balance.toFixed(2)}`, 20, yPosition + 28);
    doc.text(`Total de Transações: ${summary.total_transactions}`, 20, yPosition + 38);

    yPosition += 60;

    // Seção de Transações
    if (transactions.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text('💳 Últimas Transações', 15, yPosition);
      yPosition += 10;

      // Cabeçalho da Tabela
      doc.setFillColor(30, 64, 175);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Data', 15, yPosition);
      doc.text('Tipo', 55, yPosition);
      doc.text('Descrição', 85, yPosition);
      doc.text('Valor', 170, yPosition);
      yPosition += 8;

      // Linhas da Tabela
      doc.setTextColor(0, 0, 0);
      transactions.slice(0, 10).forEach((tx, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const bgColor = index % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
        doc.setFillColor(...bgColor);
        doc.rect(15, yPosition - 5, 180, 7, 'F');

        if (tx.type === 'income') {
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setTextColor(239, 68, 68);
        }
        doc.text(new Date(tx.date).toLocaleDateString('pt-BR'), 15, yPosition);
        doc.text(tx.type === 'income' ? 'RECEITA' : 'DESPESA', 55, yPosition);

        doc.setTextColor(0, 0, 0);
        const descricao = tx.description.length > 30 ? tx.description.substring(0, 27) + '...' : tx.description;
        doc.text(descricao, 85, yPosition);
        doc.text(`R$ ${tx.amount.toFixed(2)}`, 170, yPosition);

        yPosition += 8;
      });
    }

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}`, 185, 285);
      doc.text('Essence Clinic © 2024', 15, 285);
    }

    // Salvar PDF
    doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      const matchesText = tx.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesCategory = filterCategory === 'all' || (tx.category || 'Sem categoria') === filterCategory;
      const matchesDateStart = !filterStartDate || new Date(tx.date) >= new Date(filterStartDate);
      const matchesDateEnd = !filterEndDate || new Date(tx.date) <= new Date(filterEndDate);

      return matchesText && matchesType && matchesCategory && matchesDateStart && matchesDateEnd;
    });
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').slice(1); // pula header
        let imported = 0;

        for (const line of lines) {
          if (!line.trim()) continue;

          const [data, tipo, descricao, valor, categoria] = line.split(',').map(cell => cell.replace(/"/g, '').trim());
          if (!data || !tipo || !descricao || !valor) continue;

          const [dia, mes, ano] = data.split('/');
          const dateStr = `${ano}-${mes}-${dia}`;

          await client.post('/financial/transactions', {
            type: tipo.toLowerCase() === 'receita' ? 'income' : 'expense',
            amount: parseFloat(valor.replace(',', '.')),
            description: descricao,
            date: dateStr,
            category: categoria || 'Importado'
          });

          imported++;
        }

        alert(`✅ ${imported} transação(ões) importada(s) com sucesso!`);
        fetchData();
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('❌ Erro ao importar transações');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando dados financeiros...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
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

      <h1 style={{ margin: 0, color: '#1e40af', marginBottom: '2rem' }}>💰 Financeiro</h1>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {(['dashboard', 'kpis', 'goals', 'reports', 'analytics', 'services', 'transactions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.75rem 1.5rem',
              background: tab === t ? '#1e40af' : '#e2e8f0',
              color: tab === t ? 'white' : '#0f172a',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {t === 'dashboard' && '📊 Dashboard'}
            {t === 'kpis' && '🎯 KPIs'}
            {t === 'goals' && '🎖️ Metas'}
            {t === 'reports' && '📈 Relatórios'}
            {t === 'analytics' && '📊 Análises'}
            {t === 'services' && '🛍️ Serviços'}
            {t === 'transactions' && '💳 Transações'}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Receita Total</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              R$ {summary.total_income.toFixed(2)}
            </p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Despesas Total</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
              R$ {summary.total_expenses.toFixed(2)}
            </p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Saldo</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: summary.balance >= 0 ? '#10b981' : '#ef4444' }}>
              R$ {summary.balance.toFixed(2)}
            </p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Total de Transações</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 700, color: '#1e40af' }}>
              {summary.total_transactions}
            </p>
          </div>
        </div>
      )}

      {/* KPIs - Dashboard Executivo */}
      {tab === 'kpis' && summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* KPI Principal */}
          <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '2rem', borderRadius: '0.75rem', color: 'white' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Saldo Atual</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '3rem', fontWeight: 700 }}>
              R$ {summary.balance.toFixed(2)}
            </p>
            <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
              {summary.balance >= 0 ? '✅ Situação Positiva' : '⚠️ Atenção: Déficit'}
            </p>
          </div>

          {/* KPIs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Receita */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Receita Total</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                    R$ {summary.total_income.toFixed(2)}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📈</div>
              </div>
            </div>

            {/* Despesa */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Despesa Total</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>
                    R$ {summary.total_expenses.toFixed(2)}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📉</div>
              </div>
            </div>

            {/* Margem */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Margem Líquida</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#8b5cf6' }}>
                    {summary.total_income > 0
                      ? ((summary.balance / summary.total_income) * 100).toFixed(1)
                      : '0'}
                    %
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>💯</div>
              </div>
            </div>

            {/* Transações */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Total de Transações</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
                    {summary.total_transactions}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>💳</div>
              </div>
            </div>
          </div>

          {/* Análise de Índices */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>📊 Análise de Índices</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Índice 1: Proporção Receita */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Proporção de Receita</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>
                    {summary.total_income + summary.total_expenses > 0
                      ? Math.round((summary.total_income / (summary.total_income + summary.total_expenses)) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: '#10b981',
                      height: '100%',
                      width: `${summary.total_income + summary.total_expenses > 0
                        ? Math.round((summary.total_income / (summary.total_income + summary.total_expenses)) * 100)
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Índice 2: Proporção Despesa */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Proporção de Despesa</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    {summary.total_income + summary.total_expenses > 0
                      ? Math.round((summary.total_expenses / (summary.total_income + summary.total_expenses)) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: '#ef4444',
                      height: '100%',
                      width: `${summary.total_income + summary.total_expenses > 0
                        ? Math.round((summary.total_expenses / (summary.total_income + summary.total_expenses)) * 100)
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Índice 3: Saúde Financeira */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Saúde Financeira</span>
                  <span style={{
                    color: summary.balance >= summary.total_expenses ? '#10b981' : '#ef4444',
                    fontWeight: 700
                  }}>
                    {summary.total_expenses > 0
                      ? ((summary.balance / summary.total_expenses) * 100).toFixed(1)
                      : '0'}
                    %
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: summary.balance >= summary.total_expenses ? '#10b981' : '#ef4444',
                      height: '100%',
                      width: `${Math.min(100, summary.total_expenses > 0
                        ? ((summary.balance / summary.total_expenses) * 100)
                        : 0)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metas Financeiras */}
      {tab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card de Meta Atual */}
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', padding: '2rem', borderRadius: '0.75rem', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Meta de Receita</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', fontWeight: 700 }}>
                  R$ {financialGoal?.toFixed(2) || '0.00'}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                  {financialGoal && summary
                    ? `${((summary.total_income / financialGoal) * 100).toFixed(1)}% alcançado`
                    : 'Defina uma meta'}
                </p>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ✏️ Editar Meta
              </button>
            </div>
          </div>

          {/* Progresso da Meta */}
          {financialGoal && summary && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>📊 Progresso da Meta</h3>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Receita Alcançada</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>
                    {Math.min(100, ((summary.total_income / financialGoal) * 100).toFixed(1))}%
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      height: '100%',
                      width: `${Math.min(100, (summary.total_income / financialGoal) * 100)}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Análise */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Receita até agora</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                    R$ {summary.total_income.toFixed(2)}
                  </p>
                </div>
                <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Falta para atingir</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                    R$ {Math.max(0, financialGoal - summary.total_income).toFixed(2)}
                  </p>
                </div>
                <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #6366f1' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Dia(s) restante(s)*</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>
                    ~30
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>*Estimativa mensal</p>
                </div>
              </div>
            </div>
          )}

          {!financialGoal && (
            <div style={{ background: '#fef3c7', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', border: '2px dashed #f59e0b' }}>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#92400e' }}>📌 Defina uma Meta de Receita</p>
              <p style={{ margin: '0.5rem 0 0 0', color: '#78350f' }}>Acompanhe seu progresso rumo aos seus objetivos financeiros</p>
              <button
                onClick={() => setShowGoalModal(true)}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 2rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ✨ Criar Meta Agora
              </button>
            </div>
          )}

          {/* Dicas */}
          <div style={{ background: '#dbeafe', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#1e40af' }}>💡 Dica</p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#0c4a6e', fontSize: '0.875rem' }}>
              Defina metas realistas baseadas no seu histórico de receitas. Você pode ajustar a meta mensal sempre que necessário.
            </p>
          </div>
        </div>
      )}

      {/* Modal de Meta */}
      {showGoalModal && (
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
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0, color: '#1e40af' }}>🎖️ Definir Meta de Receita</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Meta de Receita (R$)</label>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Ex: 10000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setGoalInput('');
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
                Cancelar
              </button>
              <button
                onClick={() => {
                  const value = parseFloat(goalInput);
                  if (value > 0) {
                    setFinancialGoal(value);
                    setShowGoalModal(false);
                    setGoalInput('');
                  } else {
                    alert('Digite um valor válido');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relatórios */}
      {tab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Filtro por Período */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>🗓️ Filtro de Período</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>De:</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Até:</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                />
              </div>
              <button
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                Limpar Filtro
              </button>
            </div>
          </div>

          {/* Gráfico de Receita vs Despesa */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>📈 Receita vs Despesa por Mês</h3>
            {monthlyData.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center' }}>Nenhum dado disponível</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${Math.max(800, monthlyData.length * 100)} 400`} style={{ width: '100%', minHeight: '300px' }}>
                  {monthlyData.map((month, i) => {
                    const x = i * 80 + 60;
                    const maxValue = Math.max(...monthlyData.flatMap(m => [m.income, m.expense])) || 1;
                    const incomeHeight = (month.income / maxValue) * 150;
                    const expenseHeight = (month.expense / maxValue) * 150;
                    return (
                      <g key={i}>
                        {/* Barra de Receita */}
                        <rect x={x} y={200 - incomeHeight} width={25} height={incomeHeight} fill="#10b981" />
                        {/* Barra de Despesa */}
                        <rect x={x + 30} y={200 - expenseHeight} width={25} height={expenseHeight} fill="#ef4444" />
                        {/* Label do mês */}
                        <text x={x + 15} y={220} textAnchor="middle" fontSize="12" fill="#64748b">
                          {month.month}
                        </text>
                        {/* Valor Receita */}
                        <text x={x + 12} y={195 - incomeHeight} textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="600">
                          R$ {month.income.toFixed(0)}
                        </text>
                        {/* Valor Despesa */}
                        <text x={x + 42} y={195 - expenseHeight} textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="600">
                          R$ {month.expense.toFixed(0)}
                        </text>
                      </g>
                    );
                  })}
                  {/* Eixo X */}
                  <line x1="40" y1="200" x2={Math.max(800, monthlyData.length * 100) - 20} y2="200" stroke="#e2e8f0" strokeWidth="2" />
                  {/* Eixo Y */}
                  <line x1="40" y1="50" x2="40" y2="200" stroke="#e2e8f0" strokeWidth="2" />
                </svg>
              </div>
            )}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#10b981', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Receita</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Despesa</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Pizza - Receita vs Despesa */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>🥧 Proporção Receita vs Despesa</h3>
            {summary ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                <svg viewBox="0 0 200 200" style={{ width: '200px', height: '200px' }}>
                  {/* Círculo de Receita */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="30"
                    strokeDasharray={`${(summary.total_income / (summary.total_income + summary.total_expenses)) * 565} 565`}
                    transform="rotate(-90 100 100)"
                  />
                  {/* Círculo de Despesa */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="30"
                    strokeDasharray={`${(summary.total_expenses / (summary.total_income + summary.total_expenses)) * 565} 565`}
                    strokeDashoffset={`-${(summary.total_income / (summary.total_income + summary.total_expenses)) * 565}`}
                    transform="rotate(-90 100 100)"
                  />
                  {/* Centro */}
                  <text x="100" y="105" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e40af">
                    {summary.total_income + summary.total_expenses > 0
                      ? Math.round((summary.total_income / (summary.total_income + summary.total_expenses)) * 100)
                      : 0}
                    %
                  </text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', background: '#10b981', borderRadius: '3px' }}></div>
                      <span style={{ fontWeight: 600 }}>Receita</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                      R$ {summary.total_income.toFixed(2)}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                      {summary.total_income + summary.total_expenses > 0
                        ? Math.round((summary.total_income / (summary.total_income + summary.total_expenses)) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '3px' }}></div>
                      <span style={{ fontWeight: 600 }}>Despesa</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                      R$ {summary.total_expenses.toFixed(2)}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                      {summary.total_income + summary.total_expenses > 0
                        ? Math.round((summary.total_expenses / (summary.total_income + summary.total_expenses)) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center' }}>Carregando dados...</p>
            )}
          </div>

          {/* Fluxo de Caixa - Últimos 7 Dias */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>💳 Fluxo de Caixa (Últimos 7 Dias)</h3>
            {transactions.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center' }}>Nenhuma transação disponível</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Data</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Entrada</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Saída</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                          {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '1rem' }}>{tx.description}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: tx.type === 'income' ? '#10b981' : '#64748b', fontWeight: 600 }}>
                          {tx.type === 'income' ? `R$ ${tx.amount.toFixed(2)}` : '-'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: tx.type === 'expense' ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                          {tx.type === 'expense' ? `R$ ${tx.amount.toFixed(2)}` : '-'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1e40af' }}>
                          R$ {(summary?.balance || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Análise por Categoria */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e40af' }}>🏷️ Transações por Categoria</h3>
            {transactions.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center' }}>Nenhuma transação registrada</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Categoria</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Receitas</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Despesas</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(transactions.map(t => t.category || 'Sem categoria'))).map((category, i) => {
                    const categoryTransactions = transactions.filter(t => (t.category || 'Sem categoria') === category);
                    const income = categoryTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                    const expense = categoryTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                    const balance = income - expense;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem' }}>{category}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>R$ {income.toFixed(2)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>R$ {expense.toFixed(2)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: balance >= 0 ? '#10b981' : '#ef4444' }}>
                          R$ {balance.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Serviços */}
      {tab === 'services' && (
        <div>
          <button
            onClick={() => {
              setEditingService(null);
              setServiceForm({ name: '', description: '', price: '' });
              setShowServiceModal(true);
            }}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            + Novo Serviço
          </button>

          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {getFilteredTransactions().length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                {searchText || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Nenhuma transação correspondente aos filtros'
                  : 'Nenhuma transação registrada'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Data</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Categoria</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Valor</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTransactions().map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                        {tx.type === 'income' ? '📈 Receita' : '📉 Despesa'}
                      </td>
                      <td style={{ padding: '1rem' }}>{tx.description}</td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>{tx.category || 'Sem categoria'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>
                        R$ {tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setTransactionForm({
                              type: tx.type,
                              amount: tx.amount.toString(),
                              description: tx.description,
                              date: tx.date,
                              category: tx.category || ''
                            });
                            setShowTransactionModal(true);
                          }}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
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
        </div>
      )}

      {/* Transações */}
      {tab === 'transactions' && (
        <div>
          {/* Busca Avançada */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>🔍 Busca Avançada</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Busca por Texto */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Descrição</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar por descrição..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                />
              </div>

              {/* Filtro por Tipo */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  <option value="all">Todos</option>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>

              {/* Filtro por Categoria */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Categoria</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  <option value="all">Todas</option>
                  {Array.from(new Set(transactions.map(t => t.category || 'Sem categoria'))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Botão Limpar */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSearchText('');
                    setFilterType('all');
                    setFilterCategory('all');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Resultado da Busca */}
            <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>
                ✅ <strong>{getFilteredTransactions().length}</strong> transação(ões) encontrada(s)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionForm({
                  type: 'income',
                  amount: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  category: '',
                });
                setShowTransactionModal(true);
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              + Nova Transação
            </button>
            <button
              onClick={exportToCSV}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              📥 Exportar CSV
            </button>
            <button
              onClick={exportToPDF}
              style={{
                padding: '0.5rem 1rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              📄 Exportar PDF
            </button>
            <label style={{
              padding: '0.5rem 1rem',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'inline-block'
            }}>
              📤 Importar CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {transactions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Nenhuma transação registrada</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Data</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Descrição</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Valor</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem' }}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          background: t.type === 'income' ? '#dcfce7' : '#fee2e2',
                          color: t.type === 'income' ? '#166534' : '#991b1b',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                          {t.type === 'income' ? '💰 Receita' : '💸 Despesa'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{t.description}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingTransaction(t);
                            setTransactionForm({
                              type: t.type,
                              amount: t.amount.toString(),
                              description: t.description,
                              date: t.date,
                              category: t.category || '',
                            });
                            setShowTransactionModal(true);
                          }}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginRight: '0.5rem'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
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
        </div>
      )}

      {/* Modal Serviço */}
      {showServiceModal && (
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
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingService ? 'Editar' : 'Novo'} Serviço</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nome</label>
              <input
                type="text"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="Nome do serviço"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Descrição</label>
              <textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', minHeight: '80px' }}
                placeholder="Descrição do serviço"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Preço (R$)</label>
              <input
                type="number"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowServiceModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveService}
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

      {/* Modal Transação */}
      {showTransactionModal && (
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
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0 }}>{editingTransaction ? 'Editar' : 'Nova'} Transação</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo</label>
              <select
                value={transactionForm.type}
                onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Valor (R$)</label>
              <input
                type="number"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Descrição</label>
              <input
                type="text"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                placeholder="Descrição da transação"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Data</label>
              <input
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowTransactionModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTransaction}
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

      {/* Análises Avançadas */}
      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

          {/* P&L Report */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📊 Relatório de Lucro e Prejuízo</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f0f4f8', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Período</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Receita</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Despesa</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Lucro</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Margem %</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatePLReport().map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fafbfc' : 'white' }}>
                      <td style={{ padding: '0.75rem' }}>{row.month}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>R$ {row.income.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>R$ {row.expense.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: row.profit >= 0 ? '#10b981' : '#ef4444' }}>R$ {row.profit.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{row.marginPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparação Período a Período */}
          {calculatePeriodComparison() && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📈 Comparação Período a Período</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                  <p style={{ margin: 0, color: '#065f46', fontSize: '0.875rem', fontWeight: 600 }}>Receita</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                    {calculatePeriodComparison()!.incomeChange > 0 ? '+' : ''}{calculatePeriodComparison()!.incomeChange}%
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}>
                  <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem', fontWeight: 600 }}>Despesa</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                    {calculatePeriodComparison()!.expenseChange > 0 ? '+' : ''}{calculatePeriodComparison()!.expenseChange}%
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                  <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>Lucro</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: calculatePeriodComparison()!.profitChange > 0 ? '#10b981' : '#ef4444' }}>
                    {calculatePeriodComparison()!.profitChange > 0 ? '+' : ''}{calculatePeriodComparison()!.profitChange}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Previsão de Fluxo */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>🔮 Previsão de Fluxo (3 Meses)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f0f4f8', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Mês</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Receita (Est.)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Despesa (Est.)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Lucro (Est.)</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateCashFlowForecast().map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fafbfc' : 'white' }}>
                      <td style={{ padding: '0.75rem' }}>{row.month}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>R$ {row.income.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>R$ {row.expense.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: row.profit >= 0 ? '#10b981' : '#ef4444' }}>R$ {row.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Análise por Categoria */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>💼 Análise por Categoria</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f0f4f8', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Categoria</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Receita</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Despesa</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateCategoryAnalysis().map((cat, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fafbfc' : 'white' }}>
                      <td style={{ padding: '0.75rem' }}>{cat.name}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>R$ {cat.income.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>R$ {cat.expense.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>R$ {cat.total.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>{cat.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Métricas Avançadas */}
          {(() => {
            const metrics = calculateAdvancedMetrics();
            return metrics ? (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>📊 Métricas Avançadas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: 0, color: '#1e40af', fontSize: '0.875rem', fontWeight: 600 }}>Margem de Lucro</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{metrics.profitMargin}%</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f5f3ff', borderRadius: '0.5rem', border: '1px solid #ddd6fe' }}>
                    <p style={{ margin: 0, color: '#6d28d9', fontSize: '0.875rem', fontWeight: 600 }}>Taxa de Despesa</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{metrics.expenseRatio}%</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                    <p style={{ margin: 0, color: '#065f46', fontSize: '0.875rem', fontWeight: 600 }}>Rec. Média Mensal</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>R$ {metrics.avgMonthlyIncome}</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d' }}>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem', fontWeight: 600 }}>Desp. Média Mensal</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>R$ {metrics.avgMonthlyExpense}</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#fecaca', borderRadius: '0.5rem', border: '1px solid #fca5a5' }}>
                    <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.875rem', fontWeight: 600 }}>Lucro Médio Mensal</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>R$ {metrics.avgMonthlyProfit}</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '0.5rem', border: '1px solid #86efac' }}>
                    <p style={{ margin: 0, color: '#065f46', fontSize: '0.875rem', fontWeight: 600 }}>Runway (meses)</p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{metrics.runway}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

        </div>
      )}
    </div>
  );
}
