function duplicateSheet() {
  if(!isCompatible("DUPLICAÇÃO NÃO PERMITIDA \n\n A duplicação de planilhas anteriores a seguinte data: AGOSTO/2023; não é permitida de forma automatizada, visto que pode gerar conflitos de compatibilidade com a nova estrutura atualizada para planilhas posteriores.\n\n Ademais, é possível que a duplicação descompatibilizada gere erros e até mesmo impeça o funcionamento das automações vigentes.")) return;
  spreadsheetApp.duplicateActiveSheet();
}

function generateSettings() {
  if(!isCompatible("CONFIGURAÇÕES NÃO PODEM SER GERADAS \n\n Sobrescrever as configurações de planilhas anteriores a seguinte data: AGOSTO/2023; pode gerar conflitos de compatibilidade, erros, e mau funcionamento ou mesmo não funcionamento das automações, portanto não é permitida a geração automática de configurações.")) return;
  const settingsReset = () => {
    const spreadSheetID = spreadsheetApp.getId();
    const date = new Date();
    const monthName = monthNames[date.getMonth()];
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();
    
    ActiveSheet.setName(`AGENDAMENTOS-${monthName}/${currentYear}`);
    ActiveSheet.getRange('A3').setValue(currentMonth);

    const intervalLastRow = ActiveSheet.getRange('A:A').getLastRow();
    for (let i = 5; i <= intervalLastRow;) {
      ActiveSheet.getRange(`K${i}`).setFormula(`=IF($L${i}<>"";VLOOKUP($L${i};$A$5:$H;6;0);"")`);
      ActiveSheet.getRange(`M${i}`).setFormula(`=IF($L${i}<>"";VLOOKUP($L${i};$A$5:$H;3;0);"")`);
      ActiveSheet.getRange(`N${i}`).setFormula(`=IF($L${i}<>"";VLOOKUP($L${i};$A$5:$H;2;0);"")`);
      ActiveSheet.getRange(`O${i}`).setFormula(`=IF($L${i}<>"";VLOOKUP($L${i};$A$5:$H;4;0);"")`);
      ActiveSheet.getRange(`P${i}`).setFormula(`=IF($L${i}<>"";VLOOKUP($L${i};$A$5:$H;5;0);"")`);
      ActiveSheet.getRange('V6').setValue(000);
      ActiveSheet.getRange(`X${i}`).setFormula(`=IF(AND($O${i}<>"";$Y${i}<>"ENVIADO");HYPERLINK(CONCATENATE("https://api.whatsapp.com/send?phone=55";$O${i};"&text=*Nº Orçamento:* ";$L${i};"%0A";"*Data da instalação:* ";TO_TEXT($T${i});"%0A%0A";encodeurl(SUBSTITUTE($AM$3;" %NOME%";$M${i}))); "ENVIAR");"")`);
      ActiveSheet.getRange(`AC${i}`).setValue(false);
      ActiveSheet.getRange(`AD${i}`).setValue(false);
      ActiveSheet.getRange('AM3').setFormula('=SUBSTITUTE($AM$5;"%COLABORADOR%";$AM$7)');

      i++;
    }

    cleanupContentFromSheet();
    createImportData(spreadSheetID, currentMonth, currentYear);
  };

  callTheUi('RESET de Configuração', 'Tem certeza que deseja executar um reset de configuração? Isso, apagará os dados desta aba da sua planilha, e irá gerar uma configuração padrão correspondente ao mês corrente!', settingsReset);
}

// Util's

function isCompatible(msg) {
  const [monthName, year] = ActiveSheet.getName().substring(13).split("/");
  const monthIndex = monthNames.indexOf(monthName);
  if(Number(year) < 2024 && (monthIndex > -1 && monthIndex < 7)) { // Para compatibilizar com versões de planilhas anteriores
    ui.alert(msg);
    return false;
  }
  return true;
}

function callTheUi(title, bodyMessage, codeToExecute) {
  const response = ui.alert(title, bodyMessage, ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (response == ui.Button.YES) {
    codeToExecute();
  } else { return; }
}

function cleanupContentFromSheet() {
  ActiveSheet.getRange('L5:L').clearContent();
  ActiveSheet.getRange('Q5:W').clearContent();
  ActiveSheet.getRange('Y5:Y').clearContent();
  ActiveSheet.getRange('AE5:AK').clearContent();
  ActiveSheet.getRange('AU5:AX').clearContent();
}

function createImportData(spreadSheetID, currentMonth, currentYear) {
  const mockupImportSheet = spreadsheetApp.getSheetByName('IMPORT-CONTROLE-PROJETOS-PRODUÇÃO');

  const currentImportSheet = mockupImportSheet.copyTo(SpreadsheetApp.openById(spreadSheetID));

  currentImportSheet.setName(`IMPORT-CONTROLE-PROJETOS-PRODUÇÃO-${currentMonth}/${currentYear}`);
  currentImportSheet.getRange('A2').setValue(currentMonth);
  currentImportSheet.getRange('D2').setValue(currentMonth);
  currentImportSheet.hideSheet();

  const importProjectsAndProduction = `=QUERY('IMPORT-CONTROLE-PROJETOS-PRODUÇÃO-${currentMonth}/${currentYear}'!A5:T;"select M,J,I,K,L,Q,T where P like 'APROVADO'")`;
  ActiveSheet.getRange('A5').setFormula(importProjectsAndProduction);
}