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
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Agenda',
      icon: Calendar,
      path: '/calendar',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Clientes',
      icon: Users,
      path: '/clients',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Profissionais',
      icon: Stethoscope,
      path: '/professionals',
      color: 'from-pink-500 to-pink-600',
    },
    {
      label: 'Financeiro',
      icon: DollarSign,
      path: '/financial',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Agendamento Online',
      icon: Link2,
      path: '/booking-admin',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">💎</div>
        <h1 className="logo-text">Essence Clinic</h1>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
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
