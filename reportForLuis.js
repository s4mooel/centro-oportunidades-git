function summary() {
  const comerciales = joinLiderComerCli()[1];
  
  const summary = {};

  for(const data in allDataSheet){

    if(data === 'dataVisitas' || data === 'dataSeguros' || data === 'dataDesembolsos' || data === 'dataCaptacion' || data === 'dataTransaccional' || data === 'dataColocacion' || data === 'dataComerciales'){
      const logins = {};
      const dataTemp = allDataSheet[data]();

      let totalRegisters = 0;

      for(let i = 0; i < dataTemp.length ; i++){
        const row = dataTemp[i];
        
        let dateIdx = dataTemp[0].indexOf('fecha_registro');
        let idx = dataTemp[0].indexOf('comercial_id');
        const dateRegistered = row[dateIdx]
        const dateInFormat = new Date(dateRegistered);
        const dateStart = new Date('2025-12-15T00:00:00');
        const dateEnd = new Date('2026-01-05T23:59:59');
        const comercial_id = row[idx];

        const countANDregional = [1,'',''];

        if(dateInFormat >= dateStart && dateInFormat <= dateEnd) totalRegisters += 1;

        let sweepper = null;
        if(data === 'dataComerciales') sweepper = comerciales.has(comercial_id);
        else sweepper = comerciales.has(comercial_id) && (dateInFormat >= dateStart && dateInFormat <= dateEnd)
        
        if(sweepper){
          const comercial = comerciales.get(comercial_id);
          const nombre_comercial = comercial[1];
          const cargo = comercial[3];
          const regional = comercial[5];

          if(nombre_comercial in logins) {
            logins[nombre_comercial][0] += 1
          } else {
            countANDregional[1] = regional === '' ? 'Sin regional' : regional;
            countANDregional[2] = cargo === '' ? 'Sin cargo' : cargo;
            logins[nombre_comercial] = countANDregional;
          }
        }
      }
      //console.log(data);
      //console.log(logins)
      const keyInSummary = data.split('data')[1].toLowerCase(); 
      summary[keyInSummary] = logins;

      console.log(totalRegisters)
    }
    
  }
  const adoption = [];
  const adoptionForSheets = []
  for(const comercial in summary.comerciales){
    const row_adoption = {
      nombre: comercial,
      visitas: comercial in summary.visitas ? summary.visitas[comercial][0] : 0,
      per_visitas: comercial in summary.visitas ? 1 : 0,
      seguros: comercial in summary.seguros ? summary.seguros[comercial][0] : 0,
      per_seguros: comercial in summary.seguros ? 1 : 0,
      desembolsos: comercial in summary.desembolsos ? summary.desembolsos[comercial][0] : 0,
      per_desembolsos: comercial in summary.desembolsos ? 1 : 0,
      captacion: comercial in summary.captacion ? summary.captacion[comercial][0] : 0,
      per_captacion: comercial in summary.captacion ? 1 : 0,
      colocacion: comercial in summary.colocacion ? summary.colocacion[comercial][0] : 0,
      per_colocacion: comercial in summary.colocacion ? 1 : 0,
      transaccional: comercial in summary.transaccional ? summary.transaccional[comercial][0] : 0,
      per_transaccional: comercial in summary.transaccional ? 1 : 0,
      cargo: comercial in summary.comerciales ? summary.comerciales[comercial][2] : 'Sin cargo',
      regional: comercial in summary.comerciales ? summary.comerciales[comercial][1] : 'Sin regional'
    }

    const row_forSheet = [
      row_adoption.nombre,
      row_adoption.visitas,
      row_adoption.per_visitas,
      row_adoption.desembolsos,
      row_adoption.per_desembolsos,
      row_adoption.colocacion,
      row_adoption.per_colocacion,
      row_adoption.captacion,
      row_adoption.per_captacion,
      row_adoption.transaccional,
      row_adoption.per_transaccional,
      row_adoption.seguros,
      row_adoption.per_seguros,
      row_adoption.cargo,
      row_adoption.regional
    ]

    adoption.push(row_adoption);
    adoptionForSheets.push(row_forSheet);
  }
  //Logger.log(adoptionForSheets);
  const ssAdopcion = SpreadsheetApp.openById('1Yb_w_9KN64aC-Mc8xHZj9bl8fl6akxvO5JFGa1dkOr0');
  const shInforme = ssAdopcion.getSheetByName('20251110');
  adoptionForSheets[0] = ['nombre_comercial', 'visitas', 'count_visitas', 'desembolsos','count_desembolsos', 'cupos de crédito', 'count_cupos', 'captacion', 'count_captacion', 'transaccional', 'count_transaccional', 'sinergía', 'count_sinergia', 'cargo_comercial', 'regional']
  shInforme.clear();
  shInforme.getRange(1,1,adoptionForSheets.length, adoptionForSheets[0].length,).setValues(adoptionForSheets);
  //console.log(adoption.length)

  return JSON.stringify(adoption);

}