// Classe Projeto
class ProjectStage {
  constructor(projectNumber, rowNumber, stage, stageDone) {
    this.projectNumber = projectNumber;
    this.rowNumber = rowNumber;
    this.stage = stage;
    this.stageDone = stageDone && '';
  }

  toString() {
    return `Etapa: ${this.stage} - Linha na Planilha Agendamentos:${this.rowNumber} / Nº do Projeto: ${this.projectNumber}`;
  }
}

class PromptService {
  static isSheduleSheet() {
    const [ sheetName ] = ActiveSheet.getSheetName().split('-');
    if(sheetName !== 'AGENDAMENTOS') return false;
    return true;
  }

  static promptForProjectStages(title, msg) {
    if(!this.isSheduleSheet()) return new Message('OPERAÇÃO CANCELADA! \n\n Operação não permitida nesta planilha.', 'CANCEL-OPERATION');
    const projectStages = [];

    const projectNumberPrompt = ui.prompt(title, msg, ui.ButtonSet.OK_CANCEL);  
    if(projectNumberPrompt.getSelectedButton() == ui.Button.CANCEL) return new Message('OPERAÇÃO CANCELADA!', 'CANCEL-OPERATION');
    const receivedProjectNumber = parseInt(projectNumberPrompt.getResponseText());
    if(!receivedProjectNumber) return new Error('RESPOSTA INVÁLIDA\n\nA resposta não pode ser vazia e deve ser um número de projeto válido!');

    const projectStagePrompt = ui.prompt(title, 'Insira as etapas que deseja editar separadas por vírgula (,).\n\nExemplo: 3,2', ui.ButtonSet.OK_CANCEL);  
    if(projectStagePrompt.getSelectedButton() == ui.Button.CANCEL) return new Message('OPERAÇÃO CANCELADA!', 'CANCEL-OPERATION');
    const receivedProjectStages = projectStagePrompt.getResponseText().split(',');

    ActiveSheet.getRange('L5:Q').getValues().forEach((cell, i) => {
      const projectNumber = parseInt(cell[0]);
      const stage = parseInt(cell[5]);
      receivedProjectStages.forEach(projectStage => {
        const receivedProjectStage = parseInt(projectStage)
        if(projectNumber 
          && receivedProjectStage 
          && receivedProjectStage === stage 
          && projectNumber === receivedProjectNumber) projectStages.push(new ProjectStage(projectNumber, i + 5, stage));
      });
    });

    if(!(projectStages.length > 0)) return new Error('RESPOSTA INVÁLIDA\n\nNenhum registro com esse número de projeto e estágio encontrado!');

    return projectStages;
  }

  static pormptForStagesDone(projectStage, title, msg) {
    if(!this.isSheduleSheet()) return new Message('OPERAÇÃO CANCELADA! \n\n Operação não permitida nesta planilha.', 'CANCEL-OPERATION');
    if(!projectStage) return new Error('Etapa de projeto não encontrada!');
    const reponse = ui.alert(title, msg + `OBRA/ETAPA ( ${projectStage.stage} ) FINALIZADA:`, ui.ButtonSet.YES_NO_CANCEL);
    if(reponse === ui.Button.CANCEL) return new Message('OPERAÇÃO CANCELADA!', 'CANCEL-OPERATION');

    const stageDone = reponse === ui.Button.YES ? 'SIM' : 'NÃO';
    projectStage.stageDone = stageDone;

    return projectStage;
  }

  static promptForCompletionDate(projectStage, stageDone, completionDate, msg) {
    if(!this.isSheduleSheet()) return new Message('OPERAÇÃO CANCELADA! \n\n Operação não permitida nesta planilha.', 'CANCEL-OPERATION');
    const completionDatePrompt = ui.prompt(`DATA DE FINALIZAÇÃO PARA A ETAPA -> ${projectStage.stage}`, msg + `Formato aceito(dia,mês,ano): 00/00/00\n\nData da finalização:`, ui.ButtonSet.OK_CANCEL);
    if(completionDatePrompt.getSelectedButton() === ui.Button.CANCEL) return new Message('OPERAÇÃO CANCELADA!', 'CANCEL-OPERATION');
    const response = completionDatePrompt.getResponseText();

    if(!response) {
      alertMessage('A data não pode ser vazia!')
      return this.promptForCompletionDate(projectStage, stageDone, completionDate, msg);
    };

    const [day, month, year]  = response.split('/');
    const newCompletionDate = new Date(`${year}-${month}-${Number(day)+1}`);
    if(newCompletionDate.toString() === 'Invalid Date') {
      alertMessage('Data inválida!');
      return this.promptForCompletionDate(projectStage, stageDone, completionDate, msg);
    };
            
    return newCompletionDate;
  }
}

class Message {
  constructor(message, type) {
    this.message = message;
    this.type = type;
  }
}