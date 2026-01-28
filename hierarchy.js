function spreadingHierarchy() {

  // Este código fue usado para la construcción del spreadsheets base_usuarios por lo que no funciona para actualziar ya que borraría todos los uuid y los cmabiaría por unos nuevos, el problema es que las hojas de comerciales y líderes no se conectan a este por lo que ocurrirían fallos a la asignación de foreign keys. Sin embargo, puede basarse en el mismo para de sarrollar un script de actualización a partir de la información requerida previamente expuesta en el doc 'manual centro de oportunidades'
 /*  const plantId = '1b513yG0bIM3JQiHGK5nMvRiKptTeIbF6wc7hXNY-ncI';
  const usuariosId = '1kHJF-ucr7MVdo2DuCYRv7IDrS7fSeP3XbgfcO8f5A7I';
  const ssBaseUsuarios  = SpreadsheetApp.openById(usuariosId);
  const ssHierarchy = SpreadsheetApp.openById(plantId);
  const shPlanta = ssHierarchy.getSheetByName('Planta');
  const sheetsBaseUsuarios = ssBaseUsuarios.getSheets();
  const dataPlanta = shPlanta.getDataRange().getValues();

  const workbookByChief = new Map([
    ["jefe8", new Map()],
    ["jefe7", new Map()],
    ["jefe6", new Map()],
    ["jefe5", new Map()],
    ["jefe4", new Map()],
    ["jefe3", new Map()],
    ["jefe2", new Map()],
    ["jefe1", new Map()],
  ]);

  dataPlanta.shift();

  for(let i = 0; i < dataPlanta.length; i++){
    const row = dataPlanta[i];
    const onlyChiefs = row.length - 9 - 1;
    row.reverse();
    for(let j = 0; j < onlyChiefs; j +=6){
      const key = row[j+6];
      const over = row[j-1]
      const uuid = Utilities.getUuid();
      const currBoss = [uuid, ...row.slice(j, j+7).reverse(),1, 1,new Date() ,[over]];
      const currLevel = workbookByChief.get("jefe" + (onlyChiefs-j)/7);
      if(currLevel.has(key)){
        const currChief = currLevel.get(key);
        const arrayOfUnders = currChief[currChief.length - 1]
        if(!arrayOfUnders.includes(over)) arrayOfUnders.push(over);
      } else {
        currLevel.set(key, currBoss);
      }
      j++;
    }
  }


  const chiefResult = new Map([
    ["jefe1", []],
    ["jefe2", []],
    ["jefe3", []],
    ["jefe4", []],
    ["jefe5", []],
    ["jefe6", []],
    ["jefe7", []],
    ["jefe8", []],
  ]);


  for(let i = 1; i < workbookByChief.size+1; i++){
    const key = "jefe" + i;
    const nextKey = `jefe${i+1}`;
    const currLevel = workbookByChief.get(key);
    const nextLevel = workbookByChief.get(nextKey);
    if(nextLevel){
      currLevel.forEach(value => {
        const overChief = value[value.length-1];
        const rowChief = [...value.slice(0,value.length-1)];

        for(let j = 0; j < overChief.length; j++){
          const currValue = overChief[j];
          if(nextLevel.has(currValue)){
            const currOverChief = nextLevel.get(currValue);
            const id_chief = currOverChief[0];
            //console.log(id_chief)
            rowChief.push(id_chief);
            //console.log(rowChief);
          }
        }
        chiefResult.get(key).push(rowChief);
    });
    } else if(key === 'jefe8') {
      currLevel.forEach(value => {
        const realValue =  value;
        realValue.pop()
        chiefResult.get(key).push(realValue);
      });
    }
  }

  //console.log(chiefResult.get("jefe8"));



  for(let i = 0; i < sheetsBaseUsuarios.length; i++){
    const sheet = sheetsBaseUsuarios[i];
    const name = sheet.getName();
    if(chiefResult.has(name)){
      sheet.getRange(1,1,1,11).setValues([[
        name+"_id",
        "id_legal_"+name ,
        "nombre_"+name,
        "cargo_"+name,
        "correo_"+name,
        "regional_"+name,
        "surcusal_"+name,
        "zona_"+name,
        "status_active",
        "role_id",
        "fecha_reg"
      ]]);
      const dataForSheet = chiefResult.get(name);
      for(let j = 0; j < dataForSheet.length; j++){
        const row = dataForSheet[j];
        sheet.getRange(j+2,1,1, row.length).setValues([row]);
      }
    } else if(name === 'lideres') {
      const jefe2Map = workbookByChief.get("jefe2");
      const liderMap = workbookByChief.get("jefe1");
      const dataLider = sheet.getDataRange().getValues();
      //console.log(dataLider);
      const headers =  dataLider[0];
      const idx_legal = headers.indexOf("id_lider_legal");

      for(let j = 0; j < dataLider.length; j++){
        const row = dataLider[j];
        if(liderMap.has(row[idx_legal])){
          const currLider = liderMap.get(row[idx_legal]);
          //console.log(currLider);
          dataLider[j][idx_legal+1] = currLider[3];
          const legal_id = currLider[currLider.length-1][0];
          if(jefe2Map.has(legal_id)){
            const currJefe2 = jefe2Map.get(legal_id);
            dataLider[j][idx_legal+2] = currJefe2[0]; 
          }
        }
      }
      //console.log(dataLider);

      sheet.getRange(1,1,dataLider.length, dataLider[0].length).setValues(dataLider);
    }
  } */

}

