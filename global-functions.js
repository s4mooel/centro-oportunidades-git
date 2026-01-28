function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

/**
 * Get "home page", or a requested page.
 * Expects a 'page' parameter in querystring.
 *
 * @param {event} e Event passed to doGet, with querystring
 * @returns {String/html} Html to be served
 */
function doGet(e) {
  /* const e_mail = Session.getActiveUser().getEmail()
  if(e_mail === 'gustavo.ropero@davivienda.com'){
    return HtmlService.createTemplateFromFile('admin').evaluate().setTitle('CdO - administración');
  } */
  Logger.log( Utilities.jsonStringify(e) );
  if (!e.parameter.page) {
    // When no specific page requested, return "home page"
    return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Centro de Oportunidades');
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate().setTitle('Centro de Oportunidades');
}

/*function getComercial(){
  const comercial = dataComerciales.find(row => row[6] === 1 && row[2] === email );
  //const lider = dataLideres.find(row =>)
  return comercial;
}*/

function getAnalista (emailORid, dataAnalistas){
  let analistas = dataAnalistas
  for(let i = 0; i < analistas.length; i++){
    const row = analistas[i];
    if(row[4] === 1 && (row[2] === emailORid || row[0] === emailORid)){
      return row;
    }
  }

  return "";
}

function getComercial(emailORid,dataComerciales){
  let comerciales = dataComerciales;
  for(let i = 0; i < comerciales.length ; i++){
    const row = comerciales[i];
    if(row[6] === 1 && (row[2] === emailORid || row[0] === emailORid)){
      return row;
    }
  }
  return "";
}

function getLider(emailORid, dataLideres) {
  let lideres = dataLideres;
  for(let i = 0; i < lideres.length ; i++){
    const row = lideres[i];
    if(row[4] === 1 && (row[2] === emailORid || row[0] === emailORid)){
      return row;
    }
  }
  return "";
}


function getClientesXComercial(){
  const comercial = getComercial(getEmail()[0], allDataSheet.dataComerciales());
  const comercial_id = comercial[0];
  const clientesXcomercial = [];
  const data_Clientes = allDataSheet.dataClientes();

  // Searching clerks
  for(let i = 0; i < data_Clientes.length ; i++) {
    const row = data_Clientes[i];

    if(parseInt(row[6], 10) === 1 && row[5] === comercial_id){
      clientesXcomercial.push([comercial_id,comercial[1],comercial[3],comercial[4],comercial[6],...row]);
    }
  
  }

  //Logger.log(getClientesXComercial(getComercial(81,dataComerciales()),dataClientes()))

  const json = JSON.stringify(clientesXcomercial);
/*   Logger.log(clientesXcomercial[32]);
  Logger.log(clientesXcomercial[clientesXcomercial.length-1]);
  Logger.log(JSON.stringify(clientesXcomercial[clientesXcomercial.length-1])); */
  //Logger.log(json);
  return json;
}

function getClientesXLider() {
  const lider = getLider(getEmail()[0], allDataSheet.dataLideres());
  const lider_id = lider[0];
  const liderXcomercial = [];
  const data_Comerciales = dataComerciales();
  const data_Clientes = dataClientes();

  for(let i = 0; i < data_Comerciales.length ; i++){
    const row = data_Comerciales[i];
    if(row[6] === 1 && row[3] === lider_id){
      liderXcomercial.push([row[0], row[1], row[2]]);
    }
  }

  const dictLxC = new Map();
  for(let i = 0; i < liderXcomercial.length ; i++) {
    const key = liderXcomercial[i][0];
    dictLxC.set(key, liderXcomercial[i]);
  }

  const liderXcliente = [];

  for(let i = 0; i < data_Clientes.length ; i++){
    const row = data_Clientes[i];
    const key = row[5];

    if(parseInt(row[6], 10) === 1 && dictLxC.has(key)){
      liderXcliente.push([...dictLxC.get(key), row[0], row[1], row[2]]);
    }
  }
  //Logger.log("Total consultants are: " + liderXcomercial.length);
  //Logger.log("Total clerks are: " + liderXcliente.length);
  return [JSON.stringify(liderXcliente), liderXcomercial];
}

function normalizeDate(unfDate) {
  if(unfDate !== ''){
    const formattingDate =  new Date(unfDate);
    const year = formattingDate.getFullYear();
    const month = formattingDate.getMonth()+1;
    const numberDay = formattingDate.getDate();

    return `${year}-${month < 10 ? 0 : ''}${month}-${numberDay < 10 ? 0 : ''}${numberDay}`
  } else {
    return unfDate;
  }
}

function normalizeTime(unfDate) {
  if(new Date(unfDate).getFullYear() === 1899) return "";
  if(unfDate !== ''){
    const formattingDate =  new Date(unfDate);
    const year = formattingDate.getFullYear();
    const month = formattingDate.getMonth()+1;
    const numberDay = formattingDate.getDate();
    const hours = formattingDate.getHours();
    const minutes = formattingDate.getMinutes();

    return `${year}-${month < 10 ? 0 : ''}${month}-${numberDay < 10 ? 0 : ''}${numberDay} ${hours < 10 ? 0 : ''}${hours}:${minutes < 10 ? 0 : ''}${minutes}`
  } else {
    return unfDate;
  }
}

function editSheet(reg_id, spreadsheet, sheet, field, newValue = ''){
  const theSheet = allSheets[sheet];
  /* Logger.log("The new value is: " + newValue);
  Logger.log("The reg_id is: " + reg_id + " and the type is " + typeof reg_id);
  Logger.log("The field is: " + field + " and the type is " + typeof field) */
  let finalValue = newValue;
  const dataColumnID = theSheet.getRange("A:A").getValues();
  const dataHeaders = theSheet.getRange("1:1").getValues();
  /* Logger.log("Length column_id: " + dataColumnID.length);
  Logger.log("Length headers: " + dataHeaders[0].length);
  Logger.log("Length headers: " + dataHeaders[0]); */

  let idxID = null;
  for(let i = 0; i < dataColumnID.length ; i++){
    const currRow = dataColumnID[i];
    if(currRow[0] === reg_id){
      idxID = i+1;
      break;
    }
  }
  const fieldIdx = dataHeaders[0].indexOf(field);
  //Logger.log("Register row: " + idxID);
  //Logger.log("Register column: " + fieldIdx);

  const register = theSheet.getRange(idxID,1,1,dataHeaders[0].length)
  const registerData = register.getValues();
  //Logger.log("The current row is: " + registerData);
  const oldValue = registerData[0][fieldIdx];
  let isValNegociado = false;
  let isValAceptado = false;
  let isGoodState = false;

  // Depuración
  Logger.log("The register id is: " + reg_id);
  Logger.log("The sheet is: " + sheet);
  Logger.log("The field is: " + field);
  Logger.log("The new value is: " + newValue);
  Logger.log("The old register is: " + registerData);

  if(field === "status_active") finalValue = 0;
  else if(field === "fecha" || field === "Fecha" || field === "fecha_proyeccion") finalValue = new Date(finalValue+"T00:00:00");
  else if(field === "estado" || field === "Estado"){
    if(sheet === "captacion"){
        const valNegociadoIdx =  dataHeaders[0].indexOf("Valor Negociado");
        const valAceptadoIdx =  dataHeaders[0].indexOf("Valor Aceptado");
        const valorAcep = registerData[0][valAceptadoIdx];
        const valorNeg = registerData[0][valNegociadoIdx]
      if(finalValue === "Aceptado" && valorAcep === 0){
        registerData[0][valAceptadoIdx] = valorNeg;
        registerData[0][valNegociadoIdx] = valorAcep;
        isValAceptado = true;
      } else if(finalValue !== "Aceptado" && valorNeg === 0){
        registerData[0][valAceptadoIdx] = valorNeg;
        registerData[0][valNegociadoIdx] = valorAcep;
        isValNegociado = true;
      }
    } else if(sheet === "registro_seguros"){
      const valNegociadoIdx =  dataHeaders[0].indexOf("Valor Negociado");
      const valAceptadoIdx =  dataHeaders[0].indexOf("Valor Aceptado");
      const valorAcep = registerData[0][valAceptadoIdx];
      const valorNeg = registerData[0][valNegociadoIdx]
      if(finalValue === "Recaudado" && valorAcep === 0){
        registerData[0][valAceptadoIdx] = valorNeg;
        registerData[0][valNegociadoIdx] = valorAcep;
        isValAceptado = true;
      } else if(finalValue !== "Recaudado" && valorNeg === 0){
        registerData[0][valAceptadoIdx] = valorNeg;
        registerData[0][valNegociadoIdx] = valorAcep;
        isValNegociado = true;
      }
    } else if(sheet === "transaccional"){
      const valNegociadoIdx =  dataHeaders[0].indexOf("Valor Negociado");
      const valAceptadoIdx =  dataHeaders[0].indexOf("Valor Aceptado");
      const valorAcep = registerData[0][valAceptadoIdx];
      const valorNeg = registerData[0][valNegociadoIdx]
      if(finalValue === "Efectivo" && valorAcep === 0){
        registerData[0][valAceptadoIdx] = valorNeg;
        registerData[0][valNegociadoIdx] = valorAcep;
        isValAceptado = true;
      } else if(finalValue !== "Efectivo" && valorNeg === 0){
        registerData[0][valAceptadoIdx] = valorNeg;
        registerData[0][valNegociadoIdx] = valorAcep;
        isValNegociado = true;
      }
    } else if(sheet === "colocacion"){
      const noGestionable = dataHeaders[0].indexOf("No gestionable");
      if(finalValue !== "Cliente no gestionable") {
        registerData[0][noGestionable] = "";
        isGoodState = true;
      }
    }
  }
  Logger.log("The previous operations throw the following value: " + finalValue);
  registerData[0][fieldIdx] = finalValue;
  Logger.log("The new register is: " + registerData);
  //Logger.log("Updated row data: " + registerData);
  const arrEmail = getEmail();
  shStatusHistory.appendRow([
    Utilities.getUuid(),
    new Date,
    getComercial(arrEmail[0],allDataSheet.dataComerciales())[0] || getLider(arrEmail[0],allDataSheet.dataLideres())[0],
    arrEmail[0],
    spreadsheet,
    sheet,
    reg_id,
    field,
    oldValue,
    finalValue,
    arrEmail[1],
  ]);

  register.setValues(registerData);

  //cell.setValue(newValue);
  return {success: true, valNegociado: isValNegociado, valAceptado : isValAceptado, goodState : isGoodState}
}

function getSheetData(data) {
  const regSheetData = [];

  const clientes = allDataSheet.dataClientes();
  const mapClientes = new Map();

  for(let i  = 0; i < clientes.length; i++){
    const row = clientes[i];
    const key = row[0];
    mapClientes.set(key, row);
  }

  const comercial = getComercial(getEmail()[0], allDataSheet.dataComerciales());
  

  let sheetData = allDataSheet[data]();
  for(let i = 1; i < sheetData.length ; i++){
    const register = sheetData[i];
    const register_id = register[0];
    const dataHeaders = sheetData[0];

    const idx_cliente_id = dataHeaders.indexOf("cliente_id");
    const cliente_id = register[idx_cliente_id];
    const idx_comercial_id = dataHeaders.indexOf("comercial_id");
    const comercial_id = register[idx_comercial_id];
    const idx_state = dataHeaders.indexOf("estado") === -1 ? dataHeaders.indexOf("Estado") : dataHeaders.indexOf("estado");
    const state = register[idx_state];
    const idx_visita = dataHeaders.indexOf("visita");
    const visita = register[idx_visita];
    const idx_status_active = dataHeaders.indexOf("status_active");
    const status_active = register[idx_status_active];

    Logger.log([register_id, cliente_id, comercial_id, state, visita, status_active, comercial[0]])

    switch (data){
      case "dataVisitas": {

        if(mapClientes.has(cliente_id) && comercial_id === comercial[0] && visita !== '' && status_active === 1){
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            nit_cliente: currCliente[1],
            nombre_cliente: currCliente[2],
            visita_id: register_id,
            tipoVisita: register[1],
            compromiso: register[2],
            fecha: normalizeDate(register[3]),
            acompaniamiento: register[4]
          })
        }
        break;
      }
      case "dataColocacion": {
        if(mapClientes.has(cliente_id) && comercial_id === comercial[0] && state !== '' && status_active === 1){
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            nit_cliente: currCliente[1],
            nombre_cliente: currCliente[2],
            colocacion_id: register[0],
            fecha: normalizeDate(register[1]),
            estado: register[2],
            noGestionable : register[3],
            estructurador: register[4],
            observaciones: register[8] || '',
            valor_solicitado: register[10] || 0
          })
        }
        break;
      }
      case "dataDesembolsos": {
        if(mapClientes.has(cliente_id) && comercial_id === comercial[0] && state !== '' && status_active === 1){
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            nit_cliente: currCliente[1],
            nombre_cliente: currCliente[2],
            desembolso_id: register[0],
            estado: register[1],
            valor_desembolso: register[2] % 1e6 === register[2] ? register[2]*1e6 : register[2],
            linea: register[10],
            fecha: normalizeDate(register[3]),
            desistencia: register[4],
            observaciones: register[5],
          })
        }
        break;
      }
      case "dataCaptacion": {
        if(mapClientes.has(cliente_id) && comercial_id === comercial[0] && state !== '' && status_active === 1){
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            nit_cliente: currCliente[1],
            nombre_cliente: currCliente[2],
            captacion_id: register[0],
            fecha: normalizeDate(register[1]),
            estado: register[2],
            producto: register[3],
            valor_negociado: register[5] === 0 ? register[4] : 0,
            valor_aceptado: register[5] || 0,
            desiste: register[6],
            observaciones: register[7]
          })
        }
        break;
      }
      case "dataTransaccional": {
        if(mapClientes.has(cliente_id) && comercial_id === comercial[0] && state !== '' && status_active === 1){
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            nit_cliente: currCliente[1],
            nombre_cliente: currCliente[2],
            transaccional_id: register[0],
            fecha: normalizeDate(register[1]),
            estado: register[2],
            producto: register[3],
            valor_negociado : register[5] === 0 ? register[4] : 0,
            valor_aceptado : register[5] || 0,
            desiste : register[6],
            observaciones : register[7]
          })
        }
        break;
      }
      case "dataSeguros":{
        if(mapClientes.has(cliente_id) && comercial_id === comercial[0] && state !== '' && status_active === 1){
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            nit_cliente: currCliente[1],
            nombre_cliente: currCliente[2],
            seguro_id: register[0],
            fecha: normalizeDate(register[1]),
            estado: register[2],
            seguro: register[3],
            valor_negociado: register[4],
            valor_aceptado: register[5],
            observaciones: register[6]
          })
        }
        break;
      }
    }
  }
  //Logger.log("Total registers is : " + regColocacion.length);
  return JSON.stringify(regSheetData);
}

function allUsers (){
  const lastRowComerciales = shComerciales.getLastRow();
  const comerciales = shComerciales.getRange(1,2,lastRowComerciales,2).getValues();

  const lastRowLideres = shLideres.getLastRow();
  const lideres = shLideres.getRange(1,2,lastRowLideres,2).getValues();
  
  return [JSON.stringify(comerciales), JSON.stringify(lideres)];
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
/*function loadPage(page) {
  return HtmlService.createHtmlOutputFromFile(page).getContent();
}*/
