function guardarDatos(datos) {

  const comercial_id = getComercial(getEmail()[1],dataComerciales())[0]
  const cliente_id = Utilities.getUuid();

  shClientes.appendRow([
    cliente_id,
    datos.idCliente,
    datos.nombreCliente,
    datos.cod_oficina,
    datos.oficina,
    comercial_id,
    1,
    'Cliente Nuevo',
    new Date(),
    ,
    ,
    ,
    ,
    0,
    0,
    'NO',
    'NO',
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
    ]);

  

  return {success: true};
}
