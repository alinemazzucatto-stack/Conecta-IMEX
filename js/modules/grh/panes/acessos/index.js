/**
 * PANE: ACESSOS (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia papéis e permissões
 * - Atribuição de papéis (RH, Gestor, Colaborador, Admin)
 * - Permissões por módulo
 * - Auditoria de acesso
 */

import { grhState } from '../../core/state.js';

class AcessosPane {
  constructor() {
    this.name = 'acessos';
    this.container = null;
    this.listeners = [];
    this.usuarios = [];
  }

  async init() {
    console.log('[GRH-ACESSOS] Inicializando pane acessos...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.grhGetColabs === 'function') {
        const data = await window.grhGetColabs(true);
        this.usuarios = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn('[GRH-ACESSOS] Erro ao carregar usuários:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="acessos-pane" class="pane-acessos">
        <div style="padding:20px">
          <h2>🔐 Controle de Acessos</h2>

          <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin-bottom:20px">
            <p style="margin:0;font-size:13px;color:#991b1b">
              ⚠️ <strong>Segurança crítica:</strong> Alterações aqui afetam imediatamente os acessos dos usuários.
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;margin-bottom:8px">👥</div>
              <div style="font-weight:600;color:#166534">${this.usuarios.length}</div>
              <div style="font-size:12px;color:#4b5563">Usuários Ativos</div>
            </div>

            <div style="background:#f0f9ff;border:1px solid #a5f3fc;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;margin-bottom:8px">🔑</div>
              <div style="font-weight:600;color:#0369a1">4</div>
              <div style="font-size:12px;color:#4b5563">Papéis Disponíveis</div>
            </div>

            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;margin-bottom:8px">📋</div>
              <div style="font-weight:600;color:#92400e">9</div>
              <div style="font-size:12px;color:#4b5563">Módulos</div>
            </div>
          </div>

          <div id="acessos-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    await this.renderLista();
    console.log('[GRH-ACESSOS] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('acessos-lista');
    if (!lista) return;

    if (!this.usuarios.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">📭 Nenhum usuário</div>';
      return;
    }

    const papeisPadroes = ['Colaborador', 'Gestor', 'RH', 'Admin'];

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f0f9ff;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Usuário</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">E-mail</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Papel</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${this.usuarios.slice(0, 10).map((u, idx) => `
              <tr style="border-bottom:1px solid #e2e8f0" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(u.nome || '?')}</td>
                <td style="padding:12px;color:#0b7fb6;font-size:12px">${this.esc(u.email || '—')}</td>
                <td style="padding:12px">
                  <select id="papel-${idx}" style="padding:4px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px">
                    ${papeisPadroes.map(p => `<option value="${p}" ${u.roleAcesso === p ? 'selected' : ''}>${p}</option>`).join('')}
                  </select>
                </td>
                <td style="padding:12px;text-align:center">
                  <button type="button" id="btn-perm-${idx}" class="btn-acao"
                    style="background:none;border:none;color:#0b7fb6;cursor:pointer;font-weight:600;text-decoration:underline;font-size:12px">
                    ⚙️ Permissões
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    lista.innerHTML = html;

    // Listeners
    this.usuarios.slice(0, 10).forEach((u, idx) => {
      const btn = document.getElementById('btn-perm-' + idx);
      if (btn) {
        const listener = () => this.mostrarPermissoes(u);
        btn.addEventListener('click', listener);
        this.listeners.push({ element: btn, event: 'click', handler: listener });
      }
    });
  }

  mostrarPermissoes(usuario) {
    console.log('[GRH-ACESSOS] Mostrar permissões para:', usuario.nome);
    alert('Permissões detalhadas para: ' + usuario.nome + '\n\n[TODO: Modal de permissões por módulo]');
  }

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async cleanup() {
    console.log('[GRH-ACESSOS] Limpando...');
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
    if (this.container) this.container.innerHTML = '';
  }
}

export const acessosPane = new AcessosPane();
