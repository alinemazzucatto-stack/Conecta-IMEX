/**
 * GESTÃO DE RH - MÓDULO PRINCIPAL
 * ═════════════════════════════════════════════════════════════════
 *
 * Orquestrador central para Gestão de RH
 * - Carrega todas as panes
 * - Inicializa navegação
 * - Gerencia ciclo de vida do módulo
 */

import { grhState } from './core/state.js';
import { grhNavigation } from './core/navigation.js';

// Importar panes (será criado em fases posteriores)
// import { colaboradores } from './panes/colaboradores/index.js';
// import { remuneracao } from './panes/remuneracao/index.js';
// ... etc

class GestaoRHModule {
  constructor() {
    this.initialized = false;
  }

  /**
   * Inicializar módulo de Gestão de RH
   */
  async init() {
    try {
      console.log('[GRH] Inicializando módulo...');

      // Inicializar navegação
      grhNavigation.init('view-gestao-rh');

      // Registrar panes (será feito quando forem criadas)
      // grhNavigation.registerPane('colaboradores', colaboradores);
      // grhNavigation.registerPane('remuneracao', remuneracao);
      // ... etc

      // Obter pane ativa do estado
      const activePane = grhState.getState('activePane') || 'colaboradores';

      // Navegar para pane inicial
      await grhNavigation.navigateTo(activePane);

      // Subscrever mudanças de state
      grhState.subscribe('activePane', (newPane) => {
        grhNavigation.navigateTo(newPane);
      });

      this.initialized = true;
      console.log('[GRH] ✓ Módulo inicializado com sucesso');

      return true;
    } catch (error) {
      console.error('[GRH] Erro ao inicializar:', error);
      return false;
    }
  }

  /**
   * Navegar para uma pane específica
   */
  async goToPane(paneName) {
    if (!this.initialized) {
      console.error('[GRH] Módulo não inicializado');
      return false;
    }

    return grhNavigation.navigateTo(paneName);
  }

  /**
   * Obter estado do módulo
   */
  getState(key) {
    return grhState.getState(key);
  }

  /**
   * Atualizar estado do módulo
   */
  setState(key, value) {
    grhState.setState(key, value);
  }

  /**
   * Limpar módulo (logout, etc)
   */
  async cleanup() {
    console.log('[GRH] Limpando módulo...');
    await grhNavigation.cleanup();
    grhState.clear();
    this.initialized = false;
  }
}

// Instância global única
export const gestaoRHModule = new GestaoRHModule();

// Expor globalmente para compatibilidade
if (typeof window !== 'undefined') {
  window.gestaoRHModule = gestaoRHModule;
}
