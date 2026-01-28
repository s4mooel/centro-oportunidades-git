/******************** CONFIG ********************/
const CONFIG = {
  // Carpeta raíz "actualizaciones" (Drive Folder ID)
  UPDATES_FOLDER_ID: "1gn3z9Xn9PcIIgnn8AGcF3uU_2r3MLQov",

  // Spreadsheets de producción (IDs) - tus IDs
  BASE_CLIENTES_ID: "1TuqRFOjGEW_b850CRuWm2quVz2z7NsEKivxErBz2JcA", // base_clientes
  BASE_USUARIOS_ID: "1gbK9WQjQge4L5IFZNJJwRh0wl9OfY1w-wqYLZq-ku4o", // base_usuarios

  // Nombres de hojas dentro de las bases
  BASE_CLIENTES_SHEET: "clientes",
  BASE_USUARIOS_SHEET: "comerciales",

  // Spreadsheet donde se crean las hojas TEMP para copiar/pegar
  OUTPUT_SPREADSHEET_ID: "12OVgL6cEom2dccmiCeksnnwSV1FWNP6ycG2F1J_JjOc",

  // Si la homologada viene en Excel (.xlsx), puede requerir conversión a Google Sheets.
  // Para eso debes habilitar el "Servicio avanzado de Drive" (Drive API).
  ALLOW_XLSX_CONVERSION: true,

  // Reglas
  DEFAULT_ROLE_ID_FOR_COMERCIALES: 1, // ✅ lo que pediste
};

/******************** ENTRYPOINT ********************/
function prepararPegablesHomologadaMesActual() {
  const now = new Date();
  const monthInfo = getMonthInfo_(now); // {year, month, month2, monthNameES}

  // 1) Buscar carpeta del mes actual dentro de "actualizaciones"
  const root = DriveApp.getFolderById(CONFIG.UPDATES_FOLDER_ID);
  const monthFolder = findMonthFolder_(root, monthInfo);
  if (!monthFolder) {
    throw new Error(
      `No encontré subcarpeta del mes actual (${monthInfo.monthNameES} ${monthInfo.year}) dentro de "actualizaciones".`
    );
  }

  // 2) Buscar archivo Base Homologada dentro de esa carpeta
  const homFile = findHomologadaFile_(monthFolder);
  if (!homFile) {
    throw new Error(
      `No encontré un archivo que contenga "Homologada" dentro de la carpeta del mes: ${monthFolder.getName()}`
    );
  }

  // 3) Abrir homologada como Spreadsheet (si es XLSX intenta convertir)
  const homSS = openFileAsSpreadsheet_(homFile);

  // 4) Abrir bases
  const baseClientesSS = SpreadsheetApp.openById(CONFIG.BASE_CLIENTES_ID);
  const baseUsuariosSS = SpreadsheetApp.openById(CONFIG.BASE_USUARIOS_ID);

  const shClientes = baseClientesSS.getSheetByName(CONFIG.BASE_CLIENTES_SHEET);
  const shComerciales = baseUsuariosSS.getSheetByName(CONFIG.BASE_USUARIOS_SHEET);

  if (!shClientes) throw new Error(`No existe hoja "${CONFIG.BASE_CLIENTES_SHEET}" en base_clientes`);
  if (!shComerciales) throw new Error(`No existe hoja "${CONFIG.BASE_USUARIOS_SHEET}" en base_usuarios`);

  // 5) Leer headers (mismo orden que tus copias)
  const clientesTbl = readTable_(shClientes);
  const comercialesTbl = readTable_(shComerciales);

  // 6) Mapas existentes (para detectar "nuevos")
  const idxNit = idxReq_(clientesTbl.headers, "nit_cliente");
  const idxLegal = idxReq_(comercialesTbl.headers, "id_comercial_legal");

  const clientesExist = new Set(
    clientesTbl.rows.map(r => norm_(r[idxNit])).filter(Boolean)
  );

  const comercialesExist = new Set(
    comercialesTbl.rows.map(r => norm_(r[idxLegal])).filter(Boolean)
  );

  // ✅ Mapa legal -> comercial_id (UUID) para poder llenar comercial_id en clientes nuevos
  const legalToComercialId = buildMapLegalToComercialId_(comercialesTbl);

  // 7) Leer homologada (3 hojas clave)
  const shPrinc = homSS.getSheetByName("Principales");
  const shAsig  = homSS.getSheetByName("Asignados");
  const shEjec  = homSS.getSheetByName("Ejecutivos");

  if (!shPrinc) throw new Error(`La homologada no tiene la hoja "Principales"`);
  if (!shAsig)  throw new Error(`La homologada no tiene la hoja "Asignados"`);
  if (!shEjec)  throw new Error(`La homologada no tiene la hoja "Ejecutivos"`);

  const princ = readTable_(shPrinc);
  const asig  = readTable_(shAsig);
  const ejec  = readTable_(shEjec);

  // 8) Construir NUEVOS CLIENTES (para pegar en base_clientes)
  const nuevosClientesRows = buildNewClientesRows_({
    princ,
    asig,
    clientesHeaders: clientesTbl.headers,
    clientesExistSet: clientesExist,
    fechaReg: now,
    legalToComercialId,
  });

  // 9) Construir NUEVOS COMERCIALES (para pegar en base_usuarios)
  const nuevosComercialesRows = buildNewComercialesRows_({
    ejec,
    comercialesHeaders: comercialesTbl.headers,
    comercialesExistSet: comercialesExist,
    fechaReg: now,
  });

  // 10) Crear/actualizar hojas pegables en el SPREADSHEET DE SALIDA
  const outSS = SpreadsheetApp.openById(CONFIG.OUTPUT_SPREADSHEET_ID);
  const yymm = `${monthInfo.year}_${monthInfo.month2}`;

  const shOutClientes = upsertOutputSheet_(outSS, `TEMP_CLIENTES_NUEVOS_${yymm}`);
  const shOutComerciales = upsertOutputSheet_(outSS, `TEMP_COMERCIALES_NUEVOS_${yymm}`);

  writeOutput_(shOutClientes, clientesTbl.headers, nuevosClientesRows);
  writeOutput_(shOutComerciales, comercialesTbl.headers, nuevosComercialesRows);

  Logger.log(`OK ✅ Clientes nuevos: ${nuevosClientesRows.length}. Comerciales nuevos: ${nuevosComercialesRows.length}.`);
}

/******************** BUILDERS ********************/
function buildNewClientesRows_({princ, asig, clientesHeaders, clientesExistSet, fechaReg, legalToComercialId}) {
  // Homologada headers conocidos
  const pNit = idxReq_(princ.headers, "NRO_IDENTIFICACION");
  const pNom = idxOpt_(princ.headers, "NOMBRE_CLIENTE");
  const pBan = idxOpt_(princ.headers, "BANCA_NOMBRE");
  const pSec = idxOpt_(princ.headers, "SECTOR");
  const pLegalEj = idxOpt_(princ.headers, "NRO_IDENTIFICACION_EJECUTIVO"); // para asignar comercial

  const aNit = idxReq_(asig.headers, "NRO_IDENTIFICACION");
  const aNom = idxOpt_(asig.headers, "NOMBRE_CLIENTE");
  const aBan = idxOpt_(asig.headers, "BANCA"); // en Asignados se llama BANCA
  const aSec = idxOpt_(asig.headers, "SECTOR");
  const aLegalEj = idxOpt_(asig.headers, "NRO_IDENTIFICACION_ASIGNADO"); // para asignar comercial

  // Indices en base_clientes (los de tu copia)
  const iClienteId = idxOpt_(clientesHeaders, "cliente_id"); // se deja vacío
  const iNitCliente = idxReq_(clientesHeaders, "nit_cliente");
  const iNombre = idxOpt_(clientesHeaders, "nombre_cliente");
  const iOrigen = idxOpt_(clientesHeaders, "origen_cliente");
  const iBanca = idxOpt_(clientesHeaders, "banca");
  const iSector = idxOpt_(clientesHeaders, "sector");
  const iStatus = idxOpt_(clientesHeaders, "status_active");
  const iFecha = idxOpt_(clientesHeaders, "fecha_reg");
  const iNomina = idxOpt_(clientesHeaders, "nomina");
  const iRecaudo = idxOpt_(clientesHeaders, "recaudo");

  // ✅ comercial_id en clientes (UUID interno) – lo llenamos si lo podemos resolver
  const iComercialId = idxOpt_(clientesHeaders, "comercial_id");

  // meses (enero..diciembre) si existen
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const monthIdx = months.map(m => ({m, i: idxOpt_(clientesHeaders, m)})).filter(x => x.i !== -1);

  const out = [];
  const seenNew = new Set(); // por si se repite entre hojas

  function pushIfNew(nit, nombre, origen, banca, sector, legalEjecutivo) {
    const key = norm_(nit);
    if (!key) return;
    if (clientesExistSet.has(key)) return;
    if (seenNew.has(key)) return;

    const row = new Array(clientesHeaders.length).fill("");

    if (iClienteId !== -1) row[iClienteId] = "";
    row[iNitCliente] = key;

    if (iNombre !== -1) row[iNombre] = norm_(nombre);
    if (iOrigen !== -1) row[iOrigen] = origen; // "Base propia" o "Asignados"
    if (iBanca !== -1) row[iBanca] = norm_(banca);
    if (iSector !== -1) row[iSector] = norm_(sector);

    if (iStatus !== -1) row[iStatus] = 1;
    if (iFecha !== -1) row[iFecha] = formatDate_(fechaReg);

    if (iNomina !== -1) row[iNomina] = "NO";
    if (iRecaudo !== -1) row[iRecaudo] = "NO";

    // ✅ Si puedo resolver el UUID del comercial, lo lleno:
    if (iComercialId !== -1) {
      const legal = norm_(legalEjecutivo);
      const comercialUuid = legal ? (legalToComercialId[legal] || "") : "";
      row[iComercialId] = comercialUuid; // si no existe, queda vacío
    }

    monthIdx.forEach(({i}) => row[i] = 0);

    out.push(row);
    seenNew.add(key);
  }

  // Principales => Base propia
  princ.rows.forEach(r => {
    pushIfNew(
      r[pNit],
      pNom !== -1 ? r[pNom] : "",
      "Base propia",
      pBan !== -1 ? r[pBan] : "",
      pSec !== -1 ? r[pSec] : "",
      pLegalEj !== -1 ? r[pLegalEj] : ""
    );
  });

  // Asignados => Asignados
  asig.rows.forEach(r => {
    pushIfNew(
      r[aNit],
      aNom !== -1 ? r[aNom] : "",
      "Asignados",
      aBan !== -1 ? r[aBan] : "",
      aSec !== -1 ? r[aSec] : "",
      aLegalEj !== -1 ? r[aLegalEj] : ""
    );
  });

  return out;
}

function buildNewComercialesRows_({ejec, comercialesHeaders, comercialesExistSet, fechaReg}) {
  const eLegal = idxReq_(ejec.headers, "NRO_IDENTIFICACION_EJECUTIVO");
  const eName  = idxOpt_(ejec.headers, "NOMBRE_EJECUTIVO");
  const eBanca = idxOpt_(ejec.headers, "BANCA_NOMBRE");
  const eEnfoq = idxOpt_(ejec.headers, "DESCRIPCION_ENFOQUE");
  const eSuc   = idxOpt_(ejec.headers, "NOMBRE_SUCURSAL");

  const iComId = idxOpt_(comercialesHeaders, "comercial_id"); // se deja vacío (como pediste)
  const iName  = idxOpt_(comercialesHeaders, "nombre_comercial");
  const iMail  = idxOpt_(comercialesHeaders, "correo_usuario"); // puede quedar vacío
  const iCargo = idxOpt_(comercialesHeaders, "cargo_comercial");
  const iSuc   = idxOpt_(comercialesHeaders, "sucursal");
  const iStatus= idxOpt_(comercialesHeaders, "status_active");
  const iRole  = idxOpt_(comercialesHeaders, "role_id");        // ✅ aquí ponemos 1
  const iFecha = idxOpt_(comercialesHeaders, "fecha_reg");
  const iLegal = idxReq_(comercialesHeaders, "id_comercial_legal");
  const iBanca = idxOpt_(comercialesHeaders, "Banca");

  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const monthIdx = months.map(m => ({m, i: idxOpt_(comercialesHeaders, m)})).filter(x => x.i !== -1);

  const out = [];
  const seenNew = new Set();

  ejec.rows.forEach(r => {
    const legal = norm_(r[eLegal]);
    if (!legal) return;
    if (comercialesExistSet.has(legal)) return;
    if (seenNew.has(legal)) return;

    const row = new Array(comercialesHeaders.length).fill("");

    if (iComId !== -1) row[iComId] = ""; // sigue vacío
    row[iLegal] = legal;

    if (iName !== -1) row[iName] = eName !== -1 ? norm_(r[eName]) : "";
    if (iBanca !== -1) row[iBanca] = eBanca !== -1 ? norm_(r[eBanca]) : "";
    if (iCargo !== -1) row[iCargo] = eEnfoq !== -1 ? norm_(r[eEnfoq]) : "";
    if (iSuc !== -1) row[iSuc] = eSuc !== -1 ? norm_(r[eSuc]) : "";

    // correo queda vacío
    if (iStatus !== -1) row[iStatus] = 1;
    if (iFecha !== -1) row[iFecha] = formatDate_(fechaReg);

    // ✅ role_id = 1
    if (iRole !== -1) row[iRole] = CONFIG.DEFAULT_ROLE_ID_FOR_COMERCIALES;

    monthIdx.forEach(({i}) => row[i] = 0);

    out.push(row);
    seenNew.add(legal);
  });

  return out;
}

/******************** MAPS ********************/
function buildMapLegalToComercialId_(comercialesTbl) {
  const headers = comercialesTbl.headers;
  const rows = comercialesTbl.rows;

  const iLegal = idxReq_(headers, "id_comercial_legal");
  const iUuid = idxOpt_(headers, "comercial_id"); // si existe, lo usamos

  const map = {};
  if (iUuid === -1) return map;

  rows.forEach(r => {
    const legal = norm_(r[iLegal]);
    const uuid = norm_(r[iUuid]);
    if (legal && uuid) map[legal] = uuid;
  });
  return map;
}

/******************** DRIVE FINDERS ********************/
function findMonthFolder_(rootFolder, {year, month, monthNameES}) {
  const it = rootFolder.getFolders();
  const patterns = [
    new RegExp(`${year}[-_\\s]?0?${month}`,"i"),
    new RegExp(`${monthNameES}\\s*[-_\\s]*${year}`,"i"),
    new RegExp(`${monthNameES}`,"i"),
  ];

  while (it.hasNext()) {
    const f = it.next();
    const name = f.getName();
    if (patterns.some(rx => rx.test(name))) return f;
  }
  return null;
}

function findHomologadaFile_(monthFolder) {
  const it = monthFolder.getFiles();
  while (it.hasNext()) {
    const file = it.next();
    const name = file.getName();
    if (/homologada/i.test(name)) return file;
  }
  return null;
}

function openFileAsSpreadsheet_(file) {
  const mime = file.getMimeType();
  const id = file.getId();

  if (mime === MimeType.GOOGLE_SHEETS) {
    return SpreadsheetApp.openById(id);
  }

  const isExcel =
    mime === MimeType.MICROSOFT_EXCEL ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  if (isExcel && CONFIG.ALLOW_XLSX_CONVERSION) {
    try {
      const copy = Drive.Files.copy(
        { mimeType: MimeType.GOOGLE_SHEETS, title: `TEMP_CONVERT_${file.getName()}` },
        id
      );
      return SpreadsheetApp.openById(copy.id);
    } catch (e) {
      throw new Error(
        `El archivo Homologada está en Excel y no pude convertirlo.\n` +
        `Solución: en Apps Script -> Servicios -> habilita "Drive API" y en Google Cloud habilita Drive API.\n\nDetalle: ${e}`
      );
    }
  }

  throw new Error(`No puedo abrir el archivo "${file.getName()}" como Spreadsheet (mime: ${mime}).`);
}

/******************** SHEET IO ********************/
function upsertOutputSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.clear();
  return sh;
}

function writeOutput_(sheet, headers, rows) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.setFrozenRows(1);
}

/******************** TABLE HELPERS ********************/
function readTable_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = (values.shift() || []).map(h => String(h).trim());
  const rows = values.filter(r => r.some(v => v !== "" && v !== null));
  return { headers, rows };
}

function idxReq_(headers, name) {
  const i = headers.indexOf(name);
  if (i === -1) throw new Error(`No encontré la columna requerida "${name}"`);
  return i;
}
function idxOpt_(headers, name) {
  return headers.indexOf(name);
}
function norm_(v) {
  return String(v ?? "").trim();
}

/******************** DATES ********************/
function formatDate_(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function getMonthInfo_(d) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const month2 = String(month).padStart(2, "0");
  const monthsES = [
    "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
    "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
  ];
  return { year, month, month2, monthNameES: monthsES[month-1] };
}
