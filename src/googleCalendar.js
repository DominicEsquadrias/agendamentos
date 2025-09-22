const log = console.log;

// CREATE EVENTS ON CALENDAR *******************************************************************************************************************************
async function createEventsOnCalendar(initialDate, finalDate, objectEvents = getObjectEventsFromSheet()) {
  const installationCalendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');
  const glassworksCalendar = CalendarApp.getCalendarById('q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com');
  const metalworkShopCalendar = CalendarApp.getCalendarById('st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com');

  const currentDate = new Date();

  initialDate = !initialDate ? new Date(`${currentDate.getFullYear().toString()}-01-01T00:00:00`) : initialDate;
  finalDate = !finalDate ? new Date (`${currentDate.getFullYear().toString()}-12-31T00:00:00`) : finalDate;

  const myEventsInstallationCalendar = installationCalendar.getEvents(initialDate, finalDate);
  const myEventsGlassworksCalendar = glassworksCalendar.getEvents(initialDate, finalDate);
  const myEventsMetalworkShopCalendar = metalworkShopCalendar.getEvents(initialDate, finalDate);

  //Agenda Instalações
  if (myEventsInstallationCalendar.length > 0) {
    let eventsID = [];

    myEventsInstallationCalendar.map(event => {
      let eventTitle = event.getTitle().split(' # ');
      let id = eventTitle[eventTitle.length-1];
      eventsID.push(parseInt(id));
    });

    Object.keys(objectEvents).forEach(eventObj => {
      let objectID = parseInt(objectEvents[eventObj].id);
      let isGlassworks = objectEvents[eventObj].isGlassworks;
      let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

      if(eventsID.includes(objectID) === false && !isGlassworks && !isMetalworkShop) {
       let startTime = new Date(objectEvents[eventObj].startTime);
       let endTime = new Date (objectEvents[eventObj].endTime);

        try {
         installationCalendar.createEvent(
            objectEvents[eventObj].title,
            startTime,
            endTime,
            {
              description: objectEvents[eventObj].description,
              location: objectEvents[eventObj].location,
            },
          );
        } catch(err) {Utilities.sleep(1000)};
      }
    });

  } else {
    Object.keys(objectEvents).forEach(eventObj => {
      let isGlassworks = objectEvents[eventObj].isGlassworks;
      let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

      if(!isGlassworks && !isMetalworkShop) {
        try {
          let startTime = new Date(objectEvents[eventObj].startTime);
          let endTime = new Date (objectEvents[eventObj].endTime);

          installationCalendar.createEvent(
            objectEvents[eventObj].title,
            startTime,
            endTime,
            {
              description: objectEvents[eventObj].description,
              location: objectEvents[eventObj].location,
            },
          );
        } catch(err) {Utilities.sleep(1000)}
      }
    });
  }

  //Agenda Vidraçaria
  if (myEventsGlassworksCalendar.length > 0) {
    let eventsID = [];

    myEventsGlassworksCalendar.map(event => {
      let eventTitle = event.getTitle().split(' # ');
      let id = eventTitle[eventTitle.length-1];
      eventsID.push(parseInt(id));
    });

    Object.keys(objectEvents).forEach(eventObj => {
      let objectID = parseInt(objectEvents[eventObj].id);
      let isGlassworks = objectEvents[eventObj].isGlassworks;
      let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

      if(eventsID.includes(objectID) === false && isGlassworks && !isMetalworkShop) {
       let startTime = new Date(objectEvents[eventObj].startTime);
       let endTime = new Date (objectEvents[eventObj].endTime);

        try {
          glassworksCalendar.createEvent(
            objectEvents[eventObj].title,
            startTime,
            endTime,
            {
              description: objectEvents[eventObj].description,
              location: objectEvents[eventObj].location,
            },
          );
        } catch(err) {Utilities.sleep(1000)};
      }
   });
  } else {
    Object.keys(objectEvents).forEach(eventObj => {
      let isGlassworks = objectEvents[eventObj].isGlassworks;
      let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

      if(isGlassworks && !isMetalworkShop) {
        try {
          let startTime = new Date(objectEvents[eventObj].startTime);
          let endTime = new Date (objectEvents[eventObj].endTime);

          glassworksCalendar.createEvent(
            objectEvents[eventObj].title,
            startTime,
            endTime,
            {
              description: objectEvents[eventObj].description,
              location: objectEvents[eventObj].location,
            },
          );
        } catch(err) {Utilities.sleep(1000)}
      }
    });
  }

  //Agenda Serralheria
  if (myEventsMetalworkShopCalendar.length > 0) {
    let eventsID = [];

    myEventsMetalworkShopCalendar.map(event => {
      let eventTitle = event.getTitle().split(' # ');
      let id = eventTitle[eventTitle.length-1];
      eventsID.push(parseInt(id));
    });

    Object.keys(objectEvents).forEach(eventObj => {
      let objectID = parseInt(objectEvents[eventObj].id);
      let isGlassworks = objectEvents[eventObj].isGlassworks;
      let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

      if(eventsID.includes(objectID) === false && !isGlassworks && isMetalworkShop) {
       let startTime = new Date(objectEvents[eventObj].startTime);
       let endTime = new Date (objectEvents[eventObj].endTime);

        try {
          metalworkShopCalendar.createEvent(
            objectEvents[eventObj].title,
            startTime,
            endTime,
            {
              description: objectEvents[eventObj].description,
              location: objectEvents[eventObj].location,
            },
          );
        } catch(err) {Utilities.sleep(1000)};
      }
   });

  } else {
    Object.keys(objectEvents).forEach(eventObj => {
      let isGlassworks = objectEvents[eventObj].isGlassworks;
      let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

      if(!isGlassworks && isMetalworkShop) {
        try {
          let startTime = new Date(objectEvents[eventObj].startTime);
          let endTime = new Date (objectEvents[eventObj].endTime);

          metalworkShopCalendar.createEvent(
            objectEvents[eventObj].title,
            startTime,
            endTime,
            {
              description: objectEvents[eventObj].description,
              location: objectEvents[eventObj].location,
            },
          );
        } catch(err) {Utilities.sleep(1000)}
      }
    });
  }

  assignColorEvent((initialDate, finalDate) => {
    const calendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');

    const currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    initialDate = !initialDate ? new Date(`${currentYear.toString()}-01-01T00:00:00`) : initialDate;
    finalDate = !finalDate ? new Date (`${currentYear.toString()}-12-31T00:00:00`) : finalDate;

    let myEvents = calendar.getEvents(initialDate, finalDate);

    myEvents.map(event => {
      try {
        let [,teamName] = event.getTitle().split(' - ');
    
        if (teamName === '(MONTAGEM A)') event.setColor('11');
        if (teamName === '(MONTAGEM B)') event.setColor('9');
        if (teamName === '(SERRALHERIA)') event.setColor('10');
        if (teamName === '(ENTREGA)') event.setColor('5');
      } catch(err) {Utilities.sleep(1000)}
    });
  });
}

// UPDATE EVENTS *******************************************************************************************************************************
function updateEventsFromCalendar(initialDate, finalDate, objectEvents = getObjectEventsFromSheet()) {
  const installationCalendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');
  const glassworksCalendar = CalendarApp.getCalendarById('q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com');
  const metalworkShopCalendar = CalendarApp.getCalendarById('st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com');

  const currentDate = new Date();

  initialDate = !initialDate ? new Date(`${currentDate.getFullYear().toString()}-01-01T00:00:00`) : initialDate;
  finalDate = !finalDate ? new Date (`${currentDate.getFullYear().toString()}-12-31T00:00:00`) : finalDate;

  let myEventsInstallationCalendar = installationCalendar.getEvents(initialDate, finalDate);
  let myEventsGlassworksCalendar = glassworksCalendar.getEvents(initialDate, finalDate);
  let myEventsMetalworkShopCalendar = metalworkShopCalendar.getEvents(initialDate, finalDate);

  //Agenda Instalações
  if(myEventsInstallationCalendar.length > 0) {
    myEventsInstallationCalendar.map(event => {
      try {
        let eventTitle = event.getTitle();
        let startTime = event.getStartTime();
        let endTime = event.getEndTime();
        let description = event.getDescription();
        let location = event.getLocation();

        let arrayEventTitle = eventTitle.split(' # ');
        let id = String(arrayEventTitle[arrayEventTitle.length-1]);

        Object.keys(objectEvents).forEach(eventObj => {
          let objectID = String(objectEvents[eventObj].id);
          let isGlassworks = objectEvents[eventObj].isGlassworks;
          let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

          if(id === objectID && !isGlassworks && !isMetalworkShop) {
            if(eventTitle != objectEvents[eventObj].title) event.setTitle(objectEvents[eventObj].title);
            if(startTime != objectEvents[eventObj].startTime || endTime != objectEvents[eventObj].endTime) {
              event.setTime(new Date(objectEvents[eventObj].startTime), new Date(objectEvents[eventObj].endTime)); 
            }
            if(description != objectEvents[eventObj].description) {
              event.setDescription(objectEvents[eventObj].description);
            }
            if(location != objectEvents[eventObj].location) event.setLocation(objectEvents[eventObj].location);
          }
        });
      } catch(err) {Utilities.sleep(1000)}
    });
  } else { alertMessage('Não existem eventos para serem atualizados no calendário de Instalação!') }

  //Agenda Vidraçaria
  if(myEventsGlassworksCalendar.length > 0) {
    myEventsGlassworksCalendar.map(event => {
      try {
        let eventTitle = event.getTitle();
        let startTime = event.getStartTime();
        let endTime = event.getEndTime();
        let description = event.getDescription();
        let location = event.getLocation();

        let arrayEventTitle = eventTitle.split(' # ');
        let id = String(arrayEventTitle[arrayEventTitle.length-1]);

        Object.keys(objectEvents).forEach(eventObj => {
          let objectID = String(objectEvents[eventObj].id);
          let isGlassworks = objectEvents[eventObj].isGlassworks;
          let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

          if(id === objectID && isGlassworks && !isMetalworkShop) {
            if(eventTitle != objectEvents[eventObj].title) event.setTitle(objectEvents[eventObj].title);
            if(startTime != objectEvents[eventObj].startTime || endTime != objectEvents[eventObj].endTime) {
              event.setTime(new Date(objectEvents[eventObj].startTime), new Date(objectEvents[eventObj].endTime)); 
            }
            if(description != objectEvents[eventObj].description) event.setDescription(objectEvents[eventObj].description);
            if(location != objectEvents[eventObj].location) event.setLocation(objectEvents[eventObj].location);
          }
        });
      } catch(err) {Utilities.sleep(1000)}
    });
  } else { alertMessage('Não existem eventos para serem atualizados no calendário de Fabricação Vidraçaria!') }

  //Agenda Serralheria
  if(myEventsMetalworkShopCalendar.length > 0) {
    myEventsMetalworkShopCalendar.map(event => {
      try {
        let eventTitle = event.getTitle();
        let startTime = event.getStartTime();
        let endTime = event.getEndTime();
        let description = event.getDescription();
        let location = event.getLocation();

        let arrayEventTitle = eventTitle.split(' # ');
        let id = String(arrayEventTitle[arrayEventTitle.length-1]);

        Object.keys(objectEvents).forEach(eventObj => {
          let objectID = String(objectEvents[eventObj].id);
          let isGlassworks = objectEvents[eventObj].isGlassworks;
          let isMetalworkShop = objectEvents[eventObj].isMetalworkShop;

          if(id === objectID && !isGlassworks && isMetalworkShop) {
            if(eventTitle != objectEvents[eventObj].title) event.setTitle(objectEvents[eventObj].title);
            if(startTime != objectEvents[eventObj].startTime || endTime != objectEvents[eventObj].endTime) {
              event.setTime(new Date(objectEvents[eventObj].startTime), new Date(objectEvents[eventObj].endTime)); 
            }
            if(description != objectEvents[eventObj].description) event.setDescription(objectEvents[eventObj].description);
            if(location != objectEvents[eventObj].location) event.setLocation(objectEvents[eventObj].location);
          }
        });
      } catch(err) {Utilities.sleep(1000)}
    });
  } else { alertMessage('Não existem eventos para serem atualizados no calendário de Fabricação Serralheria!') }
}

// DELETE ALL EVENTS **********************************************************************************************************
function deleteAllEventsFromCalendars(initialDate, finalDate) {
  const installationCalendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');
  const glassworksCalendar = CalendarApp.getCalendarById('q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com');
  const metalworkShopCalendar = CalendarApp.getCalendarById('st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com');

  const currentDate = new Date();

  initialDate = !initialDate ? new Date(`${currentDate.getFullYear().toString()}-01-01T00:00:00`) : initialDate;
  finalDate = !finalDate ? new Date (`${currentDate.getFullYear().toString()}-12-31T00:00:00`) : finalDate;

  const myEventsInstallationCalendar = installationCalendar.getEvents(initialDate, finalDate);
  const myEventsGlassworksCalendar = glassworksCalendar.getEvents(initialDate, finalDate);
  const myEventsMetalworkShopCalendar = metalworkShopCalendar.getEvents(initialDate, finalDate);

  if (myEventsInstallationCalendar.length > 0) {
    myEventsInstallationCalendar.map(event => {
      try { 
        event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  }

  if (myEventsGlassworksCalendar.length > 0) {
    myEventsGlassworksCalendar.map(event => {
      try { 
        event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  }

  if (myEventsMetalworkShopCalendar.length > 0) {
    myEventsMetalworkShopCalendar.map(event => {
      try { 
        event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  }
}

// DELETE EVENT *******************************************************************************************************************************
function deleteEventFromCalendar(initialDate, finalDate) {
  const installationCalendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');
  const glassworksCalendar = CalendarApp.getCalendarById('q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com');
  const metalworkShopCalendar = CalendarApp.getCalendarById('st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com');

  const currentDate = new Date();

  initialDate = !initialDate ? new Date(`${currentDate.getFullYear().toString()}-01-01T00:00:00`) : initialDate;
  finalDate = !finalDate ? new Date (`${currentDate.getFullYear().toString()}-12-31T00:00:00`) : finalDate;

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Deletar Evento de Agendamento', 'Insira o número ID do agendamento que deseja excluir:', ui.ButtonSet.OK_CANCEL)
  const eventID = parseInt(response.getResponseText());

  if(eventID) {
    const eventIDDate = response.getResponseText().slice(-3);
    const eventLineOnSheet = response.getResponseText().slice(4);
    const monhtYearArrayEvent = [parseInt(eventIDDate.slice(0, 1)),parseInt(eventIDDate.slice(-2))];

    if(monhtYearArrayEvent[0] <= 7 && monhtYearArrayEvent[1] <= 23) {
      alertMessage('Esses eventos estão baseados na lógica de geração de ID antiga. Execute os seguinte procedimento para atualizá-los:\n\n1. Delete o respectivo evento diretamente da agenda, se o mesmo existir lá.\n2. Apague apenas o número do orçamento e insira-o novamente para que o ID seja gerado automaticamente.\n\nAssim todas as funcionalidades voltarão a ser aplicadas ao evento.');
      throw new Error('Não é possível deletar este evento.');
    }

    const myEventsInstallationCalendar = installationCalendar.getEvents(initialDate, finalDate);
    const myEventsGlassworksCalendar = glassworksCalendar.getEvents(initialDate, finalDate);
    const myEventsMetalworkShopCalendar = metalworkShopCalendar.getEvents(initialDate, finalDate);
    let flag;

    myEventsInstallationCalendar.map(event => {
      try {
        let eventTitle = event.getTitle().split(' # ');
        let id = parseInt(eventTitle[eventTitle.length-1]);

        if(id === eventID) { event.deleteEvent(); flag = true; };
      } catch(err) {Utilities.sleep(1000)}
    });

    myEventsGlassworksCalendar.map(event => {
      try {
        let eventTitle = event.getTitle().split(' # ');
        let id = parseInt(eventTitle[eventTitle.length-1]);

        if(id === eventID) { event.deleteEvent(); flag = true; };
      } catch(err) {Utilities.sleep(1000)}
    });

    myEventsMetalworkShopCalendar.map(event => {
      try {
        let eventTitle = event.getTitle().split(' # ');
        let id = parseInt(eventTitle[eventTitle.length-1]);

        if(id === eventID) { event.deleteEvent(); flag = true; };
      } catch(err) {Utilities.sleep(1000)}
    });

    if(flag) {
      ActiveSheet.getRange(`W${eventLineOnSheet}`).setValue('');
      ActiveSheet.getRange(`AL${eventLineOnSheet}`).setValue(true);
      alertMessage('Agendamento deletado com sucesso!')
    } else {alertMessage('O evento não existe na agenda.')};

  } else { alertMessage('É necessário identificar o evento inserindo o número de ID do agendamento!') }
}

// DELETE ALL EVENTS MONTH ****************************************************************************************************
function deleteAllEventsMonthFromCalendar(flag, initialDate, finalDate) {
  const installationCalendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');
  const glassworksCalendar = CalendarApp.getCalendarById('q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com');
  const metalworkShopCalendar = CalendarApp.getCalendarById('st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com');

  const currentDate = new Date();

  initialDate = !initialDate ? new Date(currentDate.getFullYear(), currentDate.getMonth()) : initialDate;
  finalDate = !finalDate ? new Date (currentDate.getFullYear(), currentDate.getMonth() + 1, 0) : finalDate;

  try {
    const myEventsInstallationCalendar = installationCalendar.getEvents(initialDate, finalDate);
    const myEventsGlassworksCalendar = glassworksCalendar.getEvents(initialDate, finalDate);
    const myEventsMetalworkShopCalendar = metalworkShopCalendar.getEvents(initialDate, finalDate);

    myEvents.map(event => {
      try {
        event.deleteEvent();
        if(eventName === event.getTitle()) event.deleteEvent();
        if(initialDate === event.getStartTime()) event.deleteEvent();
        if(finalDate === event.getEndTime()) event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  } catch { alertMessage('Ocorreu algum erro na deleção dos agendamentos, tente novamente!') }
}

// DELETE ALL EVENTS MONTH FORM CALENDARS *************************************************************************************
function deleteAllEventsMonthFromCalendars(initialDate, finalDate) {
  const installationCalendar = CalendarApp.getCalendarById('30coraha1d4fevp1rj6b3elh9c@group.calendar.google.com');
  const glassworksCalendar = CalendarApp.getCalendarById('q8i7h3hpilhpt7g5qa6es90bk0@group.calendar.google.com');
  const metalworkShopCalendar = CalendarApp.getCalendarById('st38llhrnh9lkp8nlkg2ui7c48@group.calendar.google.com');

  const currentDate = new Date();

  initialDate = !initialDate ? new Date(currentDate.getFullYear(), currentDate.getMonth()) : initialDate;
  finalDate = !finalDate ? new Date (currentDate.getFullYear(), currentDate.getMonth() + 1, 0) : finalDate;

  const myEventsInstallationCalendar = installationCalendar.getEvents(initialDate, finalDate);
  const myEventsGlassworksCalendar = glassworksCalendar.getEvents(initialDate, finalDate);
  const myEventsMetalworkShopCalendar = metalworkShopCalendar.getEvents(initialDate, finalDate);

  if (myEventsInstallationCalendar.length > 0) {
    myEventsInstallationCalendar.map(event => {
      try { 
        event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  }

  if (myEventsGlassworksCalendar.length > 0) {
    myEventsGlassworksCalendar.map(event => {
      try { 
        event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  }

  if (myEventsMetalworkShopCalendar.length > 0) {
    myEventsMetalworkShopCalendar.map(event => {
      try { 
        event.deleteEvent();
      } catch(err) {Utilities.sleep(1000)}
    });
  }
}

// UTILITIES
// GET ARRAY AND TRANSFORM IN A OBJECT EVENT
function getObjectEventsFromSheet() {
  let range = ActiveSheet.getRange("K5:AG").getValues();
  let rowNumber = ActiveSheet.getRange("BC5:BC").getValues();
  let objectEvents = {};

  const [monthName, year] = ActiveSheet.getName().substring(13).split("/");
  const monthIndex = monthNames.indexOf(monthName);

  const flag = Number(year) < 2024 && (monthIndex > -1 && monthIndex < 7); // Para compatibilizar com versões de planilhas anteriores
  const num = flag ? 0 : 1; // Em planilhas após e inclusive agosto de 2023 soma-se 1 coluna, a partir da coluna 6 do intervalo utilizado

  range.map((elem, i) => {
    if(elem[1] && elem[8 + num] && elem[9 + num] && elem[10 + num] != 'CANCELADO') {
      if(!elem[11 + num]) {
        alertMessage(`ATENÇÃO - Evento não poderá ser criado na agenda por falta do número ID (possivelmente apagado).\nA célula onde não consta o ID é a V${rowNumber[i]}.\n1. Primeiramente, apague apenas o número do orçamento que fica na célula L${rowNumber[i]} e insira-o novamente para que o ID seja gerado automaticamente.\n3. Clique novamente no botão "CRIAR AGENDAMENTOS"`);
        throw new Error('ATENÇÃO - Evento não poderá ser criado na agenda por falta do número ID');
      };

      let title = `${elem[1]} - (${elem[7 + num]}) - ${elem[3]} # ${elem[11 + num]}`;
      let projectNum = String(elem[1]);
      let startTime = elem[8 + num];
      let endTime = elem[9 + num];
      let description = `NOME DO CLIENTE: ${elem[2]}\nCONTATO: ${elem[4]}\nDESCRIÇÃO DO SERVIÇO: ${elem[6 + num]}:`;

      objectEvents[elem[11 + num]] = {
        id: String(elem[11 + num]),
        projectNum,
        title,
        startTime,
        endTime,
        description,
        location: elem[5],
        isGlassworks: elem[17 + num],
        isMetalworkShop: elem[18 + num]
      };
    }
  });

  return objectEvents;
}


function assignColorEvent(callback) {
  callback();
}

function alertMessage(msg) {
  return ui.alert(msg);
}