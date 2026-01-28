// >>>>>>>>>>>>>>>>>>>>>>>>>>>> Global variables <<<<<<<<<<<<<<<<<<<<<<<<<<<<

function fastUuid () {
  Logger.log(Utilities.getUuid());
}

function driveProof(){
  const drive = DriveApp.getFolderById('1cFfumrbaSqlxvNQlO2g5y6AAqHoupV6T');
  const event = {
    summary: "Test: Second event",
    description: "Test",
    start: {
      dateTime: "2026-01-07T12:00:00",
      timeZone: "America/Bogota",
    },
    end: {
      dateTime: "2026-01-07T13:00:00",
      timeZone: "America/Bogota",
    },
    conferenceData: {
      createRequest: {
        requestId: Utilities.getUuid(),
        conferenceSolutionKey: {
          type: "hangoutsMeet"
        }
      }
    }
  };

  const createdEvent = Calendar.Events.insert(event, 'primary', {conferenceDataVersion: 1})

  Logger.log(createdEvent.hangoutLink);
}
// Spreadsheets
const id_ssRegistros = '143bOjw1NOsPvCPJRxvd07RLQ5oZXm6vjtbRo3BPht94';
const id_ssClientes = '1TuqRFOjGEW_b850CRuWm2quVz2z7NsEKivxErBz2JcA';
const id_ssBolsas = '1Git-tUpq0pu5SQHJ_81hkRurBl_ajwurEjC0tIUDUoA';
const id_ssPlan20Clientes = '1CI54SABVfTE3LotHGDIE2Fg5A1zIVaLDC73x_OG4Xl0';
const id_ssStatusHistoryGlobal = '1vfwRe1uvJjCmmvxay_vqu_BAIVMvAQ77r2vQJS7e0lY';
const id_ssBaseUsuarios = '1gbK9WQjQge4L5IFZNJJwRh0wl9OfY1w-wqYLZq-ku4o';

const ssRegistros = SpreadsheetApp.openById(id_ssRegistros);
const ssClientes = SpreadsheetApp.openById(id_ssClientes);
const ssBolsas = SpreadsheetApp.openById(id_ssBolsas);
const ssPlan20Clientes = SpreadsheetApp.openById(id_ssPlan20Clientes);
const ssStatusHistoryGlobal = SpreadsheetApp.openById(id_ssStatusHistoryGlobal);
const ssBaseUsuarios = SpreadsheetApp.openById(id_ssBaseUsuarios);

// °°°Sheets°°°°°°

//Bank
const shColocacion = ssBolsas.getSheetByName('colocacion');
const shCaptacion = ssBolsas.getSheetByName('captacion');
const shTransaccional = ssBolsas.getSheetByName('transaccional');

// Bank values
function dataColocacion() {
  return shColocacion.getDataRange().getValues();
}
function dataCaptacion() {
  return shCaptacion.getDataRange().getValues();
}
function dataTransaccional() {
  return shTransaccional.getDataRange().getValues();
}

//Registers
const shDesembolsos = ssRegistros.getSheetByName('registro_desembolsos');
const shVisitas = ssRegistros.getSheetByName('registro_visitas');
const shSeguros = ssRegistros.getSheetByName('registro_seguros');

// Users
const shJefe8 = ssBaseUsuarios.getSheetByName('jefe8');
const shJefe7 = ssBaseUsuarios.getSheetByName('jefe7');
const shJefe6 = ssBaseUsuarios.getSheetByName('jefe6');
const shJefe5 = ssBaseUsuarios.getSheetByName('jefe5');
const shJefe4 = ssBaseUsuarios.getSheetByName('jefe4');
const shJefe3 = ssBaseUsuarios.getSheetByName('jefe3');
const shJefe2 = ssBaseUsuarios.getSheetByName('jefe2');
const shLideres = ssBaseUsuarios.getSheetByName('lideres');
const shComerciales = ssBaseUsuarios.getSheetByName('comerciales');
const shComColocacion = ssBaseUsuarios.getSheetByName('comerciales_colocacion');
const shAnalistas = ssBaseUsuarios.getSheetByName('analistas');


// Registers values
function dataLideres() {
  return shLideres.getDataRange().getValues();
}
function dataComerciales () {
  return shComerciales.getDataRange().getValues();
}
function dataComColocacion() {
  return shComColocacion.getDataRange().getValues();
}
function dataDesembolsos() {
  return shDesembolsos.getDataRange().getValues();
}
function dataVisitas() {
  return shVisitas.getDataRange().getValues();
}
function dataSeguros () {
  return shSeguros.getDataRange().getValues();
}

// Clients
const shClientes = ssClientes.getSheetByName('clientes');
const shOficinas = ssClientes.getSheetByName('oficinas');

//Clients values
function dataClientes() {
  return shClientes.getDataRange().getValues();
}

function dataVencimiento() {
  return shVencimiento.getDataRange().getValues();
}
function dataOficinas(){
  return shOficinas.getDataRange().getValues();
}
// Strategies
const shEmpresarialPyme = ssPlan20Clientes.getSheetById(0);

//Strategies values
function dataEmpresarialPyme() {
  return shEmpresarialPyme.getDataRange().getValues();
}

// Status history

const shStatusHistory = ssStatusHistoryGlobal.getSheetByName('status_history');

const allDataSheet = {
  dataCaptacion: function() {
    return shCaptacion.getDataRange().getValues();
  },
  dataOficinas: function() {
    return Sheets.Spreadsheets.Values.get(id_ssClientes, `oficinas!A:B`).values
  },
  dataClientes: function() {
    return Sheets.Spreadsheets.Values.get(id_ssClientes, `clientes!A:AC`).values
  },
  dataColocacion: function() {
    return shColocacion.getDataRange().getValues();
  },
  dataComColocacion: function() {
    return shComColocacion.getDataRange().getValues();
  },
  dataComerciales: function() {
    return shComerciales.getDataRange().getValues();
  },
  dataDesembolsos: function() {
    return shDesembolsos.getDataRange().getValues();
  },
  dataEmpresarialPyme: function() {
    return shEmpresarialPyme.getDataRange().getValues();
  },
  dataSeguros: function() {
    return shSeguros.getDataRange().getValues();
  },
  dataTransaccional: function() {
    return shTransaccional.getDataRange().getValues();
  },
 
  dataVisitas: function() {
    return shVisitas.getDataRange().getValues();
  },
  dataAnalistas: function() {
    return shAnalistas.getDataRange().getValues();
  },
  dataJefe8: function() {
    return shJefe8.getDataRange().getValues();
  },
  dataJefe7: function() {
    return shJefe7.getDataRange().getValues();
  },
  dataJefe6: function() {
    return shJefe6.getDataRange().getValues();
  },
  dataJefe5: function() {
    return shJefe5.getDataRange().getValues();
  },
  dataJefe4: function() {
    return shJefe4.getDataRange().getValues();
  },
  dataJefe3: function() {
    return shJefe3.getDataRange().getValues();
  },
  dataJefe2: function() {
    return shJefe2.getDataRange().getValues();
  },
  dataLideres: function() {
    return shLideres.getDataRange().getValues();
  },
}
const allSheets = {
  oficinas: shOficinas,
  comerciales: shComerciales,
  lideres: shLideres,
  registro_desembolsos: shDesembolsos,
  registro_visitas: shVisitas,
  registro_seguros: shSeguros,
  colocacion: shColocacion,
  captacion: shCaptacion,
  transaccional: shTransaccional,
  analistas: shAnalistas,
  jefe2: shJefe2,
  jefe3: shJefe3,
  jefe4: shJefe4,
  jefe5: shJefe5,
  jefe6: shJefe6,
  jefe7: shJefe7,
  jefe8: shJefe8
};

//User email

function getEmail(){
  let email = Session.getActiveUser().getEmail();
  //if(email === 'samuel.ibanez@davivienda.com') email = 'nabarragan@davivienda.com'
  //if(email === 'gustavo.ropero@davivienda.com') email = 'lcgalind@davivienda.com'
  let realEmail = email;// se almacena el correo real del analista
  email = CacheService.getUserCache().get("email") || email;
  console.log([email, realEmail])
  return [email, realEmail, getScriptUrl()]
}