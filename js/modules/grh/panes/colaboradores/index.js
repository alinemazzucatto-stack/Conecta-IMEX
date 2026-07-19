/**
 * PANE: COLABORADORES (FASE 2)
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerencia base de colaboradores
 * - Carregamento de dados centrais
 * - Lista com busca e filtros
 * - Edição inline
 * - Integração com Firebase
 */

import { grhState } from '../../core/state.js';

class ColaboradoresPane {
  constructor() {
    this.name = 'colaboradores';
    this.container = null;
    this.listeners = [];
    this.colaboradores = [];
    this.filtro = '';
  }

  async init() {
    console.log('[GRH-COLABORADORES] Inicializando pane colaboradores...');
    await this.carregarDados();
  }

  async carregarDados() {
    try {
      if (typeof window.grhGetColabs === 'function') {
        const data = await window.grhGetColabs(true);
        if (Array.isArray(data)) {
          this.colaboradores = data;
          console.log('[GRH-COLABORADORES] Carregados ' + this.colaboradores.length + ' colaboradores');
          return;
        }
      }
    } catch (e) {
      console.warn('[GRH-COLABORADORES] Erro ao carregar via grhGetColabs:', e);
    }

    // Fallback: tentar extrair da tabela HTML
    try {
      const rows = Array.from(document.querySelectorAll('#grh-colab-body tr'));
      if (rows.length) {
        this.colaboradores = rows.map((tr, idx) => {
          const cells = Array.from(tr.children);
          return {
            id: idx,
            nome: cells[0]?.innerText.trim() || '',
            matricula: cells[1]?.innerText.trim() || '',
            email: cells[2]?.innerText.trim() || '',
            cpf: cells[3]?.innerText.trim() || '',
            funcao: cells[4]?.innerText.trim() || '',
            setor: cells[5]?.innerText.trim() || '',
            tipo: cells[6]?.innerText.trim() || 'CLT',
            admissao: cells[7]?.innerText.trim() || '',
            status: cells[9]?.innerText.trim() || 'Ativo'
          };
        }).filter(c => c.nome && !/carregando|nenhum/i.test(c.nome));

        console.log('[GRH-COLABORADORES] Carregados ' + this.colaboradores.length + ' colaboradores da tabela');
      }
    } catch (e) {
      console.warn('[GRH-COLABORADORES] Erro ao extrair dados da tabela:', e);
    }
  }

  async render() {
    this.container = document.getElementById('view-gestao-rh');
    if (!this.container) return;

    const html = `
      <div id="colaboradores-pane" class="pane-colaboradores">
        <div style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <div>
              <h2 style="margin:0 0 4px">👥 Colaboradores</h2>
              <p style="margin:0;color:#64748b;font-size:13px">${this.colaboradores.length} colaboradores no sistema</p>
            </div>
            <button type="button" id="btn-novo-colab" class="btn btn-p"
              style="background:#0b1f5b;color:#fff;padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600">
              ➕ Novo Colaborador
            </button>
          </div>

          <div style="display:flex;gap:10px;margin-bottom:16px">
            <input type="search" id="filtro-colabs" placeholder="Buscar por nome, matrícula, e-mail, CPF ou cargo..."
              class="input-search"
              style="flex:1;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px"/>
          </div>

          <div id="colaboradores-lista" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
            <!-- Lista será renderizada aqui -->
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Anexar listeners
    const btnNovo = document.getElementById('btn-novo-colab');
    const filtroInput = document.getElementById('filtro-colabs');

    if (btnNovo) {
      const listener = () => this.mostrarFormularioNovo();
      btnNovo.addEventListener('click', listener);
      this.listeners.push({ element: btnNovo, event: 'click', handler: listener });
    }

    if (filtroInput) {
      const listener = (e) => {
        this.filtro = e.target.value.toLowerCase();
        this.renderLista();
      };
      filtroInput.addEventListener('input', listener);
      this.listeners.push({ element: filtroInput, event: 'input', handler: listener });
    }

    await this.renderLista();
    console.log('[GRH-COLABORADORES] ✓ Pane renderizada');
  }

  async renderLista() {
    const lista = document.getElementById('colaboradores-lista');
    if (!lista) return;

    let filtered = this.colaboradores;
    if (this.filtro) {
      filtered = this.colaboradores.filter(c =>
        c.nome.toLowerCase().includes(this.filtro) ||
        c.matricula.toLowerCase().includes(this.filtro) ||
        c.email.toLowerCase().includes(this.filtro) ||
        c.cpf.toLowerCase().includes(this.filtro) ||
        c.funcao.toLowerCase().includes(this.filtro)
      );
    }

    if (!filtered.length) {
      lista.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8">' +
        (this.filtro ? '❌ Nenhum colaborador encontrado' : '📭 Nenhum colaborador cadastrado') + '</div>';
      return;
    }

    const html = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f0f9ff;border-bottom:1px solid #e2e8f0">
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Nome</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Matrícula</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Cargo</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">Setor</th>
              <th style="padding:12px;text-align:left;font-weight:600;color:#0c4a6e">E-mail</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Status</th>
              <th style="padding:12px;text-align:center;font-weight:600;color:#0c4a6e">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((c, idx) => `
              <tr style="border-bottom:1px solid #e2e8f0;transition:background .2s" class="colab-row-${idx}"
                onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">
                <td style="padding:12px">${this.esc(c.nome)}</td>
                <td style="padding:12px">${this.esc(c.matricula)}</td>
                <td style="padding:12px">${this.esc(c.funcao)}</td>
                <td style="padding:12px">${this.esc(c.setor)}</td>
                <td style="padding:12px;color:#0b7fb6;font-size:12px">${this.esc(c.email)}</td>
                <td style="padding:12px;text-align:center">
                  <span style="background:${c.status === 'Ativo' ? '#dcfce7' : '#fee2e2'};color:${c.status === 'Ativo' ? '#15803d' : '#b91c1c'};padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600">
                    ${c.status || 'Ativo'}
                  </span>
                </td>
                <td style="padding:12px;text-align:center">
                  <button type="button" class="btn-acao" onclick="event.stopPropagation()" id="btn-edit-${idx}"
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

    // Anexar listeners aos botões de edição
    filtered.forEach((c, idx) => {
      const btnEdit = document.getElementById('btn-edit-' + idx);
      if (btnEdit) {
        const listener = () => this.mostrarFormularioEdicao(c);
        btnEdit.addEventListener('click', listener);
        this.listeners.push({ element: btnEdit, event: 'click', handler: listener });
      }
    });
  }

  mostrarFormularioNovo() {
    console.log('[GRH-COLABORADORES] Mostrar formulário novo colaborador');
    // TODO: Implementar modal de novo colaborador
  }

  mostrarFormularioEdicao(colab) {
    console.log('[GRH-COLABORADORES] Mostrar edição de:', colab.nome);
    // TODO: Implementar modal de edição
  }

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  async cleanup() {
    console.log('[GRH-COLABORADORES] Limpando pane colaboradores...');

    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];

    if (this.container) this.container.innerHTML = '';

    console.log('[GRH-COLABORADORES] ✓ Limpeza concluída');
  }
}

export const colaboradoresPane = new ColaboradoresPane();
