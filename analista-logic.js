function getSheetDataAnalytic(data) {
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

  for(let i = 0; i < comerciales.length;i++){
    const row = comerciales[i]
    if(row[6] === 1){
      const key = row[0];
      mapComerciales.set(key, row);
    }
  }

  const lideres = allDataSheet.dataLideres();
  const mapLideres = new Map();

  for(let i = 0; i < lideres.length; i++){
    const row = lideres[i];
    if(row[4] === 1){
      const key = row[0];
      mapLideres.set(key, row);
    }
  }

  const analista = getAnalista(getEmail()[1], allDataSheet.dataAnalistas());
  

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
          const lider_id = currComercial[3];
          if(mapLideres.has(lider_id)){
            const currLider = mapLideres.get(lider_id);
            const regional = currLider[3]
            if(regional === analista[3]){
              const currCliente = mapClientes.get(cliente_id);
              regSheetData.push({
                lider_legal: currLider[7],
                nombre_lider: currLider[1],
                cargo_lider: currLider[8],
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
          }
        }
        break;
      }
      case "dataColocacion": {
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const lider_id = currComercial[3];
          if(mapLideres.has(lider_id)){
            const currLider = mapLideres.get(lider_id);
            const regional = currLider[3]
            if(regional === analista[3]){
              const currCliente = mapClientes.get(cliente_id);
              regSheetData.push({
                cargo_lider: currLider[8],
                cargo_comercial: currComercial[4],
                lider_legal: currLider[7],
                nombre_lider: currLider[1],
                id_legal: currComercial[9],
                nombre_comercial: currComercial[1],
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
          }
        }
        break;
      }
      case "dataDesembolsos": {
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const lider_id = currComercial[3];
          if(mapLideres.has(lider_id)){
            const currLider = mapLideres.get(lider_id);
            const regional = currLider[3]
            if(regional === analista[3]){
              const currCliente = mapClientes.get(cliente_id);
              regSheetData.push({
                cargo_lider: currLider[8],
                cargo_comercial: currComercial[4],
                lider_legal: currLider[7],
                nombre_lider: currLider[1],
                id_legal: currComercial[9],
                nombre_comercial: currComercial[1],
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
          }
        }
        break;
      }
      case "dataCaptacion": {
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const lider_id = currComercial[3];
          if(mapLideres.has(lider_id)){
            const currLider = mapLideres.get(lider_id);
            const regional = currLider[3]
            if(regional === analista[3]){
              const currCliente = mapClientes.get(cliente_id);
              regSheetData.push({
                cargo_lider: currLider[8],
                cargo_comercial: currComercial[4],
                lider_legal: currLider[7],
                nombre_lider: currLider[1],
                id_legal: currComercial[9],
                nombre_comercial: currComercial[1],
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
          }
        }
        break;
      }
      case "dataTransaccional": {
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const lider_id = currComercial[3];
          if(mapLideres.has(lider_id)){
            const currLider = mapLideres.get(lider_id);
            const regional = currLider[3]
            if(regional === analista[3]){
              const currCliente = mapClientes.get(cliente_id);
              regSheetData.push({
                cargo_lider: currLider[8],
                cargo_comercial: currComercial[4],
                lider_legal: currLider[7],
                nombre_lider: currLider[1],
                id_legal: currComercial[9],
                nombre_comercial: currComercial[1],
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
          }
        }
        break;
      }
      case "dataSeguros":{
        if(mapClientes.has(cliente_id) && mapComerciales.has(comercial_id) && state !== '' && status_active === 1){
          const currComercial = mapComerciales.get(comercial_id);
          const lider_id = currComercial[3];
          if(mapLideres.has(lider_id)){
            const currLider = mapLideres.get(lider_id);
            const regional = currLider[3]
            if(regional === analista[3]){
              const currCliente = mapClientes.get(cliente_id);
              regSheetData.push({
                cargo_lider: currLider[8],
                cargo_comercial: currComercial[4],
                lider_legal: currLider[7],
                nombre_lider: currLider[1],
                id_legal: currComercial[9],
                nombre_comercial: currComercial[1],
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
          }
        }
        break;
      }
    }
  }
  return JSON.stringify(regSheetData);
}


