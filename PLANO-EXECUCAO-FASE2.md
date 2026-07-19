# 🚀 PLANO DE EXECUÇÃO - FASE 2

**Início:** 2026-07-19  
**Objetivo:** Refatorar 6 panes restantes + completar 3 existentes  
**Branch:** `refator/gestao-rh-nova`  
**Proteção:** Tag `v-perfeito-beneficios-pdf` ativa  

---

## 📋 Checklist Executivo

### Panes Críticas (30 min cada)
- [ ] 1. Admissão (30 min) — novo colaborador + checklist
- [ ] 2. Acessos (30 min) — papéis e permissões
- [ ] 3. Movimentações (30 min) — promoção/transferência

### Panes Importantes (20 min cada)
- [ ] 4. Desligamentos (20 min) — rescisória
- [ ] 5. Férias (30 min) — saldo e planejamento
- [ ] 6. Endereços (20 min) — dados secundários

### Completar Existentes
- [ ] 7. Colaboradores (20 min) — formulário de edição
- [ ] 8. Remuneração (40 min) — holerites + KPI
- [ ] 9. Benefícios — ✅ Já concluído

### Pós-Refatoração
- [ ] Testar todas as 9 panes (30 min)
- [ ] Validar sem regressões (20 min)
- [ ] Criar componentes compartilhados (30 min)

**Total Estimado:** 4-5 horas

---

## 🎯 Ordem de Implementação (Respeita Dependências)

```
1. Admissão         (independente)
   ↓
2. Acessos          (usa Colaboradores)
   ↓
3. Movimentações    (usa Colaboradores + Remuneração)
   ↓
4. Desligamentos    (usa tudo acima + Férias)
   ↓
5. Férias           (usa Remuneração + cálculos)
   ↓
6. Endereços        (independente)
   ↓
7. Colaboradores+   (completar edição)
   ↓
8. Remuneração+     (completar KPI)
   ↓
9. Testes           (validar tudo)
```

---

## ⏱️ Timeline

```
🔴 0:00 — Começar FASE 2
🟡 0:30 — 1º pane (Admissão) completa
🟡 1:00 — 2º pane (Acessos) completa
🟡 1:30 — 3º pane (Movimentações) completa
🟡 2:00 — 4º pane (Desligamentos) completa
🟡 2:30 — 5º pane (Férias) completa
🟡 3:00 — 6º pane (Endereços) completa
🟡 3:20 — Completar Colaboradores
🟡 4:00 — Completar Remuneração
🟡 4:30 — Testes + Validação
🟢 5:00 — FASE 2 COMPLETA ✅
```

---

## 🔄 Pós FASE 2

**FASE 3 (30 min):** Componentes Compartilhados
- table.js (para listas)
- form.js (para formulários)
- modal.js (para diálogos)
- buttons.js (padronizados)

**FASE 4 (30 min):** Testes
- Unit tests
- Integration tests
- E2E tests

**FASE 5 (2h):** LIMPEZA TOTAL ⚠️
- Apagar js/legacy/ (88 arquivos)
- Apagar js/modules/[antigos] (20+ arquivos)
- Validar zero regressões
- Deploy produção

---

## ✅ Pronto para Começar

Vou começar com a **1ª pane: Admissão**

Status: 🟢 GO!
