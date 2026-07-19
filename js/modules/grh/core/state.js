/**
 * GRH STATE MANAGER
 * ═════════════════════════════════════════════════════════════════
 *
 * Gerenciador de estado centralizado para Gestão de RH
 * - Estado global do módulo
 * - Pub/sub para reatividade
 * - Persistência em localStorage
 */

class GRHState {
  constructor() {
    this.subscribers = new Map();
    this.state = {
      activePane: 'colaboradores',
      userPermissions: [],
      cachedData: {},
      lastUpdate: null,
    };

    this.loadState();
  }

  /**
   * Inscrever em mudanças de estado
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);

    // Retornar função para desinscrever
    return () => {
      const callbacks = this.subscribers.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  /**
   * Atualizar estado e notificar subscribers
   */
  setState(key, value) {
    const oldValue = this.state[key];

    // Não atualizar se for igual
    if (JSON.stringify(oldValue) === JSON.stringify(value)) {
      return;
    }

    this.state[key] = value;
    this.saveState();

    // Notificar subscribers
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => {
        callback(value, oldValue);
      });
    }

    console.log(`[GRH-STATE] ${key}:`, value);
  }

  /**
   * Obter estado
   */
  getState(key) {
    return key ? this.state[key] : this.state;
  }

  /**
   * Salvar estado em localStorage
   */
  saveState() {
    try {
      localStorage.setItem('grh-state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('[GRH-STATE] Falha ao salvar estado:', e);
    }
  }

  /**
   * Restaurar estado de localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem('grh-state');
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[GRH-STATE] Falha ao restaurar estado:', e);
    }
  }

  /**
   * Limpar estado (logout, etc)
   */
  clear() {
    this.state = {
      activePane: 'colaboradores',
      userPermissions: [],
      cachedData: {},
      lastUpdate: null,
    };
    localStorage.removeItem('grh-state');
    console.log('[GRH-STATE] Estado limpo');
  }
}

// Instância global única
export const grhState = new GRHState();
