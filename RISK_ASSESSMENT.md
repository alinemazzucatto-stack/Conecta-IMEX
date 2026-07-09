# RISK ASSESSMENT - Análise de Riscos Técnicos

## 🔴 RISCOS CRÍTICOS (Devem ser resolvidos URGENTEMENTE)

### 1. Acúmulo de Código Legado (CRÍTICO - Severidade 9/10)

**Problema:**
- 60+ legacy files com duplicatas de funções
- 45+ definições de `isRH()`, `roleAtual()`, `aplicarMenu()`, etc.
- Código comentado ainda ocupa espaço e causa confusão
- Risco de alguém desmentarizar código antigo por engano

**Impacto:**
- Código cada vez mais complexo e difícil de manter
- Risco de reintroduzir bugs ao desmentarizar
- Novo desenvolvedor fica perdido com múltiplas definições
- Performance degradada lentamente com cada novo patch

**Recomendação (URGENTE):**
```
1. AGORA: Criar branch de cleanup
2. SEMANA 1: Remover fisicamente comentários (não apenas comentar)
3. SEMANA 2: Criar testes de regressão para cada mudança
4. SEMANA 3: Deploy gradual (10% do tráfego)

Prazo: 3 SEMANAS
Impacto: ALTO (manutenibilidade futura)
```

**Ação Imediata:**
```bash
# Mover legacy files comentados para arquivo/
git mv js/legacy/02-legacy.js arquivo/02-legacy.js.bak
git mv js/legacy/03-legacy.js arquivo/03-legacy.js.bak
# ... etc para todos os commentados

# Criar branch específico para isso
git checkout -b cleanup/remove-legacy-code
```

---

### 2. Falta de Testes Automatizados (CRÍTICO - Severidade 8/10)

**Problema:**
- Zero testes unit/integration/e2e
- Validação apenas manual (clique em cada perfil)
- Impossível detectar regressões automaticamente
- Novos PRs sem segurança de que não quebram nada

**Impacto:**
- Bug em Colaborador passa despercebido até produção
- Refatoração impossível sem risco
- Deploy lento e ansioso (cada mudança é risco)

**Recomendação (URGENTE):**
```
1. MÊS 1: Implementar Jest + Testing Library
2. MÊS 1: Testes de login (3 perfis)
3. MÊS 2: Testes de navegação e acesso
4. MÊS 2: Testes de menu rendering
5. MÊS 3: Testes de módulos principais

Exemplo de teste:
describe('Login', () => {
  it('should login as Gestor and show Pesquisas in menu', async () => {
    render(<LoginPage />);
    userEvent.click(screen.getByRole('button', { name: /gestor/i }));
    userEvent.type(screen.getByLabelText(/email/i), 'gestor@teste.com');
    userEvent.type(screen.getByLabelText(/senha/i), '123456');
    userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Pesquisas')).toBeVisible();
    });
  });
});

Prazo: 3 MESES (desenvolvimento paralelo)
Impacto: CRÍTICO (qualidade futura)
```

---

### 3. Firebase Sem Fallback Robusto (CRÍTICO - Severidade 7/10)

**Problema:**
- Fallback authentication usa dados hard-coded de teste
- Sem persistência de dados locais em offline
- Timeout de 1s pode não ser suficiente em conexões lentas
- Sem retry automático após falha

**Impacto:**
- Se Firebase cair, apenas teste users funcionam
- Usuários reais ficam sem acesso
- Sem feedback de erro claro (apenas "Autenticando...")

**Recomendação (URGENT):**
```
1. Implementar IndexedDB para dados locais
2. Criar sync queue para ações offline
3. Aumentar timeout Firebase para 5s com retry 3x
4. Melhorar mensagens de erro

Pseudo-código:
async function doLoginWithRetry(email, pass, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await comTimeout(auth.signInWithEmailAndPassword(email, pass), 5000);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}

Prazo: 2 MESES
Impacto: MÉDIO-ALTO (confiabilidade)
```

---

## 🟠 RISCOS ALTOS (Devem ser resolvidos em 1-2 MESES)

### 4. Sem Monitoramento/Logging (ALTO - Severidade 7/10)

**Problema:**
- Nenhum sistema de logging centralizado
- Console.log espalhado pelo código
- Impossível rastrear erros em produção
- Sem alertas de falha

**Impacto:**
- Erro silencioso em produção não é detectado
- Diagnóstico baseado em "achismo" do usuário
- Sem dados para decidir melhorias

**Recomendação:**
```
1. Implementar Sentry ou similar (error tracking)
2. Criar logger centralizado
3. Logar: logins, erros, navegação, timeouts
4. Dashboard de monitoramento em tempo real

Exemplo:
window.logger = {
  info: (msg) => console.log('[INFO]', msg),
  error: (msg, err) => {
    console.error('[ERROR]', msg, err);
    Sentry.captureException(err, { extra: { msg } });
  },
  login: (email, role) => {
    // Enviar para analytics
  }
}

Prazo: 2 MESES
Impacto: MÉDIO (debugging em produção)
```

---

### 5. Sem Versionamento de API (ALTO - Severidade 6/10)

**Problema:**
- Firebase schema mudou e quebrou código
- Sem contract testing entre frontend/backend
- Mudança no Firestore não é comunicada

**Impacto:**
- Atualização no Firestore quebra login
- Sem interface clara de dados esperados

**Recomendação:**
```
1. Documentar schema do Firestore (grh_colabs, etc.)
2. Criar tipos TypeScript para dados
3. Adicionar validação de dados (zod/yup)
4. Versionar API (grh_colabs_v1, v2, etc.)

Exemplo:
import { z } from 'zod';

const ColaboradorSchema = z.object({
  email: z.string().email(),
  nome: z.string(),
  role: z.enum(['colaborador', 'gestor', 'rh']),
  perfis: z.array(z.string()),
  setor: z.string(),
  cargo: z.string(),
});

// Validar ao ler do Firestore
const colab = ColaboradorSchema.parse(firestoreData);

Prazo: 6 SEMANAS
Impacto: MÉDIO (confiabilidade de dados)
```

---

### 6. Performance Degrada com Usuários Reais (ALTO - Severidade 6/10)

**Problema:**
- Lista de 63 colaboradores carrega OK (teste local)
- Sem saber como perfoma com 1000+ colaboradores
- Sem paginação ou virtualização
- Firestore queries sem índices

**Impacto:**
- Ao crescer, sistema fica lento
- Sem cache de dados
- Recarrega tudo a cada navegação

**Recomendação:**
```
1. Implementar paginação (20-50 itens por página)
2. Adicionar cache com TanStack Query
3. Lazy loading para imagens
4. Criar índices no Firestore

Exemplo:
const {
  data: colaboradores,
  isLoading,
  hasNextPage,
  fetchNextPage
} = useInfiniteQuery({
  queryKey: ['colaboradores'],
  queryFn: ({ pageParam = 0 }) =>
    db.collection('grh_colabs')
      .orderBy('nome')
      .startAt(pageParam * 50)
      .limit(50)
      .get(),
  getNextPageParam: (lastPage) => lastPage.docs.length === 50 ? ... : null,
});

Prazo: 8 SEMANAS
Impacto: ALTO (escalabilidade)
```

---

## 🟡 RISCOS MÉDIOS (Devem ser resolvidos em 2-3 MESES)

### 7. Sem Documentação de API Interna (MÉDIO - Severidade 5/10)

**Problema:**
- `window.doLogin()`, `window.forceView()`, etc. sem JSDoc
- Impossível saber quais parâmetros aceita
- Sem exemplos de uso

**Recomendação:**
```javascript
/**
 * Força navegação para uma view específica
 * @param {string} viewId - ID da view (intranet, pesquisas, etc.)
 * @returns {void}
 * @throws {Error} Se viewId não é permitido para o papel atual
 * @example
 * window.forceView('pesquisas'); // Redireciona para Pesquisas se permitido
 */
window.forceView = function(viewId) { ... }

Prazo: 3 SEMANAS
Impacto: MÉDIO (onboarding de desenvolvedores)
```

---

### 8. CSS & HTML Sem Versionamento (MÉDIO - Severidade 5/10)

**Problema:**
- Mudanças em CSS quebram JavaScript que procura elementos
- Sem classe/ID versionada
- HTML pode mudar e JS não recebe notificação

**Recomendação:**
```
1. Usar data-testid para seletores críticos
2. Nunca usar ID/class de CSS em JavaScript
3. Criar selector registry centralizado

Exemplo (RUIM):
document.querySelector('.sidebar-item').addEventListener('click', ...);

Exemplo (BOM):
document.querySelector('[data-testid="menu-item"]').addEventListener('click', ...);

Prazo: 2 MESES
Impacto: MÉDIO (manutenibilidade)
```

---

### 9. Sem Controle de Versão de Browser (MÉDIO - Severidade 4/10)

**Problema:**
- Sem verificação de compatibilidade
- ES6 features podem não funcionar em IE11 (se ainda suporta)
- Sem polyfills

**Recomendação:**
```
1. Definir browser suportados (Chrome 90+, Firefox 88+, Safari 14+)
2. Usar Babel se precisa suportar older browsers
3. Adicionar feature detection

Prazo: 1 MÊS
Impacto: BAIXO (assumindo browsers modernos)
```

---

## 🟢 RISCOS BAIXOS (Podem ser resolvidos em 3-6 MESES)

### 10. Sem Type Safety (BAIXO - Severidade 4/10)

**Problema:**
- JavaScript puro (sem TypeScript)
- Typos não são detectados
- `window.currentUserData.nome` pode ser undefined

**Recomendação:**
```
1. Migrar para TypeScript gradualmente
2. Começar com tipos para dados críticos (User, Role, View)
3. Ativar strict mode progressivamente

Prazo: 6 MESES (migração gradual)
Impacto: MÉDIO (qualidade de código)
```

---

### 11. Sem CI/CD Pipeline (BAIXO - Severidade 4/10)

**Problema:**
- Deploy manual
- Sem testes automatizados antes de merge
- Sem build otimizado

**Recomendação:**
```
1. GitHub Actions / GitLab CI
2. Rodar testes em todo PR
3. Build + minify automaticamente
4. Deploy automático em merge para main

Prazo: 4 SEMANAS
Impacto: MÉDIO (workflow development)
```

---

### 12. Sem Backup/Disaster Recovery (BAIXO - Severidade 3/10)

**Problema:**
- Se código for deletado, não há backup
- Sem plano de recuperação
- Firestore sem backup automático

**Recomendação:**
```
1. GitHub como principal backup (já existe)
2. Firestore backup automático (semanal)
3. Documentar plano de recuperação

Prazo: 2 SEMANAS
Impacto: BAIXO (risco extremo mas improvável)
```

---

## 📊 Matriz de Riscos

| ID | Risco | Severidade | Probabilidade | Impacto | Status | Prazo |
|----|-------|-----------|--------------|---------|--------|-------|
| 1 | Código Legado | 9/10 | MÉDIA | CRÍTICO | ⏳ TODO | 3 sem |
| 2 | Sem Testes | 8/10 | ALTA | CRÍTICO | ⏳ TODO | 3 mês |
| 3 | Firebase Frágil | 7/10 | MÉDIA | CRÍTICO | ⏳ TODO | 2 mês |
| 4 | Sem Logging | 7/10 | ALTA | ALTO | ⏳ TODO | 2 mês |
| 5 | Sem Versionamento API | 6/10 | MÉDIA | ALTO | ⏳ TODO | 6 sem |
| 6 | Performance | 6/10 | MÉDIA | ALTO | ⏳ TODO | 8 sem |
| 7 | Sem Documentação | 5/10 | ALTA | MÉDIO | ⏳ TODO | 3 sem |
| 8 | CSS/HTML Acoplamento | 5/10 | MÉDIA | MÉDIO | ⏳ TODO | 2 mês |
| 9 | Browser Compatibility | 4/10 | BAIXA | MÉDIO | ⏳ TODO | 1 mês |
| 10 | Sem TypeScript | 4/10 | MÉDIA | MÉDIO | ⏳ TODO | 6 mês |
| 11 | Sem CI/CD | 4/10 | MÉDIA | MÉDIO | ⏳ TODO | 4 sem |
| 12 | Sem Backup | 3/10 | BAIXA | BAIXO | ✅ OK | - |

---

## 🎯 Plano de Ação (Próximos 6 Meses)

### MÊS 1 (URGENTE)
- [ ] Remover código legado comentado
- [ ] Implementar Jest + testes básicos (login, menu)
- [ ] Melhorar Firebase fallback (retry, timeout)
- [ ] Documentar API com JSDoc

### MÊS 2
- [ ] Implementar Sentry para logging
- [ ] Adicionar validação de dados (Zod)
- [ ] Criar CI/CD pipeline
- [ ] Testes de navegação completos

### MÊS 3
- [ ] Testes de módulos principais
- [ ] Implementar paginação
- [ ] Cache com TanStack Query
- [ ] Type safety parcial (tipos críticos)

### MÊS 4-6
- [ ] Migração para TypeScript
- [ ] Performance optimization (virtualização)
- [ ] Backup automático Firestore
- [ ] Documentação completa

---

## ⚠️ Avisos Finais

1. **Risco de Reintrodução de Bugs:** Remover código comentado pode acidentalmente deixar bugs. Testar MUITO antes de remover.

2. **Firebase Criticidade:** Se Firebase cair, sistema fica limitado ao fallback. Melhorar fallback é URGENTE.

3. **Escalabilidade:** Com 1000+ colaboradores, sistema pode ficar lento. Planejamento de performance agora economiza refactor depois.

4. **Segurança:** Validar papéis em AMBOS frontend (UX) e backend (Firebase Rules) - nunca confiar só no frontend.
