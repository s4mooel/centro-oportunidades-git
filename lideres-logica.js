function findLevelChief(){
  const currEmail = getEmail()[1];

  let currJefe = {};
  const arrayJefes = Object.keys(allDataSheet);
  for(let j = 0; j < arrayJefes.length; j++){
    const jefeData = arrayJefes[j];
    if(jefeData.includes("Jefe") || jefeData.includes('Lideres')){
      //console.log(jefeData);
      const jefe = allDataSheet[jefeData]();
      const headers = jefe[0];
      jefe.shift();
      const idx_email = headers[2].includes("correo_") ? 2: 4; // position for the title "correo_lider" or correo_jefeI (I is a number between 2 and 8)
      const idx_status_active = headers.indexOf("status_active");
      if(!("data" in currJefe)){
        for(let i = 0; i < jefe.length; i++){
          const nowChief = jefe[i];
          if(nowChief[idx_email] === currEmail && nowChief[idx_status_active] === 1){
            currJefe.level = jefeData;
            currJefe.data = nowChief;
            currJefe.idSuperior = new Set([nowChief[0]]);
            break;
          }
        }
      } else {
        const objKey = jefeData.split('data')[1].toLowerCase();
        currJefe[objKey] = new Map();
        const newIdSuperior = new Set();
        for(let  i = 0; i < jefe.length; i++){
          const row = jefe[i];
          const key = row[0];
          const chiefs = row[11].split(",");
          for(let k = 0; k < chiefs.length; k++){
            const chief = chiefs[k]
            if(currJefe.idSuperior.has(chief)) {
              /* console.log("Fullfilled condition for superior above current chief!"); */
              currJefe[objKey].set(key, row);
              newIdSuperior.add(key);
            }
          }
        }
        /* newIdSuperior.forEach(value => console.log("Chief id: " + value)); */
        currJefe.idSuperior = newIdSuperior;
      }
      /* console.log(currJefe);
      currJefe.idSuperior.forEach(value => console.log("Ids from chiefs " + jefeData + ": " + value)); */
    }
  }
  console.log(currJefe);
  return currJefe;

}
function getSheetDataLeader(data) {

  const levelChief = findLevelChief();

  const regSheetData = [];

  const clientes = allDataSheet.dataClientes();
  const mapClientes = new Map();

  for(let i  = 0; i < clientes.length; i++){
    const row = clientes[i];
    const key = row[0];
    mapClientes.set(key, row);
  }

  const comerciales = allDataSheet.dataComerciales();
  const mapComerciales = new Map();

  //const lider = getLider(getEmail()[0], allDataSheet.dataLideres());

  for(let i = 0; i < comerciales.length;i++){
    const row = comerciales[i]
    let levelLideres = null;
    try{
      levelLideres = row[6] === 1 && levelChief.lideres.has(row[3])
    } catch {
      levelLideres = row[6] === 1 && levelChief.data.includes(row[3]);
    }
    if(levelLideres){
      const key = row[0];
      mapComerciales.set(key, row);
    }
  }
  

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

    //Logger.log([register_id, cliente_id, comercial_id, state, visita, status_active, lider[0]])

    switch (data){
      case "dataVisitas": {
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && visita !== '' && status_active === 1){  
          const currComercial = mapComerciales.get(comercial_id);
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            id_legal: currComercial[9],
            nombre_comercial: currComercial[1],
            cargo_comercial: currComercial[4],
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
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            id_legal: currComercial[9],
            nombre_comercial: currComercial[1],
            cargo_comercial: currComercial[4],
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
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            id_legal: currComercial[9],
            nombre_comercial: currComercial[1],
            cargo_comercial: currComercial[4],
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
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            id_legal: currComercial[9],
            nombre_comercial: currComercial[1],
            cargo_comercial: currComercial[4],
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
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            id_legal: currComercial[9],
            nombre_comercial: currComercial[1],
            cargo_comercial: currComercial[4],
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
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const currCliente = mapClientes.get(cliente_id);
          regSheetData.push({
            id_legal: currComercial[9],
            nombre_comercial: currComercial[1],
            cargo_comercial: currComercial[4],
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
      case "dataComerciales":{
        const comercial = comerciales[i];
        const lider_id = comercial[3];
        const substitute = getComercial(comercial[11], comerciales);

        let levelLideres = null;
        try{
          levelLideres = levelChief.lideres.has(lider_id)
        } catch {
          levelLideres = levelChief.data.includes(lider_id);
        }
        
        if(levelLideres){
          regSheetData.push({
            comercial_id: comercial[0],
            nombre_comercial: comercial[1],
            id_legal: comercial[9],
            cargo_comercial : comercial[4],
            nombre_reemplazo: substitute === "" ? "" : substitute[1],
            dateInit: normalizeTime(comercial[12]),
            dateEnd: normalizeTime(comercial[13])
          });
        }
        break;
      }
    }
  }
  //Logger.log("Total registers is : " + regColocacion.length);
  return JSON.stringify(regSheetData);
}

function summaryByBoss(){
  const levelChief = findLevelChief();
  const comerciales = allDataSheet.dataComerciales();
  const clientes = allDataSheet.dataClientes();
  Logger.log(clientes[0]);

  const desembolsos = allDataSheet.dataDesembolsos();
  const visitas = allDataSheet.dataVisitas();
  const sinergia = allDataSheet.dataSeguros();
  const captacion = allDataSheet.dataCaptacion();
  const transaccional = allDataSheet.dataTransaccional();
  const colocacion = allDataSheet.dataColocacion();
  const mapComerciales = new Map();

  for(let i = 0; i < comerciales.length; i++){
    const comercial = comerciales[i];
    const lider_id = comercial[3];
    const comercial_id = comercial[0];
    const status_active = comercial[6];

    let levelLideres = null;
    try{
      levelLideres = levelChief.lideres.has(lider_id) && status_active === 1;
    } catch {
      levelLideres = levelChief.data.includes(lider_id) && status_active === 1;
    }

    if(levelLideres) mapComerciales.set(comercial_id, comercial);
  }
  
  const mapClientes =  new Map();

  for(let i = 0; i < clientes.length; i++){
    const cliente =  clientes[i];
    const cliente_id = cliente[0];
    const status_active = parseInt(cliente[6],10);
    if(status_active === 1) mapClientes.set(cliente_id, cliente);
  }

  const bolsa = {
    visitas : visitas,
    desembolsos : desembolsos,
    sinergia : sinergia,
    captacion : captacion,
    transaccional : transaccional,
    colocacion : colocacion,
  };

  const map = {};

  for(const bols in bolsa){
    const currBolsa = bolsa[bols];
    const headers = currBolsa[0];
    const idx_status_active = headers.indexOf("status_active");
    const idx_comercial_id = headers.indexOf("comercial_id");
    const idx_cliente_id = headers.indexOf("cliente_id");
    for(let i = 0; i < currBolsa.length; i++){
      const row = currBolsa[i];
      const comercial_id = row[idx_comercial_id];
      const status_active = row[idx_status_active];
      const cliente_id = row[idx_cliente_id];
      
      if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && status_active === 1){
        const currComercial = mapComerciales.get(comercial_id);
        if(currComercial[1] in map && bols in map[currComercial[1]]){
          map[currComercial[1]][bols].push(row);
        } else if(!(currComercial[1] in map)){
          map[currComercial[1]] = {};
          map[currComercial[1]][bols] = [row];
        } else if(!(bols in map[currComercial[1]])) {
          map[currComercial[1]][bols] = [row];
        } 
      }
    }
  }

  return JSON.stringify(map);
}