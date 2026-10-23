# Conecta RH

Sistema de intranet e gestão de pessoas. A aplicação principal é `index.html`,
com estilos em `css/` e funcionalidades em `js/modules/` e `js/legacy/`.
O projeto Essence Clinic é independente e foi movido para fora desta pasta.
Arquivos internos que contêm `essence-rh` no nome pertencem ao Conecta RH
e continuam sendo carregados pela aplicação.

## Verificação local

Com Node.js 18 ou superior, execute `npm test`. Não é necessário instalar pacotes.
Os testes verificam os recursos locais carregados pela página, a sintaxe dos
scripts externos e embutidos, e cenários de falha de autenticação.
O fluxo de validação em `.github/workflows/validate.yml` executará esses testes
quando as alterações forem enviadas ao GitHub.

Para abrir a aplicação, sirva esta pasta por HTTP. O Firebase deve estar
disponível para autenticação e acesso aos dados. Abrir por `file://` não é
uma validação funcional adequada.

## Situação verificada em 23/10/2026

- Dez testes automatizados locais aprovados.
- Login exige autenticação Firebase; erro não libera contas locais de teste.
- Tentativas simultâneas de login são bloqueadas e senhas mantêm seus espaços.
- Publicação configurada pelo `wrangler.toml`; documentos de trabalho,
  testes, configurações internas e dependências excluídos em `.assetsignore`.
- Versão limpa publicada em 23/10/2026 e conferida no endereço público.
- Histórico local e referências do GitHub saneados; detalhes e limites em
  `EXCLUSAO-DADOS-STATUS.md`.

## Validações ainda necessárias

- Login real de cada perfil, saída e restauração de sessão após recarregar.
- Cadastro, edição e persistência de Movimentações, Admissões e Desligamentos
  com dados de teste autorizados.
- Permissões efetivas no banco, incluindo isolamento entre unidades.
- Verificação da versão publicada e de seus fluxos principais.
- Consolidação gradual dos arquivos legados, acompanhada de testes de
  comportamento; arquivos carregados não devem ser removidos só pelo nome.

Os relatórios de julho, incluindo `EXECUTIVE_SUMMARY.md` e `TECHNICAL_DEBT.md`,
são históricos. Suas declarações de prontidão e prazos não constituem
validação da versão atual. Os testes locais também não comprovam acesso
ao banco, segurança das regras remotas ou funcionamento integral no navegador.
