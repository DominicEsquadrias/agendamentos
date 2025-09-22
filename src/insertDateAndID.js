function onEdit(e) {
  const tabName = ActiveSheet.getName();
  updateDate(tabName);
  setMonthData(e);
}

function updateDate(tabName) {
  const column = capture.getColumn();

  if(tabName !== 'DASHBOARD' && ActiveSheet.getName() == tabName) {
  
    //Envio Orçamento
    if(column === 25)  {
      let addInColumn = capture.offset(0, 23);
      let data = new Date();

      data = Utilities.formatDate(data, "GMT-03:00", "dd/MM/yyyy HH:mm:ss");
      addInColumn.setValue(data);
    };

    //Feedback da Obra
    if(column === 32)  {
      let addInColumn = capture.offset(0, 17);
      let data = new Date();

      data = Utilities.formatDate(data, "GMT-03:00", "dd/MM/yyyy HH:mm:ss");
      addInColumn.setValue(data);
    };

    //Feedback Negativo
    if(column === 33)  {
      let addInColumn = capture.offset(0, 17);
      let data = new Date();

      data = Utilities.formatDate(data, "GMT-03:00", "dd/MM/yyyy HH:mm:ss");
      addInColumn.setValue(data);
    };

    // Set ID
    // if(ActiveSheet.getName() == tabName && column === 12)  {
    //   const date = new Date();
    //   const currentYear = date.getFullYear().toString();

    //   let monthTabName = tabName.slice(13);
    //   monthTabName = monthTabName.slice(0, -5);

    //   const monthNames = ["", "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO" ];
    //   const numMonth = monthNames.indexOf(monthTabName);

    //   const addInColumn = capture.offset(0, 10);
    //   const id = `${(numMonth < 10) ? '0' + numMonth : numMonth}${currentYear.slice(-2)}${addInColumn.getLastRow()}`;
    //   addInColumn.setValue(id);
    // };
  }
}

function setMonthData(e) {
  const range = e.range;
  const value = range.getValue();

  const monthNames = ["", "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO" ];
  const numMonth = monthNames.indexOf(value);

  const activeSheetName = ActiveSheet.getSheetName();
  let sheet = spreadsheetApp.getSheetByName('DADOS-GRÁFICOS');

  if (activeSheetName === 'DASHBOARD' && numMonth >= 1) sheet.getRange('B2').setValue(numMonth);
}