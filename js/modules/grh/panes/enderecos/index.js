/**
 * PANE: ENDEREÇOS (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia dados de endereço
 * - Endereço residencial, comercial, correspondência
 * - Validação de CEP (ViaCEP)
 * - Histórico de endereços
 * - Dados para documentos fiscais
 */

import { grhState } from '../../core/state.js';

class EnderecosPane {
  constructor() {
    this.name = 'enderecos';
    this.container = null;
    this.listeners = [];
    this.enderecos = [];
  }

  async init() {
    console.log('[GRH-ENDERECOS] Inicializando pane endereços...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.db !== 'undefined' && window.db) {
        const snap = await window.db.collection('grh_enderecos').get();
        this.enderecos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('[GRH-ENDERECOS] Erro ao carregar endereços:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="enderecos-pane" class="pane-enderecos">
        <div style="padding:20px">
          <h2>📍 Gerenciamento de Endereços</h2>

          <div style="background:#f0f9ff;border:1px solid #0284c7;border-radius:12px;padding:16px;margin-bottom:20px">
            <p style="margin:0;font-size:13px;color:#0c4a6e">
              📝 Mantenha os endereços atualizados para gerar documentos fiscais e correspondências corretas.
            </p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px">
            <div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">🏠</div>
              <div style="font-weight:600;color:#0369a1;font-size:14px">${this.enderecos.filter(e => e.tipo === 'Residencial').length}</div>
              <div style="font-size:11px;color:#4b5563">Residenciais</div>
            </div>

            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">💼</div>
              <div style="font-weight:600;color:#166534;font-size:14px">${this.enderecos.filter(e => e.tipo === 'Comercial').length}</div>
              <div style="font-size:11px;color:#4b5563">Comerciais</div>
            </div>

            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:18px;margin-bottom:4px">📮</div>
              <div style="font-weight:600;color:#92400e;font-size:14px">${this.enderecos.filter(e => e.tipo === 'Correspondência').length}</div>
              <div style="font-size:11px;color:#4b5563">Correspondência</div>
            </div>
          </div>

          <div id="enderecos-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    await this.renderLista();
    console.log('[GRH-ENDERECOS] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('enderecos-lista');
    if (!lista) return;

    if (!this.enderecos.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">📭 Nenhum endereço cadastrado</div>';
      return;
    }

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f0f9ff;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Colaborador</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Tipo</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Endereço</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">CEP</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${this.enderecos.map((e, idx) => `
              <tr style="border-bottom:1px solid #e2e8f0" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(e.nome || '?')}</td>
                <td style="padding:12px">
                  <span style="background:#f0fdf4;color:#166534;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600">
                    ${e.tipo || 'Residencial'}
                  </span>
                </td>
                <td style="padding:12px;font-size:12px">${this.esc(e.rua || '—')}, ${e.numero || '—'}</td>
                <td style="padding:12px;font-weight:600">${e.cep || '—'}</td>
                <td style="padding:12px;text-align:center">
                  <button type="button" id="btn-edit-${idx}" class="btn-acao"
                    style="background:none;border:none;color:#0b7fb6;cursor:pointer;font-weight:600;text-decoration:underline;font-size:12px">
                    ✏️ Editar
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
    this.enderecos.forEach((e, idx) => {
      const btn = document.getElementById('btn-edit-' + idx);
      if (btn) {
        const listener = () => this.mostrarEdicao(e);
        btn.addEventListener('click', listener);
        this.listeners.push({ element: btn, event: 'click', handler: listener });
      }
    });
  }

  mostrarEdicao(endereco) {
    console.log('[GRH-ENDERECOS] Mostrar edição de endereço');
    alert('[TODO: Modal de edição com validação de CEP]');
  }

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async cleanup() {
    console.log('[GRH-ENDERECOS] Limpando...');
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
    if (this.container) this.container.innerHTML = '';
  }
}

export const enderecosPane = new EnderecosPane();
