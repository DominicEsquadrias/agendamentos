const ss = SpreadsheetApp.getActive();
const shAGENDAMENTOS = ss.getSheetByName("AGENDAMENTOS");
const START_ROW = 4;
const TZ = Session.getScriptTimeZone();
const COLUMNS = {
  UUID: {
    letter: "A",
    number: 1,
  },
  PROJECT_ID: {
    letter: "B",
    number: 2,
  },
  ID: {
    letter: "C",
    number: 3,
  },
  PROJECT_APPROVAL_DATE: {
    letter: "D",
    number: 4,
  },
  PROJECT_NUMBER: {
    letter: "E",
    number: 5,
  },
  CLIENT_NAME: {
    letter: "F",
    number: 6,
  },
  PROJECT_NAME: {
    letter: "G",
    number: 7,
  },
  PHONE: {
    letter: "H",
    number: 8,
  },
  ADDRESS: {
    letter: "I",
    number: 9,
  },
  PROJECT_STEP: {
    letter: "J",
    number: 10,
  },
  APPOINTMENT_DESCRIPTION: {
    letter: "K",
    number: 11,
  },
  TEAM_NAME: {
    letter: "L",
    number: 12,
  },
  APPOINTMENT_START_TIME: {
    letter: "M",
    number: 13,
  },
  APPOINTMENT_END_TIME: {
    letter: "N",
    number: 14,
  },
  APPOINTMENT_CALENDAR_ID: {
    letter: "O",
    number: 15,
  },
  APPOINTMENT_SENT_STATUS: {
    letter: "P",
    number: 16,
  },
  APPOINTMENT_INSERTION_DEADLINE: {
    letter: "Q",
    number: 17,
  },
  APPOINTMENT_SENT_DATE: {
    letter: "R",
    number: 18,
  },
  PROJECT_OBS: {
    letter: "S",
    number: 19,
  },
  PROJECT_FEEDBACK: {
    letter: "T",
    number: 20,
  },
  PROJECT_RETURN_FEEDBACK: {
    letter: "U",
    number: 21,
  },
  PROJECT_DEADLINE: {
    letter: "V",
    number: 22,
  },
  OBS: {
    letter: "W",
    number: 23,
  },
};
