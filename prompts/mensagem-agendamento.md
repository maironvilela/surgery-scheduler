# 📋 Especificação Técnica: Sistema de Agendamento de Consultas com Envio Direto via WhatsApp (Next.js + Banco Relacional)

---

## 1. Visão Geral do Projeto
Desenvolver um módulo de agendamento de consultas médicas em **Next.js (App Router)** com **Banco de Dados Relacional** (PostgreSQL / MySQL / SQLite). 

Além da persistência e geração da mensagem, o sistema deve coletar o **WhatsApp do Paciente** e, ao clicar no botão de agendamento:
1. **Gravar o registro** no banco de dados.
2. **Copiar a mensagem** para a área de transferência.
3. **Abrir automaticamente o WhatsApp** (Web ou App móvel) diretamente na conversa do paciente com o texto da consulta já pré-carregado pronto para envio.

---

## 2. Stack Tecnológica Recomendada
- **Framework Web**: Next.js (App Router) com React e TypeScript.
- **Estilização**: Tailwind CSS.
- **Camada de Banco de Dados**: Prisma ORM ou Drizzle ORM.
- **Banco de Dados**: PostgreSQL, MySQL ou SQLite.
- **Comunicação Cliente-Servidor**: Server Actions ou API Route (`POST /api/appointments`).
- **Integração WhatsApp**: Deep Link oficial do WhatsApp (`https://wa.me/` com codificação URL) ou API de Mensageria (WhatsApp Business API / Evolution / Z-API).
- **Validação de Dados**: Zod para sanitização e validação de telefones e datas.

---

## 3. Modelagem do Banco de Dados Relacional

### Tabela: `appointments` (ou `consultas`)
- **`id`**: Identificador único universal (UUID ou CUID), Chave Primária (PK).
- **`patient_name`**: Nome completo do paciente (VARCHAR(255), Obrigatório).
- **`patient_phone`**: Número de WhatsApp/Telefone do paciente com DDD e código do país (VARCHAR(20), Obrigatório).
- **`doctor_name`**: Nome completo do médico (VARCHAR(255), Obrigatório).
- **`specialty`**: Especialidade médica mapeada (VARCHAR(255), Obrigatório).
- **`appointment_date`**: Data da consulta (Tipo DATE, Obrigatório).
- **`appointment_time`**: Horário da consulta (VARCHAR(10) ou TIME, Obrigatório).
- **`full_datetime_string`**: Data e horário por extenso (VARCHAR(255), Obrigatório).
- **`location_name`**: Nome do consultório/clínica (VARCHAR(255), Obrigatório).
- **`location_address`**: Endereço completo do local (TEXT, Obrigatório).
- **`from_website`**: Indicador se o paciente veio do site (BOOLEAN, Obrigatório, Padrão: `false`).
- **`whatsapp_message`**: Texto completo da mensagem gerada (TEXT, Obrigatório).
- **`whatsapp_sent`**: Indicador se o link do WhatsApp foi acionado (BOOLEAN, Padrão: `false`).
- **`status`**: Status do agendamento (ENUM: `'AGENDADO'`, `'CONFIRMADO'`, `'CANCELADO'`, `'REALIZADO'`, Padrão: `'AGENDADO'`).
- **`created_at`**: Data e hora de criação do registro (TIMESTAMP WITH TIME ZONE, Padrão: data atual).
- **`updated_at`**: Data e hora da última alteração (TIMESTAMP WITH TIME ZONE, Padrão: data atual).

### Índices Recomendados:
- Índice em `patient_phone` (para busca rápida por telefone).
- Índice em `appointment_date` (para filtros cronológicos).
- Índice em `doctor_name` (para relatórios por profissional).

---

## 4. Regras de Negócio e Mapeamentos Fixos

### 4.1. Sanitização do Número de WhatsApp
O formulário aceita números formatados como `(31) 98765-4321` ou `31987654321`. O sistema deve:
- Remover todos os caracteres não numéricos.
- Adicionar automaticamente o código do país do Brasil (`55`) caso não esteja presente (resultado: `5531987654321`).
- Validar se o número possui entre 10 e 13 dígitos numéricos válidos.

---

### 4.2. Mapeamento Automático: Médicos -> Especialidade
Ao selecionar o médico no formulário, a especialidade médica deve ser preenchida de forma 100% automática:
1. **Dr. Rômulo Oliveira** -> `Ortopedia (Especialista em Coluna)` *(Tratamento: ⚕️ Médico)*
2. **Dr. Sávio Laborne** -> `Ortopedia (Especialista em Coluna)` *(Tratamento: ⚕️ Médico)*
3. **Dr. Jader de Andrade** -> `Ortopedia (Especialista em Coluna)` *(Tratamento: ⚕️ Médico)*
4. **Dr. Tiago Falci** -> `Ortopedia (Especialista em Coluna)` *(Tratamento: ⚕️ Médico)*
5. **Dra. Iara Fernandes** -> `Reumatologia` *(Tratamento: ⚕️ Médica)*

---

### 4.3. Mapeamento Automático: Locais de Atendimento -> Endereço
Ao selecionar o consultório, o endereço completo é carregado e exibido automaticamente:
1. **Clínica CEOT** -> `Rua São Paulo, 1818, Lourdes - BH/MG`
2. **Ambulatório Mater Dei Contorno** -> `Avenida do Contorno, 9000, 19º Andar - Barro Preto - BH/MG`
3. **Mais Saúde Santo Agostinho** -> `Rua Bernardo Guimarães, 2785 - Santo Agostinho - BH/MG`
4. **Centro Médico Mater Dei - Nova Lima** -> `Alameda Oscar Niemeyer, 61 - Vila da Serra, Nova Lima - MG`
5. **Ambulatório Mater Dei Betim** -> `Via Expressa de Betim, 15500, Duque de Caxias - Betim/MG`
6. **Clínica Numai** -> `Avenida Coronel José Dias Bicalho, 928 - São Luiz/Pampulha - Belo Horizonte/MG`
7. **Clínica Centra** -> `Rua Inconfidência, 488 - 3° andar, Sala 301 - Centro de Betim/MG`
8. **Clínica Clinorto** -> `Av. Contorno, 5057 - Serra - BH/MG`
9. **Clínica Elcenter Barreiro** -> `Rua Alcindo Vieira, 305 - Barreiro - Belo Horizonte/MG`
10. **CEOFE - Contagem** -> `Av. José Faria da Rocha, 4458 - Eldorado, Contagem/MG`
11. **Biocor - Rede D'Or** -> `R. da Paisagem, 290 - Vila da Serra, Nova Lima/MG`

---

### 4.4. Regra de Formatação da Data por Extenso
A data selecionada (`YYYY-MM-DD`) e o horário (`HH:mm`) são convertidos no formato por extenso:
- *Exemplo*: `15 de setembro de 2026, Terça-Feira, às 14:40`

---

## 5. Estrutura Padrão da Mensagem para WhatsApp

```text
✅ Consulta Agendada com Sucesso!

Olá, [Nome do Paciente]! Seguem os detalhes do seu atendimento:

👤 Paciente: [Nome do Paciente] 
⚕️ Médico: [Nome do Médico] (ou ⚕️ Médica para Dra. Iara Fernandes)
🩺 Especialidade: [Especialidade Mapeada]

📅 Data e Horário: [Data por Extenso], às [Horário] 
🏥 Local: [Local de Atendimento] 
📍 Endereço: [Endereço Mapeado]

Ficamos muito felizes em poder cuidar de você! Qualquer dúvida sobre o trajeto ou documentação, estamos à disposição por aqui. 💙😊