/**
 * PANE: ADMISSÃO (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia onboarding de novos colaboradores
 * - Criar novo colaborador
 * - Checklist de documentação
 * - Data de admissão + contrato
 * - Integração com base de Colaboradores
 */

import { grhState } from '../../core/state.js';

class AdmissaoPane {
  constructor() {
    this.name = 'admissao';
    this.container = null;
    this.listeners = [];
    this.colaboradores = [];
  }

  async init() {
    console.log('[GRH-ADMISSAO] Inicializando pane admissão...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.grhGetColabs === 'function') {
        const data = await window.grhGetColabs(true);
        this.colaboradores = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn('[GRH-ADMISSAO] Erro ao carregar colaboradores:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="admissao-pane" class="pane-admissao">
        <div style="padding:20px">
          <h2>🎯 Admissão de Colaboradores</h2>

          <div style="display:flex;gap:20px;margin-bottom:24px">
            <div style="flex:1;background:#f0f9ff;border:1px solid #0284c7;border-radius:12px;padding:20px">
              <h3 style="margin:0 0 12px;font-size:14px;color:#0c4a6e">Novo Colaborador</h3>
              <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.5">
                Cadastre um novo colaborador e acompanhe a documentação necessária.
              </p>
              <button type="button" id="btn-novo-colab-admissao" class="btn btn-p"
                style="background:#0284c7;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
                ➕ Novo Colaborador
              </button>
            </div>

            <div style="flex:1;background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:20px">
              <h3 style="margin:0 0 12px;font-size:14px;color:#92400e">Recentes</h3>
              <p style="margin:0;font-size:13px;color:#b45309;font-weight:600">
                ${this.colaboradores.length} colaboradores no sistema
              </p>
            </div>
          </div>

          <div id="admissao-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const btnNovo = document.getElementById('btn-novo-colab-admissao');
    if (btnNovo) {
      const listener = () => this.mostrarFormularioNovo();
      btnNovo.addEventListener('click', listener);
      this.listeners.push({ element: btnNovo, event: 'click', handler: listener });
    }

    await this.renderLista();
    console.log('[GRH-ADMISSAO] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('admissao-lista');
    if (!lista) return;

    // Mostrar colaboradores recentemente adicionados (últimos 10 dias)
    const hoje = new Date();
    const dez = new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000);

    const recentes = this.colaboradores.filter(c => {
      if (!c.criadoEm) return false;
      const data = new Date(c.criadoEm);
      return data >= dez;
    }).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    if (!recentes.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">' +
        '📭 Nenhum novo colaborador nos últimos 10 dias</div>';
      return;
    }

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f0f9ff;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Nome</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Cargo</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Setor</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Data Admissão</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${recentes.map((c, idx) => `
              <tr style="border-bottom:1px solid #e2e8f0" class="colab-row-${idx}"
                onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(c.nome || '?')}</td>
                <td style="padding:12px">${this.esc(c.funcao || '—')}</td>
                <td style="padding:12px">${this.esc(c.setor || '—')}</td>
                <td style="padding:12px">${c.admissao ? this.formatData(c.admissao) : '—'}</td>
                <td style="padding:12px;text-align:center">
                  <button type="button" class="btn-acao" id="btn-doc-${idx}"
                    style="background:none;border:none;color:#0b7fb6;cursor:pointer;font-weight:600;text-decoration:underline;font-size:12px">
                    📋 Checklist
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    lista.innerHTML = html;

    // Listeners para checklist
    recentes.forEach((c, idx) => {
      const btn = document.getElementById('btn-doc-' + idx);
      if (btn) {
        const listener = () => this.mostrarChecklist(c);
        btn.addEventListener('click', listener);
        this.listeners.push({ element: btn, event: 'click', handler: listener });
      }
    });
  }

  mostrarFormularioNovo() {
    console.log('[GRH-ADMISSAO] Mostrar formulário novo colaborador');
    // Delegado para colaboradoresPane que tem edição
    if (typeof window.grhAbrirModalColab === 'function') {
      window.grhAbrirModalColab();
    }
  }

  mostrarChecklist(colab) {
    console.log('[GRH-ADMISSAO] Mostrar checklist para:', colab.nome);
    // TODO: Implementar modal de checklist de documentação
    alert('Checklist de documentação para: ' + colab.nome + '\n\n[TODO: Implementar modal completo]');
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
    console.log('[GRH-ADMISSAO] Limpando pane admissão...');

    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];

    if (this.container) this.container.innerHTML = '';

    console.log('[GRH-ADMISSAO] ✓ Limpeza concluída');
  }
}

export const admissaoPane = new AdmissaoPane();
