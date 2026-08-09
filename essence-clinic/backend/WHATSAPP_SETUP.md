# Configuração de Notificações via WhatsApp

O Essence Clinic usa a API do Twilio para enviar notificações de agendamento via WhatsApp.

## Setup Rápido

### 1. Criar Conta no Twilio

1. Acesse [twilio.com](https://www.twilio.com)
2. Crie uma conta gratuita
3. Vá para o [Console do Twilio](https://console.twilio.com/)
4. Copie seu **Account SID** e **Auth Token**

### 2. Ativar WhatsApp Sandbox

1. No console do Twilio, vá para **Messaging > Try it out > Send an SMS**
2. Clique em **WhatsApp** no menu lateral
3. Clique em **Sandbox**
4. Siga as instruções para ativar o sandbox
5. Copie o número de telefone do sandbox (será algo como `+1234567890`)

### 3. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env` do backend:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=+1234567890
```

### 4. Conectar Seu Número

1. No sandbox do WhatsApp do Twilio
2. Envie uma mensagem para o número indicado com o código fornecido
3. Você receberá confirmação

## Mensagens Enviadas

### Confirmação de Agendamento

Quando um agendamento é criado ou atualizado, o paciente recebe:

```
Olá João Silva! 👋

Seu agendamento foi confirmado com sucesso! ✅

📋 Detalhes do Agendamento:
👨‍⚕️ Profissional: Dr. Roberto
📅 Data: quinta-feira, 30 de julho de 2026
🕐 Hora: 14:00
🏥 Clínica: Essence Clinic

Se precisar cancelar ou reagendar, entre em contato conosco com antecedência.

Até logo! 😊
```

### Cancelamento de Agendamento

Quando um agendamento é cancelado, o paciente recebe:

```
Olá João Silva! 👋

Seu agendamento foi cancelado. ❌

📋 Agendamento Cancelado:
👨‍⚕️ Profissional: Dr. Roberto
📅 Data: quinta-feira, 30 de julho de 2026
🕐 Hora: 14:00

Para reagendar, entre em contato conosco.

Obrigado! 😊
```

## Números de Telefone

Os números dos pacientes devem ser armazenados no campo `phone` da tabela `clients`.

**Formato aceito:**
- `+55 11 98765-4321` ✅
- `+5511987654321` ✅
- `11 98765-4321` (será convertido para +5511987654321)
- `(11) 98765-4321` ✅

## Desativar Notificações

Se você não deseja enviar mensagens WhatsApp, simplesmente deixe as variáveis vazias no `.env`:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

O sistema continuará funcionando normalmente, apenas sem enviar as notificações.

## Troubleshooting

### "WhatsApp service not configured"
- Verifique se `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN` estão definidos no `.env`
- Reinicie o servidor backend

### "Message delivery failed"
- Verifique se o número de telefone está no formato correto
- Certifique-se de que o sandbox está ativado
- Verifique se você enviou a mensagem de ativação para o número do Twilio

### Versão Produção

Para usar em produção, você precisará:

1. Upgrade da conta do Twilio (paga)
2. Usar um número de WhatsApp Business ou comprar um número Twilio
3. Atualizar `TWILIO_WHATSAPP_FROM` para o número produção
4. Atualizar credenciais de produção

## Referências

- [Documentação Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
