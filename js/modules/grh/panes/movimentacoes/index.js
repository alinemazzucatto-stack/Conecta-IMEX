/**
 * PANE: MOVIMENTAÇÕES (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia movimentações de carreira
 * - Promoção (novo cargo/salário)
 * - Transferência entre setores
 * - Histórico de carreira
 * - Impacto em folha
 */

import { grhState } from '../../core/state.js';

class MovimentacoesPane {
  constructor() {
    this.name = 'movimentacoes';
    this.container = null;
    this.listeners = [];
    this.movimentacoes = [];
  }

  async init() {
    console.log('[GRH-MOVIMENTACOES] Inicializando pane movimentações...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.db !== 'undefined' && window.db) {
        const snap = await window.db.collection('grh_movimentacoes').get();
        this.movimentacoes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[GRH-MOVIMENTACOES] Erro ao carregar movimentações:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="movimentacoes-pane" class="pane-movimentacoes">
        <div style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div>
              <h2 style="margin:0 0 4px">📈 Movimentações de Carreira</h2>
              <p style="margin:0;color:#64748b;font-size:13px">${this.movimentacoes.length} movimentações registradas</p>
            </div>
            <button type="button" id="btn-nova-mov" class="btn btn-p"
              style="background:#0b1f5b;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
              ➕ Nova Movimentação
            </button>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px">
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">📈</div>
              <div style="font-weight:600;color:#166534;font-size:14px">${this.movimentacoes.filter(m => m.tipo === 'promoção').length}</div>
              <div style="font-size:11px;color:#4b5563">Promoções</div>
            </div>

            <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">🔄</div>
              <div style="font-weight:600;color:#0369a1;font-size:14px">${this.movimentacoes.filter(m => m.tipo === 'transferência').length}</div>
              <div style="font-size:11px;color:#4b5563">Transferências</div>
            </div>
          </div>

          <div id="movimentacoes-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const btnNova = document.getElementById('btn-nova-mov');
    if (btnNova) {
      const listener = () => this.mostrarFormularioNovo();
      btnNova.addEventListener('click', listener);
      this.listeners.push({ element: btnNova, event: 'click', handler: listener });
    }

    await this.renderLista();
    console.log('[GRH-MOVIMENTACOES] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('movimentacoes-lista');
    if (!lista) return;

    if (!this.movimentacoes.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">📭 Nenhuma movimentação</div>';
      return;
    }

    const sorted = [...this.movimentacoes].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f0f9ff;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Colaborador</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Tipo</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">De / Para</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Data</th>
            </tr>
          </thead>
          <tbody>
            ${sorted.slice(0, 20).map(m => `
              <tr style="border-bottom:1px solid #e2e8f0" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(m.nome || '?')}</td>
                <td style="padding:12px">
                  <span style="background:${m.tipo === 'promoção' ? '#dcfce7' : '#dbeafe'};color:${m.tipo === 'promoção' ? '#166534' : '#0369a1'};padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600">
                    ${m.tipo === 'promoção' ? '📈' : '🔄'} ${m.tipo}
                  </span>
                </td>
                <td style="padding:12px;font-size:12px">${this.esc(m.cargoAntes || '—')} → ${this.esc(m.cargoNovo || '—')}</td>
                <td style="padding:12px">${m.data ? this.formatData(m.data) : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    lista.innerHTML = html;
  }

  mostrarFormularioNovo() {
    console.log('[GRH-MOVIMENTACOES] Mostrar formulário nova movimentação');
    alert('[TODO: Modal de nova movimentação]');
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
    console.log('[GRH-MOVIMENTACOES] Limpando...');
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
    if (this.container) this.container.innerHTML = '';
  }
}

export const movimentacoesPane = new MovimentacoesPane();
