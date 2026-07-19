/**
 * GRH NAVIGATION MANAGER
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerenciador de navegação entre panes de Gestão de RH
 * - Routing entre abas
 * - Carregamento dinâmico de panes
 * - Cleanup de listeners ao sair
 */

import { grhState } from './state.js';

class GRHNavigation {
  constructor() {
    this.currentPane = null;
    this.panes = new Map();
    this.container = null;
  }

  /**
   * Inicializar navegação
   */
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} não encontrado`);
    }

    console.log('[GRH-NAV] Inicializado');
  }

  /**
   * Registrar uma pane
   */
  registerPane(name, paneModule) {
    this.panes.set(name, paneModule);
    console.log(`[GRH-NAV] Pane registrada: ${name}`);
  }

  /**
   * Navegar para uma pane
   */
  async navigateTo(paneName) {
    // Validar pane
    if (!this.panes.has(paneName)) {
      console.error(`[GRH-NAV] Pane desconhecida: ${paneName}`);
      return false;
    }

    // Cleanup pane anterior
    if (this.currentPane) {
      try {
        await this.currentPane.cleanup?.();
        console.log(`[GRH-NAV] Limpeza de: ${this.currentPane.name}`);
      } catch (e) {
        console.error(`[GRH-NAV] Erro ao limpar pane anterior:`, e);
      }
    }

    // Carregar nova pane
    try {
      const pane = this.panes.get(paneName);

      // Limpar container
      this.container.innerHTML = '';

      // Inicializar pane
      await pane.init?.();

      // Renderizar pane
      await pane.render?.();

      this.currentPane = pane;
      grhState.setState('activePane', paneName);

      console.log(`[GRH-NAV] ✓ Navegado para: ${paneName}`);
      return true;
    } catch (e) {
      console.error(`[GRH-NAV] Erro ao navegar para ${paneName}:`, e);
      return false;
    }
  }

  /**
   * Obter pane ativa
   */
  getActivePane() {
    return this.currentPane;
  }

  /**
   * Listar panes disponíveis
   */
  getAvailablePanes() {
    return Array.from(this.panes.keys());
  }

  /**
   * Limpeza geral
   */
  async cleanup() {
    if (this.currentPane) {
      await this.currentPane.cleanup?.();
    }
    this.panes.clear();
    this.container.innerHTML = '';
    console.log('[GRH-NAV] Limpeza completa');
  }
}

// Instância global única
export const grhNavigation = new GRHNavigation();
