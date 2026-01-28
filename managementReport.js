function joinLiderComerCli() {
  const lideres =  allDataSheet.dataLideres();
  const mapL =  new Map();
  for(let i = 0; i < lideres.length ; i++){
    const row = lideres[i];
    const key = row[0];
    mapL.set(key, row);
  }

  //Logger.log("Size of 'mapL': " + mapL.size);

  const comerciales =  allDataSheet.dataComerciales();

  const liderComercial = new Map();


  let comercialesWithNoEmail = 0;
  for(let i = 0; i < comerciales.length ; i++){
    const row = comerciales[i];
    const lider_id = row[3];
    if(row[6] === 1 && row[2] !== 'gustavo.ropero@davivienda.com' && row[2] !== 'lcgonzalez@davivienda.com'){
      //Logger.log(row[2])
      if(mapL.has(lider_id)){
        const valueLider = mapL.get(lider_id);
        liderComercial.set(row[0],[row[0], row[1], row[10], row[4], valueLider[1], valueLider[3]]);
      } else {
        liderComercial.set(row[0],[row[0], row[1], row[10], row[4], '', '']);
      }
    }
  }

  Logger.log("Size of 'liderComercial': " + liderComercial.size);

  const clientes = allDataSheet.dataClientes();
  const liderComercialCliente = new Map();


  //Logger.log("Total rows on 'clientes': " + clientes.length);
  for(let i = 0; i < clientes.length ; i++){
    const row = clientes[i];
    const comercial_id = row[5];
    if(row[6] !== 2){
      if(liderComercial.has(comercial_id)){
        
        const valueLiderComercial = liderComercial.get(comercial_id);
        liderComercialCliente.set(row[0], [row[0], row[1], row[2], row[7], row[9], row[11], row[12], row[13], row[14], row[15], row[16], ...valueLiderComercial.slice(1)]);
      } else {
        liderComercialCliente.set(row[0], [row[0], row[1], row[2], row[7], row[9], row[11], row[12], row[13], row[14], row[15], row[16], '', '', '', '']);
      }
    }
  }
  liderComercialCliente.delete("cliente_id");

/*   Logger.log("Total rows liderComercialCliente: " + liderComercialCliente.size);
  Logger.log("First row: " + liderComercialCliente.get('d0ca0d5f-0e78-4fa3-b3b8-b496d6257e9f')); */

  return [liderComercialCliente, liderComercial];
}
//------------------------------------------------------------------------------------------------------------------------------------------------
//                                                              Report      
//------------------------------------------------------------------------------------------------------------------------------------------------
function reportByTable(data){
  const join = joinLiderComerCli()
  const clientesFlat = join[0];
  const comerciales = join[1];

  comerciales.delete("comercial_id");

  const fromSheet = allDataSheet[data]();
  const comerciales_ = allDataSheet.dataComerciales();

  const augmentedComerciales = [];
  const result =  {};

  for(let i  = 0; i < comerciales_.length; i++){
    const row = comerciales_[i];
    const comercial_id = row[0];
    if(comerciales.has(comercial_id)){
      const comercial = comerciales.get(comercial_id);
      augmentedComerciales.push({
        banca: comercial[2],
        comercial: comercial[1],
        cargo: comercial[3],
        lider: comercial[4],
        regional: comercial[5]
      });
    }
  }

  result.comerciales = JSON.stringify(augmentedComerciales);

  switch(data){
    case "dataDesembolsos": {
      //-------------------------------------------------------------------------------------------------------------------------------------------
      //                                                             Desembolsos      
      //-------------------------------------------------------------------------------------------------------------------------------------------
      const augmentedDesembolsos = [];
      for(let i = 0; i < fromSheet.length; i++){
        const row = fromSheet[i];
        if(row[2] % 1e6 === row[2]) row[2] = row[2]*1e6;
        const cliente_id = row[7];
        if(clientesFlat.has(cliente_id) && row[9] === 1){
          const cliente = clientesFlat.get(cliente_id);
          augmentedDesembolsos.push({
            cliente_id : cliente[0],
            estado: row[1],
            valor_desembolso: parseFloat(row[2]),
            fecha: row[3],
            banca: cliente[12],
            comercial: cliente[11],
            cargo: cliente[13],
            lider: cliente[14],
            regional: cliente[15]
          });
        }
      }
      result.desembolsos = JSON.stringify(augmentedDesembolsos);
      break;
    }
    case "dataColocacion": {
      //-------------------------------------------------------------------------------------------------------------------------------------------
      //                                                              Cupos de crédito     
      //-------------------------------------------------------------------------------------------------------------------------------------------
      const augmentedColocacion = [];
      for(let i = 0; i < fromSheet.length; i++){
        const row = fromSheet[i];
        const cliente_id = row[5];
        if(clientesFlat.has(cliente_id) && row[7] === 1){
          const cliente = clientesFlat.get(cliente_id);
          augmentedColocacion.push({
            estado: row[2],
            fecha: row[1],
            banca: cliente[12],
            comercial: cliente[11],
            cargo: cliente[13],
            lider: cliente[14],
            regional: cliente[15]
          });
        }
      }
      result.colocacion = JSON.stringify(augmentedColocacion);
      break;
    }
    case "dataVisitas": {
      //-------------------------------------------------------------------------------------------------------------------------------------------
      //                                                              Visitas     
      //-------------------------------------------------------------------------------------------------------------------------------------------
      const augmentedVisitas = [];
      let countJennyLiliana = 0;
      for(let i = 0; i < fromSheet.length; i++){
        const row = fromSheet[i];
        const cliente_id = row[6];
        if(clientesFlat.has(cliente_id) && row[8] === 1){
          const cliente = clientesFlat.get(cliente_id);

          new_obj = {
            estado: row[1],
            fecha: row[3],
            banca: cliente[12],
            comercial: cliente[11],
            cargo: cliente[13],
            lider: cliente[14],
            regional: cliente[15]
          }
          augmentedVisitas.push(new_obj)
          if(cliente_id === '1110fa61-b9e6-4f5e-9c0c-877b745519ff') {
            console.log(cliente);
            countJennyLiliana +=1;
            console.log(JSON.stringify(new_obj))
          }
        }
      }
      result.visitas = JSON.stringify(augmentedVisitas);

      console.log(countJennyLiliana);
      break;
    }
    case "dataCaptacion": {
      const augmentedCaptacion = [];
      for(let i = 0; i < fromSheet.length; i++){
        const row = fromSheet[i];
        const cliente_id = row[8];
        row[4] = parseFloat(row[4]) || 0;
        row[5] = parseFloat(row[5]) || 0;
        if(clientesFlat.has(cliente_id) && row[10] === 1){
          const cliente = clientesFlat.get(cliente_id);
          augmentedCaptacion.push({
            estado: row[2],
            producto: row[3],
            valor_negociado: row[4] % 1e6 === row[4] ? row[4]*1e6 : row[4],
            valor_aceptado: row[5] % 1e6 === row[5] ? row[5]*1e6 : row[5],
            fecha: row[1],
            banca: cliente[12],
            comercial: cliente[11],
            cargo: cliente[13],
            lider: cliente[14],
            regional: cliente[15]
          });
        }
      }
      result.captacion = JSON.stringify(augmentedCaptacion);
      break;
    }
    case "dataTransaccional": {
      const augmentedTransaccional = [];
      for(let i = 0; i < fromSheet.length; i++){
        const row = fromSheet[i];
        const cliente_id = row[8];
        row[4] = parseFloat(row[4]) || 0;
        row[5] = parseFloat(row[5]) || 0;
        if(clientesFlat.has(cliente_id) && row[10] === 1){
          const cliente = clientesFlat.get(cliente_id);
          augmentedTransaccional.push({
            estado: row[2],
            producto: row[3],
            valor_negociado: row[4] % 1e6 === row[4] ? row[4]*1e6 : row[4],
            valor_aceptado: row[5] % 1e6 === row[5] ? row[5]*1e6 : row[5],
            fecha: row[1],
            banca: cliente[12],
            comercial: cliente[11],
            cargo: cliente[13],
            lider: cliente[14],
            regional: cliente[15]
          });
        }
      }
      result.transaccional = JSON.stringify(augmentedTransaccional);
      break;
    }
    case "dataSeguros": {
      const augmentedSinergia = [];
      for(let i = 0; i < fromSheet.length; i++){
        const row = fromSheet[i];
        const cliente_id = row[7];
        row[4] = parseFloat(row[4]) || 0;
        row[5] = parseFloat(row[5]) || 0;
        if(clientesFlat.has(cliente_id) && row[9] === 1){
          const cliente = clientesFlat.get(cliente_id);
          augmentedSinergia.push({
            estado: row[2],
            producto: row[3],
            valor_negociado: row[4] % 1e6 === row[4] && row[4] % 1e5 === row[4] ? row[4]*1e6 : row[4],
            valor_aceptado: row[5] % 1e6 === row[5] && row[5] % 1e5 === row[5] ? row[5]*1e6 : row[5],
            fecha: row[1],
            banca: cliente[12],
            comercial: cliente[11],
            cargo: cliente[13],
            lider: cliente[14],
            regional: cliente[15]
          });
        }
      }
      result.sinergia = JSON.stringify(augmentedSinergia);
      break;
    }
    case "dataComColocacion": {
      break;
    }
    case "dataVencimientos": {
      break;
    }
    case "dataClientes": {
      //-------------------------------------------------------------------------------------------------------------------------------------------
      //                                                              Actas      
      //-------------------------------------------------------------------------------------------------------------------------------------------
        const resultActas = [];
        const augmentedNomRec = [];
        for(let i = 0; i < fromSheet.length; i++){
          const row = fromSheet[i];
          const cliente_id = row[0];
          if(clientesFlat.has(cliente_id)){
            const cliente = clientesFlat.get(cliente_id);
            resultActas.push({
              nitCliente: cliente[1],
              nombreCliente: cliente[2],
              origenCliente: cliente[3],
              estadoActa : estadoActa(cliente[6]),
              cupoAprobado: parseFloat(cliente[7])*1e6 || 0,
              cupoSolicitado: parseFloat(cliente[8])*1e6 || 0,
              banca: cliente[12],
              comercial: cliente[11],
              cargo: cliente[13],
              lider: cliente[14],
              regional: cliente[15]
            });
            augmentedNomRec.push({
              nitCliente: cliente[1],
              nombreCliente: cliente[2],
              origenCliente: cliente[3],
              nomina: cliente[9],
              recaudo: cliente[10],
              banca: cliente[12],
              comercial: cliente[11],
              cargo: cliente[13],
              lider: cliente[14],
              regional: cliente[15]
            });
          }
        }
      //-------------------------------------------------------------------------------------------------------------------------------------------
      //                                                              Nómina y Recaudo      
      //-------------------------------------------------------------------------------------------------------------------------------------------
      result.actas = JSON.stringify(resultActas);
      result.nom_rec = JSON.stringify(augmentedNomRec);
      break;
    }
  }
  return result;
}
//--------------------------------------------------------------------------------------------------------------------------------------------
//                                                     First report function
//--------------------------------------------------------------------------------------------------------------------------------------------
function report(){

  console.time("Execution time 'report()'")
  const join = joinLiderComerCli()
  const clientesFlat = join[0];
  const comerciales = join[1];

  comerciales.delete("comercial_id");

  const comerciales_ = allDataSheet.dataComerciales();
  /* const desembolsos = allDataSheet.dataDesembolsos();
  const colocacion = allDataSheet.dataColocacion();
  const visitas = allDataSheet.dataVisitas();
  const captacion = allDataSheet.dataCaptacion();
  const transaccional = allDataSheet.dataTransaccional();
  const sinergia = allDataSheet.dataSeguros(); */
  const metas = allDataSheet.dataComColocacion();
  //const clientes = allDataSheet.dataClientes();

  const augmentedComerciales = [];
  const resultActas = [];
  const augmentedDesembolsos = [];
  const augmentedColocacion = [];
  const augmentedVisitas = [];
  const augmentedCaptacion = [];
  const augmentedTransaccional = [];
  const augmentedSinergia = [];
  const augmentedMetas = [];
  const augmentedVencimiento = [];
  const augmentedNomRec = [];


  //------------------------------------------------------------------------------------------------------------------------------------------
  //                                                          Comerciales
  //------------------------------------------------------------------------------------------------------------------------------------------

  for(let i  = 0; i < comerciales_.length; i++){
    const row = comerciales_[i];
    const comercial_id = row[0];
    if(comerciales.has(comercial_id)){
      const comercial = comerciales.get(comercial_id);
      augmentedComerciales.push({
        banca: comercial[2],
        comercial: comercial[1],
        cargo: comercial[3],
        lider: comercial[4],
        regional: comercial[5]
      });
    }
  }

  for(let i = 0; i < metas.length; i++){
    const row = metas[i];
    const comercial_id = row[0];
    if(comerciales.has(comercial_id)){
      const comercial = comerciales.get(comercial_id);
      augmentedMetas.push({
        '2025-01': row[1],
        '2025-02': row[2],
        '2025-03': row[3],
        '2025-04': row[4],
        '2025-05': row[5],
        '2025-06': row[6],
        '2025-07': row[7],
        '2025-08': row[8],
        '2025-09': row[9],
        '2025-10': row[10],
        '2025-11': row[11],
        '2025-12': row[12],
        banca: comercial[2],
        comercial: comercial[1],
        cargo: comercial[3],
        lider: comercial[4],
        regional: comercial[5]
      })
    }
  }
//-------------------------------------------------------------------------------------------------------------------------------------------
//                                                              Vencimiento      
//-------------------------------------------------------------------------------------------------------------------------------------------

    

    Logger.log(`Total rows for each augmented (actas, desembolsos, colocacion, visitas, captacion, transaccional, sinergia, metas, vencimiento, nom_rec): ${resultActas.length}, ${augmentedDesembolsos.length}, ${augmentedColocacion.length}, ${augmentedVisitas.length}, ${augmentedCaptacion.length}, ${augmentedTransaccional.length}, ${augmentedSinergia.length}, ${augmentedMetas.length}, ${augmentedVencimiento.length}, ${augmentedNomRec.length}`)
    console.timeEnd("Exucution time 'report()'")
  return {
    comerciales: JSON.stringify(augmentedComerciales),
    //actas: JSON.stringify(resultActas),
    //desembolsos: JSON.stringify(augmentedDesembolsos),
    //colocacion: JSON.stringify(augmentedColocacion),
    //visitas: JSON.stringify(augmentedVisitas),
    //captacion: JSON.stringify(augmentedCaptacion),
    //transaccional: JSON.stringify(augmentedTransaccional),
    //sinergia: JSON.stringify(augmentedSinergia),
    metas: JSON.stringify(augmentedMetas),
    //nom_rec: JSON.stringify(augmentedNomRec)
  };
  
}