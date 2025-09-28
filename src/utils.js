/**
 * Adiciona menu personalizado ao Google Sheets
 * @returns {void} Não retorna valor, ou modifica o estado do sistema
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🗓️ Agendamentos")
    .addItem("🔄 Criar Agendamentos", "onOpenAgendamentosCreate")
    .addItem("🔍 Gerenciar Agendamentos", "onOpenAgendamentosManage")
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

function onOpenAgendamentosManage() {
  SpreadsheetApp.getUi().alert(
    "Funcionalidade de gerenciamento em desenvolvimento."
  );
}

function onOpenAgendamentosDelete() {
  SpreadsheetApp.getUi().alert(
    "Funcionalidade de exclusão em desenvolvimento."
  );
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
 * Encontra a próxima linha disponível na planilha de agendamentos.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @returns {number} Número da próxima linha disponível
 */
function findNextAvailableRow() {
  const lastRow = shAGENDAMENTOS.getLastRow();
  return Math.max(lastRow + 1, START_ROW);
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
