/**
 * PANE: DESLIGAMENTOS (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia desligamentos e rescisão
 * - Registrar desligamento
 * - Cálculo de rescisória
 * - Gerar documento
 * - Marcar inativo
 */

import { grhState } from '../../core/state.js';

class DesligamentosPane {
  constructor() {
    this.name = 'desligamentos';
    this.container = null;
    this.listeners = [];
    this.desligamentos = [];
  }

  async init() {
    console.log('[GRH-DESLIGAMENTOS] Inicializando pane desligamentos...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.db !== 'undefined' && window.db) {
        const snap = await window.db.collection('grh_desligamentos').get();
        this.desligamentos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[GRH-DESLIGAMENTOS] Erro ao carregar:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="desligamentos-pane" class="pane-desligamentos">
        <div style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="margin:0">🚪 Desligamentos</h2>
            <button type="button" id="btn-novo-deslig" class="btn btn-p"
              style="background:#dc2626;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
              ➕ Novo Desligamento
            </button>
          </div>

          <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin-bottom:20px">
            <p style="margin:0;font-size:13px;color:#991b1b">
              ⚠️ <strong>Atenção:</strong> Marcar como desligado marcará o colaborador como inativo automaticamente.
            </p>
          </div>

          <div id="desligamentos-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const btnNovo = document.getElementById('btn-novo-deslig');
    if (btnNovo) {
      const listener = () => this.mostrarFormularioNovo();
      btnNovo.addEventListener('click', listener);
      this.listeners.push({ element: btnNovo, event: 'click', handler: listener });
    }

    await this.renderLista();
    console.log('[GRH-DESLIGAMENTOS] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('desligamentos-lista');
    if (!lista) return;

    if (!this.desligamentos.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">📭 Nenhum desligamento registrado</div>';
      return;
    }

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#fef2f2;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#7f1d1d">Colaborador</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#7f1d1d">Tipo</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#7f1d1d">Data</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#7f1d1d">Documentos</th>
            </tr>
          </thead>
          <tbody>
            ${this.desligamentos.map(d => `
              <tr style="border-bottom:1px solid #e2e8f0" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(d.nome || '?')}</td>
                <td style="padding:12px">${this.esc(d.tipo || 'Demissão')}</td>
                <td style="padding:12px">${d.data ? this.formatData(d.data) : '—'}</td>
                <td style="padding:12px;text-align:center">
                  <button type="button" class="btn-acao"
                    style="background:none;border:none;color:#dc2626;cursor:pointer;font-weight:600;text-decoration:underline;font-size:12px">
                    📋 Rescisória
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    lista.innerHTML = html;
  }

  mostrarFormularioNovo() {
    console.log('[GRH-DESLIGAMENTOS] Mostrar formulário novo desligamento');
    alert('[TODO: Modal de desligamento com cálculo de rescisória]');
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
    console.log('[GRH-DESLIGAMENTOS] Limpando...');
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
    if (this.container) this.container.innerHTML = '';
  }
}

export const desligamentosPane = new DesligamentosPane();
