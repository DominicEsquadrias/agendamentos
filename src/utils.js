/**
 * Adiciona menu personalizado ao Google Sheets
 * @returns {void} Não retorna valor, ou modifica o estado do sistema
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🗓️ Agendamentos")
    .addItem("🗓️ Criar Agendamentos", "onOpenAgendamentosCreate")
    .addItem("📝 Adicionar Status de Agendamento", "onOpenAgendamentosStatus")
    .addItem(
      "💬 Registrar Feedback de Agendamento",
      "onOpenAgendamentosFeedback"
    )
    .addItem("🗑️ Excluir Agendamentos", "onOpenAgendamentosDelete")
    .addToUi();
}

/**
 * Funções para abrir os HTMLs de agendamentos.
 */
function onOpenAgendamentosCreate() {
  const html = HtmlService.createHtmlOutputFromFile("agendamentos")
    .setWidth(800)
    .setHeight(600)
    .setTitle("CRIAR AGENDAMENTO");

  SpreadsheetApp.getUi().showModalDialog(html, "Criar Agendamento");
}

function onOpenAgendamentosDelete() {
  promptDeleteAppointment();
}

/**
 * Abre o formulário de atualização de status de agendamentos.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 */
function onOpenAgendamentosStatus() {
  try {
    const html = HtmlService.createHtmlOutputFromFile("agendamentos_status")
      .setWidth(1200)
      .setHeight(800)
      .setTitle("Atualização de Status - Agendamentos");

    SpreadsheetApp.getUi().showModalDialog(
      html,
      "Atualização de Status - Agendamentos"
    );
  } catch (error) {
    console.error("Erro ao abrir formulário de status:", error);
    SpreadsheetApp.getUi().alert(
      "Erro",
      "Erro ao abrir o formulário de atualização de status: " + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Abre o formulário de registro de feedback de projetos.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 */
function onOpenAgendamentosFeedback() {
  try {
    const html = HtmlService.createHtmlOutputFromFile("agendamentos_feedback")
      .setWidth(1200)
      .setHeight(800)
      .setTitle("Feedback de Projetos - Agendamentos");

    SpreadsheetApp.getUi().showModalDialog(
      html,
      "Feedback de Projetos - Agendamentos"
    );
  } catch (error) {
    console.error("Erro ao abrir formulário de feedback:", error);
    SpreadsheetApp.getUi().alert(
      "Erro",
      "Erro ao abrir o formulário de feedback: " + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * Obtém dados de projetos aprovados da planilha PROJETOS externa.
 * Filtra registros com status "APROVADO" na coluna J e que ainda não possuem registro de compra.
 *
 * @example
 * getApprovedProjectsData() // returns todos os projetos aprovados disponíveis
 * getApprovedProjectsData("PRJ-12345678") // returns projeto específico se aprovado e disponível
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} [projectId] - ID específico do projeto para filtrar
 * @returns {Array} Array de arrays com dados dos projetos aprovados ou array vazio
 */
function getApprovedProjectsData(projectId) {
  const shPROJETOS = SpreadsheetApp.openById(
    "1RzCF7X6MDi7EELV8it38hVdeALPROrHchlzjfpQYtdM"
  ).getSheetByName("PROJETOS");

  if (!shPROJETOS) throw new Error("Planilha PROJETOS não encontrada.");

  return shPROJETOS
    .getRange("A4:N")
    .getValues()
    .filter((project) => {
      const isApproved = project[9] === "APROVADO"; // Coluna J (índice 9)
      const hasProjectId = project[2] && project[2].toString().trim() !== ""; // Coluna C - ID DO LANÇAMENTO
      const matchesFilter = !projectId || project[2] === projectId;
      const notInCompras = !hasExistingPurchaseRecord(project[2]);

      return isApproved && hasProjectId && matchesFilter && notInCompras;
    });
}

/**
 * Gera identificador único baseado nos primeiros 8 caracteres do UUID já gerado.
 * Formata como "AGT-" seguido pelos primeiros 8 dígitos do UUID fornecido.
 *
 * @example
 * getIdentifier("abc123def456") // returns "AGT-abc123de"
 * getIdentifier("12345678-abcd-efgh") // returns "AGT-12345678"
 * getIdentifier(null) // returns null
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} uuid - UUID do qual extrair o identificador
 * @param {string} [prefix="AGT"] - Prefixo para o identificador
 * @returns {string|null} Identificador formatado ou null se UUID inválido
 */
function getIdentifier(uuid, prefix = "AGT") {
  if (!uuid) return null;

  return `${prefix}-${uuid.substring(0, 8)}`;
}

function getPresets() {
  try {
    const shPRESETS = ss.getSheetByName("PRESETS");
    if (!shPRESETS) throw new Error("Aba PRESETS não encontrada.");

    const teamsData = shPRESETS.getRange("A2:A").getValues();
    const teams = teamsData
      .map((row) => row[0])
      .filter((value) => value && value.toString().trim() !== "");

    return {
      teams,
    };
  } catch (error) {
    console.error("Erro ao carregar presets:", error);
    throw error;
  }
}

/**
 * Verifica se já existe um registro de agendamento para o projeto especificado.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} projectId - ID do projeto para verificar
 * @returns {boolean} True se já existe registro, false caso contrário
 */
function hasExistingPurchaseRecord(projectId) {
  if (!projectId) return false;

  try {
    const range = shAGENDAMENTOS
      .getRange(
        `${COLUMNS.PROJECT_ID.letter}${START_ROW}:${COLUMNS.PROJECT_ID.letter}`
      )
      .getValues();
    return range.some((row) => row[0] === projectId);
  } catch (error) {
    console.error("Erro ao verificar registros existentes:", error);
    return false;
  }
}

/**
 * Obtém presets específicos para agendamentos incluindo projetos aprovados e equipes.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @returns {Object} Objeto com projetos e equipes disponíveis
 */
function getAppointmentPresets() {
  try {
    // Obter projetos aprovados
    const approvedProjects = getApprovedProjectsData();
    const projects = approvedProjects.map((project) => ({
      id: project[2], // ID DO PROJETO (coluna C)
      label: `(${project[2]}) ${project[4]}`, // ID DO PROJETO - NOME DA OBRA
      clientName: project[3], // NOME DO CLIENTE
      projectNumber: project[7], // NÚMERO DO PROJETO
      projectName: project[6], // NOME DA OBRA
      address: project[6], // ENDEREÇO
      phone: project[5], // TELEFONE
      projectObs: project[11], // OBSERVAÇÕES DO PROJETISTA
    }));

    // Obter equipes disponíveis
    const { teams } = getPresets();

    return {
      projects,
      teams,
    };
  } catch (error) {
    console.error("Erro ao carregar presets de agendamentos:", error);
    throw error;
  }
}

/**
 * Calcula a data de prazo limite baseada em dias úteis a partir de uma data inicial.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {Date} startDate - Data inicial para o cálculo
 * @param {number} businessDays - Número de dias úteis a adicionar
 * @returns {Date} Data final após adicionar os dias úteis
 */
function addBusinessDays(startDate, businessDays) {
  let result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1);
    // Se não é sábado (6) nem domingo (0), conta como dia útil
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      daysAdded++;
    }
  }

  return result;
}

/**
 * Busca dados específicos de um projeto na planilha externa.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} projectId - ID do projeto para buscar
 * @returns {Object|null} Dados do projeto ou null se não encontrado
 */
function getProjectData(projectId) {
  if (!projectId) return null;

  try {
    const shPROJETOS = SpreadsheetApp.openById(
      "1RzCF7X6MDi7EELV8it38hVdeALPROrHchlzjfpQYtdM"
    ).getSheetByName("PROJETOS");

    if (!shPROJETOS) throw new Error("Planilha PROJETOS não encontrada.");

    const range = shPROJETOS.getRange("A4:N").getValues();

    for (const project of range) {
      if (project[2] === projectId) {
        // Coluna C - ID DO PROJETO
        return {
          uuid: project[0], // Coluna A
          registrationDate: project[1], // Coluna B
          projectId: project[2], // Coluna C
          clientName: project[3], // Coluna D
          phone: project[4], // Coluna E
          address: project[5], // Coluna F
          projectName: project[6], // Coluna G
          projectNumber: project[7], // Coluna H
          projectAmount: project[8], // Coluna I
          status: project[9], // Coluna J
          approvalDate: project[10], // Coluna K
          obs: project[11], // Coluna L - OBSERVAÇÕES DO PROJETISTA
          contactDate: project[12], // Coluna M
          projectDescription: project[13], // Coluna N
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do projeto:", error);
    return null;
  }
}

/**
 * Obtém lista de agendamentos para atualização de status.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @returns {Array} Lista de agendamentos com dados básicos
 */
function getAppointmentsForStatusUpdate() {
  try {
    const range = shAGENDAMENTOS.getRange(`A${START_ROW}:S`).getValues();

    return range
      .filter((row) => row[0] && row[0].toString().trim() !== "") // Filtra linhas com UUID
      .map((row, index) => ({
        rowNumber: START_ROW + index,
        uuid: row[0], // A - UUID
        projectId: row[1], // B - PROJECT_ID
        appointmentId: row[2], // C - ID
        approvalDate: String(row[3]), // D - PROJECT_APPROVAL_DATE
        projectNumber: row[4], // E - PROJECT_NUMBER
        clientName: row[5], // F - CLIENT_NAME
        projectName: row[6], // G - PROJECT_NAME
        phone: row[7], // H - PHONE
        address: row[8], // I - ADDRESS
        projectStep: row[9], // J - PROJECT_STEP
        appointmentDescription: row[10], // K - APPOINTMENT_DESCRIPTION
        teamName: row[11], // L - TEAM_NAME
        appointmentStartTime: String(row[12]), // M - APPOINTMENT_START_TIME
        appointmentEndTime: String(row[13]), // N - APPOINTMENT_END_TIME
        calendarId: row[14], // O - APPOINTMENT_CALENDAR_ID
        sentStatus: row[15], // P - APPOINTMENT_SENT_STATUS
        insertionDeadline: String(row[16]), // Q - APPOINTMENT_INSERTION_DEADLINE
        sentDate: String(row[17]), // R - APPOINTMENT_SENT_DATE
        projectObs: row[18], // S - PROJECT_OBS
      }));
  } catch (error) {
    console.error("Erro ao obter agendamentos:", error);
    throw error;
  }
}

/**
 * Aplica cor ao evento baseado na equipe.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {CalendarEvent} event - Evento do calendário
 * @param {string} title - Título do evento
 */
function applyEventColor(event, title) {
  try {
    if (title.includes("(MONTAGEM A)")) event.setColor("11");
    else if (title.includes("(MONTAGEM B)")) event.setColor("9");
    else if (title.includes("(SERRALHERIA)")) event.setColor("10");
    else if (title.includes("(ENTREGA)")) event.setColor("5");
    else if (title.includes("(VIDRAÇARIA)")) event.setColor("6");
  } catch (error) {
    console.error("Erro ao aplicar cor ao evento:", error);
    // Não lançar erro aqui pois a cor é opcional
  }
}
