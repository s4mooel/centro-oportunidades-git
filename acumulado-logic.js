function estadoActa(fecha) {
  
  const fechaActa = new Date(fecha);
  fechaActa.setHours(0,0,0,0);
  
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  const hoyPlus60 = new Date(hoy);
  hoyPlus60.setDate(hoy.getDate()+60);
  
  if(!fecha){
    return "Sin acta";
  }  else if (fechaActa < hoy) {
    return "Vencida";
  } else if (hoy < fechaActa && fechaActa <= hoyPlus60) {
    return "Pronta a vencer"
  } else if(fechaActa > hoy){
    return "Vigente";
  }
}

function getBaseComercial() {
  const today = new Date();
  const levelChief = findLevelChief();
  const baseClientes = allDataSheet.dataClientes();
  const comerciales = allDataSheet.dataComerciales();
  

  const mapComerciales = new Map();
  if(levelChief.level){
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
  } else {
    const comercial = getComercial(getEmail()[1], comerciales);
    const comercial_id = comercial[0];
    mapComerciales.set(comercial_id, comercial);
  }

  const clientes = [];
  for(let i = 0; i < baseClientes.length; i++){
    const row = baseClientes[i];
    const comercial_id = row[5];
    if(mapComerciales.has(comercial_id)) {
      const currComercial = mapComerciales.get(comercial_id);
      const id = currComercial[9];
      const nombre = currComercial[1];
      const cargo = currComercial[4];
      clientes.push([...row, id, nombre, cargo]);
    }
  }
  
  const empresarial_pyme = allDataSheet.dataEmpresarialPyme();

  Logger.log("Length of each array are: " + clientes.length + ", " + empresarial_pyme.length);

  const mapPlan20 = new Map();

  for(let i = 0; i < empresarial_pyme.length; i++){
    const row = empresarial_pyme[i];
    const cliente_id_real = row[1];
    mapPlan20.set(cliente_id_real, row);
  }
  
  Logger.log("Size of each map are: "+ mapPlan20.size);

  const acumulado = [];

  for(let i = 0; i < clientes.length; i++){
    const cliente = clientes[i];
    const cliente_id = cliente[0];
    const cliente_id_real = cliente[1];
    const row_for_acumulado = {
      id_legal_comercial: cliente[cliente.length-3],
      nombre_comercial: cliente[cliente.length-2],
      cargo_comercial: cliente[cliente.length-1],
      cliente_id : cliente_id,
      nit_cliente : cliente_id_real,
      nombre_cliente : cliente[2],
      acta: cliente[11],
      fecha_vigencia: normalizeDate(cliente[12]),
      estado_acta: estadoActa(cliente[12]),
      vma_total: cliente[13]*1e6,
      vma_solicitado: cliente[14]*1e6,
      nomina: cliente[15],
      recaudo: cliente[16],
      plan_20: '',
      gestion_20: '',
    }

    const month = today.getMonth();
    for(let i = 17; i < 18 + month; i++){
      row_for_acumulado[i-17 + "amortizado"] = cliente[i];
    }

    if(mapPlan20.has(cliente_id_real)){
      const plan20 = mapPlan20.get(cliente_id_real);
      row_for_acumulado.plan_20 = "SI";
      row_for_acumulado.gestion_20 = plan20[19];
    } else {
      row_for_acumulado.plan_20 = "NO";
    }

    
    

    acumulado.push(row_for_acumulado);
  }


  //Logger.log("Comercial id: " + comercial_id)
  Logger.log("Total rows. Filtered by comercial and status_active: " + acumulado.length);
  return {
    data: JSON.stringify(acumulado), 
    level: levelChief.level
  };
}