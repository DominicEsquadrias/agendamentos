/**
 * Valida se um endereço é válido usando a API do Google Maps.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} address - Endereço para validar
 * @returns {boolean} True se o endereço é válido, false caso contrário
 */
function validateAddress(address) {
  if (!address || address.trim().length < 10) {
    return false;
  }

  try {
    // Usar a API de Geocoding do Google Maps para validar o endereço
    const geocoder = Maps.newGeocoder();
    const response = geocoder.geocode({
      address: address.trim(),
      region: "BR", // Priorizar resultados do Brasil
    });

    return (
      response.status === "OK" &&
      response.results &&
      response.results.length > 0
    );
  } catch (error) {
    console.error("Erro ao validar endereço:", error);
    return false;
  }
}

/**
 * Determina qual calendário usar baseado na equipe selecionada.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} teamName - Nome da equipe
 * @returns {Object} Informações do calendário (id e nome)
 */
function getCalendarByTeam(teamName) {
  const calendars = {
    "MONTAGEM A": {
      id: "30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com",
      name: "Agenda Instalações",
    },
    "MONTAGEM B": {
      id: "30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com",
      name: "Agenda Instalações",
    },
    ENTREGA: {
      id: "30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com",
      name: "Agenda Instalações",
    },
    VIDRAÇARIA: {
      id: "q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com",
      name: "Agenda Vidraçaria",
    },
    SERRALHERIA: {
      id: "st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com",
      name: "Agenda Serralheria",
    },
  };

  // Verificar se a equipe tem um calendário específico
  for (const [key, calendar] of Object.entries(calendars)) {
    if (teamName.toUpperCase().includes(key)) {
      return calendar;
    }
  }

  throw new Error(`Calendário não encontrado para a equipe: ${teamName}`);
}

/**
 * Cria um evento único em um calendário específico.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {Object} eventData - Dados do evento
 * @returns {string} ID do evento criado
 */
function createSingleCalendarEvent(eventData) {
  try {
    const calendar = CalendarApp.getCalendarById(eventData.calendarId);

    if (!calendar) {
      throw new Error(`Calendário não encontrado: ${eventData.calendarId}`);
    }

    const event = calendar.createEvent(
      eventData.title,
      eventData.startTime,
      eventData.endTime,
      {
        description: eventData.description,
        location: eventData.location,
      }
    );

    // Aplicar cor baseada na equipe
    applyEventColor(event, eventData.title);

    return event.getId();
  } catch (error) {
    console.error("Erro ao criar evento no calendário:", error);
    throw new Error(`Erro ao criar evento: ${error.message}`);
  }
}

/**
 * Interface para deletar agendamento - solicita ID via prompt.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 */
function promptDeleteAppointment() {
  try {
    const appointmentId = Browser.inputBox(
      "Deletar Agendamento",
      "Digite o ID do agendamento que deseja deletar (ex: AGT-12345678):",
      Browser.Buttons.OK_CANCEL
    );

    if (appointmentId === "cancel" || !appointmentId) {
      Browser.msgBox(
        "Operação Cancelada",
        "Nenhum agendamento foi deletado.",
        Browser.Buttons.OK
      );
      return;
    }

    // Validar formato do ID
    if (!appointmentId.match(/^AGT-[a-fA-F0-9]{8}$/)) {
      Browser.msgBox(
        "ID Inválido",
        "O ID do agendamento deve estar no formato AGT-xxxxxxxx (8 caracteres alfanuméricos)",
        Browser.Buttons.OK
      );
      return;
    }

    deleteAppointment(appointmentId);
  } catch (error) {
    console.error("Erro na interface de deleção:", error);
    Browser.msgBox("Erro", `Erro: ${error.message}`, Browser.Buttons.OK);
  }
}

/**
 * Salva um registro de agendamento na planilha e cria o evento no Google Agenda.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {Object} formData - Dados do formulário de agendamento
 * @returns {Object} Resultado da operação com ID do agendamento e nome do calendário
 */
function saveAppointmentRecord(formData) {
  try {
    // Validar dados obrigatórios
    if (
      !formData.projectId ||
      !formData.appointmentDescription ||
      !formData.teamName ||
      !formData.appointmentStartTime ||
      !formData.appointmentEndTime ||
      !formData.address
    ) {
      throw new Error("Dados obrigatórios não fornecidos.");
    }

    // Validar datas
    const startTime = new Date(formData.appointmentStartTime);
    const endTime = new Date(formData.appointmentEndTime);

    if (endTime <= startTime) {
      throw new Error("Data e hora de término deve ser posterior ao início.");
    }

    // Gerar UUID e ID do agendamento
    const uuid = Utilities.getUuid();
    const appointmentId = getIdentifier(uuid, "AGT");

    // Inserir nova linha no início dos dados (empurra dados existentes para baixo)
    shAGENDAMENTOS.insertRows(START_ROW, 1);
    const insertRow = START_ROW; // Sempre inserir na linha 4 (primeiro registro)

    // Determinar qual calendário usar baseado na equipe
    const calendarInfo = getCalendarByTeam(formData.teamName);

    // Criar evento no Google Agenda
    const eventId = createSingleCalendarEvent({
      title: `${formData.projectNumber} - (${formData.teamName}) - ${formData.projectName}`,
      description: `#AGENDAMENTO(${appointmentId})\n\nNOME DO CLIENTE: ${formData.clientName}\nCONTATO: ${formData.phone}\nDESCRIÇÃO DO SERVIÇO: ${formData.appointmentDescription}`,
      location: formData.address,
      startTime: startTime,
      endTime: endTime,
      calendarId: calendarInfo.id,
    });

    // Preencher dados na planilha (colunas A até O)
    const rowData = [
      [uuid], // A - UUID
      [formData.projectId], // B - PROJECT_ID
      [appointmentId], // C - ID
      [Utilities.formatDate(new Date(), TZ, "dd/MM/yyyy HH:mm:ss")], // D - PROJECT_APPROVAL_DATE
      [formData.projectNumber], // E - PROJECT_NUMBER
      [formData.clientName], // F - CLIENT_NAME
      [formData.projectName], // G - PROJECT_NAME
      [formData.phone], // H - PHONE
      [formData.address], // I - ADDRESS
      [formData.projectStep], // J - PROJECT_STEP
      [formData.appointmentDescription], // K - APPOINTMENT_DESCRIPTION
      [formData.teamName], // L - TEAM_NAME
      [Utilities.formatDate(new Date(startTime), TZ, "dd/MM/yyyy HH:mm:ss")], // M - APPOINTMENT_START_TIME
      [Utilities.formatDate(new Date(endTime), TZ, "dd/MM/yyyy HH:mm:ss")], // N - APPOINTMENT_END_TIME
      [eventId], // O - APPOINTMENT_CALENDAR_ID
      [],
      [],
      [],
      [formData.projectObs],
    ];

    // Inserir dados na planilha
    const range = shAGENDAMENTOS.getRange(
      insertRow,
      COLUMNS.UUID.number,
      1,
      19
    );
    range.setValues([rowData.map((cell) => cell[0])]);

    return {
      success: true,
      appointmentId: appointmentId,
      calendarName: calendarInfo.name,
      eventId: eventId,
      row: insertRow,
    };
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    throw new Error(`Erro ao salvar agendamento: ${error.message}`);
  }
}

/**
 * Atualiza o status de envio de um agendamento e preenche as colunas restantes.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {Object} statusData - Dados do status a atualizar
 * @returns {Object} Resultado da operação
 */
function updateAppointmentStatus(statusData) {
  try {
    // Validar dados obrigatórios
    if (!statusData.appointmentId || !statusData.status) {
      throw new Error("ID do agendamento e status são obrigatórios.");
    }

    // Encontrar a linha do agendamento
    const appointmentRow = findAppointmentRow(statusData.appointmentId);
    if (!appointmentRow) {
      throw new Error("Agendamento não encontrado.");
    }

    // Buscar dados do projeto para observações
    const projectData = getProjectData(statusData.projectId);
    if (!projectData) {
      throw new Error("Dados do projeto não encontrados.");
    }

    // Calcular data limite (3 dias úteis a partir da data de aprovação)
    const approvalDate = new Date(appointmentRow.approvalDate);
    const insertionDeadline = addBusinessDays(approvalDate, 3);
    const sentDate = appointmentRow.sentDate;

    // Preparar dados para atualização
    const updateData = [];

    // P16 - APPOINTMENT_SENT_STATUS
    updateData.push([statusData.status]);

    // Q17 - APPOINTMENT_INSERTION_DEADLINE
    updateData.push([
      Utilities.formatDate(insertionDeadline, TZ, "dd/MM/yyyy HH:mm:ss"),
    ]);

    // R18 - APPOINTMENT_SENT_DATE (apenas se status = "ENVIADO")
    const newSentDate =
      sentDate === "" && statusData.status === "ENVIADO"
        ? Utilities.formatDate(new Date(), TZ, "dd/MM/yyyy HH:mm:ss")
        : Utilities.formatDate(sentDate, TZ, "dd/MM/yyyy HH:mm:ss");
    updateData.push([newSentDate]);

    // S19 - PROJECT_OBS (observações do projetista)
    updateData.push([projectData.obs || ""]);

    // Atualizar a planilha (colunas P16 até S19)
    const range = shAGENDAMENTOS.getRange(
      appointmentRow.rowNumber,
      COLUMNS.APPOINTMENT_SENT_STATUS.number,
      1,
      4
    );
    range.setValues([updateData.map((cell) => cell[0])]);

    return {
      appointmentId: statusData.appointmentId,
      status: statusData.status,
    };
  } catch (error) {
    console.error("Erro ao atualizar status do agendamento:", error);
    throw new Error(`Erro ao atualizar status: ${error.message}`);
  }
}

/**
 * Deleta um agendamento da planilha e do Google Calendar.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} appointmentId - ID do agendamento (AGT-xxxxxxxx)
 * @returns {Object} Resultado da operação
 */
function deleteAppointment(appointmentId) {
  try {
    // Validar dados obrigatórios
    if (!appointmentId) {
      throw new Error("ID do agendamento é obrigatório.");
    }

    // Encontrar a linha do agendamento
    const appointmentRow = findAppointmentRow(appointmentId);
    if (!appointmentRow) {
      throw new Error("Agendamento não encontrado.");
    }

    // Mostrar informações do agendamento e pedir confirmação
    const infoMessage =
      "ID: " +
      appointmentRow.appointmentId +
      "\n" +
      "Cliente: " +
      appointmentRow.clientName +
      "\n" +
      "Projeto: " +
      appointmentRow.projectName +
      "\n" +
      "Equipe: " +
      appointmentRow.teamName +
      "\n" +
      "Data/Hora(Início): " +
      Utilities.formatDate(
        new Date(appointmentRow.appointmentStartTime),
        TZ,
        "dd/MM/yyyy HH:mm"
      ) +
      "\n" +
      "Data/Hora(Término): " +
      Utilities.formatDate(
        new Date(appointmentRow.appointmentEndTime),
        TZ,
        "dd/MM/yyyy HH:mm"
      ) +
      "\n\n" +
      "CONFIRME NA TELA SEGUINTE";

    SpreadsheetApp.getUi().alert(
      "AGENDAMENTO A SER DELETADO:",
      infoMessage,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    const userConfirmed =
      Browser.msgBox(
        "Deletar Agendamento - (ATENÇÃO) Esta ação não pode ser desfeita!",
        "Confirma a exclusão do agendamento? ",
        Browser.Buttons.YES_NO
      ) === "yes";

    if (!userConfirmed) {
      return {
        success: false,
        message: "Operação cancelada pelo usuário.",
      };
    }

    // Deletar evento do Google Calendar se existir
    if (appointmentRow.calendarId) {
      const teamCalendarInfo = getCalendarByTeam(appointmentRow.teamName);
      const calendar = CalendarApp.getCalendarById(teamCalendarInfo.id);
      if (calendar) {
        const event = calendar.getEventById(appointmentRow.calendarId);
        if (event) {
          event.deleteEvent();
        }
      }
    }

    // Deletar linha da planilha
    shAGENDAMENTOS.deleteRow(appointmentRow.rowNumber);

    Browser.msgBox(
      "Sucesso",
      `Agendamento ${appointmentId} deletado com sucesso!`,
      Browser.Buttons.OK
    );

    return {
      success: true,
      appointmentId: appointmentId,
      message: "Agendamento deletado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    Browser.msgBox(
      "Erro",
      `Erro ao deletar agendamento: ${error.message}`,
      Browser.Buttons.OK
    );
    throw new Error(`Erro ao deletar agendamento: ${error.message}`);
  }
}

/**
 * Salva feedback de projeto nas colunas T20-Y25.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {Object} feedbackData - Dados do feedback
 * @returns {Object} Resultado da operação
 */
function saveProjectFeedback(feedbackData) {
  try {
    // Validar dados obrigatórios
    if (!feedbackData.appointmentId || !feedbackData.feedbackType) {
      throw new Error("ID do agendamento e tipo de feedback são obrigatórios.");
    }

    // Validar regex do ID de retorno se fornecido
    if (
      feedbackData.returnAppointmentId &&
      !feedbackData.returnAppointmentId.match(/^AGT-[a-fA-F0-9]{8}$/)
    ) {
      throw new Error(
        "ID do agendamento de retorno deve estar no formato AGT-xxxxxxxx (8 caracteres alfanuméricos)."
      );
    }

    // Encontrar a linha do agendamento
    const appointmentRow = findAppointmentRowExtended(
      feedbackData.appointmentId
    );
    if (!appointmentRow) {
      throw new Error("Agendamento não encontrado.");
    }

    // Validar se o agendamento foi enviado (P16 = "ENVIADO")
    if (appointmentRow.sentStatus !== "ENVIADO") {
      throw new Error(
        "Só é possível registrar feedback para agendamentos com status ENVIADO."
      );
    }

    // Validar regras de negócio
    if (
      feedbackData.feedbackType === "NEGATIVO" &&
      !feedbackData.returnAppointmentId
    ) {
      throw new Error(
        "Para feedback NEGATIVO é obrigatório informar o ID do agendamento de retorno."
      );
    }

    const currentDate = new Date();
    const updateData = [];

    // T20 - PROJECT_FEEDBACK
    updateData.push([feedbackData.feedbackType]);

    // U21 - PROJECT_RETURN_FEEDBACK (só preenche se feedback NEGATIVO e ID fornecido)
    const returnFeedback =
      feedbackData.feedbackType === "NEGATIVO" &&
      feedbackData.returnAppointmentId
        ? feedbackData.returnAppointmentId
        : "";
    updateData.push([returnFeedback]);

    // V22 - PROJECT_DEADLINE (data de finalização)
    // Regra: preenche se POSITIVO, SEM RETORNO, ou se NEGATIVO com ID de retorno
    const shouldFillDeadline =
      feedbackData.feedbackType === "POSITIVO" ||
      feedbackData.feedbackType === "SEM RETORNO" ||
      (feedbackData.feedbackType === "NEGATIVO" &&
        feedbackData.returnAppointmentId);

    const projectDeadline = shouldFillDeadline
      ? Utilities.formatDate(currentDate, TZ, "dd/MM/yyyy HH:mm:ss")
      : "";
    updateData.push([projectDeadline]);

    // W23 - OBS (observações)
    updateData.push([feedbackData.observations || ""]);

    // X24 - PROJECT_FEEDBACK_DATE (data do feedback - sempre preenche)
    updateData.push([
      Utilities.formatDate(currentDate, TZ, "dd/MM/yyyy HH:mm:ss"),
    ]);

    // Y25 - PROJECT_FEEDBACK_RETURN_DATE (data de retorno - só se ID de retorno foi fornecido)
    const feedbackReturnDate = feedbackData.returnAppointmentId
      ? Utilities.formatDate(currentDate, TZ, "dd/MM/yyyy HH:mm:ss")
      : "";
    updateData.push([feedbackReturnDate]);

    // Atualizar a planilha (colunas T20 até Y25)
    const range = shAGENDAMENTOS.getRange(
      appointmentRow.rowNumber,
      COLUMNS.PROJECT_FEEDBACK.number,
      1,
      6
    );
    range.setValues([updateData.map((cell) => cell[0])]);

    return {
      appointmentId: feedbackData.appointmentId,
      feedbackType: feedbackData.feedbackType,
      returnAppointmentId: feedbackData.returnAppointmentId,
      projectDeadline: projectDeadline,
    };
  } catch (error) {
    console.error("Erro ao salvar feedback do projeto:", error);
    throw new Error(`Erro ao salvar feedback: ${error.message}`);
  }
}

/**
 * Obtém lista de agendamentos para registro de feedback.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @returns {Array} Lista de agendamentos com dados completos
 */
function getAppointmentsForFeedback() {
  try {
    const range = shAGENDAMENTOS.getRange(`A${START_ROW}:Y`).getValues();

    return range
      .filter((row) => row[0] && row[0].toString().trim() !== "") // Filtra linhas com UUID
      .filter((row) => row[15] === "ENVIADO") // Só mostra agendamentos com status ENVIADO
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
        projectFeedback: row[19], // T - PROJECT_FEEDBACK
        projectReturnFeedback: row[20], // U - PROJECT_RETURN_FEEDBACK
        projectDeadline: String(row[21]), // V - PROJECT_DEADLINE
        obs: row[22], // W - OBS
        projectFeedbackDate: String(row[23]), // X - PROJECT_FEEDBACK_DATE
        projectFeedbackReturnDate: String(row[24]), // Y - PROJECT_FEEDBACK_RETURN_DATE
      }));
  } catch (error) {
    console.error("Erro ao obter agendamentos para feedback:", error);
    throw error;
  }
}

/**
 * Encontra a linha de um agendamento específico pelo ID (versão estendida com todas as colunas).
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} appointmentId - ID do agendamento
 * @returns {Object|null} Dados da linha do agendamento ou null se não encontrado
 */
function findAppointmentRowExtended(appointmentId) {
  try {
    const range = shAGENDAMENTOS.getRange(`A${START_ROW}:Y`).getValues();

    for (let i = 0; i < range.length; i++) {
      const row = range[i];
      if (row[2] === appointmentId) {
        // Coluna C - ID do agendamento
        return {
          rowNumber: START_ROW + i,
          uuid: row[0], // A - UUID
          projectId: row[1], // B - PROJECT_ID
          appointmentId: row[2], // C - ID
          approvalDate: row[3], // D - PROJECT_APPROVAL_DATE
          projectNumber: row[4], // E - PROJECT_NUMBER
          clientName: row[5], // F - CLIENT_NAME
          projectName: row[6], // G - PROJECT_NAME
          phone: row[7], // H - PHONE
          address: row[8], // I - ADDRESS
          projectStep: row[9], // J - PROJECT_STEP
          appointmentDescription: row[10], // K - APPOINTMENT_DESCRIPTION
          teamName: row[11], // L - TEAM_NAME
          appointmentStartTime: row[12], // M - APPOINTMENT_START_TIME
          appointmentEndTime: row[13], // N - APPOINTMENT_END_TIME
          calendarId: row[14], // O - APPOINTMENT_CALENDAR_ID
          sentStatus: row[15], // P - APPOINTMENT_SENT_STATUS
          insertionDeadline: row[16], // Q - APPOINTMENT_INSERTION_DEADLINE
          sentDate: row[17], // R - APPOINTMENT_SENT_DATE
          projectObs: row[18], // S - PROJECT_OBS
          projectFeedback: row[19], // T - PROJECT_FEEDBACK
          projectReturnFeedback: row[20], // U - PROJECT_RETURN_FEEDBACK
          projectDeadline: row[21], // V - PROJECT_DEADLINE
          obs: row[22], // W - OBS
          projectFeedbackDate: row[23], // X - PROJECT_FEEDBACK_DATE
          projectFeedbackReturnDate: row[24], // Y - PROJECT_FEEDBACK_RETURN_DATE
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return null;
  }
}

/**
 * Encontra a linha de um agendamento específico pelo ID.
 *
 * @since 1.0.0
 * @author Lucas Vieira
 * @param {string} appointmentId - ID do agendamento
 * @returns {Object|null} Dados da linha do agendamento ou null se não encontrado
 */
function findAppointmentRow(appointmentId) {
  try {
    const range = shAGENDAMENTOS.getRange(`A${START_ROW}:S`).getValues();

    for (let i = 0; i < range.length; i++) {
      const row = range[i];
      if (row[2] === appointmentId) {
        // Coluna C - ID do agendamento
        return {
          rowNumber: START_ROW + i,
          uuid: row[0], // A - UUID
          projectId: row[1], // B - PROJECT_ID
          appointmentId: row[2], // C - ID
          approvalDate: row[3], // D - PROJECT_APPROVAL_DATE
          projectNumber: row[4], // E - PROJECT_NUMBER
          clientName: row[5], // F - CLIENT_NAME
          projectName: row[6], // G - PROJECT_NAME
          phone: row[7], // H - PHONE
          address: row[8], // I - ADDRESS
          projectStep: row[9], // J - PROJECT_STEP
          appointmentDescription: row[10], // K - APPOINTMENT_DESCRIPTION
          teamName: row[11], // L - TEAM_NAME
          appointmentStartTime: row[12], // M - APPOINTMENT_START_TIME
          appointmentEndTime: row[13], // N - APPOINTMENT_END_TIME
          calendarId: row[14], // O - APPOINTMENT_CALENDAR_ID
          sentStatus: row[15], // P - APPOINTMENT_SENT_STATUS
          insertionDeadline: row[16], // Q - APPOINTMENT_INSERTION_DEADLINE
          sentDate: row[17], // R - APPOINTMENT_SENT_DATE
          projectObs: row[18], // S - PROJECT_OBS
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return null;
  }
}
