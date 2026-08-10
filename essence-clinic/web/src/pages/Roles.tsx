import { useState } from 'react';
import { Shield, Plus, Trash2, Edit2 } from 'lucide-react';
import '../styles/roles.css';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  members: number;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'clients' | 'appointments' | 'financial' | 'settings';
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrador',
      description: 'Acesso total ao sistema',
      color: 'from-cyan-400 to-blue-600',
      members: 2,
      permissions: ['all'],
    },
    {
      id: '2',
      name: 'Profissional',
      description: 'Acesso a agendamentos e fichas',
      color: 'from-cyan-400 to-blue-600',
      members: 8,
      permissions: ['view_appointments', 'create_records', 'view_clients'],
    },
    {
      id: '3',
      name: 'Recepcionista',
      description: 'Gerencia agendamentos',
      color: 'from-cyan-400 to-blue-600',
      members: 3,
      permissions: ['view_appointments', 'edit_appointments', 'view_clients'],
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showNewRole, setShowNewRole] = useState(false);

  const allPermissions: Permission[] = [
    { id: 'view_dashboard', name: 'Ver Dashboard', description: 'Visualizar dashboard', category: 'dashboard' },
    { id: 'view_appointments', name: 'Ver Agendamentos', description: 'Visualizar agendamentos', category: 'appointments' },
    { id: 'create_appointments', name: 'Criar Agendamentos', description: 'Criar novos agendamentos', category: 'appointments' },
    { id: 'edit_appointments', name: 'Editar Agendamentos', description: 'Editar agendamentos existentes', category: 'appointments' },
    { id: 'delete_appointments', name: 'Deletar Agendamentos', description: 'Deletar agendamentos', category: 'appointments' },
    { id: 'view_clients', name: 'Ver Clientes', description: 'Visualizar clientes', category: 'clients' },
    { id: 'create_clients', name: 'Criar Clientes', description: 'Criar novos clientes', category: 'clients' },
    { id: 'create_records', name: 'Criar Fichas', description: 'Criar fichas clínicas', category: 'clients' },
    { id: 'view_financial', name: 'Ver Financeiro', description: 'Visualizar dados financeiros', category: 'financial' },
    { id: 'manage_users', name: 'Gerenciar Usuários', description: 'Criar e editar usuários', category: 'settings' },
    { id: 'manage_roles', name: 'Gerenciar Roles', description: 'Criar e editar roles', category: 'settings' },
  ];

  const handleDeleteRole = (id: string) => {
    if (window.confirm('Tem certeza?')) {
      setRoles(roles.filter(r => r.id !== id));
      setSelectedRole(null);
    }
  };

  return (
    <div className="roles-container">
      <div className="roles-header">
        <div>
          <h1>🔐 Roles & Permissões</h1>
          <p>Gerencie acessos e permissões de usuários</p>
        </div>
        <button onClick={() => setShowNewRole(true)} className="btn-new-role">
          <Plus size={18} /> Novo Role
        </button>
      </div>

      <div className="roles-content">
        <div className="roles-list">
          <h2>Roles Disponíveis</h2>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`role-card ${selectedRole?.id === role.id ? 'active' : ''}`}
            >
              <div className={`role-badge bg-gradient-to-br ${role.color}`}>
                <Shield size={20} />
              </div>
              <div className="role-info">
                <h3>{role.name}</h3>
                <p>{role.description}</p>
                <small>{role.members} membros</small>
              </div>
            </button>
          ))}
        </div>

        <div className="roles-detail">
          {selectedRole ? (
            <>
              <div className="detail-header">
                <h2>{selectedRole.name}</h2>
                <div className="actions">
                  <button className="btn-edit">✏️ Editar</button>
                  <button onClick={() => handleDeleteRole(selectedRole.id)} className="btn-delete">
                    🗑️ Deletar
                  </button>
                </div>
              </div>

              <div className="permissions-section">
                <h3>Permissões</h3>
                <div className="permission-categories">
                  {Array.from(new Set(allPermissions.map(p => p.category))).map(category => (
                    <div key={category} className="permission-group">
                      <h4>{category.toUpperCase()}</h4>
                      <div className="permission-list">
                        {allPermissions
                          .filter(p => p.category === category)
                          .map(permission => (
                            <label key={permission.id} className="permission-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedRole.permissions.includes(permission.id) || selectedRole.permissions.includes('all')}
                                readOnly
                              />
                              <span className="permission-name">{permission.name}</span>
                              <span className="permission-desc">{permission.description}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="members-section">
                <h3>Membros ({selectedRole.members})</h3>
                <div className="members-placeholder">
                  Lista de membros com este role
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Shield size={48} />
              <p>Selecione um role para ver detalhes</p>
            </div>
          )}
        </div>
      </div>

      {showNewRole && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Novo Role</h2>
            <p>Funcionalidade em desenvolvimento...</p>
            <button onClick={() => setShowNewRole(false)} className="btn-close-modal">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
