# Sistema de Agendamentos - Dominic Esquadrias

Sistema integrado de agendamentos que conecta projetos aprovados com o Google Agenda através de uma interface web moderna.

## 🚀 Funcionalidades

### ✅ Implementado

#### 📝 Criação de Agendamentos

- **Interface Web Moderna**: Formulário HTML responsivo com Tailwind CSS
- **Integração com Projetos**: Carrega automaticamente projetos aprovados da planilha PROJETOS
- **Validação de Endereços**: Valida endereços usando Google Maps API
- **Criação Automática de Eventos**: Cria eventos no Google Agenda baseado na equipe selecionada
- **Múltiplos Calendários**: Suporte para calendários de Instalação, Vidraçaria e Serralheria
- **Validação em Tempo Real**: Formulário com validação dinâmica
- **Máscaras de Input**: Formatação automática de telefone
- **Feedback Visual**: Loading states e validação de endereços
- **🔄 Sincronização Atômica**: Garantia de que eventos e registros sejam criados simultaneamente
- **🔙 Rollback Automático**: Desfaz operações em caso de falha para manter integridade
- **✅ Verificação de Integridade**: Verifica consistência entre planilha e calendários
- **🔧 Correção Automática**: Recria eventos ausentes automaticamente
- **📤 Inserção no Início**: Novos agendamentos são inseridos no topo da planilha

#### 📊 Atualização de Status

- **Interface de Gerenciamento**: Formulário dedicado para atualizar status dos agendamentos
- **Filtros Avançados**: Busca por ID, cliente, projeto e filtros por status/equipe
- **Cálculo Automático de Prazos**: Data limite calculada automaticamente (3 dias úteis)
- **Integração com Projetos**: Observações do projetista copiadas automaticamente
- **Data de Envio Automática**: Registra data/hora quando status = "ENVIADO"
- **Visual de Prazos**: Indicadores visuais para prazos vencidos e próximos do vencimento
- **Preenchimento Completo**: Preenche colunas P16-S19 automaticamente

#### 💬 Feedback de Projetos

- **Registro de Feedback**: Interface dedicada para registrar feedback dos clientes
- **Tipos de Feedback**: POSITIVO, NEGATIVO, SEM RETORNO
- **Validação Condicional**: ID de retorno obrigatório apenas para feedback NEGATIVO
- **Restrição de Acesso**: Apenas agendamentos com status "ENVIADO" podem receber feedback
- **Datas Automáticas**: Registro automático de datas de feedback e retorno
- **Regras de Finalização**: Data de finalização baseada no tipo de feedback
- **Filtros Inteligentes**: Busca e filtros por feedback, equipe e projeto
- **Observações**: Campo livre para observações sobre o feedback
- **Validação de IDs**: Validação do formato AGT-xxxxxxxx para IDs de retorno

### 🔄 Em Desenvolvimento

- Exclusão de agendamentos
- Relatórios de agendamentos
- Notificações automáticas

## 📋 Estrutura do Sistema

### Arquivos Principais

- **`src/agendamentos.html`**: Interface web para criação de agendamentos
- **`src/agendamentos_status.html`**: Interface web para atualização de status
- **`src/agendamentos_feedback.html`**: Interface web para registro de feedback
- **`src/agendamentos_managment.js`**: Funções de gerenciamento de agendamentos
- **`src/utils.js`**: Funções utilitárias e lógica de negócio
- **`src/GLOBAL_CONST.js`**: Constantes globais e mapeamento de colunas
- **`src/appsscript.json`**: Configuração do projeto e macros

### Colunas da Planilha

#### Colunas Principais (A-O)

| Coluna | Campo                   | Descrição                                   |
| ------ | ----------------------- | ------------------------------------------- |
| A      | UUID                    | Identificador único universal               |
| B      | PROJECT_ID              | ID do projeto aprovado                      |
| C      | ID                      | Identificador do agendamento (AGT-xxxxxxxx) |
| D      | PROJECT_APPROVAL_DATE   | Data de aprovação/criação                   |
| E      | PROJECT_NUMBER          | Número do projeto                           |
| F      | CLIENT_NAME             | Nome do cliente                             |
| G      | PROJECT_NAME            | Nome da obra                                |
| H      | PHONE                   | Telefone de contato                         |
| I      | ADDRESS                 | Endereço do agendamento                     |
| J      | PROJECT_STEP            | Etapa do projeto                            |
| K      | APPOINTMENT_DESCRIPTION | Descrição do serviço                        |
| L      | TEAM_NAME               | Nome da equipe responsável                  |
| M      | APPOINTMENT_START_TIME  | Data/hora de início                         |
| N      | APPOINTMENT_END_TIME    | Data/hora de término                        |
| O      | APPOINTMENT_CALENDAR_ID | ID do evento no Google Agenda               |

#### Colunas de Status e Controle (P-S)

| Coluna | Campo                          | Descrição                                        |
| ------ | ------------------------------ | ------------------------------------------------ |
| P      | APPOINTMENT_SENT_STATUS        | Status do envio (ENVIADO ou vazio)               |
| Q      | APPOINTMENT_INSERTION_DEADLINE | Data limite para realização (3 dias úteis)       |
| R      | APPOINTMENT_SENT_DATE          | Data/hora do envio (automático se ENVIADO)       |
| S      | PROJECT_OBS                    | Observações do projetista (da planilha projetos) |

#### Colunas de Feedback (T-Y)

| Coluna | Campo                        | Descrição                                        |
| ------ | ---------------------------- | ------------------------------------------------ |
| T      | PROJECT_FEEDBACK             | Tipo de feedback (POSITIVO/NEGATIVO/SEM RETORNO) |
| U      | PROJECT_RETURN_FEEDBACK      | ID do agendamento de retorno (só para NEGATIVO)  |
| V      | PROJECT_DEADLINE             | Data de finalização do projeto                   |
| W      | OBS                          | Observações sobre o feedback                     |
| X      | PROJECT_FEEDBACK_DATE        | Data de registro do feedback (automático)        |
| Y      | PROJECT_FEEDBACK_RETURN_DATE | Data de registro do retorno (automático)         |

#### Regras de Preenchimento

##### Status (P-S)

- **Coluna P16**: Preenchida manualmente através do formulário de status
- **Coluna Q17**: Calculada automaticamente (data de aprovação + 3 dias úteis)
- **Coluna R18**: Preenchida automaticamente quando status = "ENVIADO"
- **Coluna S19**: Copiada automaticamente da planilha de projetos (coluna L)

##### Feedback (T-Y)

- **Restrição**: Apenas agendamentos com status "ENVIADO" (P16) podem receber feedback
- **Coluna T20**: Preenchida manualmente (POSITIVO/NEGATIVO/SEM RETORNO)
- **Coluna U21**: Obrigatória apenas para feedback NEGATIVO
- **Coluna V22**: Preenchida automaticamente conforme regras:
  - POSITIVO ou SEM RETORNO: data atual
  - NEGATIVO: apenas se U21 estiver preenchido
- **Coluna W23**: Campo livre para observações
- **Coluna X24**: Preenchida automaticamente quando T20 é definido
- **Coluna Y25**: Preenchida automaticamente quando U21 é definido

## 🗓️ Calendários Integrados

### Mapeamento por Equipe

- **MONTAGEM A/B, ENTREGA**: Agenda Instalações
- **VIDRAÇARIA**: Agenda Vidraçaria
- **SERRALHERIA**: Agenda Serralheria

### Cores dos Eventos

- **MONTAGEM A**: Cor 11 (Azul)
- **MONTAGEM B**: Cor 9 (Verde)
- **SERRALHERIA**: Cor 10 (Vermelho)
- **ENTREGA**: Cor 5 (Amarelo)
- **VIDRAÇARIA**: Cor 6 (Laranja)

## 📱 Como Usar

### 1. Acessar o Sistema

No Google Sheets, acesse o menu **🗓️ Agendamentos** com as seguintes opções:

- **🗓️ Criar Agendamentos**: Formulário para novos agendamentos
- **📝 Adicionar Status de Agendamento**: Atualizar status de envio
- **💬 Registrar Feedback de Projetos**: Registrar feedback dos clientes
- **🗑️ Excluir Agendamentos**: Deletar agendamentos

### 2. Preencher Formulário

1. **Selecionar Projeto**: Escolha um projeto aprovado da lista
2. **Definir Etapa**: Descreva qual etapa será executada
3. **Detalhar Serviço**: Forneça descrição completa do agendamento
4. **Escolher Equipe**: Selecione a equipe responsável
5. **Definir Horários**: Configure data/hora de início e fim
6. **Validar Endereço**: O sistema valida automaticamente
7. **Confirmar Telefone**: Número de contato formatado

### 3. Criação Automática (Atômica)

- ✅ **PASSO 1**: Evento criado no Google Agenda
- ✅ **PASSO 2**: Registro salvo na planilha simultaneamente
- ✅ **PASSO 3**: Formatação aplicada automaticamente
- ✅ **PASSO 4**: Status marcado como "CRIADO"
- ✅ ID único gerado (AGT-xxxxxxxx)
- ✅ Rollback automático em caso de falha
- ✅ Notificação de sucesso com confirmação

### 4. Verificar Integridade

No menu **🗓️ Agendamentos** → **🔍 Gerenciar Agendamentos**:

- Verifica consistência entre planilha e calendários
- Identifica eventos ausentes ou registros órfãos
- Oferece correção automática de inconsistências

## 🔧 Configuração Técnica

### Dependências Google Apps Script

```json
{
  "enabledAdvancedServices": [
    {
      "userSymbol": "Calendar",
      "version": "v3",
      "serviceId": "calendar"
    },
    {
      "userSymbol": "Maps",
      "version": "v1",
      "serviceId": "maps"
    }
  ]
}
```

### Permissões Necessárias

- ✅ Google Calendar API
- ✅ Google Maps API
- ✅ Google Sheets API

## 📝 Formato dos Eventos

### Título

```
[NÚMERO_PROJETO] - ([EQUIPE]) - [NOME_OBRA] # [ID_AGENDAMENTO]
```

### Descrição

```
NOME DO CLIENTE: [CLIENTE]
CONTATO: [TELEFONE]
DESCRIÇÃO DO SERVIÇO: [DESCRIÇÃO]
```

### Localização

```
[ENDEREÇO_VALIDADO]
```

## 🔍 Validações Implementadas

- ✅ Campos obrigatórios
- ✅ Datas (término > início)
- ✅ Endereços via Google Maps
- ✅ Formato de telefone
- ✅ Projetos aprovados existentes
- ✅ Equipes válidas

## 🚨 Tratamento de Erros

- **Endereço Inválido**: Aviso visual, permite prosseguir
- **Dados Obrigatórios**: Bloqueio do envio
- **Erro no Calendário**: Mensagem específica
- **Falha na Validação**: Feedback em tempo real

## 👨‍💻 Autor

**Lucas Vieira**  
Sistema desenvolvido para Dominic Esquadrias  
Versão: 1.0.0
