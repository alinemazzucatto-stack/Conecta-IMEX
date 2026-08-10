import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import StatCard from '@/components/StatCard';
import RevenueChart from '@/components/RevenueChart';
import {
  Users,
  Calendar,
  Stethoscope,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  Plus,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const quickActions = [
    { label: '+ Novo agendamento', icon: Calendar, href: '/calendar', primary: true },
    { label: '+ Novo cliente', icon: Users, href: '/clients', primary: false },
    { label: '+ Nova ficha', icon: FileText, href: '/medical-records', primary: false },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Agenda',
      description: 'Gerencie agendamentos da clínica',
      color: 'blue',
      href: '/calendar',
    },
    {
      icon: Users,
      title: 'Clientes',
      description: 'Cadastre e gerencie pacientes',
      color: 'green',
      href: '/clients',
    },
    {
      icon: Stethoscope,
      title: 'Profissionais',
      description: 'Gerencie profissionais e especialidades',
      color: 'pink',
      href: '/professionals',
    },
    {
      icon: DollarSign,
      title: 'Financeiro',
      description: 'Controle receitas e relatórios',
      color: 'orange',
      href: '/financial',
    },
  ];

  const bookingFeatures = [
    {
      icon: Calendar,
      title: 'Agendamento Online',
      description: 'Configure link público e horários',
      color: 'indigo',
      href: '/booking-admin',
    },
  ];

  const recordsFeatures = [
    {
      icon: FileText,
      title: 'Fichas Clínicas',
      description: 'Crie e gerencie fichas médicas',
      color: 'blue',
      href: '/medical-records',
    },
  ];

  return (
    <div className="p-8 dashboard-container">
      {/* Welcome Section */}
      <div className="mb-10 pb-6 border-b border-purple-100 dashboard-header">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Bem-vindo, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Aqui está o resumo da sua clínica Essence Clinic
            </p>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <p className="font-medium">Hoje</p>
            <p>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10 flex flex-wrap gap-3">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.href)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all
                ${action.primary
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-white text-blue-600 border-2 border-blue-500 hover:bg-blue-50'
                }
              `}
            >
              <Icon size={18} />
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Quick Stats Grid - Linha 1: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
        <StatCard
          icon={<Users size={24} />}
          label="Clientes Ativos"
          value="1.243"
          trend={12}
          color="purple"
        />
        <StatCard
          icon={<Calendar size={24} />}
          label="Agendamentos Hoje"
          value="12"
          trend={5}
          color="blue"
        />
        <StatCard
          icon={<Stethoscope size={24} />}
          label="Profissionais"
          value="8"
          trend={2}
          color="pink"
        />
      </div>

      {/* Additional Stats - Linha 2: 1 + 2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <StatCard
          icon={<DollarSign size={24} />}
          label="Receita do Mês"
          value="R$ 45.3k"
          trend={18}
          color="green"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="Pendentes de Confirmação"
          value="5"
          trend={-2}
          color="orange"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Crescimento de Clientes"
          value="+3.2%"
          trend={8}
          color="indigo"
        />
      </div>

      {/* Agendamentos Este Mês - Linha 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <StatCard
          icon={<Calendar size={24} />}
          label="Agendamentos Este Mês"
          value="287"
          trend={15}
          color="green"
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <RevenueChart />
      </div>

      {/* Booking Feature */}
      <div className="mb-12">
        <h2 className="section-header">
          Agendamento Online
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookingFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            const colorMap: Record<string, string> = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              pink: 'from-pink-500 to-pink-600',
              orange: 'from-orange-500 to-orange-600',
              indigo: 'from-indigo-500 to-indigo-600',
            };

            return (
              <button
                key={idx}
                onClick={() => navigate(feature.href)}
                className="feature-card"
              >
                <div className={`feature-icon bg-gradient-to-br ${colorMap[feature.color]}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
                <a className="feature-link">
                  Acessar →
                </a>
              </button>
            );
          })}
        </div>
      </div>

      {/* Medical Records Feature */}
      <div className="mb-12">
        <h2 className="section-header">
          Fichas Clínicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recordsFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            const colorMap: Record<string, string> = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              pink: 'from-pink-500 to-pink-600',
              orange: 'from-orange-500 to-orange-600',
              indigo: 'from-indigo-500 to-indigo-600',
            };

            return (
              <button
                key={idx}
                onClick={() => navigate(feature.href)}
                className="feature-card"
              >
                <div className={`feature-icon bg-gradient-to-br ${colorMap[feature.color]}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
                <a className="feature-link">
                  Acessar →
                </a>
              </button>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="section-header">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const colorMap: Record<string, string> = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              pink: 'from-pink-500 to-pink-600',
              orange: 'from-orange-500 to-orange-600',
            };

            return (
              <button
                key={idx}
                onClick={() => navigate(feature.href)}
                className="feature-card"
              >
                <div className={`feature-icon bg-gradient-to-br ${colorMap[feature.color]}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-title">
                  {feature.title}
                </h3>
                <p className="feature-description">
                  {feature.description}
                </p>
                <a className="feature-link">
                  Acessar →
                </a>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
