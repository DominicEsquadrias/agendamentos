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
    ];

    // Inserir dados na planilha
    const range = shAGENDAMENTOS.getRange(
      insertRow,
      COLUMNS.UUID.number,
      1,
      15
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

  // Por padrão, usar calendário de instalações
  return calendars["MONTAGEM A"];
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
