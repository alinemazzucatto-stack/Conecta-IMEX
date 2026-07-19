/**
 * PANE: FÉRIAS (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia planejamento de férias
 * - Saldo de férias por colaborador
 * - Solicitação e aprovação
 * - Cálculo de provisões
 * - Alertas de vencimento (12 meses)
 */

import { grhState } from '../../core/state.js';

class FeriasPane {
  constructor() {
    this.name = 'ferias';
    this.container = null;
    this.listeners = [];
    this.solicitacoes = [];
  }

  async init() {
    console.log('[GRH-FERIAS] Inicializando pane férias...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.db !== 'undefined' && window.db) {
        const snap = await window.db.collection('grh_ferias').get();
        this.solicitacoes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[GRH-FERIAS] Erro ao carregar férias:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="ferias-pane" class="pane-ferias">
        <div style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="margin:0">🏖️ Planejamento de Férias</h2>
            <button type="button" id="btn-nova-feriasolicitacao" class="btn btn-p"
              style="background:#0b1f5b;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
              ➕ Solicitar Férias
            </button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px">
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">📋</div>
              <div style="font-weight:600;color:#166534;font-size:14px">${this.solicitacoes.filter(s => s.status === 'Aguardando').length}</div>
              <div style="font-size:11px;color:#4b5563">Aguardando Aprovação</div>
            </div>

            <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">✅</div>
              <div style="font-weight:600;color:#0369a1;font-size:14px">${this.solicitacoes.filter(s => s.status === 'Aprovada').length}</div>
              <div style="font-size:11px;color:#4b5563">Aprovadas</div>
            </div>

            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">⚠️</div>
              <div style="font-weight:600;color:#92400e;font-size:14px">${this.solicitacoes.filter(s => s.vencendo).length}</div>
              <div style="font-size:11px;color:#4b5563">A Vencer</div>
            </div>
          </div>

          <div id="ferias-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const btnNova = document.getElementById('btn-nova-feriasolicitacao');
    if (btnNova) {
      const listener = () => this.mostrarFormularioNovo();
      btnNova.addEventListener('click', listener);
      this.listeners.push({ element: btnNova, event: 'click', handler: listener });
    }

    await this.renderLista();
    console.log('[GRH-FERIAS] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('ferias-lista');
    if (!lista) return;

    if (!this.solicitacoes.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">📭 Nenhuma solicitação</div>';
      return;
    }

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f0f9ff;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Colaborador</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Período</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Dias</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.solicitacoes.map(s => {
              const statusColor = s.status === 'Aprovada' ? '#22c55e' : s.status === 'Reprovada' ? '#ef4444' : '#f59e0b';
              return `
              <tr style="border-bottom:1px solid #e2e8f0" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(s.nome || '?')}</td>
                <td style="padding:12px;font-size:12px">${s.inicio ? this.formatData(s.inicio) : '—'} a ${s.fim ? this.formatData(s.fim) : '—'}</td>
                <td style="padding:12px;text-align:center;font-weight:600">${s.dias || '—'}</td>
                <td style="padding:12px;text-align:center">
                  <span style="background:${statusColor}1a;color:${statusColor};padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600">
                    ${s.status || 'Aguardando'}
                  </span>
                </td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    `;

    lista.innerHTML = html;
  }

  mostrarFormularioNovo() {
    console.log('[GRH-FERIAS] Mostrar formulário nova solicitação');
    alert('[TODO: Modal de solicitação de férias com calendário]');
  }

  formatData(data) {
    if (!data) return '—';
    const d = new Date(data + 'T12:00:00');
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  }

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async cleanup() {
    console.log('[GRH-FERIAS] Limpando...');
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
    if (this.container) this.container.innerHTML = '';
  }
}

export const feriasPane = new FeriasPane();
