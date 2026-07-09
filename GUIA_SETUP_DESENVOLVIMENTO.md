# 🛠️ GUIA DE SETUP - Desenvolvimento e Testes Completos
**Para**: Conecta RH/IMEX - Testes Dinâmicos por Perfil  
**Data**: 2026-07-08

---

## 🚀 SETUP RÁPIDO (5 min)

### 1. Configurar Firebase Credentials

Crie arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
VITE_FIREBASE_API_KEY=seu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 2. Ou usar Firebase Emulator (Recomendado para Dev)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Iniciar emulador
firebase emulators:start
```

---

## 👥 CRIAR USUÁRIOS DE TESTE

### Usuário 1: Colaborador
```
E-mail: colaborador@empresa.com
Senha: Senha123!
Nome: João Silva
Setor: TI
Gestor: Maria Santos
Perfil: colaborador
```

### Usuário 2: Gestor
```
E-mail: gestor@empresa.com
Senha: Senha123!
Nome: Maria Santos
Setor: Gestão
Perfil: gestor
```

### Usuário 3: RH
```
E-mail: rh@empresa.com
Senha: Senha123!
Nome: Pedro Costa
Setor: Recursos Humanos
Perfil: rh
```

---

## 📊 SEED DATA - Estrutura Base

### Coleção `usuarios`
```javascript
{
  uid: "user_123",
  email: "colaborador@empresa.com",
  nome: "João Silva",
  setor: "TI",
  gestor_id: "user_gestor_001",
  perfil: "colaborador",
  data_criacao: new Date(),
  ativo: true
}
```

### Coleção `ferias`
```javascript
{
  id: "ferias_001",
  usuario_id: "user_123",
  data_inicio: "2026-08-01",
  data_fim: "2026-08-15",
  dias_totais: 15,
  status: "solicitada",
  data_solicitacao: new Date(),
  gestor_aprovacao_id: "user_gestor_001",
  rh_aprovacao_id: null
}
```

### Coleção `beneficios`
```javascript
{
  id: "beneficio_001",
  usuario_id: "user_123",
  tipo: "saude",
  plano: "Gold",
  valor_mensal: 500.00,
  ativo: true
}
```

### Coleção `documentos`
```javascript
{
  id: "doc_001",
  usuario_id: "user_123",
  tipo: "contrato",
  nome: "Contrato de Trabalho",
  url: "https://...",
  data_upload: new Date()
}
```

---

## 🧪 TESTES POR PERFIL

### TESTE 1: Perfil COLABORADOR

```
1. Login como: colaborador@empresa.com / Senha123!
2. Verificar Dashboard:
   - [ ] Hero com saudação "Bem-vindo, João"
   - [ ] Cards de resumo (Saldo de férias, Benefícios, etc)
   - [ ] Próximos eventos
   - [ ] Últimas notificações

3. Testar Menu:
   - [ ] Dashboard
   - [ ] Benefícios
   - [ ] Solicitação de Férias
   - [ ] Pesquisas
   - [ ] Meu Perfil
   - [ ] Trilhas de Carreira
   - [ ] PDI
   - [ ] Meu Desenvolvimento
   - [ ] Ouvidoria
   - [ ] Intranet
   - [ ] Gamificação

4. Teste de Funcionalidade:
   - [ ] Abrir "Solicitação de Férias"
   - [ ] Preencher período (01/08/2026 a 15/08/2026)
   - [ ] Adicionar observação
   - [ ] Clicar "Enviar solicitação"
   - [ ] Verificar se aparece em "Minhas férias"

5. Teste de Restrição:
   - [ ] Tentar acessar "Gestão RH" (deve estar oculto)
   - [ ] Tentar acessar "Usuários" (deve estar oculto)
   - [ ] Tentar acessar "Auditoria" (deve estar oculto)
```

### TESTE 2: Perfil GESTOR

```
1. Login como: gestor@empresa.com / Senha123!
2. Verificar Dashboard Gestor:
   - [ ] Hero com estatísticas (Pendentes, Aprovadas, etc)
   - [ ] Cards de resumo da equipe
   - [ ] Próximos vencimentos

3. Testar Menu Gestor:
   - [ ] Dashboard
   - [ ] Gestão RH (deve estar visível)
   - [ ] Aprovação de Férias
   - [ ] Equipe do Gestor
   - [ ] Pesquisas
   - [ ] (Herda módulos de Colaborador)

4. Teste de Funcionalidade:
   - [ ] Abrir "Aprovação de Férias"
   - [ ] Listar férias pendentes de João
   - [ ] Aprovar ou rejeitar
   - [ ] Adicionar comentário
   - [ ] Clicar "Aprovar"
   - [ ] Verificar se status mudou

5. Teste de Restrição:
   - [ ] Tentar acessar "Auditoria" (deve estar oculto)
   - [ ] Tentar acessar "Gestão de Usuários" (deve estar restrito)
```

### TESTE 3: Perfil RH

```
1. Login como: rh@empresa.com / Senha123!
2. Verificar Dashboard RH:
   - [ ] Hero com KPIs (Total de colaboradores, etc)
   - [ ] Cards de controle
   - [ ] Alertas de compliance

3. Testar Menu RH:
   - [ ] Dashboard
   - [ ] Gestão RH (completo)
   - [ ] Usuários
   - [ ] Benefícios
   - [ ] Auditoria
   - [ ] DISC
   - [ ] Cargos
   - [ ] Trilhas
   - [ ] Pesquisas
   - [ ] Calendário
   - [ ] Experiência (45/90 dias)
   - [ ] Estrutura de Carreira
   - [ ] Desenvolvimento
   - [ ] Mapeamento
   - [ ] Roadmap

4. Teste de Funcionalidade:
   - [ ] Abrir "Gestão de Usuários"
   - [ ] Listar todos os usuários
   - [ ] Criar novo usuário (testar formulário)
   - [ ] Editar usuário existente
   - [ ] Ver permissões

5. Teste de Restrição:
   - [ ] Verificar acesso TOTAL (não deve haver restrições)
   - [ ] Acessar Auditoria (deve estar visível)
```

---

## 🐛 TESTES DE BUG/REGRESSÃO

### Verificação Crítica
```
1. Layout de Login:
   - [ ] Sem flicker ao carregar
   - [ ] Responsive (desktop + mobile)
   - [ ] Botões de perfil funcionam

2. Menu Lateral:
   - [ ] Não oscila ao trocar de perfil
   - [ ] Itens ativar/desativam corretamente
   - [ ] Ícones carregam

3. Formulários:
   - [ ] Campos obrigatórios marcados
   - [ ] Validação funciona
   - [ ] Mensagens de erro aparecem
   - [ ] Salvamento persiste dados

4. Permissões:
   - [ ] Colaborador não vê menus de RH
   - [ ] Gestor vê apenas seus menus
   - [ ] RH tem acesso completo

5. Performance:
   - [ ] Página carrega em < 3s
   - [ ] Navegação entre views < 500ms
   - [ ] Sem memory leaks (DevTools)
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Sistema Online
- [ ] Firebase conectado
- [ ] Usuários autenticados
- [ ] Dados de teste populados
- [ ] App carrega sem erros

### Navegação
- [ ] Menu responde a cliques
- [ ] Views mudam corretamente
- [ ] Botões "Voltar" funcionam
- [ ] Deep linking funciona

### Funcionalidade
- [ ] Formulários salvam dados
- [ ] Tabelas mostram dados
- [ ] Filtros funcionam
- [ ] Relatórios geram

### Visual
- [ ] Layout está correto
- [ ] Cores padronizadas
- [ ] Responsivo funciona
- [ ] Sem flicker ou oscilação

### Segurança
- [ ] Permissões respeitadas
- [ ] Dados sensíveis ocultos
- [ ] LGPD em conformidade

---

## 🔧 TROUBLESHOOTING

### "Firebase not initialized"
```
Solução: Verificar .env.local, recarregar página
```

### "DOMContentLoaded timeout"
```
Solução: Verificar se Orchestrator está carregado
Console log: [Init] ===== INICIALIZAÇÃO COMPLETA (Erros: 0) =====
```

### "Navegação não funciona"
```
Solução: Verificar se sbNav está definida
window.sbNav deve ser uma função
```

### "Permissões não funcionam"
```
Solução: Verificar sessionStorage.userRole
Deve conter: 'colaborador', 'gestor', ou 'rh'
```

---

## 📱 TESTE MOBILE

```
1. Redimensionar navegador para 375px (celular)
2. Testar em cada perfil:
   - [ ] Menu responsivo
   - [ ] Botões clicáveis
   - [ ] Formulários acessíveis
   - [ ] Layout não quebra
```

---

## ✅ VALIDAÇÃO FINAL

Quando todos os testes passarem:

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Validar tipos TypeScript
npm run type-check

# Executar linter
npm run lint

# Buildar para produção
npm run build

# Testar build
npm run preview
```

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verificar logs do console (DevTools F12)
2. Verificar Firebase emulator logs
3. Verificar .env.local está correto
4. Limpar cache e recarregar (Ctrl+Shift+Delete)
5. Reiniciar dev server

---

**Após completar este guia, o sistema estará 100% testado e validado! 🎉**
