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

## Histórico Git e documentação

- O conteúdo foi saneado em 302 versões históricas de arquivos, mantendo a
  versão atual e suas correções. As 437 revisões foram processadas.
- Os quatro ramos e as duas tags existentes no GitHub foram substituídos pelas
  referências saneadas com verificação prévia das versões remotas.
- Os pontos locais de recuperação antigos foram removidos e os objetos Git
  inalcançáveis foram eliminados.
- A verificação de 1.056 objetos históricos de texto não encontrou os 170
  identificadores pessoais pesquisados, derivados dos cadastros e históricos.
- Documentos Word, PDFs e o pacote ZIP de documentação foram lidos; não foram
  encontrados esses identificadores em seus conteúdos extraíveis. Isso não
  equivale a uma varredura visual/OCR de todas as imagens.

## Publicação

- A versão limpa foi publicada no Worker `conecta-imex` pela conta correta.
- A implantação ativa passou a ser `d7584083`, com 100% do tráfego.
- Foram enviados somente 164 arquivos do site, sem documentos internos.
- O endereço público respondeu HTTP 200 e seu HTML coincidiu, por SHA-256,
  com o pacote validado. Dez testes automatizados foram aprovados.
- As URLs públicas de prévia foram desativadas; o endereço de produção
  `https://conecta-imex.mazzucatto-24.workers.dev/` continua habilitado.
- A limpeza única dos históricos locais será executada ao carregar a versão
  atualizada em cada navegador. Não é possível apagar remotamente dados de
  navegadores que ainda não carregaram essa versão.

## Limites da conferência

- Inspeção de anexos fora das coleções removidas.
- A Cloudflare mantém implantações anteriores no painel e não apresentou uma
  opção de exclusão individual no menu consultado. Essas versões não foram
  removidas do armazenamento do provedor; suas URLs de prévia foram desativadas.
- Não foi solicitada limpeza dos caches internos e de cópias externas do GitHub.
- Cópias e exportações fora da pasta deste projeto não foram inspecionadas.

O escopo executado é a base operacional, os arquivos locais identificados,
as referências Git e a publicação ativa. Não declarar eliminação universal
de cópias fora desse escopo. As contas no Firebase Auth e os documentos de
autorização necessários para manter o acesso foram preservados.
