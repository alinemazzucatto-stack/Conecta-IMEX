# 📋 PLANO - Refatoração das 6 Panes Restantes

**Status:** Planejamento  
**Branch:** `refator/gestao-rh-nova`  
**Proteção:** Tag `v-perfeito-beneficios-pdf` + Branch `main-perfeito`

---

## 🎯 Visão Geral

Temos **9 panes totais** em Gestão RH. Já refatoramos **3** (30%).  
Faltam **6 panes** (70%) que precisam ser migradas para a nova arquitetura modular.

```
CRÍTICO (refatorados ✅)
├── Benefícios       ✅ 100% (upload PDF)
├── Colaboradores    🟡 70% (falta edição)
└── Remuneração      🟡 10% (placeholder)

PRIORIDADE 2 (próximos ⏳)
├── Admissão         📋 0% (onboarding)
├── Acessos          📋 0% (permissões)
└── Movimentações    📋 0% (carreira)

PRIORIDADE 3 (depois)
├── Desligamentos    📋 0% (rescisões)
├── Férias           📋 0% (planejamento)
└── Endereços        📋 0% (dados secundários)
```

---

## 🔄 Estratégia por Pane

### 1️⃣ ADMISSÃO (Prioridade Alta)
**Criticidade:** IMPORTANTE  
**Arquivo legado:** `02-legacy.js` (admissão/onboarding)  
**Linhas:** ~150  
**Tempo estimado:** 45 minutos

**Funcionalidades:**
- Criar novo colaborador (CPF, nome, cargo, salário)
- Checklist de documentação (RG, CREA, CNJ, etc)
- Data de admissão + contrato
- Integração com Colaboradores (novo registro)

**Estratégia:**
```javascript
class AdmissaoPane {
  - Carregar templates de documentação
  - Formulário de novo colaborador
  - Checklist interativo
  - Salvar no Firebase + atualizar lista de Colaboradores
  - Lifecycle: init() → render() → cleanup()
}
```

**Dependências:**
- ✅ colaboradores (já refatorado)
- ✅ state manager (já pronto)

---

### 2️⃣ ACESSOS (Prioridade Alta)
**Criticidade:** IMPORTANTE (segurança)  
**Arquivo legado:** Diversos (permissões espalhadas)  
**Linhas:** ~120  
**Tempo estimado:** 40 minutos

**Funcionalidades:**
- Atribuição de papéis (RH, Gestor, Colaborador, Admin)
- Permissões por módulo
- Controle de visualização de dados sensíveis
- Auditoria de acesso

**Estratégia:**
```javascript
class AcessosPane {
  - Carregar matriz de permissões
  - Listar usuários com seus papéis
  - Editor de permissões por módulo
  - Salvar policy no Firebase
  - Validar permissões em todas as operações
}
```

**Dependências:**
- ✅ colaboradores (mapear usuários)
- ✅ state manager (armazenar permissões atuais)

---

### 3️⃣ MOVIMENTAÇÕES (Prioridade Alta)
**Criticidade:** IMPORTANTE  
**Arquivo legado:** `02-legacy.js` (promoções, transferências)  
**Linhas:** ~180  
**Tempo estimado:** 50 minutos

**Funcionalidades:**
- Registrar promoção (novo cargo/salário)
- Transferência entre setores
- Histórico de carreira
- Cálculo de impacto em folha

**Estratégia:**
```javascript
class MovimentacoesPane {
  - Carregar histórico de movimentações
  - Formulário de nova movimentação (tipo, data, detalhe)
  - Validar se impacta benefícios/salário
  - Integrar com Remuneração (recalcular KPI)
  - Persistir timeline
}
```

**Dependências:**
- ✅ colaboradores (buscar/atualizar dados)
- ✅ remuneracao (impacto em folha)
- ✅ state manager

---

### 4️⃣ DESLIGAMENTOS (Prioridade Média)
**Criticidade:** IMPORTANTE  
**Arquivo legado:** `02-legacy.js` (demissões, rescisões)  
**Linhas:** ~140  
**Tempo estimado:** 45 minutos

**Funcionalidades:**
- Registrar desligamento (tipo: demissão, pedido, rescisão)
- Calcular rescisória (saldo férias, 13º, aviso prévio)
- Gerar documento de desligamento
- Marcar colaborador como inativo

**Estratégia:**
```javascript
class DesligamentosPane {
  - Carregar colaboradores ativos
  - Formulário de desligamento
  - Calcular rescisória automática
  - Gerar PDF (usar jsPDF)
  - Atualizar status em Colaboradores
  - Remover de folha futura
}
```

**Dependências:**
- ✅ colaboradores (atualizar status)
- ✅ remuneracao (cálculo rescisória)
- ✅ state manager

---

### 5️⃣ FÉRIAS (Prioridade Média)
**Criticidade:** IMPORTANTE  
**Arquivo legado:** `02-legacy.js` (férias)  
**Linhas:** ~200  
**Tempo estimado:** 60 minutos

**Funcionalidades:**
- Planejamento de férias (período, dias)
- Aprovação por gestor
- Cálculo de provisão (13º + férias)
- Calendário visual
- Alertas de vencimento

**Estratégia:**
```javascript
class FeriasPane {
  - Carregar saldo de férias por colaborador
  - Formulário de solicitação
  - Calendário de aprovação
  - Cálculo de provisão automático
  - Integrar com Remuneração (provisões)
  - Alertas de vencimento (12 meses)
}
```

**Dependências:**
- ✅ colaboradores (buscar saldo)
- ✅ remuneracao (provisões)
- 🟡 estado de aprovação (novo)

---

### 6️⃣ ENDEREÇOS (Prioridade Baixa)
**Criticidade:** SECUNDÁRIO  
**Arquivo legado:** `02-legacy.js` (endereços)  
**Linhas:** ~100  
**Tempo estimado:** 30 minutos

**Funcionalidades:**
- Cadastro de endereço (residencial, comercial, correspondência)
- Validação de CEP (integrar ViaCEP)
- Histórico de endereços
- Dados para documentos fiscais

**Estratégia:**
```javascript
class EnderecosPane {
  - Carregar endereços do colaborador
  - Formulário com autocomplete de CEP
  - Validação de dados
  - Salvar múltiplos endereços
  - Usar para gerar documentos
}
```

**Dependências:**
- ✅ colaboradores (associar endereço)
- 🟢 API ViaCEP (externa)

---

## 📅 Timeline Recomendada

### Fase 2A: Panes Críticas (próximas 2 horas)
```
⏳ Admissão        45 min  (+ 10 min testes)
⏳ Acessos         40 min  (+ 10 min testes)
⏳ Movimentações   50 min  (+ 10 min testes)
```

### Fase 2B: Panes Importantes (próximas 2 horas)
```
⏳ Desligamentos   45 min  (+ 10 min testes)
⏳ Férias          60 min  (+ 15 min testes)
```

### Fase 2C: Panes Secundárias (próxima 1 hora)
```
⏳ Endereços       30 min  (+ 5 min testes)
```

**Total FASE 2:** ~6 horas de refatoração  
**Incluindo testes:** ~7 horas

---

## 🔗 Dependências Entre Panes

```
Colaboradores (base)
    ↓
    ├→ Admissão (cria novo colaborador)
    ├→ Acessos (define permissões)
    ├→ Movimentações (atualiza dados)
    └→ Desligamentos (marca inativo)

Remuneração (folha)
    ↓
    ├→ Benefícios (impacta custos)
    ├→ Movimentações (novo salário)
    ├→ Férias (provisões)
    └→ Desligamentos (rescisória)

Férias (saldo)
    ↓
    └→ Desligamentos (saldo férias na rescisória)
```

**Ordem de Implementação (respeita dependências):**
1. ✅ Colaboradores (base)
2. ✅ Remuneração (segundo pilar)
3. ⏳ Admissão (usa colaboradores)
4. ⏳ Acessos (proteção)
5. ⏳ Movimentações (atualiza colaboradores + remuneração)
6. ⏳ Férias (usa remuneração)
7. ⏳ Desligamentos (usa tudo)
8. ⏳ Endereços (independente)

---

## 💾 Estratégia de Dados

### Firebase Collections
```
grh_colaboradores/
  {cpf}: { nome, email, cargo, setor, status, ... }

grh_acessos/
  {user_email}: { papeis: [], modulos: [], permissoes: {} }

grh_movimentacoes/
  {cpf}_YYYY-MM-DD: { tipo, cargo_novo, salario_novo, ... }

grh_ferias/
  {cpf}: { dias_saldo, proxima_data_limite, solicitacoes: [] }

grh_desligamentos/
  {cpf}: { data, tipo, motivo, rescisoria: {...}, ... }

grh_enderecos/
  {cpf}: { residencial: {...}, comercial: {...}, ... }
```

---

## 🎯 Padrão para Todas as Panes

Cada pane segue o mesmo contrato:

```javascript
class MyPane {
  constructor() {
    this.name = 'my-pane';
    this.container = null;
    this.listeners = [];
    this.data = [];
  }

  async init() {
    // 1. Carregar dados de Firebase/localStorage
    // 2. Preparar estruturas internas
  }

  async render() {
    // 1. Renderizar HTML
    // 2. Anexar listeners (this.listeners.push)
    // 3. Validar permissões (se necessário)
  }

  async cleanup() {
    // 1. Remover todos listeners (this.listeners.forEach)
    // 2. Limpar dados temporários
    // 3. Limpar container
  }
}

export const myPane = new MyPane();
```

**Vantagens:**
- ✅ Zero listeners orphans
- ✅ Lifecycle previsível
- ✅ Reutilizável em todas as 9 panes
- ✅ Fácil testar/debugar

---

## 🧪 Testes por Pane

Para cada pane refatorada, validar:

```javascript
// 1. Inicialização
await myPane.init();
✓ Dados carregados?
✓ Estrutura interna ok?

// 2. Renderização
await myPane.render();
✓ HTML renderizado?
✓ Listeners anexados (count > 0)?
✓ Sem erros no console?

// 3. Interação
// ... testes específicos de UI ...

// 4. Limpeza
await myPane.cleanup();
✓ Listeners removidos (count = 0)?
✓ Container vazio?
✓ Sem memory leaks?

// 5. Navegação
gestaoRHModule.goToPane('other-pane');
gestaoRHModule.goToPane('my-pane');
✓ Reinicia corretamente?
```

---

## 🚨 Rollback Strategy

Se algo quebrar em qualquer pane:

```bash
# Opção 1: Volta rápida (se quebrou agora)
git reset --hard HEAD~1
git push origin refator/gestao-rh-nova --force

# Opção 2: Volta para versão perfeita completa
git reset --hard v-perfeito-beneficios-pdf
npx wrangler deploy

# Opção 3: Cria nova branch de emergência
git checkout -b emergency-fix
# ... fix ...
# depois: git reset --hard v-perfeito-beneficios-pdf
```

---

## ✅ Checklist Antes de Commitar Cada Pane

- [ ] Código segue padrão (init/render/cleanup)
- [ ] Todos listeners em `this.listeners`
- [ ] Sem console.error ou console.warn
- [ ] Testado no navegador (sem regressões)
- [ ] Permissões validadas
- [ ] Firebase + localStorage funcionando
- [ ] Cleanup remove todos listeners
- [ ] Documentação atualizada
- [ ] Commit com mensagem clara

---

## 📊 Visão Final (Após FASE 2 Completa)

```
┌─ GESTÃO RH REFATORADO ─────────────────────┐
│                                             │
│  state.js (centralizado)                   │
│     ↑                                       │
│     ├── navigation.js                      │
│     │                                       │
│     └─→ 9 Panes (modulares):               │
│         ├─ Colaboradores   ✅              │
│         ├─ Remuneração     ✅              │
│         ├─ Benefícios      ✅              │
│         ├─ Admissão        ✅              │
│         ├─ Acessos         ✅              │
│         ├─ Movimentações   ✅              │
│         ├─ Desligamentos   ✅              │
│         ├─ Férias          ✅              │
│         └─ Endereços       ✅              │
│                                             │
└─────────────────────────────────────────────┘

Resultado:
- 0 redefinições de função global
- 9 módulos independentes
- Todos os listeners rastreados
- Lifecycle previsível
- ~2000 linhas de código organizado
- 0 código morto
- Fácil de testar e manter
```

---

## 🔐 Conclusão

Cada uma das 6 panes restantes segue o **mesmo padrão** de refatoração:

1. Entender código legado
2. Extrair lógica essencial
3. Implementar com novo pattern (init/render/cleanup)
4. Integrar com state centralizado
5. Testar sem regressões
6. Commitar com segurança de rollback

**Total estimado:** 6-7 horas de trabalho  
**Risco:** Mínimo (versão perfeita protegida)  
**Retorno:** Sistema 100% modular e maintível

---

**Próximo passo:** Quer que eu comece pelas 3 panes críticas (Admissão, Acessos, Movimentações) agora?
