function deleteOldTabs() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const today = new Date();

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();

    // Verifica se o nome da aba começa com "COMPRAS-", "SOLICITAÇÃO-", "PROJETOS-", ou "AGENDAMENTOS-"
    if (sheetName.startsWith("COMPRAS-") || sheetName.startsWith("SOLICITAÇÃO-") || sheetName.startsWith("PROJETOS-") || sheetName.startsWith("AGENDAMENTOS-")) {
      const creationDate = sheet.getRange("A1").getValue();

      if (creationDate instanceof Date) { // Verifica se a célula A1 contém uma data válida
        const diffMonths = (today.getFullYear() - creationDate.getFullYear()) * 12 + (today.getMonth() - creationDate.getMonth());

        if (diffMonths > 12) {
          spreadsheet.deleteSheet(sheet); // Exclui a aba se ela tiver mais de 12 meses
        }
      } else {
        console.warn(`A aba "${sheetName}" não possui uma data válida em A1.`);
      }
    }
  });
}