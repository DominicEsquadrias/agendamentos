function runMainProjectStages() {
  const title = 'FINALIZAÇÃO DE OBRA/ETAPA';
  const msg = 'AGUARDE A EXECUÇÃO DO SCRIPT \n 1. A caixa de diálogo na parte superior da página indica se há script em execução! \n 2. Não utilizar a planilha enquanto o script estiver em execução! \n\n';
  let projectStages = [];

  projectStages = PromptService.promptForProjectStages(title, msg + 'O preenchimento deve seguir plenamente as instruções para serem aceitos como válidos.\n\nNº do Projeto:');
  if(projectStages instanceof Message && projectStages.type === 'CANCEL-OPERATION') return alertMessage(projectStages.message);

  if(projectStages instanceof Error) {
    alertMessage(projectStages.message);
    return runMainProjectStages();
  } 
 
  for(let i = 0; i < projectStages.length; i++) {
    if(i === -1) i++;
        
    try {
      const projectStage = PromptService.pormptForStagesDone(projectStages[i], title, msg);
      if(projectStage instanceof Message && projectStage.type === 'CANCEL-OPERATION') return alertMessage(projectStage.message);
        
      if(projectStage instanceof Error) {
        alertMessage(projectStage.message)
        continue;
      }

      const constructionStageDoneRange = ActiveSheet.getRange(`AH${projectStage.rowNumber}`); 
      const completionDateRange = ActiveSheet.getRange(`AI${projectStage.rowNumber}`);
      const stageDone = constructionStageDoneRange.getValue();
      const completionDate = completionDateRange.getValue();

      if(stageDone === "SIM" || completionDate !== "") {
        alertMessage(`Data de finalização da obra/etapa -> ( ${projectStage.stage} ). Já preenchida! \n\n Nº do projeto: ${projectStage.projectNumber} \n Linha: ${projectStage.rowNumber}`);
        continue;
      } else if(stageDone !== "SIM" && projectStage.stageDone === 'NÃO') {
        constructionStageDoneRange.setValue(projectStage.stageDone);
        continue;
      }

      const response = PromptService.promptForCompletionDate(projectStage, stageDone, completionDate, msg);
      if(response instanceof Message && response.type === 'CANCEL-OPERATION') return alertMessage(response.message);

      constructionStageDoneRange.setValue(projectStage.stageDone);
      completionDateRange.setValue(response);

    } catch(e) { log(e); return alertMessage(`ALGO DEU ERRADO: ${e.toString()}`); }

  }
  return alertMessage('OPERAÇÃO FINALIZADA')
}
