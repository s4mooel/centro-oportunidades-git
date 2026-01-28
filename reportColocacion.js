function feedLideres() {
  const lideres = dataLideres();
  const mapLideres = [];
  for(let i= 0 ; i < lideres.length ; i++){
    const row = lideres[i];
    if(row[4] === 1) mapLideres.push([row[0], row[1]]);
  }
  //Logger.log(mapLideres);
  return mapLideres;
}
function feedComerciales() {
  const comerciales = dataComerciales();
  const mapComerciales = [];
  for(let i = 0; i < comerciales.length ; i++){
    const row = comerciales[i];
    if(row[6] === 1) mapComerciales.push([row[0], row[1]]);
  }
  //Logger.log(mapComerciales);
  return mapComerciales;
}
function feedRegionales() {
  const regionales = ['EJE CAFETERO', 'BOGOTÁ Y CUNDINAMARCA', 'VALLE Y CAUCA', 'SANTANDERES Y ARAUCA', 'CENTRO SUR', 'CARIBE', 'ANTIOQUIA'];
  return regionales;
}

function feedCargo(){
  const cargos = ['Asesor Pyme Relacional', 'Ejecutivo Empresarial', 'Ejecutivo Hunter', 'Ejecutivo Pyme Relacional', 'Supernumerario Pyme']

  return cargos;
}
function metasComerciales() {
  const lideres = dataLideres();
  const comerciales = dataComerciales();
  const vencimiento = dataVencimiento();
  const metasCol = dataComColocacion();
  const desembolsos = dataDesembolsos();

  const comercialesAmort = new Map();
  const mapLideres = new Map();
  const mapDesembolsos = new Map();
  const totalComerciales = [];

  for(let i = 0; i < lideres.length ; i++){
    const row = lideres[i];
    const key = row[0];
    mapLideres.set(key, row);
  }

  //Logger.log(mapLideres.get(2));

  for(let i = 0; i < vencimiento.length ; i++){
    const __row = vencimiento[i];
    const row = [__row[1],__row[2],__row[3],__row[4],__row[5],__row[6],__row[7],__row[8]];
    if(comercialesAmort.has(row[6])){
      const rowMap = comercialesAmort.get(row[6]);
      for(let j = 0 ; j < 6; j++){
        rowMap[j] += row[j];
      }
    } else {
      const key = row[6];
      comercialesAmort.set(key, row);
    }
  }

  //Logger.log(comercialesAmort.get(2));

  for(let i = 0; i < desembolsos.length ; i++){
    const __row = desembolsos[i];
    const row = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if(__row[1] === 'Desembolsado' && __row[9] === 1){
      const normValue = (parseInt(__row[2],10) || 0) % 1e6 === (parseInt(__row[2],10) || 0) ? (parseInt(__row[2],10) || 0)*1e6 : (parseInt(__row[2],10) || 0);
      const monthRow = new Date(__row[3]).getMonth() || 12; // 12 es para valores sin fecha asociada
      row[monthRow] = normValue;
      row.push(__row[8])
      //Logger.log(row);


      if(mapDesembolsos.has(row[13])){
        const rowMap = mapDesembolsos.get(row[13]);
        for(let j = 0; j < 13 ; j++){
          rowMap[j] += row[j];
        }
      } else {
        const key = row[13];
        mapDesembolsos.set(key,row);
      }
    }
  }

  //Logger.log(mapDesembolsos.get(6))
  
  for(let i = 0; i < comerciales.length ; i++){
    
    const row = comerciales[i];
    const rowCol = metasCol[i];
    const comercial_id = row[0];
    const lider_id = row[3];
    const rowTotal = [];
    rowTotal.push(...row,...rowCol);
    
    if(comercialesAmort.has(comercial_id)){
      rowTotal.push(...comercialesAmort.get(comercial_id))
    }

    if(mapLideres.has(lider_id)){
      rowTotal.push(...mapLideres.get(lider_id))
    }
    if(mapDesembolsos.has(comercial_id)){
      rowTotal.push(...mapDesembolsos.get(comercial_id));
    }

    //["comercial_id"0,"nombre_comercial"1,"correo_usuario"2,"lider_id"3,"cargo_comercial"4,"sucursal"5,"status_active"6,"role_id"7,"fecha_reg"8,"id_comercial_legal"9,"comercial_id"10,0+11,1+12,2+13,3+14,4+15,5+16,6+17,7+18,8+19,9+20,10+21,11+22,3+23,4+24,5+25,6+26,7+27,8+28,"comercial_id"29,"status_active"30,"lider_id"31,"nombre_lider"32,"correo_lider"33,"regional"34,"status_active"35,"role_id"36,"fecha_reg"37]
    //totalComerciales.push(rowTotal);
    totalComerciales.push({
      comercial_id : rowTotal[0] || 0,
      nombre_comercial : rowTotal[1] || '',
      cargo_comercial : rowTotal[4] || '',
      sucursal : rowTotal[5] || '',
      meta_jan : rowTotal[11] || 0,
      meta_feb : rowTotal[12] || 0,
      meta_mar : rowTotal[13] || 0,
      meta_apr : rowTotal[14] || 0,
      meta_may : rowTotal[15] || 0,
      meta_jun : rowTotal[16] || 0,
      meta_jul : rowTotal[17] || 0,
      meta_aug : rowTotal[18] || 0,
      meta_sep : rowTotal[19] || 0,
      meta_oct : rowTotal[20] || 0,
      meta_nov : rowTotal[21] || 0,
      meta_dec : rowTotal[22] || 0,
      amort_jan : 0,
      amort_feb : 0,
      amort_mar : 0,
      amort_apr : rowTotal[23] || 0,
      amort_may : rowTotal[24] || 0,
      amort_jun : rowTotal[25] || 0,
      amort_jul : rowTotal[26] || 0,
      amort_aug : rowTotal[27] || 0,
      amort_sep : rowTotal[28] || 0,
      amort_oct : 0,
      amort_nov : 0,
      amort_dec : 0,
      desem_jan : rowTotal[38] || 0,
      desem_feb : rowTotal[39] || 0,
      desem_mar : rowTotal[40] || 0,
      desem_apr : rowTotal[41] || 0,
      desem_may : rowTotal[42] || 0,
      desem_jun : rowTotal[43] || 0,
      desem_jul : rowTotal[44] || 0,
      desem_aug : rowTotal[45] || 0,
      desem_sep : rowTotal[46] || 0,
      desem_oct : rowTotal[47] || 0,
      desem_nov : rowTotal[48] || 0,
      desem_dec : rowTotal[49] || 0,
      lider : rowTotal[32] || '',
      regional : rowTotal[34] || ''
    });
  }

  //Logger.log(JSON.stringify(totalComerciales));
  return totalComerciales;
}

function filtrarYagregar (filtros){
  const data = metasComerciales();
  Logger.log("Los datos de los filtros son:");
  Object.entries(filtros).forEach(([clave, valor]) => Logger.log(`${clave} ${valor}`));

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  Logger.log("La condición de filtrado arrojan: " + (filtros.lider.includes(data[2].lider)))
  const filtrados = data.filter(row => {
    return (filtros.lider.includes(row.lider)) || (filtros.cargo.includes(row.cargo_comercial)) || (filtros.regional.includes(row.regional)) || (filtros.comercial.includes(row.nombre_comercial))
  });
  Logger.log("Total de filas filtradas " + filtrados.length);
  const grupos = {};
  const amort = {};
  const reaching = {};
  Logger.log(JSON.stringify(filtrados[0]));
  filtrados.forEach(row => {
    const clave = [
      filtros.lider ? row.lider : "Todos los líderes",
      filtros.comercial ? row.nombre_comercial : "Todos los líderes",
      filtros.regional ? row.regional : "Todos los líderes",
    ].join("|");
    Logger.log("Las claves son: " + clave);
    if(!grupos[clave]) grupos[clave] = new Array(12).fill(0);
    if(!amort[clave]) amort[clave] = new Array(12).fill(0);
    if(!reaching[clave]) reaching[clave] = new Array(12).fill(0);

    grupos[clave][0] += row.meta_jan;
    grupos[clave][1] += row.meta_feb;
    grupos[clave][2] += row.meta_mar;
    grupos[clave][3] += row.meta_apr;
    grupos[clave][4] += row.meta_may;
    grupos[clave][5] += row.meta_jun;
    grupos[clave][6] += row.meta_jul;
    grupos[clave][7] += row.meta_aug;
    grupos[clave][8] += row.meta_sep;
    grupos[clave][9] += row.meta_oct;
    grupos[clave][10] += row.meta_nov;
    grupos[clave][11] += row.meta_dec;

    amort[clave][0] += row.amort_jan;
    amort[clave][1] += row.amort_feb;
    amort[clave][2] += row.amort_mar;
    amort[clave][3] += row.amort_apr;
    amort[clave][4] += row.amort_may;
    amort[clave][5] += row.amort_jun;
    amort[clave][6] += row.amort_jul;
    amort[clave][7] += row.amort_aug;
    amort[clave][8] += row.amort_sep;
    amort[clave][9] += row.amort_oct;
    amort[clave][10] += row.amort_nov;
    amort[clave][11] += row.amort_dec;

    reaching[clave][0] += row.desem_jan;
    reaching[clave][1] += row.desem_feb;
    reaching[clave][2] += row.desem_mar;
    reaching[clave][3] += row.desem_apr;
    reaching[clave][4] += row.desem_may;
    reaching[clave][5] += row.desem_jun;
    reaching[clave][6] += row.desem_jul;
    reaching[clave][7] += row.desem_aug;
    reaching[clave][8] += row.desem_sep;
    reaching[clave][9] += row.desem_oct;
    reaching[clave][10] += row.desem_nov;
    reaching[clave][11] += row.desem_dec;
  });

  const series = Object.keys(grupos).map(nombre => ({
    name: nombre,
    type: "line",
    smooth: true,
    data: grupos[nombre]
  }));
  /*const amortizaciones = Object.keys(amort).map(nombre => ({
    name: nombre+"amort",
    type: "line",
    smooth: true,
    data: amort[nombre]
  }));
  const totalDesembolsos = Object.keys(reaching).map(nombre => ({
    name: nombre+"desem",
    type: "line",
    smooth: true,
    data: reaching[nombre]
  }));¨*/

  return {
    categorias: meses,
    series
  };
}
