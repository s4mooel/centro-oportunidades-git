function gestionarBolsa(cliente, colocacion, captacion, transaccional, visitas, desembolsos, seguros) {
  const hoy =  new Date();

  const comercial_id = getComercial(getEmail()[0],dataComerciales())[0];
  
  const max_iter = Math.max(captacion.length, transaccional.length, colocacion.length, visitas.length, desembolsos.length, seguros.length);
  const min_iter = (captacion.length === 0 || transaccional.length === 0) ? Math.max(captacion.length, transaccional.length) : Math.min(captacion.length, transaccional.length);

  
  for(let i = 0; i < max_iter; i+=5){

    //Logger.log("Entré al for");
    if(i === 0 && visitas.length > 0){
      //Logger.log("Entré a una condición que no debía entrar");
      shVisitas.appendRow([
        Utilities.getUuid(),
        visitas[i][1],
        visitas[i+2][1],
        visitas[i+1][1],
        visitas[i+3][1] || "",
        hoy,
        cliente,
        comercial_id,
        1 // status_active
      ]);
    }

    if(i === 0 && desembolsos.length > 0){
      //Logger.log("Entré a una condición que no debía entrar");
      shDesembolsos.appendRow([
        Utilities.getUuid(),
        desembolsos[i][1],
        parseInt(desembolsos[i+2][1].replace(/\./g, "").trim(),10),
        desembolsos[i+3][1],
        desembolsos[i+1][1] || "",
        desembolsos[i+5][1] || "",
        hoy,
        cliente,
        comercial_id,
        1, // status_active
        desembolsos[i+4][1]
      ]);
    }

    if(i === 0 && seguros.length > 0){
      //Logger.log("Entré a una condición que no debía entrar");
      shSeguros.appendRow([
        Utilities.getUuid(),
        hoy,
        seguros[i][1],
        seguros[i+2][1],
        parseInt(seguros[i+3][1].replace(/\./g, "").trim(),10) || 0,
        parseInt(seguros[i+4][1].replace(/\./g, "").trim(),10) || 0,
        seguros[i+5][1] || "",
        cliente,
        comercial_id,
        1, // status_active
        hoy
      ]);
    }

    if(i === 0 && colocacion.length > 0){
      //Logger.log("Entré a una condición que no debía entrar");
      shColocacion.appendRow([
        Utilities.getUuid(),
        hoy,
        colocacion[i][1],
        colocacion[i+1][1],
        colocacion[i+2][1],
        cliente,
        comercial_id,
        1, // status_active
        colocacion[i+4][1],
        hoy,
        parseInt(colocacion[i+3][1].replace(/\./g, "").trim(),10)
      ]);
    } 
    /* Logger.log(i < min_iter);
    Logger.log(captacion.length > 0);
    Logger.log(captacion.length === max_iter); */
    if((i< min_iter && captacion.length > 0) || captacion.length === max_iter){
      Logger.log("Entré a la condición para agregar la fila");
      shCaptacion.appendRow([
        Utilities.getUuid(),
        hoy,
        captacion[i+1][1],
        captacion[i][1],
        captacion[i+1][1] !== "Aceptado" ? parseInt(captacion[i+3][1].replace(/\./g, "").trim(),10) : 0,
        captacion[i+1][1] === "Aceptado" ? parseInt(captacion[i+3][1].replace(/\./g, "").trim(),10) : 0,
        captacion[i+2][1],
        captacion[i+4][1],
        cliente,
        comercial_id,
        1, // status_active
        hoy
      ])

    }
    /* Logger.log(transaccional.length > 0);
    Logger.log(transaccional.length === max_iter); */
    if((i < min_iter && transaccional.length > 0) ||transaccional.length === max_iter ) {
      Logger.log("Entré a la condición para agregar la fila");
      shTransaccional.appendRow([
        Utilities.getUuid(),
        hoy,
        transaccional[i+1][1],
        transaccional[i][1],
        transaccional[i+1][1] !== "Efectivo" ? parseInt(transaccional[i+3][1].replace(/\./g, "").trim(),10) : 0,
        transaccional[i+1][1] === "Efectivo" ? parseInt(transaccional[i+3][1].replace(/\./g, "").trim(),10) : 0,
        transaccional[i+2][1],
        transaccional[i+4][1],
        cliente,
        comercial_id,
        1, // status_active
        hoy
      ])
    }

  }
  return {success: true, message : "Gestión realizada existosamente"};
}

function replacement(){
  const comercialesData = allDataSheet.dataComerciales();
  const comercial = getComercial(getEmail()[1], comercialesData);
  const replaceComercial = getComercial(comercial[11], comercialesData);
  const beginning_day = new Date(comercial[12]);
  const last_day = new Date(comercial[13]);
  const today = new Date();
  
  if(today <= last_day && today >= beginning_day){
    console.log("Beginning function. Current comercial: " + replaceComercial);
    return JSON.stringify({time: true, comercial: replaceComercial, myData: comercial})
  } else{
    console.log("Replacement out of time")
    return JSON.stringify({time: false})
  }
}

function activate_replacement(currComercial){
  const cache = CacheService.getUserCache();
  cache.put("email",currComercial,300);
  return {success: true, msg: "Ya puede recargar la página"};
}

