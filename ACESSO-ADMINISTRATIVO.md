# Acesso administrativo exclusivo

Configurado em 23/10/2026 para `aline.mazzucatto@imex.com.br`, com a identidade
Firebase `qTyh5V0bOtewN4P7756FfsTuDMf1`, conferida no perfil existente em `users`.

O login continua exigindo a senha válida no Firebase Auth. Depois de autenticar,
valida e-mail e UID e carrega o perfil administrativo existente. Não consulta
nem recria cadastros de colaboradores. Perfis ausentes ou inconsistentes
encerram a autenticação.

As regras publicadas no Firestore exigem essa mesma identidade em todas as
permissões de leitura e escrita. Outras contas e visitantes sem autenticação
não podem acessar os dados do aplicativo. As contas existentes no Firebase
Auth foram preservadas. Sua eventual liberação futura exige uma mudança
explícita na política do aplicativo e nas regras do banco.

## Validação

- Quinze testes automatizados aprovados, incluindo login administrativo sem
  cadastro de colaborador, bloqueio de outro e-mail, UID incorreto e sessão
  antiga de outra conta.
- Simulador do Firestore: conta administrativa permitida; visitante sem
  autenticação e identidade diferente com o mesmo e-mail negados.
- Regras publicadas e verificadas no console do Firebase.
- Publicação ativa da interface: `8d7db29e`, com arquivos conferidos por SHA-256.
- Consulta HTTP direta sem autenticação ao perfil retornou 403.
- A entrada com a senha pessoal deve ser feita pela própria administradora;
  a senha não foi solicitada, lida nem alterada nesta correção.

Os controles do aplicativo estão em `js/modules/access-policy.js` e as regras
correspondentes estão versionadas em `firestore.rules`.
