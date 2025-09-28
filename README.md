# Sistema de Agendamentos - Dominic Esquadrias

Sistema integrado de agendamentos que conecta projetos aprovados com o Google Agenda através de uma interface web moderna.

## 🚀 Funcionalidades

### ✅ Implementado

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

### 🔄 Em Desenvolvimento

- Gerenciamento de agendamentos existentes
- Exclusão de agendamentos
- Relatórios de agendamentos

## 📋 Estrutura do Sistema

### Arquivos Principais

- **`src/agendamentos.html`**: Interface web para criação de agendamentos
- **`src/utils.js`**: Funções utilitárias e lógica de negócio
- **`src/GLOBAL_CONST.js`**: Constantes globais e mapeamento de colunas
- **`src/googleCalendar.js`**: Funções existentes para manipulação de calendários

### Colunas da Planilha (A-O)

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

No Google Sheets, clique no menu **🗓️ Agendamentos** → **🔄 Criar Agendamentos**

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
