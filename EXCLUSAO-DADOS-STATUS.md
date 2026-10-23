# Exclusão de dados de colaboradores — 23/10/2026

Escopo solicitado: excluir cadastros e históricos, preservando contas de acesso.

## Executado na cópia local

- Esvaziadas três cópias de cadastros com 67 registros cada.
- Esvaziada a lista de remuneração com 46 registros.
- Esvaziadas duas listas de movimentações com 35 registros cada.
- Esvaziadas duas listas demonstrativas de desligamentos com 5 registros cada.
- Removidos dados pessoais dos modelos de endereço e folha.
- Retirados exemplos fixos de dependentes e ranking da página principal.
- Desativada a importação automática de cadastros ao abrir base vazia.
- Adicionada limpeza única dos históricos conhecidos em localStorage e
  sessionStorage. Essa limpeza só acontece quando a versão atualizada é aberta
  em cada navegador. Contas e persistência do Firebase Auth são preservadas.

Os números acima representam cópias de registros, não pessoas únicas.

## Conferência remota em 23/10/2026

Após o usuário conectar a conta administrativa correta e confirmar a exclusão,
foi verificada a ausência destas 17 coleções no Firestore:

- `grh_colabs`, `grh_rem` (excluídas pelo usuário durante o fluxo).
- `meta_grh_colabs`, `meta_colabs`, `meta_grh_rem`, `meta_grh_mov`,
  `meta_grh_desl`, `meta_grh_documentos`.
- `meta_disc_resultados`, `meta_ouvidoria`, `meta_pesquisas`,
  `meta_intra_humores`, `meta_intranet`.
- `alertasEnviados`, `meta_alertasEnviados`.
- `audit`, `meta_audit` (exclusão integral explicitamente autorizada após
  esclarecimento de que também seriam apagados os logs técnicos).

As contas continuam listadas no Firebase Authentication. As coleções `users`,
`meta_gestores` e as configurações foram preservadas. Candidatos de recrutamento
em `rs_candidatos` não foram incluídos na exclusão de colaboradores.

A coleção geral `intranet` contém comunicados institucionais e foi preservada.
Sua exclusão integral foi bloqueada pela revisão automática por possível
inclusão de conteúdo fora do escopo. A exclusão integral de `audit` e
`meta_audit` foi inicialmente bloqueada pelo mesmo motivo; após autorização
expressa do usuário, ambas foram excluídas e sua ausência foi verificada.

O console de Storage exibiu uma tela exigindo plano Blaze para acesso ao produto;
nenhum inventário de arquivos foi disponibilizado e nenhum arquivo de Storage
foi excluído. Essa tela não comprova ausência de anexos em outros locais.

## Pendências

- Inspeção de anexos fora das coleções removidas.
- Publicação das alterações e limpeza nos navegadores que usam a versão anterior.
- Reescrita do histórico Git: versões anteriores ainda podem conter os dados.
- Inspeção e limpeza de backups, arquivos exportados e documentação binária.

Não considerar a exclusão integral concluída enquanto as pendências acima
permanecerem. Preservar as contas no Firebase Auth e os documentos de autorização
necessários para manter o acesso.
