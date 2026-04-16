/**
 * Líneas de producto por planta — referencia comercial (complementa Excel "Productos por planta" cuando se re-exporta).
 * Claves = PLANTAS keys en v5_engine.js
 */
// ──────────────────────────────────────────────────────────────────────────────
// RICH LEADS DEMO — Estructura completa de prospección Intel
// Campos nuevos: decisor, contacto{email,tel}, prods_actuales, score_prioridad
// Estos registros se mezclan en D vía covia_embed_clients.js (o aquí como demostración).
// Para producción: exportar desde Apollo.io / ImportGenius / LinkedIn Sales Nav.
// ──────────────────────────────────────────────────────────────────────────────
window.COVIA_RICH_LEADS_DEMO = [
  {
    n: 'Vidriera del Norte S.A.',
    s: 'vidrio', tp: 'l', lat: 25.6866, lng: -100.3161,
    d: 'San Nicolás de los Garza, NL', v: 0, pot: '4,000-6,000',
    p: 'Arena sílica alta pureza para soplado y flotado',
    prov: 'Competidor regional',
    decisor: 'Ing. Roberto Garza — Dir. Compras',
    contacto: { email: 'r.garza@vidrieranorte.mx', tel: '+52 81 8xxx xxxx' },
    prods_actuales: ['Arena Silícea 30/50', 'Sosa Cáustica'],
    score_prioridad: 95,
    propensity_score: 88,
    tech_stack: ['Horno flotado Pilkington', 'SCADA Siemens', 'ERP SAP S/4HANA'],
    ultima_licitacion: '2025-Q4 · contrato vence Mar-2026',
    refs: [{t:'LinkedIn',u:'https://www.linkedin.com/company/vidriera-norte'}]
  },
  {
    n: 'CEMEX Concretos NE — Planta Apodaca',
    s: 'construccion', tp: 'l', lat: 25.7814, lng: -100.1872,
    d: 'Apodaca, NL', v: 0, pot: '12,000-18,000',
    p: 'Arena para morteros y premezclados · contrato marco',
    prov: 'Competidor regional',
    decisor: 'Lic. Patricia Solís — Gerente Abastecimiento',
    contacto: { email: 'p.solis@cemex.com', tel: '+52 81 8xxx xxxx' },
    prods_actuales: ['Arena 3/8"', 'Arena M-400', 'Grava 3/4"'],
    score_prioridad: 91,
    propensity_score: 75,
    tech_stack: ['Planta dosificadora ODISA', 'ERP Oracle', 'Telemetría IoT tanques'],
    ultima_licitacion: '2024-Q2 · renovación anual Jun-2025',
    refs: [{t:'CEMEX',u:'https://www.cemex.com.mx'}]
  },
  {
    n: 'Sanitarios Porcelana Industrial S.A.',
    s: 'ceramica', tp: 'l', lat: 25.5928, lng: -100.3736,
    d: 'Monterrey, NL', v: 0, pot: '3,500-7,500',
    p: 'Cerasil / arena sanitarios y chamota',
    prov: 'Sin proveedor',
    decisor: 'M.A. Carlos Vela — Director de Planta',
    contacto: { email: 'cvela@porcelaindustrial.mx', tel: '+52 81 8xxx xxxx' },
    prods_actuales: ['Chamota', 'Feldespato NL'],
    score_prioridad: 88,
    propensity_score: 92,
    tech_stack: ['Hornos túnel gas natural', 'Prensa hidráulica 500T', 'ERP propio'],
    ultima_licitacion: 'Sin licitación reciente — compra spot',
    refs: [{t:'Web',u:'https://www.google.com/search?q=sanitarios+porcelana+monterrey'}]
  },
  {
    n: 'PEMEX Exploración — Burgos',
    s: 'fracking', tp: 'l', lat: 25.9951, lng: -97.8563,
    d: 'Reynosa, Tamaulipas', v: 0, pot: '40,000-80,000',
    p: 'Proppant 20/40 mesh para estimulación shale',
    prov: 'Competidor regional',
    decisor: 'Ing. Miguel Ángel Torres — Jefe Perforación',
    contacto: { email: 'm.torres@pemex.com', tel: '+52 899 xxx xxxx' },
    prods_actuales: ['Proppant 40/70 US', 'Proppant 20/40 regional'],
    score_prioridad: 98,
    propensity_score: 65,
    tech_stack: ['Fracturadora Calfrac', 'Software STIMPLAN', 'Moniteo sísmico Halliburton'],
    ultima_licitacion: '2025-Q1 · licitación abierta CompraNet LA-006HJY001-E8-2025',
    refs: [{t:'Pemex',u:'https://www.pemex.com'},{t:'CompraNet',u:'https://compranet.hacienda.gob.mx'}]
  },
  {
    n: 'Agua y Drenaje de Monterrey — PTAR Norte',
    s: 'filtracion', tp: 'l', lat: 25.7355, lng: -100.3096,
    d: 'Monterrey, NL', v: 0, pot: '8,000-12,000',
    p: 'Arena cuarzo filtración AWWA B100 licitación',
    prov: 'Sin proveedor',
    decisor: 'Ing. Lorena Garza — Jefa Compras Públicas',
    contacto: { email: 'licitaciones@agua.monterrey.gob.mx', tel: '+52 81 8xxx xxxx' },
    prods_actuales: ['Arena antracita', 'Grava soporte 3/8"'],
    score_prioridad: 93,
    propensity_score: 85,
    tech_stack: ['Filtros multicapa Xylem', 'SCADA Wonderware', 'Medidores Endress+Hauser'],
    ultima_licitacion: '2025-Q3 · licitación estimada Jul-Sep 2026 (ciclo anual)',
    refs: [{t:'Licitación',u:'https://compranet.hacienda.gob.mx'}]
  },
  {
    n: 'Club de Golf Los Azulejos',
    s: 'deportiva', tp: 'l', lat: 25.6500, lng: -100.2800,
    d: 'San Agustín, NL', v: 0, pot: '800-1,500',
    p: 'Arena bunker premium lavada USGA · 18 hoyos',
    prov: 'Sin proveedor',
    decisor: 'Sr. Jacobo Villarreal — Gerente Mantenimiento',
    contacto: { email: 'mantenimiento@losazulejos.mx', tel: '+52 81 8xxx xxxx' },
    prods_actuales: ['Arena lavada importada'],
    score_prioridad: 79,
    propensity_score: 71,
    tech_stack: ['Sistema riego Hunter', 'Cortadora greens Toro Reelmaster'],
    ultima_licitacion: 'Compra directa — sin proceso formal',
    refs: [{t:'Club',u:'https://www.google.com/search?q=club+golf+azulejos+san+agustin+nl'}]
  }
];
// Función para inyectar rich leads en el dataset principal (llamar en window.onload)
window.injectRichLeadsDemo = function(){
  if(typeof D !== 'undefined' && Array.isArray(window.COVIA_RICH_LEADS_DEMO)){
    window.COVIA_RICH_LEADS_DEMO.forEach(rl=>{
      if(!D.find(d=>d.n===rl.n))D.unshift(rl);
    });
  }
};
window.COVIA_PRODUCTS_BY_PLANT = {
  lampazos: {
    cluster: 'CAN-LAM',
    lines: ['Arena sílica Cerasil / Granusil (vidrio, cerámica)', 'Silice VC granel y SL', 'SilverBond morteros', 'Proppant fracking 20/40 (Burgos)', 'Arena filtración / PTAR'],
    notes: 'Norte: vidrio float, cerámica NL-Coah, logística frontera.'
  },
  jaltipan: {
    cluster: 'JAL-SJO-TLX',
    lines: ['Cerasil SL gama completa', 'Granusil construcción', 'Arena ecuestre / deportiva', 'Mezclas mortero industrial'],
    notes: 'Sur-centro: supply Bajío, Veracruz, Golfo.'
  },
  san_jose: {
    cluster: 'JAL-SJO-TLX',
    lines: ['Cerasil pasta y chamota', 'Arena sílica alta pureza', 'Incast fundición'],
    notes: 'Bajío: cerámica sanitaria, fundición cercana.'
  },
  tlaxcala: {
    cluster: 'JAL-SJO-TLX',
    lines: ['Cerasil SL-204 / 208 / 306', 'Granusil premezclado', 'Fibra / silice VC'],
    notes: 'Centro-México: CDMX, Puebla, Tlaxcala.'
  },
  canoitas: {
    cluster: 'CAN-LAM',
    lines: ['Arena sílica frontera', 'Carbonatos y morteros', 'Gravas técnicas construcción'],
    notes: 'Coahuila-NL-Laredo corredor.'
  },
  benito_juarez: {
    cluster: 'AHU-JUA',
    lines: ['Cerasil Kohler / porcelana', 'Arena sanitarios', 'Mezclas alta blancura'],
    notes: 'NL industrial densidad alta.'
  },
  ahuazotepec: {
    cluster: 'AHU-JUA',
    lines: ['Cerasil ruta centro-oriente', 'Arena construcción', 'Logística ferroviaria'],
    notes: 'Enlace Puebla-Hidalgo.'
  },
  apodaca: {
    cluster: 'NA',
    lines: ['Silice VC / B granel', 'Cerasil Apodaca-Pesquería', 'Fibra aislantes'],
    notes: 'Monterrey metro.'
  },
  san_juan: {
    cluster: 'NA',
    lines: ['Arena Tabasco-Veracruz', 'Construcción sur', 'Filtración regional'],
    notes: 'Veracruz / Sureste.'
  },
  usm: {
    cluster: 'NA',
    lines: ['Distribución USM / spot MTY', 'Mezclas a pedido'],
    notes: 'Coord. aprox.; validar pedidos CRM.'
  }
};
