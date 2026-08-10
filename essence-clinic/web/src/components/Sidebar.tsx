import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  DollarSign,
  Settings,
  LogOut,
  ChevronRight,
  Link2,
  FileText,
  Package,
  Zap,
  BarChart3,
} from 'lucide-react';
import '../styles/sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Agenda',
      icon: Calendar,
      path: '/calendar',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Clientes',
      icon: Users,
      path: '/clients',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Fichas Clínicas',
      icon: FileText,
      path: '/medical-records',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Profissionais',
      icon: Stethoscope,
      path: '/professionals',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Financeiro',
      icon: DollarSign,
      path: '/financial',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Comissões',
      icon: BarChart3,
      path: '/commissions',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Pacotes',
      icon: Package,
      path: '/packages',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Integrações',
      icon: Zap,
      path: '/integrations',
      color: 'from-cyan-400 to-blue-600',
    },
    {
      label: 'Agendamento Online',
      icon: Link2,
      path: '/booking-admin',
      color: 'from-cyan-400 to-blue-600',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">💎</div>
        <div>
          <h1 className="logo-text">Essence Clinic</h1>
          <p className="logo-subtitle">Healthcare Platform</p>
        </div>
      </div>

      {/* User Status */}
      <div className="sidebar-user">
        <div className="user-avatar">
          <span className="user-initial">A</span>
          <span className="user-status-dot"></span>
        </div>
        <div className="user-info">
          <p className="user-name">Test User</p>
          <p className="user-status">🟢 Online</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="nav-label">NAVEGAÇÃO</p>
          {menuItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-item ${active ? 'active' : ''}`}
                title={item.label}
              >
                <div className={`icon-wrapper bg-gradient-to-br ${item.color}`}>
                  <Icon size={20} />
                </div>
                <span className="label">{item.label}</span>
                {active && <ChevronRight size={16} className="chevron" />}
              </button>
            );
          })}
        </div>

        <div className="nav-section">
          <p className="nav-label">MÓDULOS</p>
          {menuItems.slice(3).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-item ${active ? 'active' : ''}`}
                title={item.label}
              >
                <div className={`icon-wrapper bg-gradient-to-br ${item.color}`}>
                  <Icon size={20} />
                </div>
                <span className="label">{item.label}</span>
                {active && <ChevronRight size={16} className="chevron" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="logout-btn"
          title="Sair"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
