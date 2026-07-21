# TECHNICAL DEBT - Pendências Futuras vs Urgentes

**Data:** 2026-07-09  
**Status:** Priorizado  
**Total Passivos:** 12 items (3 urgentes, 4 altos, 5 médios)

---

## 🔴 URGENTES (Próximas 3 semanas)

### 1. Remover Código Legado Comentado
**Estimativa:** 8 horas  
**Severidade:** ALTA  
**Status:** ⏳ TODO  

**Problema:**
- 60+ legacy files com 117+ linhas comentadas
- Confunde novos desenvolvedores
- Aumenta tamanho do bundle (+50KB)

**Solução:**
```bash
# Mover comentados para arquivo de backup
git mv js/legacy/02-legacy.js ARCHIVE/02-legacy.js.bak

# Criar commit de limpeza
git commit -m "cleanup: archive legacy code that was never used"
```

**Impacto:** -50KB bundle, +10% legibilidade de código  
**Deadline:** 2026-07-31  
**Owner:** @dev-team

---

### 2. Implementar Jest + Testing Library
**Estimativa:** 40 horas (5 dias)  
**Severidade:** CRÍTICA  
**Status:** ⏳ TODO  

**Tarefas:**
```
[ ] Setup Jest + Testing Library (4h)
[ ] Login tests (8h)
    [ ] Colaborador login
    [ ] Gestor login
    [ ] RH login
    [ ] Fallback auth
[ ] Menu tests (8h)
    [ ] Menu rendering por role
    [ ] Menu items visibilidade
    [ ] Acesso control
[ ] Integration tests (12h)
    [ ] Login + page refresh
    [ ] Role switch
    [ ] Navigation flow
[ ] CI/CD integration (8h)
    [ ] Run tests em todo PR
    [ ] Coverage report
```

**Impacto:** 100% regressão prevention, CI/CD automation  
**Deadline:** 2026-08-30  
**Owner:** @qa-team

---

### 3. Melhorar Firebase Fallback
**Estimativa:** 16 horas (2 dias)  
**Severidade:** ALTA  
**Status:** ⏳ TODO  

**Tarefas:**
```
[ ] IndexedDB para dados offline (4h)
[ ] Retry automático 3x com exponential backoff (4h)
[ ] Sync queue para ações offline (8h)
```

**Impacto:** Funciona mesmo sem internet, 99.9% uptime  
**Deadline:** 2026-08-15  
**Owner:** @backend-dev

---

## 🟠 ALTOS (1-2 meses)

### 4. Sentry Integration
**Estimativa:** 12 horas  
**Impacto:** Real-time error monitoring, alertas automáticas  
**Deadline:** 2026-08-30

### 5. TypeScript Migration
**Estimativa:** 100 horas (tipos críticos primeiro)  
**Impacto:** Type safety, fewer bugs  
**Deadline:** 2026-09-30

### 6. Paginação & Cache
**Estimativa:** 20 horas  
**Impacto:** Suporta 1000+ colaboradores sem performance degradation  
**Deadline:** 2026-09-15

### 7. CI/CD Pipeline
**Estimativa:** 24 horas  
**Impacto:** Automated testing, deployment, quality gates  
**Deadline:** 2026-09-01

---

## 🟡 MÉDIOS (2-3 meses)

### 8. API Versionamento
**Estimativa:** 16 horas  
**Impacto:** Backwards compatible API changes

### 9. Backup Automático
**Estimativa:** 8 horas  
**Impacto:** Disaster recovery

### 10. Documentação Usuário
**Estimativa:** 20 horas  
**Impacto:** Menos suporte, mais self-service

### 11. Performance Audit
**Estimativa:** 12 horas  
**Impacto:** < 2s FCP, < 3s LCP

### 12. Security Review
**Estimativa:** 16 horas  
**Impacto:** OWASP compliance, penetration testing

---

## 📊 Timeline de Implementação

```
JULHO 2026
├─ Semana 1 (7-14): Remover código legado (-50KB)
├─ Semana 2-3 (14-28): Setup Jest básico + login tests
└─ Semana 4 (28-31): Firebase fallback v2

AGOSTO 2026
├─ Semana 1-2: Jest coverage 80%+
├─ Semana 3: Sentry + monitoring
└─ Semana 4: TypeScript tipos críticos

SETEMBRO 2026
├─ Semana 1-2: Paginação + cache
├─ Semana 3: CI/CD pipeline
└─ Semana 4: Performance audit

OUTUBRO+ 2026
└─ TypeScript completo, documentação, security review
```

---

## ✅ Aprovação e Assinatura

Este documento estabelece **prioridades claras** entre:
- **Estabilidade AGORA** (urgentes de 3 semanas)
- **Qualidade PRÓXIMO MÊS** (altos de 1-2 meses)
- **Evolução DEPOIS** (médios de 2-3 meses+)

**Regra Ouro:** NENHUMA funcionalidade nova até todos URGENTES estarem 100% completos.

---

Aprovado por: **Aline Mazzucatto**  
Data: **2026-07-09**  
Status: **EFETIVO IMEDIATAMENTE**

