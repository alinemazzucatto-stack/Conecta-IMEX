# 🏗️ ARQUITETURA NOVA - MÓDULO GRH

## Status: FASE 1 ✅ | FASE 2 🔄

---

## Estrutura de Diretórios

```
js/modules/grh/
├── core/
│   ├── state.js          ✅ Gerenciador de estado centralizado
│   ├── navigation.js     ✅ Roteamento entre panes
│   └── api.js            🔄 Abstração Firebase (PRÓXIMO)
│
├── panes/
│   ├── colaboradores/    🔄 Lista, busca, detalhes
│   ├── remuneracao/      🔄 Holerites, KPI, PDF upload
│   ├── movimentacoes/    🔄 Promoções, transferências
│   ├── desligamentos/    🔄 Demissões, rescisões
│   ├── enderecos/        🔄 Gestão de endereços
│   ├── ferias/           🔄 Planejamento de férias
│   ├── admissao/         🔄 Onboarding, documentação
│   ├── beneficios/       🔄 ⭐ CRÍTICO: Upload PDF
│   └── acessos/          🔄 Permissões, papéis
│
├── components/           🔄 Componentes compartilhados
│   ├── tabs.js
│   ├── table.js
│   ├── form.js
│   ├── modal.js
│   └── buttons.js
│
├── utils/                🔄 Utilidades
│   ├── validators.js
│   ├── formatters.js
│   └── converters.js
│
└── index.js             ✅ Orquestrador central

```

---

## FASE 1: Estrutura Base ✅

### Concluído:
- ✅ **state.js** - Pub/sub centralizado
- ✅ **navigation.js** - Roteamento limpo
- ✅ **index.js** - Orquestrador

### Benefícios:
- Elimina 22 redefinições diferentes de `grhTab()`
- Estado único em lugar de esparramado
- Suporta async/await em navegação
- Cleanup automático ao trocar pane
- Persistência em localStorage

---

## FASE 2: Refatoração de Panes 🔄 (ATUAL)

### Prioridade 1 - CRÍTICO ⭐
1. **beneficios/** - Upload PDF + cálculos (versão perfeita funciona)
2. **remuneracao/** - Holerites, KPI (integração crítica)
3. **colaboradores/** - Dados base do sistema

### Prioridade 2 - IMPORTANTE
4. **admissao/** - Integração novos colaboradores
5. **acessos/** - Permissões e segurança
6. **movimentacoes/** - Carreira e movimentos

### Prioridade 3 - SUPORTANTES
7. **desligamentos/** - Final de relação
8. **ferias/** - Planejamento
9. **enderecos/** - Dados secundários

### Template para cada pane:

```javascript
// panes/{nome}/index.js
class {Nome}Pane {
  constructor() {
    this.name = '{nome}';
    this.container = null;
    this.listeners = [];
  }

  async init() {
    // Carregar dados iniciais
  }

  async render() {
    // Renderizar UI
  }

  async cleanup() {
    // Remover listeners, limpar dados temporários
  }
}

export const {nome}Pane = new {Nome}Pane();
```

---

## FASE 3: Componentes Compartilhados 🔄

Depois que panes estiverem prontas:

- **tabs.js** - Navegação entre abas
- **table.js** - Tabelas com sort/filter
- **form.js** - Formulários reativos
- **modal.js** - Diálogos e confirmações
- **buttons.js** - Botões padronizados

---

## FASE 4: Testes 🔄

- Unit tests para state.js
- Integration tests para cada pane
- E2E tests para fluxos críticos
- Testes com 3 perfis: RH, Gestor, Colaborador

---

## FASE 5: Limpeza & Deploy 🔄

- Remover scripts legados
- Validação final
- Deploy para produção
- Monitoramento

---

## Fluxo de Refatoração Seguro

### 1. Por Pane:
```
Entender código legado 
  ↓
Criar novo arquivo em js/modules/grh/panes/{nome}/
  ↓
Implementar com nova arquitetura
  ↓
Testar localmente
  ↓
Commit seguro na branch refator/gestao-rh-nova
```

### 2. Se quebrar:
```bash
git reset --hard v-perfeito-beneficios-pdf
```

### 3. Quando pronto:
```bash
git tag -a v-perfeito-grh-refatorado -m "GRH completamente refatorado"
git push origin main
npx wrangler deploy
```

---

## Checklist por Pane

Para cada pane refatorada:

- [ ] Código legado entendido
- [ ] Nova estrutura criada
- [ ] Estado centralizado em state.js
- [ ] Navegação via navigation.js
- [ ] Métodos async/await
- [ ] Listeners removidos no cleanup()
- [ ] Sem conflitos CSS (usar CSS modules ou classes)
- [ ] Testado com dados reais
- [ ] Sem erros no console
- [ ] Documentação atualizada
- [ ] Commit com mensagem clara

---

## Notas Importantes

⚠️ **Não quebre a versão perfeita!**
- Versão perfeita está tagueada: `v-perfeito-beneficios-pdf`
- Trabalhe sempre em `refator/gestao-rh-nova`
- Faça commits frequentes
- Teste tudo localmente antes de commitar

🎯 **Foco: Estabilidade**
- Remova 57 scripts, não adicione novos
- Um único lugar de verdade para estado
- Lifecycle limpo: init → render → cleanup

---

**Última atualização:** 2026-07-19  
**Responsável:** Refatoração Completa  
**Status:** 🟡 FASE 2 EM PROGRESSO
