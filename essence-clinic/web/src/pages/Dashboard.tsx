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
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Aqui está o resumo da sua clínica Essence Clinic
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        <StatCard
          icon={<DollarSign size={24} />}
          label="Receita do Mês"
          value="R$ 45.3k"
          trend={18}
          color="green"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
        <StatCard
          icon={<Calendar size={24} />}
          label="Agendamentos Este Mês"
          value="287"
          trend={15}
          color="green"
        />
      </div>

      {/* Revenue Chart */}
      <div className="mb-12">
        <RevenueChart />
      </div>

      {/* Booking Feature */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                className="bg-white rounded-12 p-6 border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all text-left group"
              >
                <div className={`bg-gradient-to-br ${colorMap[feature.color]} w-12 h-12 rounded-10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {feature.description}
                </p>
                <span className="text-purple-600 font-semibold text-sm group-hover:text-purple-700">
                  Acessar →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Medical Records Feature */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                className="bg-white rounded-12 p-6 border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all text-left group"
              >
                <div className={`bg-gradient-to-br ${colorMap[feature.color]} w-12 h-12 rounded-10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {feature.description}
                </p>
                <span className="text-purple-600 font-semibold text-sm group-hover:text-purple-700">
                  Acessar →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                className="bg-white rounded-12 p-6 border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all text-left group"
              >
                <div className={`bg-gradient-to-br ${colorMap[feature.color]} w-12 h-12 rounded-10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {feature.description}
                </p>
                <span className="text-purple-600 font-semibold text-sm group-hover:text-purple-700">
                  Acessar →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
