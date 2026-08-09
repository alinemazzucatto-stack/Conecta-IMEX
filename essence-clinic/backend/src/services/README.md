# Email Service

O serviço de email do Essence Clinic permite enviar notificações por email aos pacientes sobre seus agendamentos.

## Configuração

Para ativar o serviço de email, configure as seguintes variáveis de ambiente no arquivo `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app-google
SMTP_FROM=noreply@essenceclinic.com
```

### Como configurar com Gmail

1. Acesse sua conta Google
2. Vá para "Gerenciar sua Conta Google"
3. Clique em "Segurança" no menu lateral
4. Ative "Verificação em duas etapas"
5. Volte para "Segurança" e procure por "Senhas de aplicativo"
6. Selecione "Mail" e "Windows Computer" (ou seu dispositivo)
7. Copie a senha gerada e use em `SMTP_PASSWORD`

## Recursos

- ✅ Notificação automática ao criar agendamento
- ✅ Notificação automática ao atualizar agendamento
- ✅ Template HTML profissional
- ✅ Graceful fallback se as credenciais não estiverem configuradas

## Uso

O serviço é chamado automaticamente quando:

1. Um novo agendamento é criado (POST /api/appointments)
2. Um agendamento é atualizado (PUT /api/appointments/:id)

Se o email não puder ser enviado, o agendamento será criado/atualizado normalmente, mas um aviso será registrado no console.

## Desativando o Serviço

Se você não deseja enviar emails, simplesmente deixe `SMTP_USER` e `SMTP_PASSWORD` vazios no arquivo `.env`.
