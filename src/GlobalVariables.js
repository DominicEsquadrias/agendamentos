const spreadsheetApp = SpreadsheetApp.getActiveSpreadsheet();
const ActiveSheet = SpreadsheetApp.getActiveSheet();
const capture = ActiveSheet.getActiveCell();
const ui = SpreadsheetApp.getUi();
const monthNames = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO" ];

function onOpen() {
  const [ sheetName ] = ActiveSheet.getSheetName().split('-');
  if(sheetName === 'AGENDAMENTOS') ActiveSheet.setFrozenRows(4);

  ui.createMenu('Agendamentos')
  .addItem('Criar Agendamentos', 'createEventsOnCalendar')
  .addItem('Atualizar Agendamentos', 'updateEventsFromCalendar')
  .addItem('Deletar Evento de Agendamento', 'deleteEventFromCalendar')
  .addToUi();

  ui.createMenu('Obra')
  .addItem('Finalizar Obra/Etapa', 'runMainProjectStages')
  .addToUi();
}