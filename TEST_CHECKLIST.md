# TEST CHECKLIST - Conecta IMEX/RH

## 📋 Matriz de Testes por Perfil e Módulo

### COLABORADOR (`colaborador@teste.com` / `123456`)

#### Login & Autenticação
- [ ] Login sem oscilações visuais
- [ ] Não fica preso em "Autenticando..."
- [ ] SessionStorage salvo corretamente (userRole=colaborador)
- [ ] AppShell visível após login
- [ ] Logout limpa sessionStorage

#### Menu & Navegação
- [ ] Menu mostra 5 itens (Intranet, Gamificação, Estrutura, Mais, Ouvidoria)
- [ ] Ícones corretos para cada menu (🏠, 🏆, 🏢, 📦, 📢)
- [ ] Clique em menu item navega corretamente
- [ ] Body tem classe `role-colaborador`

#### Controle de Acesso
- [ ] Pesquisas: Negado (redireciona para Dashboard)
- [ ] Férias: Acessível
- [ ] Intranet: Acessível
- [ ] Benefícios: Acessível se disponível
- [ ] Gestão RH: Negado

#### Módulos Específicos
- [ ] **Intranet:** Carrega feed social
- [ ] **Gamificação:** Exibe pontos e ranking
- [ ] **Estrutura & Carreira:** Mostra cargo atual e trilha
- [ ] **Mais:** Menu expandido funciona
- [ ] **Ouvidoria:** Form de feedback funciona

#### Performance
- [ ] Nenhum erro 404 no console
- [ ] Sem setInterval de polling
- [ ] CPU uso < 30% em idle
- [ ] Navegação suave entre abas

---

### GESTOR (`gestor@teste.com` / `123456`)

#### Login & Autenticação
- [ ] Login bem-sucedido com loginRole=gestor
- [ ] SessionStorage salvo (userRole=gestor)
- [ ] Fallback authentication respeita seleção de papel

#### Menu & Navegação
- [ ] Menu mostra 10 itens:
  - [ ] 🏠 Intranet
  - [ ] 🏆 Gamificação
  - [ ] 🏢 Estrutura e Carreira
  - [ ] 🌴 Férias
  - [ ] 👔 Gestor
  - [ ] 📋 Pesquisas ⭐
  - [ ] 🎁 Meus Benefícios
  - [ ] 📢 Ouvidoria
  - [ ] 🤖 Conecta AI
  - [ ] 🪪 Meus Dados
- [ ] Body tem classe `role-gestor`

#### Controle de Acesso
- [ ] **Pesquisas: PERMITIDO** (acesso completo)
- [ ] Férias: Acessível
- [ ] Benefícios: Acessível
- [ ] Intranet: Acessível
- [ ] Gestão RH: Negado (redireciona para Intranet)
- [ ] Dashboard RH: Negado

#### Pesquisas (Menu Item Crítico)
- [ ] Pesquisas visível no menu
- [ ] Clique abre Pesquisas (não redireciona)
- [ ] Pode visualizar pesquisas existentes
- [ ] Pode responder pesquisas

#### Módulos Específicos
- [ ] **Gestor:** Painel de gestão carrega
- [ ] **Solicitações:** Férias pode solicitar
- [ ] **Benefícios:** Pode visualizar planos

---

### RH (`rh@teste.com` / `123456`)

#### Login & Autenticação
- [ ] Login bem-sucedido com loginRole=rh
- [ ] SessionStorage salvo (userRole=rh)
- [ ] Fallback authentication mantém role=rh

#### Menu & Navegação
- [ ] Menu mostra 7+ itens:
  - [ ] 🏢 Gestão RH ⭐
  - [ ] 📊 Dashboard RH
  - [ ] 📢 Ouvidoria
  - [ ] 🤖 Conecta AI
  - [ ] 📝 Auditoria
  - [ ] 🗺️ Roadmap do Produto
  - [ ] 🪪 Meus Dados
- [ ] Body tem classe `role-rh`

#### Controle de Acesso
- [ ] **Pesquisas: PERMITIDO** (acesso completo)
- [ ] Gestão RH: Acessível
- [ ] Dashboard RH: Acessível
- [ ] Auditoria: Acessível
- [ ] Remuneração: Acessível
- [ ] Colaboradores: Acessível
- [ ] Documento Management: Acessível

#### Módulos Específicos
- [ ] **Gestão RH:** Dashboard carrega com estatísticas
- [ ] **Colaboradores:** Lista de 63 colaboradores (44 CLT, 19 PJ)
- [ ] **Remuneração:** Folha e salários visíveis
- [ ] **Férias:** Saldo e aprovações funcionam
- [ ] **Benefícios:** Planos e cartões visíveis
- [ ] **Pesquisas:** Modelos e respostas visíveis
- [ ] **Auditoria:** Logs de acesso funcionam

---

## 🔄 Testes de Transição entre Perfis

- [ ] Colaborador → Gestor: Menu muda corretamente
- [ ] Gestor → RH: Menu muda corretamente
- [ ] RH → Colaborador: Menu muda corretamente
- [ ] SessionStorage limpo ao mudar perfil
- [ ] Sem estado preso de perfil anterior

---

## 🚨 Testes de Regressão (Críticos)

### Login/Auth
- [ ] Sem oscilações de tela
- [ ] Sem "Autenticando..." infinito
- [ ] Sem erros 404 de scripts
- [ ] Sem duplicação de listeners

### Performance
- [ ] CPU < 30% em idle
- [ ] Nenhum setInterval ativo (exceto login fallback: 100ms com timeout 5s)
- [ ] MutationObserver consoante não duplicado
- [ ] Nenhum vazamento de memória (monitore por 5min)

### Segurança
- [ ] Controle de acesso funcionando por perfil
- [ ] Senha validada contra Firebase/fallback
- [ ] Sem acesso a dados de outro perfil
- [ ] SessionStorage não expõe dados sensíveis

---

## 📱 Testes de Compatibilidade

### Navegadores
- [ ] Chrome 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+

### Dispositivos
- [ ] Desktop (1280x800)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x812)

### Conexão
- [ ] 4G rápida
- [ ] 3G lenta
- [ ] Offline (fallback authentication)

---

## 📊 Testes de Carga

- [ ] 5 logins simultâneos: OK
- [ ] 100 colaboradores listados: Performance OK
- [ ] Pesquisa com 1000 respostas: Carrega em < 2s
- [ ] Relatório de remuneração: Processa em < 5s

---

## ✅ Checklist Final

- [ ] Todos os testes de Colaborador passando
- [ ] Todos os testes de Gestor passando
- [ ] Todos os testes de RH passando
- [ ] Nenhuma regressão detectada
- [ ] Performance dentro dos limites
- [ ] Segurança validada
- [ ] Documentação atualizada
- [ ] Pronto para Deploy em Produção

**Data do Teste:** ___________
**Testador:** ___________
**Status:** [ ] APROVADO [ ] REPROVADO
**Observações:** 
___________________________________________________________________________
