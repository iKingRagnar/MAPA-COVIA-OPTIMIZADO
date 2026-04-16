// V5 ENGINE — Data + Map + Charts + Chatbot V2 with inline charts
const CO={vidrio:'#3b82f6',ceramica:'#f59e0b',fundicion:'#a855f7',construccion:'#14b8a6',fibra:'#ec4899',deportiva:'#ff6b6b',cuestre:'#d97706',filtracion:'#06b6d4',fracking:'#8b5cf6',agricola:'#10b981',reciclaje:'#f97316'};
const LB={vidrio:'Vidrio',ceramica:'Cerámica',fundicion:'Fundición',construccion:'Construcción',fibra:'Fibra',deportiva:'Deportiva',cuestre:'Encuestre',filtracion:'Filtración',fracking:'Fracking',agricola:'Agricultura',reciclaje:'Constr/Recicl'};
const SEG_WEIGHT_IA={fracking:1.2,filtracion:1.15,reciclaje:1.08,deportiva:1.1,cuestre:1.05,agricola:1,vidrio:1.05,ceramica:1.05,fundicion:1.05,construccion:1.07,fibra:1.05};
/** Piso ton/año si falta rango pot en lead (siempre >0) */
const POT_FLOOR_BY_SEG={vidrio:400,ceramica:350,fundicion:300,construccion:320,fibra:280,deportiva:350,cuestre:250,filtracion:500,fracking:800,agricola:200,reciclaje:400};
const MERCADO_BASE={vidrio:'Vidrio · envases y construcción',ceramica:'Cerámica · pisos y sanitarios',fundicion:'Fundición y piezas metálicas',construccion:'Obra civil y prefabricados',fibra:'Fibra · aislamiento',deportiva:'Deportes · arenas técnicas',cuestre:'Ecuestre · charrería',filtracion:'Agua · PTAR y albercas',fracking:'Hidrocarburos · proppant',agricola:'Agro · sustratos',reciclaje:'Cemento · reciclaje/RCD'};
/** Referencias públicas por segmento (contexto sectorial; clic abre en nueva pestaña). Ampliable desde ingestión/CRM. */
const SEG_PUBLIC_REFS={
  filtracion:[{t:'CONAGUA',u:'https://www.gob.mx/conagua'},{t:'OMS · agua',u:'https://www.who.int/es/teams/environment-climate-change-and-health/water-sanitation-and-hygiene'}],
  reciclaje:[{t:'INEGI · residuos',u:'https://www.inegi.org.mx/temas/residuos/'},{t:'SEMARNAT',u:'https://www.gob.mx/semarnat'}],
  fracking:[{t:'CNH · hidrocarburos',u:'https://www.gob.mx/cnh'},{t:'SENER (hist.)',u:'https://www.gob.mx/sener'}],
  deportiva:[{t:'FIFA · calidad campo',u:'https://www.fifa.com/es/technical/football-technology'}],
  cuestre:[{t:'FEI · superficies',u:'https://inside.fei.org/fei/disciplines/jumping/rules'}],
  agricola:[{t:'SIAP · México',u:'https://www.gob.mx/siap'}]
};
/** Pistas de venta por segmento (briefing vendedor; ampliable). */
const SEG_SALES_PLAYBOOK={
  _default:[
    'Cruza volumen potencial con distancia: propón frecuencia de entrega y stock mínimo alineado a consumo real.',
    'Cierra un siguiente paso con fecha: visita técnica, muestra homologada o cotización formal.'
  ],
  ceramica:[
    'Valida granulometría, alúmina y punto de fusión vs. línea (gres/porcelánico/esmaltes); pide hoja de carga del competidor.',
    'Arena sílica + feldespato/CaCO₃ en producto: ofrece paquete técnico único (menos interfaces de compra) y trazabilidad por lote.',
    'Argumenta costo total (merma + logística + paradas), no solo $/ton.'
  ],
  vidrio:[
    'Vidrio float/envases: enfatiza constancia química y ausencia de hierro; ofrece auditoría de lote con su horno.',
    'Proponer consignación o acuerdo marco si el volumen lo permite.'
  ],
  fundicion:[
    'Fundición: co-crear especificación de granulometría y refractoriedad con su metalurgista; reduce rechazos.',
    'Ligar entrega a calendario de coladas o paradas programadas.'
  ],
  construccion:[
    'Construcción/premezclado: ancla a obra o contrato regional; propón prueba en planta de concreto con técnico Covia.',
    'Destaca disponibilidad y tiempo de respuesta vs. importación.'
  ],
  fibra:[
    'Fibra/aislamiento: hablar en términos de binder y resistencia térmica; muestras bajo norma aplicable.',
    'Si hay importador actual, contrasta lead time y stock local.'
  ],
  deportiva:[
    'Arenas deportivas: FIFA/ITF/FEP — pide especificación del proyecto y año de mantenimiento; ofrece visita de cancha.',
    'Incluye drenaje y granulometría en la propuesta (no solo precio por tonelada).'
  ],
  cuestre:[
    'Ecuestre: seguridad del animal + consistencia del lecho; referencias de clubes homologados.',
    'Proponer blend estable en el tiempo (menos quejas operativas).'
  ],
  filtracion:[
    'Filtración/PTAR: hablar en cumplimiento normativo y vida útil del lecho; pide pilotos con métricas de turbidez.',
    'Licitaciones: adelanta documentación técnica y trazabilidad.'
  ],
  fracking:[
    'Hidrocarburos/proppant: acoplar granulometría 20/40 etc. a pozo y presión; valida cadena de suministro y certificaciones.',
    'Tratar volumen anual y contingencias logísticas (almacenaje).'
  ],
  agricola:[
    'Agro/sustratos: enfatiza inocuidad, pH y retención de agua; prueba en invernadero o lote piloto.',
    'Estacionalidad: acuerdo de volumen por campaña.'
  ],
  reciclaje:[
    'Reciclaje/RCD: conecta con mortero y sustitutos cementicios; propón mezclas que reduzcan huella.',
    'Integra logística de retorno si aplica.'
  ]
};

/** Catálogo oficial de plantas Covia México (coordenadas suministradas) */
const PLANTAS={
  ahuazotepec:{key:'ahuazotepec',label:'Ahuazotepec',short:'Ahuazotepec',lat:20.05039457,lng:-98.1520346,city:'Monterrey',state:'NL',zip:'64060',addr:'Estación del Ferrocarril Ahuaz., Puebla',cluster:'AHU-JUA',pid:414},
  jaltipan:{key:'jaltipan',label:'Jáltipan',short:'Jáltipan',lat:17.98822915,lng:-94.69891462,city:'Jáltipan',state:'VZ',zip:'96210',addr:'Prolongación Calle Juárez Lote 19',cluster:'JAL-SJO-TLX',pid:6020},
  san_jose:{key:'san_jose',label:'San José',short:'San José',lat:20.96687881,lng:-100.4758384,city:'San José de Iturbide',state:'GT',zip:'37980',addr:'Rancho El Arenal de Arriba',cluster:'JAL-SJO-TLX',pid:6030},
  tlaxcala:{key:'tlaxcala',label:'Tlaxcala · Tetla de la Solidaridad',short:'Tlaxcala',lat:19.49246399,lng:-98.06109503,city:'Tetla de la Solidaridad',state:'TL',zip:'90431',addr:'Prolongación Industrial Xicohténcatl S/N',cluster:'JAL-SJO-TLX',pid:6055},
  lampazos:{key:'lampazos',label:'Lampazos de Naranjo',short:'Lampazos',lat:27.0001576,lng:-100.5145842,city:'Lampazos de Naranjo',state:'NL',zip:'65070',addr:'Carretera Monterrey-Colombia Km. 143',cluster:'CAN-LAM',pid:6025},
  canoitas:{key:'canoitas',label:'Canoitas',short:'Canoitas',lat:28.06411032,lng:-100.0801502,city:'Villa Hidalgo',state:'CO',zip:'26670',addr:'Carretera Laredo-Piedras Negras Km. 87.5',cluster:'CAN-LAM',pid:6015},
  apodaca:{key:'apodaca',label:'Apodaca',short:'Apodaca',lat:25.76724949,lng:-100.1735469,city:'Apodaca',state:'NL',zip:'66600',addr:'Carretera Apodaca-Huinalá Km. 1.5',cluster:'NA',pid:6005},
  san_juan:{key:'san_juan',label:'San Juan',short:'San Juan',lat:17.90158305,lng:-95.05248449,city:'San Juan Evangelista',state:'VZ',zip:'96120',addr:'Carretera Sayula-Ciudad Alemán Km. 12.5',cluster:'NA',pid:6035},
  benito_juarez:{key:'benito_juarez',label:'Benito Juárez NL (no Ciudad Juárez CHIH)',short:'Juárez NL',lat:25.65892758,lng:-100.071624,city:'Benito Juárez',state:'NL',zip:'67250',addr:'Camino Lateral Anillo Periférico No. 800 · Nuevo León',cluster:'AHU-JUA',pid:6010},
  usm:{key:'usm',label:'USM Monterrey',short:'USM',lat:25.668,lng:-100.318,city:'Monterrey',state:'NL',zip:'64060',addr:'Loma Larga 2621 (coord. aprox.)',cluster:'NA',pid:6060,approx:true}
};
const PLANT_ORDER=['lampazos','jaltipan','canoitas','benito_juarez','ahuazotepec','san_jose','tlaxcala','apodaca','san_juan','usm'];
const PLANT_ASSIGNMENT_ORDER=PLANT_ORDER.filter(k=>{
  const p=PLANTAS[k];
  if(!p)return false;
  if(p.approx)return false; // USM sin coordenada oficial: no participa en asignación territorial
  return Number.isFinite(p.lat)&&Number.isFinite(p.lng);
});
/**
 * KPI logísticos por planta (embarques vs pedidos; cumplimiento %).
 * Jáltipan: cuenta ancla en zona + referencias de otras cuentas del mismo reporte.
 */
const PLANT_LOGISTICS_SNAPSHOT={
  jaltipan:{
    fuente:'Indicadores operativos (embarques vs pedidos nuevos)',
    /** Vol. actual ton/año (referencia operativa planta — alineado a tarjeta BI) */
    volActualTonAno:228000,
    productoAgregado:'Total',
    compliancePct:99,
    shipments:229,
    orderNew:230,
    delta:-1,
    cuentaAncla:{
      n:'LOGISTICA Y SUMINISTROS INDUSTRIALES',
      lat:17.963932928575424,
      lng:-94.70673573646667,
      city:'Jaltipan de Morelos',
      state:'Veracruz'
    },
    otrasCuentas:[
      {n:'KENDRY COMPANY (SHIP TO)',city:'Chalchicomula de Sesma, Puebla',shipments:29615,compliance:97},
      {n:'GUARDIAN INDUSTRIES',shipments:15717,compliance:107},
      {n:'ALUSUIZA',city:'Ecatepec de Morelos, Mor',shipments:228,compliance:108},
      {n:'MICAELA S. GARCIA L (ENERGIA)',shipments:202,compliance:78},
      {n:'KSB DE MEXICO',city:'Ciudad de México',shipments:129,compliance:102},
      {n:'FRANCISCO JAVIER PEREZ RODRIGUEZ',shipments:102,compliance:102},
      {n:'RAILTECH CALOMEX',city:'San Nicolás de los Garza, NL',shipments:76,compliance:102},
      {n:'VKO LIMPIEZA Y MANTENIMIENTO INDUSTRIA',city:'Guadalajara, Jal',shipments:61,compliance:87},
      {n:'CORAZONES PARA LA FUNDICION',shipments:39,compliance:109},
      {n:'SIKA MEXICANA (COATZACOALCOS)',city:'Coatzacoalcos, Ver',shipments:31,compliance:102},
      {n:'BM PRODUCTOS',city:'Saltillo, Coah',shipments:25,compliance:101}
    ]
  },
  /** Referencia cartera CRM (suma clientes actuales en tablero) — sin sustituir a vol. operativo por planta */
  lampazos:{
    fuente:'Cartera clientes actuales (tablero Mapa Covia) · cluster CAN-LAM',
    notaOperativa:'Usar KPI "Vol. Actual" con solo Lampazos = suma CRM; capacidad referencia 350K ton/año en análisis de volumen.'
  }
};
/** Por defecto: todas las plantas (vista agregada). Clic en chip = solo esa planta; Ctrl+Clic = multi. */
let selectedPlantKeys=PLANT_ORDER.slice();
/**
 * Radio máx. km desde la planta asignada (la más cercana entre las seleccionadas).
 * Regla comercial prospección: no mostrar cuentas fuera de este radio por planta.
 */
const PLANT_CATCHMENT_KM=200;
/** Planta asignada = argmin distancia entre las claves indicadas (empate → clave menor). */
function nearestPlantAmongKeys(d,keyList){
  const pts=(keyList||[]).map(k=>PLANTAS[k]).filter(p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&!p.approx);
  if(!pts.length)return null;
  let best=pts[0],bd=dist(best,d);
  for(let i=1;i<pts.length;i++){
    const p=pts[i],dd=dist(p,d);
    if(dd<bd-1e-6||(Math.abs(dd-bd)<=1e-6&&String(p.key)<String(best.key))){bd=dd;best=p;}
  }
  return best;
}
/** Planta territorial única: la más cercana en **todo** el catálogo (no solo la selección). Evita que MTY aparezca al filtrar Ahuazotepec, etc. */
function assignedPlantGlobal(d){
  return nearestPlantAmongKeys(d,PLANT_ASSIGNMENT_ORDER);
}
/**
 * Cuenta en vista de planta(s) si su asignación global está en keyList y cumple radio.
 * keyList suele ser selectedPlantKeys o [una_planta] para KPIs.
 */
function withinPlantCatchmentWithKeys(d,keyList){
  const a=assignedPlantGlobal(d);
  if(!a)return false;
  if(!keyList.includes(a.key))return false;
  return dist(a,d)<=PLANT_CATCHMENT_KM;
}
function withinPlantCatchment(d){
  return withinPlantCatchmentWithKeys(d,selectedPlantKeys);
}

function totalActualesCarteraTon(){
  return D.filter(x=>x.tp==='a').reduce((s,d)=>s+d.v,0);
}
function hasActiveDataFilter(){
  return cT!=='all'||!!cQ;
}
/**
 * Intl.NumberFormat('es-MX') — Mexico: coma miles, punto decimal.
 * 21,277,221 · 228.0 · igual que BI / Excel MX.
 */
const _nf=new Intl.NumberFormat('es-MX',{maximumFractionDigits:0});
const _nf2=new Intl.NumberFormat('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
function fmtNum(n,dec=0){
  if(dec===2)return _nf2.format(Number(n));
  return _nf.format(Math.round(Number(n)));
}
/** Formatea toneladas: 1.864 M ton | 228.0 K ton | 1,250 ton */
function formatTonKpi(ton){
  if(ton>=1000000)return new Intl.NumberFormat('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}).format(ton/1000000)+' M ton';
  if(ton>=10000)return new Intl.NumberFormat('es-MX',{minimumFractionDigits:1,maximumFractionDigits:1}).format(ton/1000)+' K ton';
  if(ton>=1000)return new Intl.NumberFormat('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0}).format(ton)+' ton';
  return fmtNum(ton)+' ton';
}
function formatTonPot(ton){return formatTonKpi(ton)}
/** k3: siempre suma CRM de actuales en vista (territorio + filtros). La ref. operativa BI de Jáltipan (~228K) solo va en subtítulo, nunca sustituye el número principal. */
function computeKpiVolActual(acF){
  const keys=selectedPlantKeys;
  const filtered=hasActiveDataFilter();
  const onlyJ=keys.length===1&&keys[0]==='jaltipan';
  const onlyL=keys.length===1&&keys[0]==='lampazos';
  const vj=(PLANT_LOGISTICS_SNAPSHOT.jaltipan&&PLANT_LOGISTICS_SNAPSHOT.jaltipan.volActualTonAno)||228000;
  const ton=acF.reduce((s,d)=>s+d.v,0);
  const rad=` · ≤${PLANT_CATCHMENT_KM} km`;
  const jRef=`Ref. operativo planta Jáltipan (BI, no suma de filas): ~${Math.round(vj/1000)}K ton/año.`;
  if(onlyJ&&!filtered){
    if(ton===0){
      return {ton:0,sub:`Cartera CRM actuales en territorio Jáltipan ${rad}: 0 ton. Tablero sin actuales asignados a Jáltipan en catálogo. ${jRef}`};
    }
    return {ton,sub:`Suma cartera CRM (actuales) ${rad} · territorio Jáltipan. ${jRef}`};
  }
  if(onlyJ&&filtered){
    return {ton,sub:'Cartera filtrada (actuales) · territorio Jáltipan'+rad};
  }
  if(onlyL&&!filtered){
    return {ton,sub:'Suma cartera CRM (referencia Lampazos / NL · CAN-LAM)'+rad};
  }
  if(onlyL&&filtered){
    return {ton,sub:'Cartera filtrada · actuales'+rad};
  }
  return {ton,sub:(filtered?'Cartera filtrada (actuales)':'Suma cartera · plantas: '+keys.map(k=>PLANTAS[k]?PLANTAS[k].short:k).join(' · '))+' · ≤'+PLANT_CATCHMENT_KM+' km · territorio: planta más cercana del catálogo.'};
}
function setKpiSub(id,t){
  const el=document.getElementById(id);
  if(el)el.textContent=t||'';
}
/** Explica totales: asignación global + solape al comparar plantas en solitario vs multisitio. */
function computeKpiLeadsSub(uniqueLeads){
  const keys=selectedPlantKeys||[];
  if(keys.length>=PLANT_ORDER.length)return '';
  const rows=getFilteredData().filter(d=>d.tp==='l');
  const base=`Asignación: planta más cercana del catálogo completo · radio ≤${PLANT_CATCHMENT_KM} km.`;
  if(keys.length===1){
    const pk=keys[0],sh=PLANTAS[pk]?PLANTAS[pk].short:pk;
    return `${base} Territorio ${sh}: solo cuentas cuya planta territorial es ${sh} (${uniqueLeads} leads en vista).`;
  }
  let sumSingles=0;
  keys.forEach(k=>{sumSingles+=rows.filter(d=>withinPlantCatchmentWithKeys(d,[k])).length});
  const overlap=sumSingles-uniqueLeads;
  const names=keys.map(k=>PLANTAS[k]?PLANTAS[k].short:k).join(' · ');
  if(overlap>0){
    return `Total único en vista: ${uniqueLeads}. Si sumas cada planta sola (${names}): ${sumSingles} — ${overlap} lead(s) en zona compartida (misma cuenta, varias plantas a ≤${PLANT_CATCHMENT_KM} km; se cuenta una vez).`;
  }
  return `Total único: ${uniqueLeads} (= suma por planta en solitario: ${sumSingles}). ${base}`;
}

function getSelectedPlants(){return selectedPlantKeys.map(k=>PLANTAS[k]).filter(Boolean)}
function mapCenter(){const pts=getSelectedPlants();if(!pts.length)return PLANTAS.lampazos;return {lat:pts.reduce((s,p)=>s+p.lat,0)/pts.length,lng:pts.reduce((s,p)=>s+p.lng,0)/pts.length}}
/** Distancia km a la planta asignada territorialmente (catálogo completo). */
function distMin(d){const p=assignedPlantGlobal(d);return p?dist(p,d):0}
/** Planta asignada (siempre la más cercana en toda la red Covia). */
function nearestPlant(d){return assignedPlantGlobal(d)||PLANTAS.lampazos}
function distBreakdown(d){
  const own=assignedPlantGlobal(d);
  const pts=getSelectedPlants();
  if(!own||pts.length<=1)return '';
  const rows=pts.map(p=>{
    const tag=p.key===own.key?' <span style="color:#6ee7b7">(coincide con asignación)</span>':'';
    return `<tr><td>${p.short}${tag}</td><td><b>${dist(p,d).toFixed(0)}</b> km</td></tr>`;
  }).join('');
  return `<br><small style="color:#94a3b8">Asignación territorial (catálogo): <b>${own.short}</b> (${dist(own,d).toFixed(0)} km). Distancias a las plantas activas en tu filtro:</small><table class="dt" style="margin-top:4px">${rows}</table>`;
}
function plantSummaryLine(){const pts=getSelectedPlants();return pts.map(p=>`${p.short} (${p.lat.toFixed(4)}°, ${p.lng.toFixed(4)}°)`).join(' · ')}

/** Leads manuales / curados (mapa + playbook). Clientes actuales reales: covia_embed_clients.js → COVIA_CLIENTS_FROM_EXCEL */
const D_INLINE_LEADS=[
// DEPORTIVA 18
{n:"Estadio BBVA Rayados",lat:25.6691,lng:-100.2444,s:"deportiva",v:0,p:"Arena drenaje FIFA",d:"Guadalupe NL",t:"(81)8110-1200",tp:"l",pot:"2,000-3,500",prov:"US Silica",refs:[{t:'Estadio (referencia)',u:'https://www.google.com/search?q=Estadio+BBVA+Monterrey'},{t:'FIFA calidad técnica',u:'https://www.fifa.com/es/technical/football-technology'}]},
{n:"Estadio Universitario Tigres",lat:25.7229,lng:-100.3121,s:"deportiva",v:0,p:"Arena drenaje",d:"San Nicolás NL",t:"(81)8329-4000",tp:"l",pot:"1,500-2,800",prov:"Sin proveedor"},
{n:"Club Campestre MTY Golf",lat:25.5986,lng:-100.2647,s:"deportiva",v:0,p:"Arena bunker premium",d:"San Pedro NL",t:"(81)8363-0033",tp:"l",pot:"1,200-2,000",prov:"Importación"},
{n:"Las Misiones Golf 18H",lat:25.6514,lng:-100.29,s:"deportiva",v:0,p:"Arena bunker blanca",d:"Monterrey NL",t:"(81)8319-2600",tp:"l",pot:"1,000-1,800",prov:"Importación"},
{n:"Club Golf Valle Alto",lat:25.5589,lng:-100.2876,s:"deportiva",v:0,p:"Arena bunker",d:"Monterrey NL",t:"(81)8303-5300",tp:"l",pot:"800-1,500",prov:"Sin proveedor"},
{n:"Las Cruces Golf 18H",lat:25.78,lng:-100.19,s:"deportiva",v:0,p:"Arena bunker",d:"Apodaca NL",t:"(81)8220-4100",tp:"l",pot:"800-1,500",prov:"Arenas locales"},
{n:"INDE NL Estadio",lat:25.6866,lng:-100.3169,s:"deportiva",v:0,p:"Arena canchas",d:"Monterrey NL",t:"(81)2020-9700",tp:"l",pot:"1,500-3,000",prov:"Arenas locales"},
{n:"Sultanes MTY Béisbol",lat:25.7188,lng:-100.3131,s:"deportiva",v:0,p:"Arena infield",d:"Monterrey NL",t:"(81)8346-0606",tp:"l",pot:"500-1,000",prov:"Sin proveedor"},
{n:"Tec de Monterrey Campos",lat:25.6514,lng:-100.2903,s:"deportiva",v:0,p:"Arena campos",d:"Monterrey NL",t:"(81)8358-2000",tp:"l",pot:"800-1,500",prov:"Arenas locales"},
{n:"UANL Campus Deportivo",lat:25.7229,lng:-100.32,s:"deportiva",v:0,p:"Arena canchas",d:"San Nicolás NL",t:"(81)8329-4000",tp:"l",pot:"600-1,200",prov:"Arenas locales"},
{n:"Acereros Monclova",lat:26.91,lng:-101.42,s:"deportiva",v:0,p:"Arena infield",d:"Monclova Coah",t:"(866)633-1200",tp:"l",pot:"400-800",prov:"Sin proveedor"},
{n:"Saraperos Saltillo",lat:25.42,lng:-101.0,s:"deportiva",v:0,p:"Arena infield",d:"Saltillo Coah",t:"(844)416-7400",tp:"l",pot:"400-800",prov:"Sin proveedor"},
{n:"Parque Fundidora",lat:25.68,lng:-100.29,s:"deportiva",v:0,p:"Arena canchas",d:"Monterrey NL",t:"(81)8126-0000",tp:"l",pot:"300-600",prov:"Arenas locales"},
{n:"CREA Parques MTY x7",lat:25.69,lng:-100.31,s:"deportiva",v:0,p:"Arena canchas",d:"Monterrey NL",t:"(81)2020-6700",tp:"l",pot:"1,000-2,000",prov:"Arenas locales"},
{n:"Club Deportivo Campestre",lat:25.6589,lng:-100.3547,s:"deportiva",v:0,p:"Tenis/pádel",d:"San Pedro NL",t:"(81)8363-0033",tp:"l",pot:"400-700",prov:"Sin proveedor"},
{n:"Canchas Mundial 2026 Tamps",lat:26.08,lng:-98.3,s:"deportiva",v:0,p:"Arena Mundial 2026",d:"Tamaulipas",t:"(899)922-1000",tp:"l",pot:"1,500-3,000",prov:"Licitación"},
{n:"Ciudad del Sol Golf",lat:25.28,lng:-100.02,s:"deportiva",v:0,p:"Arena bunker 9H",d:"Allende NL",t:"(826)268-0100",tp:"l",pot:"400-800",prov:"Sin proveedor"},
{n:"Tierra Dorada Golf",lat:25.47,lng:-99.98,s:"deportiva",v:0,p:"Arena bunker 9H",d:"Cadereyta NL",t:"(828)284-0050",tp:"l",pot:"400-700",prov:"Sin proveedor"},
// CUESTRE 26
{n:"Club Hípico La Silla",lat:25.6047,lng:-100.2319,s:"cuestre",v:0,p:"Arena ecuestre premium",d:"Monterrey NL",t:"(81)8338-1200",tp:"l",pot:"1,500-2,500",prov:"Importación"},
{n:"Club Hípico Monterrey",lat:25.6589,lng:-100.4123,s:"cuestre",v:0,p:"Arena ecuestre",d:"San Pedro NL",t:"(81)8363-4500",tp:"l",pot:"1,200-2,000",prov:"Arenas locales"},
{n:"Hipódromo Monterrey",lat:25.73,lng:-100.28,s:"cuestre",v:0,p:"Arena pista carreras",d:"Monterrey NL",t:"(81)8369-0101",tp:"l",pot:"2,000-4,000",prov:"Arenas locales"},
{n:"Las Encinas Race Track",lat:25.5514,lng:-100.9476,s:"cuestre",v:0,p:"Arena pista",d:"Ramos Arizpe Coah",t:"(844)488-2200",tp:"l",pot:"1,500-3,000",prov:"Sin proveedor"},
{n:"Centro Ecuestre San Pedro",lat:25.6578,lng:-100.4021,s:"cuestre",v:0,p:"Arena ecuestre",d:"San Pedro NL",t:"(81)8363-7800",tp:"l",pot:"800-1,500",prov:"Arenas locales"},
{n:"Rancho Santa Rosa",lat:25.65,lng:-100.26,s:"cuestre",v:0,p:"Arena FEI",d:"Monterrey NL",t:"(81)1234-5600",tp:"l",pot:"600-1,200",prov:"Sin proveedor"},
{n:"Asoc. Equitación NE",lat:25.685,lng:-100.257,s:"cuestre",v:0,p:"Arena ecuestre",d:"El Uro NL",t:"(81)8338-4400",tp:"l",pot:"600-1,200",prov:"Sin proveedor"},
{n:"Lienzo Charro Fed. NL",lat:25.69,lng:-100.33,s:"cuestre",v:0,p:"Arena charrería",d:"Monterrey NL",t:"(81)8374-0500",tp:"l",pot:"400-800",prov:"Arenas locales"},
{n:"Lienzo Charro San Isidro",lat:25.42,lng:-101.0,s:"cuestre",v:0,p:"Arena charrería",d:"Saltillo Coah",t:"(844)416-3200",tp:"l",pot:"300-600",prov:"Sin proveedor"},
{n:"Lienzo Charro Monclova",lat:26.91,lng:-101.42,s:"cuestre",v:0,p:"Arena charrería",d:"Monclova Coah",t:"(866)633-5500",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Lienzo Charro Arteaga",lat:25.44,lng:-101.01,s:"cuestre",v:0,p:"Arena charrería",d:"Arteaga Coah",t:"(844)483-0100",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Lienzo Charro Nvo Laredo",lat:27.48,lng:-99.52,s:"cuestre",v:0,p:"Arena charrería",d:"Nvo Laredo Tamps",t:"(867)712-3300",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Club Hípico Apodaca",lat:25.785,lng:-100.187,s:"cuestre",v:0,p:"Arena ecuestre",d:"Apodaca NL",t:"(81)8220-5100",tp:"l",pot:"400-800",prov:"Sin proveedor"},
{n:"Club Campestre Saltillo Ec.",lat:25.424,lng:-101.006,s:"cuestre",v:0,p:"Arena ecuestre",d:"Saltillo Coah",t:"(844)432-0200",tp:"l",pot:"600-1,200",prov:"Arenas locales"},
{n:"Rancho Santa Isabel",lat:25.285,lng:-100.024,s:"cuestre",v:0,p:"Arena cuadra",d:"Allende NL",t:"(826)268-1500",tp:"l",pot:"500-1,000",prov:"Sin proveedor"},
{n:"Centro Ecuestre Cumbres",lat:25.729,lng:-100.379,s:"cuestre",v:0,p:"Arena ecuestre",d:"Monterrey NL",t:"(81)1522-3300",tp:"l",pot:"300-600",prov:"Sin proveedor"},
{n:"Haras del Norte",lat:25.785,lng:-100.157,s:"cuestre",v:0,p:"Arena cría",d:"Pesquería NL",t:"(81)8220-8800",tp:"l",pot:"400-800",prov:"Sin proveedor"},
{n:"Club Ecuestre Linares",lat:24.86,lng:-99.57,s:"cuestre",v:0,p:"Arena ecuestre",d:"Linares NL",t:"(821)212-3400",tp:"l",pot:"200-500",prov:"Sin proveedor"},
{n:"Centro Ecuestre Monclova",lat:26.92,lng:-101.43,s:"cuestre",v:0,p:"Arena ecuestre",d:"Monclova Coah",t:"(866)636-1100",tp:"l",pot:"300-600",prov:"Sin proveedor"},
{n:"Club Hípico Reynosa",lat:26.05,lng:-98.28,s:"cuestre",v:0,p:"Arena ecuestre",d:"Reynosa Tamps",t:"(899)922-4500",tp:"l",pot:"300-600",prov:"Sin proveedor"},
{n:"Lienzo Charro García",lat:25.81,lng:-100.58,s:"cuestre",v:0,p:"Arena charrería",d:"García NL",t:"(81)8282-1100",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Lienzo Charro Los Ramones",lat:25.99,lng:-99.63,s:"cuestre",v:0,p:"Arena charrería",d:"Los Ramones NL",t:"(826)253-0050",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Rancho El Milagro",lat:25.191,lng:-99.824,s:"cuestre",v:0,p:"Arena cuadra",d:"Montemorelos NL",t:"(826)263-1200",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Rancho El Mezquite",lat:25.424,lng:-100.154,s:"cuestre",v:0,p:"Arena ecuestre",d:"Santiago NL",t:"(81)2345-6700",tp:"l",pot:"200-500",prov:"Sin proveedor"},
{n:"Lienzo Charro Cadereyta",lat:25.59,lng:-99.98,s:"cuestre",v:0,p:"Arena charrería",d:"Cadereyta NL",t:"(828)284-1100",tp:"l",pot:"200-400",prov:"Sin proveedor"},
{n:"Centro Ecuestre El Uro",lat:25.686,lng:-100.258,s:"cuestre",v:0,p:"Arena ecuestre",d:"Monterrey NL",t:"(81)8338-5500",tp:"l",pot:"300-600",prov:"Sin proveedor"},
// FILTRACIÓN 20
{n:"Agua y Drenaje MTY",lat:25.6866,lng:-100.3169,s:"filtracion",v:0,p:"Arena filtración lecho",d:"Monterrey NL",t:"aguaydrenaje.org",tp:"l",pot:"5,000-10,000",refs:[{t:'Referido en registro (web)',u:'https://www.google.com/search?q=Agua+y+Drenaje+Monterrey'},{t:'Marco agua MX (CONAGUA)',u:'https://www.gob.mx/conagua'}]},
{n:"COMAPA Nuevo Laredo",lat:27.476,lng:-99.517,s:"filtracion",v:0,p:"Arena filtración",d:"Nvo Laredo Tamps",t:"comapanl.gob.mx",tp:"l",pot:"2,000-4,000"},
{n:"SIMAS Saltillo",lat:25.424,lng:-101.006,s:"filtracion",v:0,p:"Arena filtración",d:"Saltillo Coah",t:"simas.gob.mx",tp:"l",pot:"2,000-4,000"},
{n:"COMAPA Reynosa",lat:26.05,lng:-98.28,s:"filtracion",v:0,p:"Arena filtración",d:"Reynosa Tamps",t:"",tp:"l",pot:"1,500-3,000"},
{n:"COMAPA Matamoros",lat:25.88,lng:-97.5,s:"filtracion",v:0,p:"Arena filtración",d:"Matamoros Tamps",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Cobosa Tratamiento Agua",lat:25.69,lng:-100.32,s:"filtracion",v:0,p:"Equipos filtración",d:"Monterrey NL",t:"cobosa.com.mx",tp:"l",pot:"800-1,500"},
{n:"Carbotecnia",lat:25.68,lng:-100.33,s:"filtracion",v:0,p:"Arena filtros",d:"Monterrey NL",t:"carbotecnia.info",tp:"l",pot:"800-1,500"},
{n:"Aqua Systems MX",lat:25.69,lng:-100.32,s:"filtracion",v:0,p:"Medios filtrantes",d:"Monterrey NL",t:"aqua.com.mx",tp:"l",pot:"1,000-2,500"},
{n:"Silmex",lat:25.951,lng:-100.175,s:"filtracion",v:0,p:"Arena AWWA",d:"Ciénega Flores NL",t:"silmex.com.mx",tp:"l",pot:"1,500-3,000"},
{n:"Aquazone Albercas",lat:25.69,lng:-100.31,s:"filtracion",v:0,p:"Arena filtros piscina",d:"Monterrey NL",t:"aquazonealbercas.com",tp:"l",pot:"600-1,200"},
{n:"Albercas y Equipos MTY",lat:25.68,lng:-100.32,s:"filtracion",v:0,p:"Arena filtros piscina",d:"Monterrey NL",t:"",tp:"l",pot:"500-1,000"},
{n:"PTAR Apodaca",lat:25.78,lng:-100.19,s:"filtracion",v:0,p:"Arena terciaria",d:"Apodaca NL",t:"",tp:"l",pot:"800-1,500"},
{n:"PTAR Pesquería",lat:25.81,lng:-100.19,s:"filtracion",v:0,p:"Arena filtración",d:"Pesquería NL",t:"",tp:"l",pot:"600-1,200"},
{n:"PTAR García",lat:25.81,lng:-100.59,s:"filtracion",v:0,p:"Arena filtración",d:"García NL",t:"",tp:"l",pot:"500-1,000"},
{n:"PTAR Santa Catarina",lat:25.67,lng:-100.45,s:"filtracion",v:0,p:"Arena filtración",d:"Sta Catarina NL",t:"",tp:"l",pot:"500-1,000"},
{n:"Agua de Coahuila",lat:27.06,lng:-101.55,s:"filtracion",v:0,p:"Arena multiplantas",d:"Coahuila",t:"",tp:"l",pot:"3,000-6,000"},
{n:"Agua de Tamaulipas",lat:23.73,lng:-99.15,s:"filtracion",v:0,p:"Arena filtración",d:"Tamaulipas",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Pool Service MTY",lat:25.67,lng:-100.32,s:"filtracion",v:0,p:"Arena alberca",d:"Monterrey NL",t:"",tp:"l",pot:"300-600"},
{n:"Hidrosan",lat:25.68,lng:-100.33,s:"filtracion",v:0,p:"Equipos tratamiento",d:"Monterrey NL",t:"",tp:"l",pot:"400-800"},
{n:"Potabilizadora San Roque",lat:25.69,lng:-100.31,s:"filtracion",v:0,p:"Arena potabilización",d:"Monterrey NL",t:"AyD",tp:"l",pot:"1,500-3,000"},
// FRACKING 12
{n:"PEMEX Cuenca Burgos",lat:26.09,lng:-99.49,s:"fracking",v:0,p:"Proppant 20/40",d:"Los Ramones NL",t:"pemex.com",tp:"l",pot:"20,000-50,000"},
{n:"Schlumberger MX",lat:26.09,lng:-98.28,s:"fracking",v:0,p:"Arena fracturamiento",d:"Reynosa Tamps",t:"slb.com",tp:"l",pot:"10,000-25,000"},
{n:"Halliburton MX",lat:22.23,lng:-97.86,s:"fracking",v:0,p:"Stimulation proppant",d:"Tampico Tamps",t:"halliburton.com",tp:"l",pot:"8,000-20,000"},
{n:"Baker Hughes MX",lat:26.1,lng:-98.29,s:"fracking",v:0,p:"Fracturamiento",d:"Reynosa Tamps",t:"bakerhughes.com",tp:"l",pot:"5,000-15,000"},
{n:"Weatherford MX",lat:26.1,lng:-98.3,s:"fracking",v:0,p:"Completions",d:"Reynosa Tamps",t:"weatherford.com",tp:"l",pot:"3,000-8,000"},
{n:"Cubo Petroleum",lat:24.75,lng:-98.05,s:"fracking",v:0,p:"Perforación",d:"San Fernando Tamps",t:"",tp:"l",pot:"3,000-8,000"},
{n:"Newpek Exploración",lat:26.0,lng:-98.5,s:"fracking",v:0,p:"Gas shale",d:"Tamaulipas",t:"newpek.com",tp:"l",pot:"4,000-10,000"},
{n:"Pantera E&P",lat:26.05,lng:-98.45,s:"fracking",v:0,p:"Exploración gas",d:"Tamaulipas",t:"",tp:"l",pot:"3,000-8,000"},
{n:"BNK Petroleum",lat:27.06,lng:-101.55,s:"fracking",v:0,p:"Shale gas",d:"Coahuila",t:"",tp:"l",pot:"2,000-6,000"},
{n:"Proppant Distribuidores",lat:27.48,lng:-99.52,s:"fracking",v:0,p:"Distribución proppant",d:"Nvo Laredo",t:"",tp:"l",pot:"5,000-12,000"},
{n:"Terra Energy Services",lat:26.09,lng:-98.28,s:"fracking",v:0,p:"Well services",d:"Reynosa Tamps",t:"",tp:"l",pot:"2,000-5,000"},
{n:"C&J Energy Services",lat:26.1,lng:-98.3,s:"fracking",v:0,p:"Completions",d:"Reynosa Tamps",t:"",tp:"l",pot:"2,000-5,000"},
// AGRICULTURA 28
{n:"Ycoysa Invernaderos",lat:25.81,lng:-100.59,s:"agricola",v:0,p:"Sustratos",d:"García NL",t:"ycoysa.com",tp:"l",pot:"1,500-3,000"},
{n:"Invernaderos Premium García",lat:25.82,lng:-100.58,s:"agricola",v:0,p:"Sustrato tomate",d:"García NL",t:"",tp:"l",pot:"800-1,500"},
{n:"Zona Lagunera Agricultores",lat:25.54,lng:-103.44,s:"agricola",v:0,p:"Drenaje arcilloso",d:"Torreón Coah",t:"",tp:"l",pot:"3,000-6,000"},
{n:"Invernaderos Norte Coah",lat:25.42,lng:-101.01,s:"agricola",v:0,p:"Sustratos",d:"Saltillo Coah",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Citricultores NL-Tamps",lat:25.59,lng:-100.22,s:"agricola",v:0,p:"Mejorador suelo",d:"Montemorelos NL",t:"",tp:"l",pot:"1,000-2,500"},
{n:"Viñedos Parras",lat:25.42,lng:-102.18,s:"agricola",v:0,p:"Drenaje viñedo",d:"Parras Coah",t:"",tp:"l",pot:"600-1,200"},
{n:"Berries del Norte",lat:22.77,lng:-102.57,s:"agricola",v:0,p:"Sustrato fresas",d:"Zacatecas",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Viveros Norte MTY",lat:25.69,lng:-100.32,s:"agricola",v:0,p:"Mezcla vivero",d:"Monterrey NL",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Sustratos Premium QRO",lat:20.59,lng:-100.39,s:"agricola",v:0,p:"Distribuidor",d:"Querétaro",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Horticultores Río Bravo",lat:26.08,lng:-98.3,s:"agricola",v:0,p:"Drenaje",d:"Tamaulipas",t:"",tp:"l",pot:"1,200-2,500"},
{n:"Manzaneros Cuauhtémoc",lat:28.64,lng:-106.56,s:"agricola",v:0,p:"Mejorador",d:"Chihuahua",t:"",tp:"l",pot:"800-1,500"},
{n:"Grupo Gussi",lat:20.59,lng:-100.39,s:"agricola",v:0,p:"Sustratos intensivos",d:"Querétaro",t:"",tp:"l",pot:"3,000-6,000"},
{n:"Invernaderos Linares",lat:24.86,lng:-99.57,s:"agricola",v:0,p:"Sustrato tomate",d:"Linares NL",t:"",tp:"l",pot:"500-1,000"},
{n:"Nopal Industrial",lat:23.65,lng:-100.64,s:"agricola",v:0,p:"Drenaje",d:"SLP",t:"",tp:"l",pot:"300-600"},
{n:"Arandaneros Norte",lat:25.19,lng:-99.82,s:"agricola",v:0,p:"Sustrato arándano",d:"Montemorelos NL",t:"",tp:"l",pot:"800-1,500"},
{n:"Productores Orgánicos NL",lat:25.69,lng:-100.32,s:"agricola",v:0,p:"Arena compost",d:"Monterrey NL",t:"",tp:"l",pot:"400-800"},
{n:"Floricultura Norte",lat:25.42,lng:-101.01,s:"agricola",v:0,p:"Sustrato flores",d:"Saltillo Coah",t:"",tp:"l",pot:"300-600"},
{n:"Pome Fruits Chihuahua",lat:28.64,lng:-106.09,s:"agricola",v:0,p:"Manzano",d:"Chihuahua",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Nueces Norte Coah",lat:27.06,lng:-101.55,s:"agricola",v:0,p:"Drenaje nogal",d:"Coahuila",t:"",tp:"l",pot:"500-1,000"},
{n:"Chile Salinas Victoria",lat:25.98,lng:-100.3,s:"agricola",v:0,p:"Sustrato chile",d:"Salinas Victoria NL",t:"",tp:"l",pot:"500-1,000"},
{n:"Girasol Noreste",lat:25.42,lng:-101.01,s:"agricola",v:0,p:"Drenaje",d:"Coahuila",t:"",tp:"l",pot:"400-800"},
{n:"Rancho Agrícola Santiago",lat:25.42,lng:-100.15,s:"agricola",v:0,p:"Mejorador",d:"Santiago NL",t:"",tp:"l",pot:"300-600"},
{n:"Cactáceas SLP",lat:22.16,lng:-100.99,s:"agricola",v:0,p:"Drenaje",d:"SLP",t:"",tp:"l",pot:"300-600"},
{n:"Campos Maíz Tamps",lat:25.59,lng:-100.22,s:"agricola",v:0,p:"Semilleros",d:"Tamaulipas",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Aguacateros Michoacán",lat:19.17,lng:-104.91,s:"agricola",v:0,p:"Drenaje",d:"Michoacán",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Hortalizas Cadereyta",lat:25.59,lng:-99.98,s:"agricola",v:0,p:"Sustrato",d:"Cadereyta NL",t:"",tp:"l",pot:"500-1,000"},
{n:"Invernaderos Arteaga",lat:25.36,lng:-100.85,s:"agricola",v:0,p:"Sustrato",d:"Arteaga Coah",t:"",tp:"l",pot:"600-1,200"},
{n:"Agro Norte Pesquería",lat:25.81,lng:-100.19,s:"agricola",v:0,p:"Sustrato",d:"Pesquería NL",t:"",tp:"l",pot:"400-800"},
// CONSTRUCCIÓN 36
{n:"CEMEX Concretos MTY",lat:25.6866,lng:-100.3169,s:"reciclaje",v:0,p:"Arena morteros",d:"Monterrey NL",t:"cemex.com",tp:"l",pot:"8,000-15,000"},
{n:"Holcim México NE",lat:25.69,lng:-100.3,s:"reciclaje",v:0,p:"Arena cemento",d:"Monterrey NL",t:"holcim.com.mx",tp:"l",pot:"5,000-12,000"},
{n:"GCC Concretos NE",lat:25.69,lng:-100.31,s:"reciclaje",v:0,p:"Arena premezclado",d:"Monterrey NL",t:"gcc.com",tp:"l",pot:"3,000-6,000"},
{n:"ABC Concretos MTY",lat:25.79,lng:-100.34,s:"reciclaje",v:0,p:"Arena premezclado",d:"MTY/Saltillo",t:"abcconcretos.com",tp:"l",pot:"2,000-4,000"},
{n:"Grupo Compre",lat:25.79,lng:-100.29,s:"reciclaje",v:0,p:"Arena premezclado",d:"Monterrey NL",t:"compre.com.mx",tp:"l",pot:"1,500-3,000"},
{n:"Grupo Hermes Asfaltos",lat:25.69,lng:-100.32,s:"reciclaje",v:0,p:"Arena asfáltica",d:"Monterrey NL",t:"",tp:"l",pot:"5,000-10,000"},
{n:"Saint-Gobain Weber",lat:25.55,lng:-100.27,s:"reciclaje",v:0,p:"Morteros especiales",d:"Monterrey NL",t:"weber.com.mx",tp:"l",pot:"4,000-8,000"},
{n:"Mapei México NE",lat:25.79,lng:-100.29,s:"reciclaje",v:0,p:"Aditivos/morteros",d:"Monterrey NL",t:"mapei.com.mx",tp:"l",pot:"3,000-6,000"},
{n:"Fassa Bortolo MX",lat:25.95,lng:-100.17,s:"reciclaje",v:0,p:"Arena morteros",d:"Ciénega Flores NL",t:"fassabortolo.mx",tp:"l",pot:"2,500-5,000"},
{n:"Grupo DAGS",lat:25.42,lng:-101.0,s:"reciclaje",v:0,p:"Arena obras",d:"Saltillo Coah",t:"grupodags.com",tp:"l",pot:"2,000-4,000"},
{n:"Cemento Cruz Azul NE",lat:25.69,lng:-100.31,s:"reciclaje",v:0,p:"Arena cemento",d:"Monterrey NL",t:"",tp:"l",pot:"3,000-6,000"},
{n:"Constructora Javer",lat:25.69,lng:-100.32,s:"reciclaje",v:0,p:"Arena vivienda",d:"Monterrey NL",t:"javer.com.mx",tp:"l",pot:"2,000-4,000"},
{n:"Constructora Ara NE",lat:25.69,lng:-100.32,s:"reciclaje",v:0,p:"Arena vivienda",d:"Monterrey NL",t:"",tp:"l",pot:"2,500-5,000"},
{n:"Vinte Constructora",lat:25.69,lng:-100.33,s:"reciclaje",v:0,p:"Arena vivienda",d:"Monterrey NL",t:"",tp:"l",pot:"2,000-4,000"},
{n:"IMESA Fundición",lat:25.79,lng:-100.34,s:"reciclaje",v:0,p:"Arena verde",d:"Escobedo NL",t:"imesamty.com",tp:"l",pot:"1,500-3,000"},
{n:"Fundiciones MTY",lat:25.81,lng:-100.19,s:"reciclaje",v:0,p:"Arena fundición",d:"Pesquería NL",t:"",tp:"l",pot:"1,200-2,500"},
{n:"CDMI Fundición",lat:25.7,lng:-100.31,s:"reciclaje",v:0,p:"Arena CO2",d:"Monterrey NL",t:"",tp:"l",pot:"800-1,500"},
{n:"ARSILC Distribución",lat:25.79,lng:-100.38,s:"reciclaje",v:0,p:"Arena sílica",d:"Monterrey NL",t:"parenas.com.mx",tp:"l",pot:"3,000-6,000"},
{n:"Recicladora del Norte",lat:25.7,lng:-100.31,s:"reciclaje",v:0,p:"Arena reciclada",d:"Monterrey NL",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Pavimentos de NL",lat:25.78,lng:-100.19,s:"reciclaje",v:0,p:"Arena carretera",d:"Apodaca NL",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Ladrillera Monterrey",lat:25.81,lng:-100.19,s:"reciclaje",v:0,p:"Arena ladrillo",d:"Pesquería NL",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Blockera del Norte",lat:25.81,lng:-100.59,s:"reciclaje",v:0,p:"Arena block",d:"García NL",t:"",tp:"l",pot:"800-1,500"},
{n:"Grupo Constructor Coah",lat:25.42,lng:-101.01,s:"reciclaje",v:0,p:"Arena obras",d:"Saltillo Coah",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Materiales Monclova",lat:26.91,lng:-101.42,s:"reciclaje",v:0,p:"Distribución",d:"Monclova Coah",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Transportes Carreteros",lat:25.81,lng:-100.19,s:"reciclaje",v:0,p:"Arena carretera",d:"Pesquería NL",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Concretos Norte",lat:25.75,lng:-100.28,s:"reciclaje",v:0,p:"Arena premezclado",d:"Apodaca NL",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Asfaltos Noreste",lat:25.69,lng:-100.32,s:"reciclaje",v:0,p:"Arena asfáltica",d:"Monterrey NL",t:"",tp:"l",pot:"2,000-4,000"},
{n:"Concretos Arteaga",lat:25.36,lng:-100.85,s:"reciclaje",v:0,p:"Arena premezclado",d:"Arteaga Coah",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Morteros Secos Norte",lat:25.95,lng:-100.17,s:"reciclaje",v:0,p:"Arena mortero seco",d:"Ciénega Flores NL",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Materiales Laredo",lat:27.48,lng:-99.52,s:"reciclaje",v:0,p:"Distribución",d:"Nvo Laredo Tamps",t:"",tp:"l",pot:"1,000-2,000"},
{n:"Vitromex Construcción",lat:25.81,lng:-100.59,s:"reciclaje",v:0,p:"Arena cerámica",d:"García NL",t:"vitromex.com",tp:"l",pot:"3,000-6,000"},
{n:"Geo Hogares NE",lat:25.69,lng:-100.33,s:"reciclaje",v:0,p:"Arena vivienda",d:"Monterrey NL",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Arena Industrial Saltillo",lat:25.42,lng:-101.01,s:"reciclaje",v:0,p:"Arena industrial",d:"Saltillo Coah",t:"",tp:"l",pot:"1,500-3,000"},
{n:"Tepeyac Materiales",lat:25.69,lng:-100.3,s:"reciclaje",v:0,p:"Distribución",d:"Monterrey NL",t:"",tp:"l",pot:"800-1,500"},
{n:"Vidriera Treviño",lat:25.73,lng:-100.31,s:"reciclaje",v:0,p:"Vidrio/arena",d:"Monterrey NL",t:"vidrieratrevino.com.mx",tp:"l",pot:"600-1,200"},
{n:"Pisos Adoquines MTY",lat:25.81,lng:-100.19,s:"reciclaje",v:0,p:"Arena adoquín",d:"Pesquería NL",t:"",tp:"l",pot:"800-1,500"},
{n:"Vitro Envases SA",lat:25.7959,lng:-100.1202,s:"vidrio",v:0,p:"Silice especial envase",d:"Apodaca NL",t:"(81)8863-1000",tp:"l",pot:"8,000-15,000",prov:"US Silica"},
{n:"Owens-Illinois MX",lat:25.7959,lng:-100.2202,s:"vidrio",v:0,p:"Silice grado vidrio",d:"Monterrey NL",t:"oi.com",tp:"l",pot:"5,000-10,000",prov:"Importacion"},
{n:"Vitro Vidrios Planos",lat:25.9059,lng:-100.1678,s:"vidrio",v:0,p:"Arena silice float",d:"Cienega Flores NL",t:"(81)8154-7700",tp:"l",pot:"3,000-6,000",prov:"Arenas locales"},
{n:"Interceramic Chihuahua",lat:28.64,lng:-106.09,s:"ceramica",v:0,p:"Cerasil SL-208B",d:"Chihuahua",t:"interceramic.com",tp:"l",pot:"5,000-10,000",prov:"Arenas locales"},
{n:"Lamosa Pisos NE",lat:25.69,lng:-100.31,s:"ceramica",v:0,p:"Arena ceramica premium",d:"Monterrey NL",t:"(81)8865-1200",tp:"l",pot:"4,000-8,000",prov:"Importacion"},
{n:"San Lorenzo Ceramica",lat:25.42,lng:-101.01,s:"ceramica",v:0,p:"Cerasil SL-306A",d:"Saltillo Coah",t:"(844)488-5500",tp:"l",pot:"3,000-6,000",prov:"Arenas locales"},
{n:"Portobello Mexico",lat:25.69,lng:-100.32,s:"ceramica",v:0,p:"Cerasil SL-208B",d:"Monterrey NL",t:"portobello.com",tp:"l",pot:"2,000-4,000",prov:"Importacion"},
{n:"METALSA Escobedo",lat:25.79,lng:-100.19,s:"fundicion",v:0,p:"Arena moldes autopartes",d:"Escobedo NL",t:"(81)8288-6000",tp:"l",pot:"2,000-4,000",prov:"Arenas regionales"},
{n:"Nemak Garcia",lat:25.81,lng:-100.58,s:"fundicion",v:0,p:"Incast 55 colada",d:"Garcia NL",t:"(81)8748-8000",tp:"l",pot:"3,000-6,000",prov:"US Silica"},
{n:"Rassini Frenos NL",lat:25.79,lng:-100.34,s:"fundicion",v:0,p:"Arena fundicion gris",d:"San Martin NL",t:"(81)8288-7700",tp:"l",pot:"1,000-2,000",prov:"Arenas regionales"},
{n:"Tenaris Tamsa Altamira",lat:22.38,lng:-97.86,s:"fundicion",v:0,p:"Arena colada centrifugada",d:"Altamira Tamps",t:"tenaris.com",tp:"l",pot:"4,000-8,000",prov:"Importacion"},
{n:"ISOMAT NL",lat:25.79,lng:-100.34,s:"fibra",v:0,p:"Silice fibra ceramica",d:"Escobedo NL",t:"(81)8369-4400",tp:"l",pot:"500-1,000",prov:"Sin proveedor"},
{n:"Thermoinsulation MX",lat:25.69,lng:-100.31,s:"fibra",v:0,p:"Silice VC SL-A refractario",d:"Monterrey NL",t:"(81)8374-5500",tp:"l",pot:"400-800",prov:"Sin proveedor"},
{n:"Insulmica NE",lat:25.75,lng:-100.28,s:"fibra",v:0,p:"Fibra mineral/silice",d:"Apodaca NL",t:"(81)8220-8100",tp:"l",pot:"300-600",prov:"Sin proveedor"},
{n:"CEMEX Saltillo Concretos",lat:25.42,lng:-101.01,s:"reciclaje",v:0,p:"Arena premezclado",d:"Saltillo Coah",t:"(844)414-1000",tp:"l",pot:"5,000-10,000",prov:"Arenas regionales"},
{n:"Grupo Empresarial Dycsa",lat:25.69,lng:-100.33,s:"reciclaje",v:0,p:"Arena construccion pesada",d:"Monterrey NL",t:"(81)8158-6600",tp:"l",pot:"2,000-4,000",prov:"Arenas regionales"},
{n:"Viveica Prefabricados",lat:25.81,lng:-100.19,s:"reciclaje",v:0,p:"Arena mortero seco",d:"Pesqueria NL",t:"(81)8220-9300",tp:"l",pot:"1,500-3,000",prov:"Sin proveedor"},
// —— Producto: mineral + (arena sílica); segmento s solo cerámica / reciclaje ——
{n:"Feld. Sanitarios Norte MTY",lat:25.714,lng:-100.285,s:"ceramica",v:0,p:"Feldespato potásico cuerpo (arena sílica)",d:"Monterrey NL",t:"",tp:"l",pot:"2,500-5,000",prov:"Turquía/India"},
{n:"Pasta Cerámica Apodaca",lat:25.782,lng:-100.195,s:"ceramica",v:0,p:"Feldespato + arcillas (arena sílica)",d:"Apodaca NL",t:"",tp:"l",pot:"1,800-3,500",prov:"Importación"},
{n:"Gres Porcelánico Escobedo",lat:25.805,lng:-100.355,s:"ceramica",v:0,p:"Feldespato micronizado (arena sílica)",d:"Escobedo NL",t:"",tp:"l",pot:"3,000-6,000",prov:"Sin proveedor"},
{n:"Línea Gran Formato García",lat:25.815,lng:-100.575,s:"ceramica",v:0,p:"Feldespato flux esmaltes (arena sílica)",d:"García NL",t:"",tp:"l",pot:"2,000-4,500",prov:"Importación"},
{n:"Fritas y Esmaltes Ciénega",lat:25.935,lng:-100.205,s:"ceramica",v:0,p:"Feldespato sodico/cálcico (arena sílica)",d:"Ciénega Flores NL",t:"",tp:"l",pot:"4,000-8,000",prov:"Europa"},
{n:"Sanitarios Premium SP",lat:25.658,lng:-100.405,s:"ceramica",v:0,p:"Feldespato pasta blanca (arena sílica)",d:"Sta Catarina NL",t:"",tp:"l",pot:"1,500-3,000",prov:"Sin proveedor"},
{n:"Azulejo Industrial Pesquería",lat:25.805,lng:-100.175,s:"ceramica",v:0,p:"Feldespato para gres (arena sílica)",d:"Pesquería NL",t:"",tp:"l",pot:"2,500-5,000",prov:"Turquía"},
{n:"Benito Juárez Feld. Especial",lat:25.652,lng:-100.065,s:"ceramica",v:0,p:"Feldespato cuerpo sanitario (arena sílica)",d:"Benito Juárez NL",t:"",tp:"l",pot:"2,000-4,000",prov:"Importación"},
{n:"Cluster Cerámico Juárez NL",lat:25.671,lng:-100.088,s:"ceramica",v:0,p:"Feldespato sodico (arena sílica)",d:"Juárez NL",t:"",tp:"l",pot:"3,500-7,000",prov:"Sin proveedor"},
{n:"USM Área Feldespato",lat:25.672,lng:-100.305,s:"ceramica",v:0,p:"Feldespato laboratorio (arena sílica)",d:"Monterrey NL",t:"",tp:"l",pot:"800-1,500",prov:"Covia"},
{n:"Feld. Planta Lampazos Ruta",lat:26.985,lng:-100.505,s:"ceramica",v:0,p:"Feldespato para gres rústico (arena sílica)",d:"Anáhuac NL",t:"",tp:"l",pot:"1,200-2,500",prov:"Importación"},
{n:"Noreste Feld. Colombia Km",lat:26.895,lng:-100.445,s:"ceramica",v:0,p:"Feldespato industrial (arena sílica)",d:"Lampazos zona NL",t:"",tp:"l",pot:"1,000-2,000",prov:"Sin proveedor"},
{n:"Pasta Roja Jáltipan",lat:17.995,lng:-94.712,s:"ceramica",v:0,p:"Feldespato vajilla (arena sílica)",d:"Jáltipan VZ",t:"",tp:"l",pot:"2,000-4,000",prov:"Importación"},
{n:"Ladrillo Vitrificado Sur",lat:17.975,lng:-94.685,s:"ceramica",v:0,p:"Feldespato bajo fuego (arena sílica)",d:"Cosamaloapan VZ",t:"",tp:"l",pot:"1,500-3,000",prov:"Sin proveedor"},
{n:"Gres Jáltipan Cluster",lat:18.005,lng:-94.655,s:"ceramica",v:0,p:"Feldespato porcelana (arena sílica)",d:"Jáltipan VZ",t:"",tp:"l",pot:"2,500-5,000",prov:"Turquía"},
{n:"Canoitas Feld. Frontera",lat:28.072,lng:-100.095,s:"ceramica",v:0,p:"Feldespato ladrillo cara vista (arena sílica)",d:"Villa Hidalgo CO",t:"",tp:"l",pot:"1,000-2,500",prov:"Regional"},
{n:"Pasta Cerámica Piedras Negras",lat:28.11,lng:-100.12,s:"ceramica",v:0,p:"Feldespato color (arena sílica)",d:"Coahuila",t:"",tp:"l",pot:"1,800-3,500",prov:"Importación"},
{n:"Tetla Feld. Industrial",lat:19.485,lng:-98.055,s:"ceramica",v:0,p:"Feldespato piso técnico (arena sílica)",d:"Tetla TL",t:"",tp:"l",pot:"2,000-4,000",prov:"Sin proveedor"},
{n:"Tlaxcala San Pablo del Monte",lat:19.12,lng:-98.32,s:"ceramica",v:0,p:"Feldespato artesanal (arena sílica)",d:"Tlaxcala",t:"",tp:"l",pot:"600-1,200",prov:"Local"},
{n:"San José Iturbide Gres",lat:20.955,lng:-100.465,s:"ceramica",v:0,p:"Feldespato rústico (arena sílica)",d:"San José de Iturbide GT",t:"",tp:"l",pot:"1,200-2,500",prov:"Importación"},
{n:"Dolores Hidalgo Pasta",lat:21.15,lng:-100.93,s:"ceramica",v:0,p:"Feldespato tradicional (arena sílica)",d:"Guanajuato",t:"",tp:"l",pot:"800-1,800",prov:"Local"},
{n:"Ahuazotepec Arcilla-Feld",lat:20.045,lng:-98.14,s:"ceramica",v:0,p:"Feldespato mezcla porcelana (arena sílica)",d:"Zacapoaxtla Pue",t:"",tp:"l",pot:"1,500-3,000",prov:"Sin proveedor",refs:[{t:'Buscar: cerámica Zacapoaxtla / Sierra Norte Puebla',u:'https://www.google.com/search?q=ceramica+Zacapoaxtla+Puebla+industria'},{t:'INEGI · Puebla (contexto económico)',u:'https://www.inegi.org.mx/contenidos/programas/ce/2019/'}]},
{n:"Puebla Angelópolis Cerámica",lat:19.05,lng:-98.25,s:"ceramica",v:0,p:"Feldespato gran formato (arena sílica)",d:"Puebla",t:"",tp:"l",pot:"3,000-6,000",prov:"Europa"},
{n:"San Juan Evangelista Ladrillo",lat:17.895,lng:-95.035,s:"ceramica",v:0,p:"Feldespato horno túnel (arena sílica)",d:"San Juan VZ",t:"",tp:"l",pot:"1,000-2,000",prov:"Regional"},
{n:"Sayula Cluster Cerámico",lat:17.88,lng:-95.12,s:"ceramica",v:0,p:"Feldespato piso (arena sílica)",d:"Veracruz",t:"",tp:"l",pot:"1,200-2,500",prov:"Sin proveedor"},
{n:"Monclova Acabados Cerámicos",lat:26.9,lng:-101.41,s:"ceramica",v:0,p:"Feldespato esmalte (arena sílica)",d:"Monclova CO",t:"",tp:"l",pot:"800-1,500",prov:"Importación"},
{n:"Torreón Industria Sanitaria",lat:25.55,lng:-103.42,s:"ceramica",v:0,p:"Feldespato pasta (arena sílica)",d:"Torreón CO",t:"",tp:"l",pot:"2,000-4,000",prov:"Turquía"},
{n:"Reynosa Maquila Sanitarios",lat:26.08,lng:-98.31,s:"ceramica",v:0,p:"Feldespato importación (arena sílica)",d:"Reynosa Tamps",t:"",tp:"l",pot:"1,500-3,000",prov:"US border"},
{n:"Nuevo Laredo Distribución Feld",lat:27.49,lng:-99.51,s:"ceramica",v:0,p:"Feldespato stock NAFTA (arena sílica)",d:"Nvo Laredo Tamps",t:"",tp:"l",pot:"1,000-2,500",prov:"Importación"},
{n:"Querétaro Hub Cerámico",lat:20.62,lng:-100.39,s:"ceramica",v:0,p:"Feldespato alta gama (arena sílica)",d:"Querétaro",t:"",tp:"l",pot:"2,500-5,000",prov:"Europa"},
{n:"Carbonato Master Batch Apodaca",lat:25.775,lng:-100.165,s:"reciclaje",v:0,p:"CaCO₃ micronizado PVC (arena sílica)",d:"Apodaca NL",t:"",tp:"l",pot:"3,000-6,000",prov:"Regional"},
{n:"Plásticos Norte MTY",lat:25.705,lng:-100.28,s:"reciclaje",v:0,p:"PCC filler masterbatch (arena sílica)",d:"Monterrey NL",t:"",tp:"l",pot:"4,000-9,000",prov:"Sin proveedor"},
{n:"PVC Compuestos García",lat:25.82,lng:-100.58,s:"reciclaje",v:0,p:"Carbonato recubierto (arena sílica)",d:"García NL",t:"",tp:"l",pot:"2,500-5,000",prov:"Importación"},
{n:"Caucho Industrial NL",lat:25.74,lng:-100.22,s:"reciclaje",v:0,p:"CaCO₃ caucho (arena sílica)",d:"Guadalupe NL",t:"",tp:"l",pot:"2,000-4,000",prov:"Regional"},
{n:"Pinturas y Recubrimientos MTY",lat:25.68,lng:-100.34,s:"reciclaje",v:0,p:"Carbonato fino pintura (arena sílica)",d:"Monterrey NL",t:"",tp:"l",pot:"1,500-3,500",prov:"Local"},
{n:"Adhesivos Benito Juárez",lat:25.645,lng:-100.055,s:"reciclaje",v:0,p:"PCC adhesivos (arena sílica)",d:"Benito Juárez NL",t:"",tp:"l",pot:"1,200-2,800",prov:"Sin proveedor"},
{n:"Carbonato Juárez NL Planta",lat:25.662,lng:-100.078,s:"reciclaje",v:0,p:"CaCO₃ mortero fino (arena sílica)",d:"Juárez NL",t:"",tp:"l",pot:"2,000-4,500",prov:"Cantera NL"},
{n:"Caliza Molido Lampazos",lat:27.01,lng:-100.52,s:"reciclaje",v:0,p:"Carbonato agrícola/cal (arena sílica)",d:"Lampazos NL",t:"",tp:"l",pot:"1,000-2,500",prov:"Regional"},
{n:"Agro Caliza Anáhuac",lat:26.95,lng:-100.48,s:"reciclaje",v:0,p:"CaCO₃ suelo (arena sílica)",d:"NL Norte",t:"",tp:"l",pot:"800-2,000",prov:"Local"},
{n:"PVC Jáltipan Compuestos",lat:17.99,lng:-94.69,s:"reciclaje",v:0,p:"PCC plástico (arena sílica)",d:"Jáltipan VZ",t:"",tp:"l",pot:"1,500-3,000",prov:"Importación"},
{n:"Masterbatch Ver Sur",lat:17.97,lng:-94.72,s:"reciclaje",v:0,p:"Carbonato cable (arena sílica)",d:"Veracruz",t:"",tp:"l",pot:"1,200-2,500",prov:"Sin proveedor"},
{n:"Canoitas Caliza Industrial",lat:28.055,lng:-100.07,s:"reciclaje",v:0,p:"CaCO₃ cemento blanco (arena sílica)",d:"Coahuila",t:"",tp:"l",pot:"2,500-5,000",prov:"Regional"},
{n:"Piedras Negras Carbonato",lat:28.68,lng:-100.52,s:"reciclaje",v:0,p:"PCC precipitado (arena sílica)",d:"Coahuila",t:"",tp:"l",pot:"3,000-7,000",prov:"Importación"},
{n:"Tetla PCC Alimentario",lat:19.5,lng:-98.04,s:"reciclaje",v:0,p:"Carbonato farmacéutico (arena sílica)",d:"Tetla TL",t:"",tp:"l",pot:"1,000-2,000",prov:"Especialidad"},
{n:"Tlaxcala Plásticos",lat:19.45,lng:-98.12,s:"reciclaje",v:0,p:"CaCO₃ film (arena sílica)",d:"Tlaxcala",t:"",tp:"l",pot:"1,500-3,000",prov:"Regional"},
{n:"San José PCC Agro",lat:20.98,lng:-100.455,s:"reciclaje",v:0,p:"Carbonato corrector suelo (arena sílica)",d:"Guanajuato",t:"",tp:"l",pot:"1,200-2,500",prov:"Local"},
{n:"Puebla Compuestos Cal",lat:19.08,lng:-98.2,s:"reciclaje",v:0,p:"CaCO₃ construcción (arena sílica)",d:"Puebla",t:"",tp:"l",pot:"2,000-4,000",prov:"Cantera"},
{n:"San Juan Plásticos",lat:17.905,lng:-95.06,s:"reciclaje",v:0,p:"PCC tubería (arena sílica)",d:"San Juan VZ",t:"",tp:"l",pot:"1,000-2,500",prov:"Importación"},
{n:"Coatzacoalcos Petroquímica",lat:18.14,lng:-94.44,s:"reciclaje",v:0,p:"CaCO₃ compuesto (arena sílica)",d:"Veracruz",t:"",tp:"l",pot:"2,500-6,000",prov:"Sin proveedor"},
{n:"Saltillo PCC Regional",lat:25.43,lng:-101.0,s:"reciclaje",v:0,p:"Carbonato mortero (arena sílica)",d:"Saltillo CO",t:"",tp:"l",pot:"1,800-3,500",prov:"Regional"},
{n:"Torreón Cal Hidratada",lat:25.54,lng:-103.45,s:"reciclaje",v:0,p:"CaCO₃ cal (arena sílica)",d:"Torreón CO",t:"",tp:"l",pot:"2,000-4,000",prov:"Local"},
{n:"Reynosa Plásticos Frontera",lat:26.06,lng:-98.28,s:"reciclaje",v:0,p:"PCC empaque (arena sílica)",d:"Reynosa Tamps",t:"",tp:"l",pot:"1,500-3,500",prov:"Importación"},
{n:"Querétaro Nanofillers",lat:20.61,lng:-100.42,s:"reciclaje",v:0,p:"CaCO₃ nano (piloto) (arena sílica)",d:"Querétaro",t:"",tp:"l",pot:"1,000-2,000",prov:"Lab"},
{n:"León Guanajuato PCC",lat:21.12,lng:-101.68,s:"reciclaje",v:0,p:"Carbonato calzado (arena sílica)",d:"Guanajuato",t:"",tp:"l",pot:"2,000-4,500",prov:"Regional"},
{n:"USM Ruta Carbonato",lat:25.67,lng:-100.31,s:"reciclaje",v:0,p:"CaCO₃ pruebas QC (arena sílica)",d:"Monterrey NL",t:"",tp:"l",pot:"400-900",prov:"Covia"},
{n:"Feld. Saltillo Porcelana",lat:25.41,lng:-101.02,s:"ceramica",v:0,p:"Feldespato industrial (arena sílica)",d:"Saltillo CO",t:"",tp:"l",pot:"2,000-4,000",prov:"Importación"},
{n:"Feld. Monclova Ladrillo",lat:26.92,lng:-101.44,s:"ceramica",v:0,p:"Feldespato cara vista (arena sílica)",d:"Monclova CO",t:"",tp:"l",pot:"900-1,800",prov:"Regional"},
{n:"Feld. Mérida Yucatán",lat:20.97,lng:-89.62,s:"ceramica",v:0,p:"Feldespato pasta (arena sílica)",d:"Yucatán",t:"",tp:"l",pot:"1,200-2,500",prov:"Importación"},
{n:"Feld. León Sanitarios",lat:21.12,lng:-101.69,s:"ceramica",v:0,p:"Feldespato alta blancura (arena sílica)",d:"León GT",t:"",tp:"l",pot:"2,500-5,000",prov:"Europa"},
{n:"Carbonato Tampico PCC",lat:22.25,lng:-97.86,s:"reciclaje",v:0,p:"PCC offshore (arena sílica)",d:"Tampico Tamps",t:"",tp:"l",pot:"2,000-4,500",prov:"Importación"},
{n:"Carbonato Matamoros Plásticos",lat:25.87,lng:-97.5,s:"reciclaje",v:0,p:"CaCO₃ empaque (arena sílica)",d:"Matamoros Tamps",t:"",tp:"l",pot:"1,500-3,000",prov:"Regional"},
{n:"Carbonato SL Potosí",lat:22.15,lng:-101.0,s:"reciclaje",v:0,p:"Carbonato minería (arena sílica)",d:"SLP",t:"",tp:"l",pot:"1,800-3,500",prov:"Cantera"},
{n:"Feld. Cancún Import",lat:21.16,lng:-86.85,s:"ceramica",v:0,p:"Feldespato distribución (arena sílica)",d:"Quintana Roo",t:"",tp:"l",pot:"600-1,200",prov:"Importación"},
{n:"Carbonato Cancún Obra",lat:21.14,lng:-86.83,s:"reciclaje",v:0,p:"CaCO₃ estuco (arena sílica)",d:"Quintana Roo",t:"",tp:"l",pot:"800-1,500",prov:"Local"},
];

let map,mkrs=[],plantOverlays=[];let cT='all';let cQ='';let chatChartId=0;
const MAP_ULTRA_FAST_DEFAULT=true;
let mapUltraFast=MAP_ULTRA_FAST_DEFAULT;
let searchDebounceTimer=null;
let mapCanvasRenderer=null;
let mapBaseDark=null,mapBaseLight=null,mapBaseStyle='dark';
const MEX_BOUNDS=[[14.0,-117.8],[33.4,-86.0]];
const MEX_CORE_BOUNDS=[[15.0,-116.5],[32.8,-87.5]];
let mapDidAutoFit=false;
let mapShowRings=true;
let geoMinScore=0; // 0=todo, 80=solo geo confiable
let geoStrictMapOnly=false; // true: oculta en mapa leads con GeoScore bajo
let strictVerifiedOnly=false; // true: solo cuentas con señal verificable de cliente real
const GEO_STRICT_MIN_SCORE=65;
let tableSortKey='dist';
let tableSortDir='asc';
let mapLeadFocus=null;
let mapLeadView='preview';
let mapLeadDiag='';
let leadIntelSearchQ='';
let leadIntelRenderToken=0;
let leadIntelMode='all'; // all | internal | competitor
const LEAD_ENRICH_KEY='covia_lead_enrich_v1';
const LEAD_TYPE_OPTIONS=['Cliente actual','Identificado','Cliente perdido','Contactado','Prospectado','No Existe'];
const MINERAL_OPTIONS=['No aplica','Carbonato de Calcio','Feldespato','Sílica Molida','Sílica Bajo Fierro','Silica Granular'];
const LEAD_SCORE_OPTIONS=['Construcción','P1-Priority','P2','P3'];
const REGION_OPTIONS=['Norte','Noreste','Noroeste','Bajio','Centro','Occidente','Sur','Golfo'];
const LEAD_IMPORT_HEADER_MAP={
  supplier:['supplier','proveedor'],
  mineral:['mineral'],
  product:['product','producto'],
  endMarket:['end market description','end market','mercado'],
  subMarket:['sub-market','sub market','submercado'],
  plantName:['plant name','planta'],
  customerGroup:['customer group','grupo cliente'],
  marketGroup:['market group','grupo mercado'],
  customerDeliveryName:['customer delivery name','customer','cliente'],
  fy2025:['2025 fy st','fy st','fy2025']
};
let leadEnrichCache=loadLeadEnrichCache();
const COMPACT_MODE_KEY='covia_compact_mode_v1';
let compactMode=false;
const FOLLOWUP_KEY='covia_followups_v1';
let followupsRenderToken=0;
let followupSearchQ='';
let followupOwnerFilter='all';
let followupStatusFilter='all';
let vibeCarouselIdx=0;
let vibeCarouselTimer=null;
const TAB_VIBE_META={
  inicio:{k:'Inicio',t:'Radar Comercial Covia',s:'KPIs, segmentos y señales de crecimiento en una vista ejecutiva viva.',q:'industrial analytics dashboard mexico manufacturing'},
  mapa:{k:'Mapa',t:'Territorio Vivo',s:'Leads, clientes y distancia operativa en tiempo real con contexto visual.',q:'mexico industrial map logistics territory'},
  ventas:{k:'Ventas',t:'Revenue Intelligence',s:'Hallazgos accionables, takeover competitivo y oportunidad por tonelaje.',q:'industrial sales team strategy meeting'},
  bandeja:{k:'Bandeja',t:'Playbook de Cierre',s:'Siguiente mejor acción por cuenta con foco en ejecución comercial.',q:'sales pipeline operations command center'},
  seguimiento:{k:'Seguimiento',t:'Orquestación Colaborativa',s:'Bitácora compartida para juntas, responsables y compromisos de cierre.',q:'team collaboration kanban sales'},
  intel:{k:'Intel',t:'Inteligencia Prescriptiva',s:'Escenarios, predicción y recomendaciones por planta y segmento.',q:'business intelligence predictive analytics'},
  datos:{k:'Datos',t:'Gobierno y Seguridad',s:'Trazabilidad de fuentes, política de seguridad y operación auditada.',q:'cyber security data governance dashboard'}
};
const LEAD_INTEL_PAGE_SIZE=220;
function loadLeadEnrichCache(){
  try{
    const raw=localStorage.getItem(LEAD_ENRICH_KEY);
    const json=raw?JSON.parse(raw):{};
    return (json&&typeof json==='object')?json:{};
  }catch(e){return {}}
}
function saveLeadEnrichCache(){
  try{localStorage.setItem(LEAD_ENRICH_KEY,JSON.stringify(leadEnrichCache||{}))}catch(e){}
}
function normStr(v){
  return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function leadIntelId(d){
  return `li_${normStr(d?.n).replace(/\s+/g,'_')}__${normStr(d?.d).replace(/\s+/g,'_')}`.slice(0,150);
}
function currentSessionUser(){
  const byDom=document.getElementById('authUser')?.textContent?.trim();
  const bySession=sessionStorage.getItem('covia_user')||'';
  const bySec=(typeof secState!=='undefined'&&secState?.user)?String(secState.user):'';
  const base=(byDom&&byDom.toLowerCase()!=='invitado')?byDom:(bySession||bySec||'Operador');
  const sid=sessionStorage.getItem('covia_sid')||'';
  const shortSid=sid?sid.replace(/[^a-z0-9]/gi,'').slice(0,6):'';
  return shortSid?`${base}#${shortSid}`:base;
}
function inferRegionFromLead(d){
  const txt=normStr(`${d?.d||''} ${d?.plant||''} ${d?.estado||''}`);
  const has=(arr)=>arr.some(x=>txt.includes(x));
  if(has(['nuevo leon','coahuila','tamaulipas','chihuahua','durango']))return 'Norte';
  if(has(['saltillo','monterrey','apodaca','juarez nl']))return 'Noreste';
  if(has(['baja california','sonora','sinaloa','noroeste','tijuana','mexicali']))return 'Noroeste';
  if(has(['guanajuato','queretaro','san luis','aguascalientes','celaya','bajio']))return 'Bajio';
  if(has(['cdmx','ciudad de mexico','estado de mexico','hidalgo','morelos','puebla','tlaxcala']))return 'Centro';
  if(has(['jalisco','michoacan','colima','nayarit']))return 'Occidente';
  if(has(['veracruz','tabasco','campeche','yucatan','quintana roo','golfo']))return 'Golfo';
  if(has(['oaxaca','chiapas','guerrero','sur']))return 'Sur';
  return 'Centro';
}
function inferMineralsFromLead(d){
  const txt=normStr(`${d?.p||''} ${d?.product||''} ${d?.mineral||''} ${d?.n||''} ${d?.d||''}`);
  const out=[];
  if(txt.includes('carbonato'))out.push('Carbonato de Calcio');
  if(txt.includes('feldespato')||txt.includes('feldspar'))out.push('Feldespato');
  if((txt.includes('silica')||txt.includes('silice'))&&(txt.includes('molida')||txt.includes('milled')||txt.includes('stx')))out.push('Sílica Molida');
  if((txt.includes('silica')||txt.includes('silice'))&&(txt.includes('bajo fierro')||txt.includes('low iron')||txt.includes('sc-')))out.push('Sílica Bajo Fierro');
  if((txt.includes('silica')||txt.includes('silice'))&&(txt.includes('granular')||txt.includes('granel')||txt.includes('granusil')||txt.includes('incast')))out.push('Silica Granular');
  if(!out.length)return ['No aplica'];
  return [...new Set(out)];
}
function inferMineralsFromLeadDeep(d,meta){
  const m=meta||{};
  const txt=normStr(`${d?.p||''} ${d?.product||''} ${d?.mineral||''} ${d?.n||''} ${d?.d||''} ${m.endMarket||''} ${m.subMarket||''} ${m.product||''} ${m.marketGroup||''} ${m.customerGroup||''}`);
  const out=[];
  const add=v=>{if(v&&!out.includes(v))out.push(v);};
  if(/carbonato|caco3|calcita|pcc|filler|relleno|caliza/.test(txt))add('Carbonato de Calcio');
  if(/feldespato|feldspar|ceram|porcelan|azulejo|esmalte|sanitario|frita/.test(txt))add('Feldespato');
  if(/silic|silice|arena|glass|vidrio|envase|filtr|frack|proppant|fundici|deportiv|ecuestr|infield|bunker/.test(txt))add('Silica Granular');
  if(/moli|milled|ground|adhesiv|mortero|boquilla|junta|pastas|slurry/.test(txt))add('Sílica Molida');
  if(/bajo fierro|low iron|ultra clear|solar|optico|extra blanco/.test(txt))add('Sílica Bajo Fierro');
  if(!out.length){
    const seg=String(d?.s||'');
    if(['vidrio','filtracion','fracking','deportiva','cuestre','fundicion','fibra'].includes(seg))add('Silica Granular');
    if(seg==='ceramica')add('Feldespato');
    if(['construccion','reciclaje','agricola'].includes(seg))add('Carbonato de Calcio');
  }
  return out.length?out:['No aplica'];
}
function inferLeadScoring(d,pot,priority){
  const seg=normStr(LB[d?.s]||d?.s||'');
  if(seg.includes('construccion'))return 'Construcción';
  if(priority>=90||pot>=15000)return 'P1-Priority';
  if(priority>=75||pot>=5000)return 'P2';
  return 'P3';
}
function inferLeadType(d){
  if(d?.tp==='a')return 'Cliente actual';
  const pv=normStr(getProv(d));
  if(pv.includes('sin proveedor'))return 'Prospectado';
  if(!pv||pv==='n a')return 'Identificado';
  return 'Contactado';
}
function defaultLeadMeta(d,pot,priority){
  return {
    tipo:inferLeadType(d),
    minerals:inferMineralsFromLead(d),
    observations:'',
    leadScoring:inferLeadScoring(d,pot,priority),
    region:inferRegionFromLead(d),
    vendedor:'',
    supplierOverride:'',
    endMarket:'',
    subMarket:'',
    marketGroup:'',
    customerGroup:'',
    product:'',
    plantName:'',
    fy2025:'',
    lastModifiedBy:'',
    lastModifiedAt:0
  };
}
function getLeadMeta(d,pot,priority){
  const key=leadIntelId(d);
  const saved=leadEnrichCache[key]||{};
  const base=defaultLeadMeta(d,pot,priority);
  const merged={...base,...saved};
  const hasManualMineral=Array.isArray(saved?.minerals)&&saved.minerals.length&&!saved.minerals.every(x=>normStr(x)==='no aplica');
  if(hasManualMineral)merged.minerals=[...new Set(saved.minerals)];
  else merged.minerals=inferMineralsFromLeadDeep(d,merged);
  return merged;
}
function setLeadMetaById(leadId,patch){
  const now=Date.now();
  const prev=leadEnrichCache[leadId]||{};
  const sid=sessionStorage.getItem('covia_sid')||'';
  const fp=(typeof secFingerprint==='function')?String(secFingerprint()||''):'';
  leadEnrichCache[leadId]={
    ...prev,
    ...patch,
    lastModifiedBy:currentSessionUser(),
    lastModifiedAt:now,
    lastModifiedSid:sid?sid.slice(0,12):'',
    lastModifiedFp:fp?fp.slice(0,12):''
  };
  saveLeadEnrichCache();
}
function leadLastModifiedLabel(meta){
  if(!meta?.lastModifiedAt)return 'Auto';
  const ts=new Date(meta.lastModifiedAt).toLocaleString('es-MX');
  const sid=meta?.lastModifiedSid?` · SID:${String(meta.lastModifiedSid).slice(0,6)}`:'';
  return `${meta.lastModifiedBy||'Operador'}${sid} · ${ts}`;
}
function leadHeaderValue(row,canon){
  const headers=LEAD_IMPORT_HEADER_MAP[canon]||[];
  const keys=Object.keys(row||{});
  for(const h of headers){
    const k=keys.find(x=>normStr(x)===normStr(h));
    if(k&&row[k]!=null&&String(row[k]).trim()!=='')return String(row[k]).trim();
  }
  return '';
}
async function ensureXlsxLib(){
  if(window.XLSX)return window.XLSX;
  await new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
  return window.XLSX;
}
function matchLeadByCustomerName(name,leads){
  const n=normStr(name);
  if(!n||n.length<4)return null;
  let best=null,bestScore=0;
  leads.forEach(d=>{
    const ln=normStr(d.n);
    if(!ln)return;
    let score=0;
    if(ln===n)score=100;
    else if(ln.includes(n)||n.includes(ln))score=80;
    else{
      const nWords=n.split(' ');
      const hits=nWords.filter(w=>w.length>3&&ln.includes(w)).length;
      score=hits*12;
    }
    if(score>bestScore){bestScore=score;best=d;}
  });
  return bestScore>=24?best:null;
}
async function importLeadIntelXlsx(fileList){
  if(!fileList||!fileList.length)return;
  const XLSX=await ensureXlsxLib();
  const leads=[...D.filter(x=>x.tp==='l'||x.tp==='a')];
  let merged=0;
  for(const file of fileList){
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    wb.SheetNames.forEach(sn=>{
      const ws=wb.Sheets[sn];
      const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      rows.forEach(r=>{
        const customer=leadHeaderValue(r,'customerDeliveryName');
        const mLead=matchLeadByCustomerName(customer,leads);
        if(!mLead)return;
        const id=leadIntelId(mLead);
        const mineralRaw=leadHeaderValue(r,'mineral');
        const mineralNorm=normStr(mineralRaw);
        const minerals=[
          mineralNorm.includes('carbonato')?'Carbonato de Calcio':'',
          mineralNorm.includes('feld')?'Feldespato':'',
          mineralNorm.includes('bajo fierro')||mineralNorm.includes('low iron')?'Sílica Bajo Fierro':'',
          mineralNorm.includes('molid')||mineralNorm.includes('milled')?'Sílica Molida':'',
          mineralNorm.includes('silic')||mineralNorm.includes('silice')?'Silica Granular':''
        ].filter(Boolean);
        setLeadMetaById(id,{
          supplierOverride:leadHeaderValue(r,'supplier')||leadEnrichCache[id]?.supplierOverride||'',
          endMarket:leadHeaderValue(r,'endMarket')||leadEnrichCache[id]?.endMarket||'',
          subMarket:leadHeaderValue(r,'subMarket')||leadEnrichCache[id]?.subMarket||'',
          product:leadHeaderValue(r,'product')||leadEnrichCache[id]?.product||'',
          plantName:leadHeaderValue(r,'plantName')||leadEnrichCache[id]?.plantName||'',
          customerGroup:leadHeaderValue(r,'customerGroup')||leadEnrichCache[id]?.customerGroup||'',
          marketGroup:leadHeaderValue(r,'marketGroup')||leadEnrichCache[id]?.marketGroup||'',
          fy2025:leadHeaderValue(r,'fy2025')||leadEnrichCache[id]?.fy2025||'',
          minerals:minerals.length?[...new Set(minerals)]:leadEnrichCache[id]?.minerals||inferMineralsFromLead(mLead)
        });
        merged++;
      });
    });
  }
  refreshLeadMineralsHeuristics();
  alert(`XLS integrado: ${fmtNum(merged)} cuentas actualizadas.`);
  renderLeadIntelTable(false);
}
function refreshLeadMineralsHeuristics(){
  let touched=0;
  [...D.filter(x=>x.tp==='l'||x.tp==='a')].forEach(d=>{
    const id=leadIntelId(d);
    const prev=leadEnrichCache[id]||{};
    const keepManual=Array.isArray(prev.minerals)&&prev.minerals.length&&!prev.minerals.every(x=>normStr(x)==='no aplica');
    if(keepManual)return;
    const inferred=inferMineralsFromLeadDeep(d,prev);
    const same=JSON.stringify(prev.minerals||[])===JSON.stringify(inferred);
    if(!same){
      leadEnrichCache[id]={...prev,minerals:inferred};
      touched++;
    }
  });
  if(touched>0)saveLeadEnrichCache();
}
const LEAD_BIG_FISH_MX=[
  {empresa:'Vitro (Planta Vidrio Plano)',ubicacion:'García, NL',interes:'Arena Silícea, Feldespato',puesto:'Gerente de Suministros Raw Materials'},
  {empresa:'Cemex (Planta Monterrey)',ubicacion:'Monterrey, NL',interes:'Aditivos, Agregados',puesto:'Director de Logística y Abasto'},
  {empresa:'Grupo Simec',ubicacion:'Apodaca, NL',interes:'Chatarra, Fundentes',puesto:'Jefe de Compras Chatarra/Energía'},
  {empresa:'Saint-Gobain',ubicacion:'Cuautla / Saltillo',interes:'Vidrio Automotriz',puesto:'Global Purchasing Manager'},
  {empresa:'ArcelorMittal',ubicacion:'Lázaro Cárdenas',interes:'Mineral de Hierro, Carbón',puesto:'Gerente de Compras Estratégicas'}
];
const LEAD_TRIANGULATED=[
  {seg:'Vidrio',empresa:'Vitro S.A.B. de C.V.',ubic:'García, NL',contacto:'Gerente de Suministros Raw Materials',email:'Verificación pendiente',tel:'Verificación pendiente',pot:15000,status:'hot'},
  {seg:'Vidrio',empresa:'Owens-Illinois',ubic:'Monterrey, NL',contacto:'Supply Chain Manager',email:'Verificación pendiente',tel:'Verificación pendiente',pot:9800,status:'medium'},
  {seg:'Cerámica',empresa:'Daltile de México',ubic:'Monterrey, NL',contacto:'Supply Chain VP',email:'Verificación pendiente',tel:'Verificación pendiente',pot:25000,status:'hot'},
  {seg:'Fundición',empresa:'Grupo Simec',ubic:'Apodaca, NL',contacto:'Director de Operaciones',email:'Verificación pendiente',tel:'Verificación pendiente',pot:31000,status:'hot'},
  {seg:'Fibra',empresa:'Owen Corning',ubic:'Tlaxcala',contacto:'Plant Manager',email:'Verificación pendiente',tel:'Verificación pendiente',pot:5500,status:'medium'},
  {seg:'Filtración',empresa:'Donaldson Filtration',ubic:'Querétaro',contacto:'Supply Chain Manager',email:'Verificación pendiente',tel:'Verificación pendiente',pot:11000,status:'hot'},
  {seg:'Fracking',empresa:'Pemex (Poza Rica)',ubic:'Poza Rica, Veracruz',contacto:'Director de Exploración',email:'Verificación pendiente',tel:'Verificación pendiente',pot:55000,status:'hot'},
  {seg:'Agricultura',empresa:'Gruma S.A.B. de C.V.',ubic:'Monterrey, NL',contacto:'Director de Operaciones',email:'Verificación pendiente',tel:'Verificación pendiente',pot:45000,status:'hot'},
  {seg:'Constr/Recicl',empresa:'Cemex (Planta Monterrey)',ubic:'Monterrey, NL',contacto:'Global Sourcing',email:'Verificación pendiente',tel:'Verificación pendiente',pot:88000,status:'hot'},
  {seg:'Construcción',empresa:'Empresas ICA',ubic:'CDMX',contacto:'Procurement Director',email:'Verificación pendiente',tel:'Verificación pendiente',pot:0,status:'medium',nota:'Reasignar a Constr/Recicl'},
  {seg:'Deportiva',empresa:'Nike de México',ubic:'CDMX',contacto:'Retail Operations Director',email:'N/A',tel:'N/A',pot:null,status:'medium',nota:'Cuenta marca'},
  {seg:'Encuestre',empresa:'Hipódromo de las Américas',ubic:'CDMX',contacto:'Facility Manager',email:'N/A',tel:'N/A',pot:null,status:'medium',nota:'Cuenta marca'}
];
const ENABLE_SYNTHETIC_LEADS=false; // hard-off: no "Prospecto territorial" en operación comercial
const MAP_REAL_LEADS=[
  {n:'Vitro S.A.B. de C.V.',lat:25.80,lng:-100.55,s:'vidrio',tp:'l',v:0,p:'Arena silícea y feldespato para vidrio plano',d:'García, NL',pot:'15,000-25,000',prov:'Competidor regional',decisor:'Gerente de Suministros Raw Materials'},
  {n:'Owens-Illinois Monterrey',lat:25.69,lng:-100.31,s:'vidrio',tp:'l',v:0,p:'Sílica para envase de vidrio',d:'Monterrey, NL',pot:'9,800-14,000',prov:'Competidor regional',decisor:'Supply Chain Manager'},
  {n:'Daltile de México',lat:25.69,lng:-100.32,s:'ceramica',tp:'l',v:0,p:'Feldespato y sílica para porcelánico',d:'Monterrey, NL',pot:'25,000-35,000',prov:'Importación',decisor:'Supply Chain VP'},
  {n:'Grupo Simec Apodaca',lat:25.78,lng:-100.20,s:'fundicion',tp:'l',v:0,p:'Fundentes y materiales para fusión',d:'Apodaca, NL',pot:'31,000-42,000',prov:'Competidor regional',decisor:'Director de Operaciones'},
  {n:'Owen Corning Tlaxcala',lat:19.32,lng:-98.24,s:'fibra',tp:'l',v:0,p:'Sílica para fibra y aislantes',d:'Tlaxcala',pot:'5,500-9,000',prov:'Importación',decisor:'Plant Manager'},
  {n:'Donaldson Filtration Querétaro',lat:20.59,lng:-100.39,s:'filtracion',tp:'l',v:0,p:'Lechos de filtración industrial',d:'Querétaro',pot:'11,000-18,000',prov:'Sin proveedor',decisor:'Supply Chain Manager'},
  {n:'PEMEX Poza Rica',lat:20.53,lng:-97.46,s:'fracking',tp:'l',v:0,p:'Proppant 20/40 y soporte de pozo',d:'Poza Rica, Veracruz',pot:'55,000-80,000',prov:'Importación',decisor:'Director de Exploración'},
  {n:'Gruma Monterrey',lat:25.67,lng:-100.32,s:'agricola',tp:'l',v:0,p:'Sustratos minerales y drenaje',d:'Monterrey, NL',pot:'45,000-65,000',prov:'Competidor regional',decisor:'Director de Operaciones'},
  {n:'CEMEX Monterrey',lat:25.67,lng:-100.33,s:'reciclaje',tp:'l',v:0,p:'Arena para morteros y reciclaje cementicio',d:'Monterrey, NL',pot:'88,000-120,000',prov:'Competidor regional',decisor:'Global Sourcing'},
  {n:'Empresas ICA',lat:19.43,lng:-99.13,s:'construccion',tp:'l',v:0,p:'Arena para obra civil y prefabricados',d:'CDMX',pot:'2,000-6,000',prov:'Regional',decisor:'Procurement Director'},
  {n:'Nike de México',lat:19.40,lng:-99.17,s:'deportiva',tp:'l',v:0,p:'Arenas deportivas para instalaciones',d:'CDMX',pot:'800-3,000',prov:'Sin proveedor',decisor:'Retail Operations Director'},
  {n:'Hipódromo de las Américas',lat:19.44,lng:-99.20,s:'cuestre',tp:'l',v:0,p:'Arena ecuestre para pistas y mantenimiento',d:'CDMX',pot:'400-2,500',prov:'Sin proveedor',decisor:'Facility Manager'}
];
const _kpiTimers={};
/**
 * Anima un KPI numérico de su valor actual al nuevo en 800 ms (ease-out cúbico, 60 fps).
 * displayFn(val:number):string   — formateador personalizado
 */
function animateKpiNum(id,target,displayFn){
  if(_kpiTimers[id]){cancelAnimationFrame(_kpiTimers[id]);delete _kpiTimers[id]}
  const el=document.getElementById(id);if(!el)return;
  const fmt=displayFn||(v=>fmtNum(v));
  const prev=parseFloat((el.dataset.kpiRaw||0))||0;
  el.dataset.kpiRaw=target;
  const dur=800,start=performance.now();
  function frame(now){
    const t=Math.min((now-start)/dur,1);
    const ease=1-Math.pow(1-t,3);
    el.textContent=fmt(prev+(target-prev)*ease);
    if(t<1){_kpiTimers[id]=requestAnimationFrame(frame)}else{el.textContent=fmt(target);delete _kpiTimers[id]}
  }
  _kpiTimers[id]=requestAnimationFrame(frame);
}
function dist(a,b){const R=6371,dL=(b.lat-a.lat)*Math.PI/180,dG=(b.lng-a.lng)*Math.PI/180,x=Math.sin(dL/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dG/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function geoDestination(lat,lng,bearingDeg,distKm){
  const R=6371,br=bearingDeg*Math.PI/180,lat1=lat*Math.PI/180,lng1=lng*Math.PI/180;
  const lat2=Math.asin(Math.sin(lat1)*Math.cos(distKm/R)+Math.cos(lat1)*Math.sin(distKm/R)*Math.cos(br));
  const lng2=lng1+Math.atan2(Math.sin(br)*Math.sin(distKm/R)*Math.cos(lat1),Math.cos(distKm/R)-Math.sin(lat1)*Math.sin(lat2));
  return{lat:lat2*180/Math.PI,lng:((lng2*180/Math.PI+540)%360)-180};
}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const SYNTH_LEAD_SEGS=['vidrio','ceramica','fundicion','construccion','fibra','deportiva','cuestre','filtracion','fracking','agricola','reciclaje'];
function potRangeForSeg(s){
  const m={fracking:'15,000-45,000',filtracion:'4,000-12,000',reciclaje:'3,000-9,000',ceramica:'2,500-8,000',vidrio:'3,000-10,000',deportiva:'800-3,000',construccion:'2,000-6,000',fundicion:'1,500-5,000',fibra:'600-2,500',cuestre:'400-2,500',agricola:'1,000-4,000'};
  return m[s]||'1,200-4,000';
}
function buildTerritorySyntheticLeads(){
  const out=[];
  const per=300;
  PLANT_ORDER.forEach((pk,pi)=>{
    const plant=PLANTAS[pk];if(!plant)return;
    const rng=mulberry32(201*(pi+1)+1337);
    let n=0,guard=0;
    while(n<per&&guard<500000){
      guard++;
      const dk=15+rng()*185;
      const bear=rng()*360;
      const pt=geoDestination(plant.lat,plant.lng,bear,dk);
      const cand={lat:pt.lat,lng:pt.lng};
      const ap=assignedPlantGlobal(cand);
      if(!ap||ap.key!==pk)continue;
      if(dist(ap,cand)>PLANT_CATCHMENT_KM)continue;
      const seg=SYNTH_LEAD_SEGS[Math.floor(rng()*SYNTH_LEAD_SEGS.length)];
      const shortP=LB[seg]||seg;
      n++;
      out.push({
        n:`Prospecto territorial · ${plant.short} · ${shortP} #${n}`,
        lat:pt.lat,lng:pt.lng,s:seg,tp:'l',v:0,
        p:`Arena sílica / ${shortP} · prospecto territorial (validar en CRM)`,
        d:`~${dk.toFixed(0)} km de ${plant.short} · MX`,
        t:'',pot:potRangeForSeg(seg),prov:rng()>0.55?'Sin proveedor':'Competidor regional',
        _synth:true,_plant:pk,
        refs:[{t:'Contexto sector (búsqueda)',u:'https://www.google.com/search?q=industria+'+encodeURIComponent(shortP)+'+Mexico'}]
      });
    }
  });
  return out;
}
const MX_GEO_BOUNDS={latMin:14.2,latMax:33.0,lngMin:-118.8,lngMax:-86.2};
const GEO_CITY_HINTS=[
  {k:'coatzacoalcos',lat:18.1342,lng:-94.4589},
  {k:'minatitlan',lat:17.9993,lng:-94.5586},
  {k:'jaltipan',lat:17.9882,lng:-94.6989},
  {k:'san juan evangelista',lat:17.9016,lng:-95.0525},
  {k:'villahermosa',lat:17.9892,lng:-92.9475},
  {k:'veracruz',lat:19.1738,lng:-96.1342},
  {k:'monterrey',lat:25.6866,lng:-100.3161},
  {k:'apodaca',lat:25.7819,lng:-100.1880},
  {k:'juarez nl',lat:25.6500,lng:-100.1000},
  {k:'benito juarez nl',lat:25.6589,lng:-100.0716},
  {k:'lampazos',lat:27.0167,lng:-100.5167},
  {k:'villa hidalgo',lat:28.0167,lng:-100.2000},
  {k:'saltillo',lat:25.4383,lng:-100.9737},
  {k:'san jose de iturbide',lat:21.0015,lng:-100.3835},
  {k:'tetla',lat:19.4416,lng:-98.1066},
  {k:'ahuazotepec',lat:20.0492,lng:-98.1638},
];
function geoNormText(t){
  return String(t||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ').trim();
}
function geoIsInMx(lat,lng){
  return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=MX_GEO_BOUNDS.latMin&&lat<=MX_GEO_BOUNDS.latMax&&lng>=MX_GEO_BOUNDS.lngMin&&lng<=MX_GEO_BOUNDS.lngMax;
}
function geoHintForLead(d){
  const txt=`${geoNormText(d?.d)} ${geoNormText(d?.n)}`;
  for(const h of GEO_CITY_HINTS){
    if(txt.includes(h.k))return {lat:h.lat,lng:h.lng,key:h.k};
  }
  return null;
}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}
function geoScoreMeta({rawOk,hint,deltaKm=999,adj='raw'}){
  let s=62;
  if(rawOk)s+=18;else s-=35;
  if(hint){
    if(deltaKm<=3)s+=18;
    else if(deltaKm<=8)s+=12;
    else if(deltaKm<=18)s+=6;
    else s-=18;
  }else{
    s+=4;
  }
  if(String(adj).startsWith('city_snap'))s-=8;
  if(String(adj).startsWith('city_fill'))s-=12;
  if(adj==='plant_fallback')s-=20;
  if(adj==='raw')s+=6;
  const score=clamp(Math.round(s),5,100);
  const grade=score>=90?'A':score>=80?'B':score>=65?'C':'D';
  return {score,grade};
}
function geoScoreLead(d){
  if(d&&Number.isFinite(d._geoScore))return Number(d._geoScore);
  return 50;
}
function geoScoreHintText(d){
  const sc=geoScoreLead(d);
  const g=d?String(d._geoGrade||'C'):'C';
  const adj=d?String(d._geoAdj||'raw'):'raw';
  const why=adj==='raw'?'coord valida directa':adj.replace(/_/g,' ');
  return `GeoScore ${sc}/100 (${g}) · ${why}`;
}
const LEAD_NON_COMPANY_STARTERS=[
  'que ','qué ','como ','cómo ','cual ','cuál ','donde ','dónde ','por que ','por qué ',
  'buscas ','cuantas ','cuántas ','cuanto ','cuánto ','impactaran ','impactarán '
];
const LEAD_NON_COMPANY_TERMS=[
  '¿','?',' vacantes ',' salario ',' sueldos ',' que es ',' qué es ',' usos ',' propiedades ',
  'caracteristicas ',' características ',' definicion ',' definición ',' historia de ',' internet en ',
  'papel de ',' gobierno ofrece ','#informaciónconfidencial','informaciónconfidencial',
  'proveedores de ',' en latinoamérica',' en latinoamerica','relación méxico','relacion mexico',
  'actividad industrial','economía y finanzas','economia y finanzas','inegi','repunta','caida ','caída '
];
const LEAD_COMPANY_HINTS=[
  ' sa de cv',' s.a. de c.v',' s de rl',' s. de r.l',' s.a.p.i',' sab de cv',' holdings',' group',' grupo ',
  ' industria',' industrial',' vidrio',' ceram',' fundicion',' fundición',' mineria',' minería',' cement',
  ' acero',' steel',' foundry',' logistics',' materiales',' manufacturing',' solutions'
];
const LEAD_NEWS_VERBS=[
  ' completa ',' completan ',' logra ',' logran ',' será ',' sera ',' mira ',' ofrece ',' impactará ',' impactara ',
  ' prueban ',' pruebas ',' reporta ',' reportan ',' anuncia ',' anuncian ',' presenta ',' presentan '
];
function isCoherentLeadName(name){
  const raw=String(name||'').trim();
  if(!raw)return false;
  const low=` ${raw.toLowerCase()} `;
  if(LEAD_NON_COMPANY_TERMS.some(t=>low.includes(t)))return false;
  if(LEAD_NON_COMPANY_STARTERS.some(t=>low.startsWith(` ${t}`.trim())||low.startsWith(t)))return false;
  if(/^[#"'“”‘’▶►»]/.test(raw))return false;
  if(/^\d{2,}/.test(raw))return false;
  if(/^[¿?]/.test(raw)||/[¿?]/.test(raw))return false;
  if(/^\d+$/.test(raw))return false;
  const wc=raw.split(/\s+/).filter(Boolean).length;
  if(wc>=5&&LEAD_NEWS_VERBS.some(t=>low.includes(t))&&!LEAD_COMPANY_HINTS.some(t=>low.includes(t)))return false;
  // Long narrative titles are usually headlines, not account names.
  if(wc>7&&!LEAD_COMPANY_HINTS.some(t=>low.includes(t)))return false;
  const weirdPunctuation=(raw.match(/[,:;!]/g)||[]).length;
  if(weirdPunctuation>=2&&!LEAD_COMPANY_HINTS.some(t=>low.includes(t)))return false;
  return true;
}
function isCoherentLeadRecord(d){
  if(!d||String(d.tp||'')!=='l')return true;
  return isCoherentLeadName(d.n);
}
function normalizeLeadGeo(d){
  const lat=Number(d?.lat),lng=Number(d?.lng);
  const hint=geoHintForLead(d);
  const rawOk=geoIsInMx(lat,lng);
  let adj='raw',outLat=lat,outLng=lng,deltaKm=999;
  if(hint&&rawOk){
    const dd=dist({lat,lng},{lat:hint.lat,lng:hint.lng});
    deltaKm=dd;
    // If lead claims specific city but point is far, snap to city centroid.
    if(dd>18){outLat=hint.lat;outLng=hint.lng;adj=`city_snap:${hint.key}`;}
    const gm=geoScoreMeta({rawOk,hint,deltaKm,adj});
    return {...d,lat:outLat,lng:outLng,_geoAdj:adj,_geoScore:gm.score,_geoGrade:gm.grade};
  }
  if(hint&&!rawOk){
    outLat=hint.lat;outLng=hint.lng;adj=`city_fill:${hint.key}`;
    const gm=geoScoreMeta({rawOk,hint,deltaKm:0,adj});
    return {...d,lat:outLat,lng:outLng,_geoAdj:adj,_geoScore:gm.score,_geoGrade:gm.grade};
  }
  if(rawOk){
    const gm=geoScoreMeta({rawOk,hint:null,deltaKm:0,adj});
    return {...d,lat,lng,_geoAdj:adj,_geoScore:gm.score,_geoGrade:gm.grade};
  }
  const fallback=assignedPlantGlobal(d)||PLANTAS.apodaca||PLANTAS.lampazos;
  outLat=fallback.lat;outLng=fallback.lng;adj='plant_fallback';
  const gm=geoScoreMeta({rawOk,hint:null,deltaKm:0,adj});
  return {...d,lat:outLat,lng:outLng,_geoAdj:adj,_geoScore:gm.score,_geoGrade:gm.grade};
}
function initCoviaMasterDataset(){
  const ex=(typeof COVIA_CLIENTS_FROM_EXCEL!=='undefined'&&COVIA_CLIENTS_FROM_EXCEL)?COVIA_CLIENTS_FROM_EXCEL:[];
  const realLeads=(typeof window!=='undefined'&&Array.isArray(window.COVIA_REAL_LEADS))?window.COVIA_REAL_LEADS:[];
  const synth=(ENABLE_SYNTHETIC_LEADS&&window.COVIA_ENABLE_SYNTHETIC===true)?buildTerritorySyntheticLeads():[];
  const base=[...ex,...D_INLINE_LEADS,...MAP_REAL_LEADS,...realLeads,...synth];
  const seen=new Set();
  return base.filter(d=>{
    if(!d||!d.n)return false;
    if(/prospecto territorial/i.test(String(d.n||'')))return false;
    const key=`${String(d.n||'').toLowerCase().trim()}|${String(d.d||'').toLowerCase().trim()}|${d.s||''}|${d.tp||''}`;
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  }).map(normalizeLeadGeo);
}
function emergencyDatasetFallback(){
  const ex=(typeof COVIA_CLIENTS_FROM_EXCEL!=='undefined'&&COVIA_CLIENTS_FROM_EXCEL)?COVIA_CLIENTS_FROM_EXCEL:[];
  const realLeads=(typeof window!=='undefined'&&Array.isArray(window.COVIA_REAL_LEADS))?window.COVIA_REAL_LEADS:[];
  const raw=[...ex,...D_INLINE_LEADS,...MAP_REAL_LEADS,...realLeads].filter(d=>d&&d.n);
  const seen=new Set();
  const out=[];
  raw.forEach(d=>{
    const key=canonicalLeadKey(d);
    if(seen.has(key))return;
    seen.add(key);
    out.push(normalizeLeadGeo(d));
  });
  return out;
}
let D=[];
try{D=initCoviaMasterDataset();}catch(e){console.error('initCoviaMasterDataset error',e);}
if(!Array.isArray(D)||D.length===0){
  try{D=emergencyDatasetFallback();}catch(e2){console.error('emergencyDatasetFallback error',e2);}
  strictVerifiedOnly=false;
  geoMinScore=0;
}
function aCnt(id,tgt,pre,suf){if(_kpiTimers[id])clearInterval(_kpiTimers[id]);let c=0;const s=Math.max(tgt/35,1);const el=document.getElementById(id);if(!el)return;_kpiTimers[id]=setInterval(()=>{c+=s;if(c>=tgt){c=tgt;clearInterval(_kpiTimers[id]);delete _kpiTimers[id]}el.textContent=(pre||'')+Math.round(c)+(suf||'')},25)}

function clearPlantOverlays(){plantOverlays.forEach(x=>{try{map.removeLayer(x)}catch(e){}});plantOverlays=[]}
function drawPlantOverlays(){
  clearPlantOverlays();
  const pts=getSelectedPlants();if(!pts.length)return;
  const cols=['#3b82f6','#10b981','#ef4444'];
  pts.forEach((pl,idx)=>{
    if(mapShowRings){
      [200000,100000,50000].forEach((r,i)=>{
        const c=cols[i];
        const cir=L.circle([pl.lat,pl.lng],{
          radius:r,
          fillColor:c,
          fillOpacity:[.025,.05,.08][i],
          color:c,
          className:`covia-ring covia-ring-r${i+1}`,
          weight:[1.1,1.25,1.4][i],
          opacity:[.42,.58,.72][i],
          dashArray:i===0?'6,7':(i===1?'':'2,7')
        }).addTo(map);
        plantOverlays.push(cir);
      });
    }
    const pi=L.divIcon({html:`<div class="covia-plant-marker"><span>${idx+1}</span></div>`,iconSize:[34,34],iconAnchor:[17,17],className:'covia-plant-wrap'});
    const log=PLANT_LOGISTICS_SNAPSHOT[pl.key];
    let logHtml='';
    if(log&&log.cuentaAncla&&typeof log.shipments==='number'){
      logHtml=`<br><br><span style="font-size:11px;color:#6ee7b7"><b>Logística (dato reciente):</b> ${log.compliancePct}% cumplimiento · ${log.shipments} embarques / ${log.orderNew} pedidos · Δ${log.delta} · ${log.productoAgregado}</span><br><span style="font-size:10px;color:#94a3b8">Ref. zona: ${log.cuentaAncla.n.substring(0,36)}…</span>`;
    }else if(log&&log.fuente){
      logHtml=`<br><br><span style="font-size:10px;color:#94a3b8">${log.fuente}</span>`;
    }
    const pop=`<div style="font-family:Inter;min-width:220px"><b>🏭 ${pl.label}</b><br><span style="font-size:11px;color:#94a3b8">${pl.addr}</span><br>${pl.city}, ${pl.state} C.P. ${pl.zip}<br>Cluster: <b>${pl.cluster}</b> · PLANT_ID ${pl.pid}${pl.approx?' (coord. aprox.)':''}${logHtml}</div>`;
    const pm=L.marker([pl.lat,pl.lng],{icon:pi}).addTo(map).bindPopup(pop);
    pm.bindTooltip(`<div class="map-tip-card"><div class="map-tip-head"><span class="map-tip-dot" style="background:#ef4444"></span><strong>${escapeHtml(pl.label)}</strong></div><div class="map-tip-row">${escapeHtml(pl.city)}, ${escapeHtml(pl.state)} · Cluster ${escapeHtml(pl.cluster)}</div><div class="map-tip-row">Pasa mouse para preview · click para detalle logístico</div></div>`,{direction:'top',offset:[0,-12],sticky:true,opacity:1,className:'map-tooltip-pro'});
    pm.on('mouseover',()=>pm.openTooltip());
    pm.on('mouseout',()=>pm.closeTooltip());
    plantOverlays.push(pm);
  });
  if(map){
    const b=L.latLngBounds(pts.map(p=>[p.lat,p.lng]));
    map.fitBounds(b,{padding:[26,26],maxZoom:6});
  }
}

function initMap(){
  const c=mapCenter();
  map=L.map('map',{
    zoomControl:false,
    preferCanvas:true,
    minZoom:4,
    maxZoom:12,
    zoomSnap:1,
    zoomAnimation:true,
    fadeAnimation:true,
    markerZoomAnimation:true,
    inertia:true,
    inertiaDeceleration:2500,
    maxBounds:MEX_BOUNDS,
    maxBoundsViscosity:1
  }).setView([c.lat,c.lng],6);
  mapCanvasRenderer=L.canvas({padding:.5});
  L.control.zoom({position:'bottomright'}).addTo(map);
  mapBaseDark=L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'© OSM © CARTO',subdomains:'abcd',maxZoom:19,noWrap:true,bounds:MEX_BOUNDS});
  mapBaseLight=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'© OSM © CARTO',subdomains:'abcd',maxZoom:19,noWrap:true,bounds:MEX_BOUNDS});
  mapBaseStyle='light';
  mapBaseLight.addTo(map);
  document.body.classList.toggle('map-fast',mapUltraFast);
  renderMapUxBar();
  drawPlantOverlays();
  D.forEach((d,i)=>{
    const km=distMin(d).toFixed(0);
    const np=nearestPlant(d);
    const col=CO[d.s]||'#64748b';
    const infoTon=d.tp==='a'?`${fmtNum(d.v)} ton/año`:`${d.pot||'N/A'} ton/año`;
    const pop=`<div style="font-family:Inter;min-width:220px"><b style="color:${col}">${d.tp==='a'?'✅':'💡'} ${d.n}</b><br><span style="background:${col};color:#fff;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700">${LB[d.s]}</span><br>📊 <b>${infoTon}</b><br>📦 ${d.p||'—'}<br>📍 ${d.d||'—'}<br>🏭 <b>${np.short}</b> · ${km} km</div>`;
    let mk;
    if(mapUltraFast){
      // Ultra-fast path: canvas circle markers + no hover tooltips.
      const radius=d.tp==='a'?8:5;
      mk=L.circleMarker([d.lat,d.lng],{
        renderer:mapCanvasRenderer,
        radius,
        color:'#ffffff',
        weight:1,
        opacity:.9,
        fillColor:col,
        fillOpacity:d.tp==='a'?.96:.84
      }).addTo(map).bindPopup(pop);
    }else{
      let sz=d.tp==='a'?Math.max(14,Math.min(36,Math.sqrt(d.v)/3)):14;
      const label=d.tp==='a'?(d.v>=1000?(d.v/1000).toFixed(0):'•'):'';
      const cls=d.tp==='a'?'covia-marker covia-marker-actual':'covia-marker covia-marker-lead';
      const h=`<div class="${cls}" style="--mk:${col};--sz:${sz}px">${label?`<span class="covia-marker-value">${label}</span>`:''}</div>`;
      const ic=L.divIcon({html:h,iconSize:[sz+10,sz+10],iconAnchor:[(sz+10)/2,(sz+10)/2],className:'covia-marker-wrap'});
      const gmaps=mapsUrlForLead(d);
      const sv=streetViewUrlForLead(d);
      const tip=`<div class="map-tip-card"><div class="map-tip-head"><span class="map-tip-dot" style="background:${col}"></span><strong>${escapeHtml(d.n)}</strong></div><div class="map-tip-row">${escapeHtml(LB[d.s]||d.s)} · ${escapeHtml(d.d||'—')}</div><div class="map-tip-row"><b>${escapeHtml(infoTon)}</b> · ${km} km de ${escapeHtml(np.short)}</div><div class="map-tip-row"><b>${escapeHtml(geoScoreHintText(d))}</b></div><div class="map-tip-links"><a href="${escapeAttr(gmaps)}" target="_blank" rel="noopener noreferrer">Maps</a><a href="${escapeAttr(sv)}" target="_blank" rel="noopener noreferrer">Street View</a></div></div>`;
      mk=L.marker([d.lat,d.lng],{icon:ic}).addTo(map).bindPopup(pop);
      mk.bindTooltip(tip,{direction:'top',offset:[0,-10],sticky:true,opacity:1,className:'map-tooltip-pro'});
      mk.on('mouseover',()=>mk.openTooltip());
      mk.on('mouseout',()=>mk.closeTooltip());
    }
    mk.on('click',()=>{
      mapLeadFocus=d;
      if(!mapLeadView)mapLeadView='preview';
      renderMapLeadPreviewPanel();
    });
    mkrs.push({mk,s:d.s,tp:d.tp,i});
  });
  document.getElementById('mC').textContent=D.length;
  renderMapLeadPreviewPanel();
  setTimeout(()=>{
    if(!mapDidAutoFit){
      focusSelectedPlants();
      setTimeout(()=>{fitMapToVisibleMarkers();},120);
      mapDidAutoFit=true;
    }
  },120);
}
function setMapBasemap(style){
  mapBaseStyle=style==='light'?'light':'dark';
  if(!map)return;
  if(map.hasLayer(mapBaseDark))map.removeLayer(mapBaseDark);
  if(map.hasLayer(mapBaseLight))map.removeLayer(mapBaseLight);
  if(mapBaseStyle==='light')mapBaseLight.addTo(map);
  else mapBaseDark.addTo(map);
  renderMapUxBar();
}
function toggleMapRings(){
  mapShowRings=!mapShowRings;
  drawPlantOverlays();
  renderMapUxBar();
}
function fitMapToVisibleMarkers(){
  if(!map||!mkrs.length)return;
  const inCore=ll=>ll&&Number.isFinite(ll.lat)&&Number.isFinite(ll.lng)&&ll.lat>=MEX_CORE_BOUNDS[0][0]&&ll.lat<=MEX_CORE_BOUNDS[1][0]&&ll.lng>=MEX_CORE_BOUNDS[0][1]&&ll.lng<=MEX_CORE_BOUNDS[1][1];
  const visible=mkrs.filter(m=>map.hasLayer(m.mk)).map(m=>m.mk.getLatLng()).filter(inCore);
  if(!visible.length){focusSelectedPlants();return;}
  const b=L.latLngBounds(visible);
  map.fitBounds(b,{padding:[32,32],maxZoom:8});
}
function focusSelectedPlants(){
  const pts=getSelectedPlants();
  if(!pts.length||!map)return;
  const b=L.latLngBounds(pts.map(p=>[p.lat,p.lng]));
  map.fitBounds(b,{padding:[36,36],maxZoom:7});
}
function renderMapUxBar(){
  const el=document.getElementById('mapUxBar');
  if(!el)return;
  el.innerHTML=
    `<span class="mux-pill${mapUltraFast?' on':''}" title="Modo de rendimiento del mapa">${mapUltraFast?'UltraFast':'Visual'}</span>`+
    `<button class="mux-btn${mapBaseStyle==='dark'?' on':''}" title="Mapa oscuro" onclick="setMapBasemap('dark')">Dark</button>`+
    `<button class="mux-btn${mapBaseStyle==='light'?' on':''}" title="Mapa claro" onclick="setMapBasemap('light')">Light</button>`+
    `<button class="mux-btn${mapShowRings?' on':''}" title="Mostrar/ocultar anillos" onclick="toggleMapRings()">Rings</button>`+
    `<button class="mux-btn${geoStrictMapOnly?' on':''}" title="Oculta en mapa leads con GeoScore < ${GEO_STRICT_MIN_SCORE}" onclick="toggleGeoUltraStrictMap()">Geo-Strict</button>`+
    `<button class="mux-btn" title="Ajustar a marcadores visibles" onclick="fitMapToVisibleMarkers()">Fit</button>`+
    `<button class="mux-btn" title="Enfocar plantas seleccionadas" onclick="focusSelectedPlants()">Plantas</button>`+
    `<button class="mux-btn" title="Exportar leads con geolocalización a corregir" onclick="exportGeoIssues()">Geo CSV</button>`;
}
window.setMapBasemap=setMapBasemap;
window.toggleMapRings=toggleMapRings;
window.fitMapToVisibleMarkers=fitMapToVisibleMarkers;
window.focusSelectedPlants=focusSelectedPlants;
function toggleGeoUltraStrictMap(){
  geoStrictMapOnly=!geoStrictMapOnly;
  renderMapUxBar();
  syncAll();
}
window.toggleGeoUltraStrictMap=toggleGeoUltraStrictMap;

function leadDomainFromData(d){
  const txt=String(d?.t||'');
  const dm=txt.match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})(?:[\/\s]|$)/i);
  if(dm&&dm[1])return dm[1].toLowerCase();
  const refs=Array.isArray(d?.refs)?d.refs:[];
  for(const r of refs){
    const u=String(r?.u||'');
    const m=u.match(/https?:\/\/(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})/i);
    if(m&&m[1]&&!/google|bing|linkedin|x\.com|twitter|facebook|instagram|youtube/.test(m[1].toLowerCase()))return m[1].toLowerCase();
  }
  return '';
}
const FREE_EMAIL_DOMAINS=new Set([
  'gmail.com','hotmail.com','outlook.com','live.com','yahoo.com','icloud.com','proton.me','protonmail.com','aol.com'
]);
const NON_TRUSTED_SOURCE_DOMAINS=[
  'google.com','bing.com','news.google.com','x.com','twitter.com','facebook.com','instagram.com','youtube.com','tiktok.com',
  'wikipedia.org','wikihow.com','inegi.org.mx','expansion.mx','elfinanciero.com.mx','forbes.com.mx','eleconomista.com.mx'
];
const TRUSTED_SOURCE_PREFIXES=['leads_complete','directorio_csv','customers_covia','harvest_'];
function cleanLeadValue(v){
  return String(v||'').trim();
}
function extractLeadEmail(d){
  return cleanLeadValue((d&&d.contacto&&d.contacto.email)||d?.email||'');
}
function extractLeadPhone(d){
  return cleanLeadValue((d&&d.contacto&&d.contacto.tel)||d?.t||'');
}
function isCorporateEmail(email){
  const e=cleanLeadValue(email).toLowerCase();
  if(!e||e==='pendiente'||e==='n/a'||e==='na'||e==='verificación pendiente'||e==='verificacion pendiente')return false;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))return false;
  const dm=e.split('@')[1]||'';
  if(!dm||FREE_EMAIL_DOMAINS.has(dm))return false;
  return true;
}
function hasValidPhone(phone){
  const p=cleanLeadValue(phone).toLowerCase();
  if(!p||p==='pendiente'||p==='n/a'||p==='na'||p==='verificación pendiente'||p==='verificacion pendiente')return false;
  const digits=p.replace(/\D/g,'');
  return digits.length>=8;
}
function hasTrustedSource(d){
  const src=cleanLeadValue(d?._src).toLowerCase();
  if(src&&TRUSTED_SOURCE_PREFIXES.some(p=>src.startsWith(p)))return true;
  const dm=leadDomainFromData(d);
  if(!dm)return false;
  if(NON_TRUSTED_SOURCE_DOMAINS.some(x=>dm===x||dm.endsWith(`.${x}`)))return false;
  if(/news|noticias|blog|revista|periodico|newspaper/.test(dm))return false;
  return true;
}
function isVerifiedBusinessRecord(d){
  if(!d)return false;
  if(String(d.tp||'')==='a')return true;
  if(!isCoherentLeadRecord(d))return false;
  return isCorporateEmail(extractLeadEmail(d))||hasValidPhone(extractLeadPhone(d))||hasTrustedSource(d);
}
function normalizeLeadText(v){
  return String(v||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^\w\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function canonicalLeadKey(d){
  const n=normalizeLeadText(d?.n);
  const city=normalizeLeadText(d?.d);
  const seg=normalizeLeadText(d?.s);
  const tp=normalizeLeadText(d?.tp||'l');
  return `${n}|${city}|${seg}|${tp}`;
}
function leadRecordQuality(d){
  if(!d)return 0;
  let s=0;
  if(String(d.tp||'')==='a')s+=80;
  if(isVerifiedBusinessRecord(d))s+=35;
  if(isCorporateEmail(extractLeadEmail(d)))s+=25;
  if(hasValidPhone(extractLeadPhone(d)))s+=15;
  if(hasTrustedSource(d))s+=10;
  if(Number.isFinite(Number(d?.lat))&&Number.isFinite(Number(d?.lng)))s+=6;
  if(cleanLeadValue(d?.pot))s+=4;
  return s;
}
function logoUrlFromLead(d){
  const dom=leadDomainFromData(d);
  if(!dom)return '';
  return `https://logo.clearbit.com/${dom}?size=256`;
}
function faviconUrlFromLead(d){
  const dom=leadDomainFromData(d);
  if(!dom)return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(dom)}&sz=128`;
}
function segmentVisualDataUrl(seg,label,color){
  const segTxt=String(label||seg||'Segmento').toUpperCase().slice(0,18);
  const c=String(color||'#0ea5e9');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c}" stop-opacity=".95"/>
      <stop offset="55%" stop-color="#0f172a" stop-opacity=".88"/>
      <stop offset="100%" stop-color="#0b3a66" stop-opacity=".95"/>
    </linearGradient>
    <radialGradient id="r" cx=".15" cy=".1" r=".8">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".45"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="700" fill="url(#g)"/>
  <rect width="1200" height="700" fill="url(#r)"/>
  <g opacity=".22" fill="#fff">
    <circle cx="170" cy="140" r="150"/><circle cx="1020" cy="120" r="180"/><circle cx="980" cy="620" r="140"/>
  </g>
  <g opacity=".3" stroke="#fff" fill="none">
    <path d="M20 560 C220 420, 420 680, 640 520 S980 420, 1180 540" stroke-width="2"/>
    <path d="M20 600 C220 470, 420 730, 640 560 S980 450, 1180 580" stroke-width="1.5"/>
  </g>
  <g fill="#fff" opacity=".95" font-family="Inter,Arial,sans-serif">
    <text x="64" y="520" font-size="38" font-weight="700">COVIA</text>
    <text x="64" y="560" font-size="66" font-weight="900">${segTxt}</text>
    <text x="64" y="608" font-size="28" font-weight="600" opacity=".88">Visual de referencia comercial por segmento</text>
  </g>
  <g fill="#fff" opacity=".25">
    <rect x="760" y="210" width="320" height="190" rx="16"/>
    <rect x="840" y="250" width="190" height="115" rx="12" fill="#ffffff" opacity=".36"/>
    <rect x="740" y="440" width="360" height="118" rx="18"/>
  </g>
  </svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
function tabVisualDataUrl(tab){
  const meta=TAB_VIBE_META[tab]||TAB_VIBE_META.inicio;
  const colorMap={inicio:'#0ea5e9',mapa:'#06b6d4',ventas:'#8b5cf6',bandeja:'#f59e0b',seguimiento:'#10b981',intel:'#a855f7',datos:'#334155'};
  return segmentVisualDataUrl(tab,meta.t,colorMap[tab]||'#0ea5e9');
}
function leadImageBundle(d){
  const seg=d?.s||'construccion';
  const segLabel=LB[seg]||seg||'Segmento';
  const segArt=segmentVisualDataUrl(seg,segLabel,CO[seg]||'#0ea5e9');
  const logo=logoUrlFromLead(d);
  const fav=faviconUrlFromLead(d);
  return {src:logo||fav||segArt,fb1:logo?(fav||segArt):(fav?segArt:''),fb2:logo&&fav?segArt:'',segArt};
}
function osmEmbedUrl(d){
  if(!Number.isFinite(d?.lat)||!Number.isFinite(d?.lng))return '';
  const lat=Number(d.lat),lng=Number(d.lng),delta=0.07;
  const bbox=[lng-delta,lat-delta,lng+delta,lat+delta].map(v=>v.toFixed(6));
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox[0]}%2C${bbox[1]}%2C${bbox[2]}%2C${bbox[3]}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
}
function mapLeadAssets(d){
  return {
    pvu:osmStaticPreviewUrl(d,9,320,160),
    emb:osmEmbedUrl(d),
    logo:logoUrlFromLead(d),
    fav:faviconUrlFromLead(d),
    gmaps:mapsUrlForLead(d),
    sv:streetViewUrlForLead(d),
    gq:googleSearchUrl(`${d.n} ${d.d||''}`)
  };
}
function resolveMapLeadView(d,requested){
  const a=mapLeadAssets(d);
  let view=requested||'preview';
  let diag='';
  if(view==='street'){
    view='preview';
    diag='AutoDiagnóstico: Street View no embebible aquí. Se cambió automáticamente a Vista.';
  }else if(view==='google'){
    view='preview';
    diag='AutoDiagnóstico: Google Search no embebible en panel. Se cambió automáticamente a Vista.';
  }else if(view==='map'&&!a.emb){
    view='preview';
    diag='AutoDiagnóstico: no hay coordenadas válidas para mapa embebido. Se muestra Vista.';
  }else if(view==='image'&&!a.logo&&!a.fav){
    view='preview';
    diag='AutoDiagnóstico: sin dominio/logo para esta cuenta. Se muestra Vista.';
  }
  if(view==='preview'&&!a.pvu&&a.emb){
    view='map';
    diag=diag||'AutoDiagnóstico: preview estático no disponible. Se cambió a mapa embebido.';
  }
  return {view,diag,a};
}
function mapLeadViewBody(d,effectiveView,assets){
  const a=assets||mapLeadAssets(d);
  const segFallback=leadImageBundle(d).segArt;
  const quickPreview=`${a.pvu?`<img class="mlv-preview" src="${escapeAttr(a.pvu)}" data-fallback="${escapeAttr(segFallback)}" alt="" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';this.style.objectFit='cover';this.style.padding='0';return;}this.style.display='none';this.nextElementSibling.style.display='block';"/><div class="mlv-empty" style="display:none">Preview no disponible en este punto.</div>`:`<img class="mlv-preview" src="${escapeAttr(segFallback)}" alt="Visual segmento"/>`}`;
  if(effectiveView==='map'&&a.emb){
    return `<div class="mlv-frame-wrap"><iframe class="mlv-frame" src="${escapeAttr(a.emb)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
  }
  if(effectiveView==='image'){
    return `<div class="mlv-img-wrap">${a.logo?`<img class="mlv-logo" src="${escapeAttr(a.logo)}" data-fallback="${escapeAttr(a.fav)}" alt="" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';this.style.objectFit='contain';this.style.padding='18px';return;}this.style.display='none';this.nextElementSibling.style.display='block';"/><div class="mlv-empty" style="display:none">No encontré logo directo; usa Google/Maps.</div>`:`${a.fav?`<img class="mlv-logo" src="${escapeAttr(a.fav)}" alt="" style="object-fit:contain;padding:18px"/><div class="mlv-empty" style="display:none"></div>`:'<div class="mlv-empty">Sin dominio corporativo detectado para logo.</div>'}`}</div>`;
  }
  return `<div class="mlv-img-wrap">${quickPreview}</div>`;
}
function mapLeadActionLinks(d){
  const gmaps=mapsUrlForLead(d),sv=streetViewUrlForLead(d),gq=googleSearchUrl(`${d.n} ${d.d||''}`);
  const links=[
    {id:'map',label:'Maps',icon:'fa-map-location-dot',url:gmaps},
    {id:'street',label:'Street',icon:'fa-street-view',url:sv},
    {id:'google',label:'Google',icon:'fa-magnifying-glass',url:gq}
  ];
  return links.map(l=>{
    const on=mapLeadView===l.id?' on':'';
    return `<a class="mlv-link${on}" href="${escapeAttr(l.url)}" target="_blank" rel="noopener noreferrer"><i class="fas ${l.icon}"></i> ${l.label}</a>`;
  }).join('');
}
function renderMapLeadPreviewPanel(){
  const el=document.getElementById('mapLeadPreview');
  if(!el)return;
  if(!mapLeadFocus){
    el.innerHTML='<div class="mlv-empty">Haz click en un marcador para abrir su vista detallada.</div>';
    return;
  }
  const d=mapLeadFocus;
  const rv=resolveMapLeadView(d,mapLeadView);
  if(rv.view!==mapLeadView)mapLeadView=rv.view;
  mapLeadDiag=rv.diag||'';
  const buttons=[
    ['preview','Vista'],
    ['map','Mapa'],
    ['image','Logo'],
    ['street','Calle'],
    ['google','Buscar']
  ].map(([k,l])=>`<button type="button" class="mlv-tab${mapLeadView===k?' on':''}" onclick="setMapLeadView('${k}')">${l}</button>`).join('');
  const infoTon=d.tp==='a'?`${fmtNum(d.v)} ton/año`:`${d.pot||'N/A'} ton/año`;
  const np=nearestPlant(d),km=distMin(d).toFixed(0);
  el.innerHTML=`<div class="mlv-head"><div class="mlv-name">${escapeHtml(d.n)}</div><div class="mlv-sub">${escapeHtml(LB[d.s]||d.s)} · ${escapeHtml(d.d||'—')}</div><div class="mlv-sub"><b>${escapeHtml(infoTon)}</b> · ${km} km de ${escapeHtml(np.short)}</div><div class="mlv-sub"><b>${escapeHtml(geoScoreHintText(d))}</b></div></div>${mapLeadDiag?`<div class="mlv-diag"><i class="fas fa-stethoscope"></i> ${escapeHtml(mapLeadDiag)}</div>`:''}<div class="mlv-tabs">${buttons}</div><div class="mlv-pane" data-view="${escapeAttr(mapLeadView)}">${mapLeadViewBody(d,mapLeadView,rv.a)}</div><div class="mlv-actions">${mapLeadActionLinks(d)}</div>`;
}
function setMapLeadView(v){
  mapLeadView=v||'preview';
  mapLeadDiag='';
  renderMapLeadPreviewPanel();
}
window.setMapLeadView=setMapLeadView;

function setTabVibeHero(tab){
  const meta=TAB_VIBE_META[tab]||TAB_VIBE_META.inicio;
  const img=document.getElementById('vibeHeroImg');
  const k=document.getElementById('vibeHeroKicker');
  const t=document.getElementById('vibeHeroTitle');
  const s=document.getElementById('vibeHeroSub');
  const tags=document.getElementById('vibeHeroTags');
  if(k)k.textContent=meta.k;
  if(t)t.textContent=meta.t;
  if(s)s.textContent=meta.s;
  if(img){
    const src=tabVisualDataUrl(tab);
    if(img.dataset.src!==src){img.dataset.src=src;img.src=src;}
  }
  if(tags){
    const fd=getViewData();
    const leads=fd.filter(x=>x.tp==='l').length;
    const clientes=fd.filter(x=>x.tp==='a').length;
    const pot=fd.filter(x=>x.tp==='l').reduce((acc,d)=>acc+effectiveTonProm(d),0);
    tags.innerHTML=`<span class="vibe-tag"><i class="fas fa-crosshairs"></i> ${fmtNum(leads)} leads</span><span class="vibe-tag"><i class="fas fa-users"></i> ${fmtNum(clientes)} clientes</span><span class="vibe-tag"><i class="fas fa-weight-hanging"></i> ${fmtNum(Math.round(pot))} ton potencial</span>`;
  }
}
function renderVibeCarousel(){
  const el=document.getElementById('vibeCarousel');
  if(!el)return;
  const fd=getViewData().filter(x=>x.tp==='l').sort((a,b)=>leadRowScore(b)-leadRowScore(a));
  const top=fd.slice(0,6);
  if(!top.length){
    el.innerHTML='<div class="vibe-empty">Sin leads en este filtro para carrusel dinámico.</div>';
    return;
  }
  const cards=top.map((d,idx)=>{
    const seg=LB[d.s]||d.s;
    const score=Math.round(leadRowScore(d));
    const pot=Math.round(effectiveTonProm(d));
    const bi=leadImageBundle(d);
    return `<article class="vibe-card${idx===vibeCarouselIdx?' on':''}" data-i="${idx}"><div class="vibe-card-img-wrap"><img class="vibe-card-img" loading="lazy" src="${escapeAttr(bi.src)}" data-fb1="${escapeAttr(bi.fb1)}" data-fb2="${escapeAttr(bi.fb2)}" alt="${escapeAttr(seg)}" onerror="if(this.dataset.fb1){this.src=this.dataset.fb1;this.dataset.fb1=this.dataset.fb2||'';this.dataset.fb2='';return;}"/><span class="vibe-chip">${escapeHtml(seg)}</span></div><div class="vibe-card-body"><span class="vibe-card-seg">${escapeHtml(seg)}</span><h4>${escapeHtml(d.n)}</h4><p>${escapeHtml(d.d||'—')}</p><div class="vibe-card-metrics"><span><i class="fas fa-brain"></i> ${score}</span><span><i class="fas fa-weight-hanging"></i> ${fmtNum(pot)} ton</span></div></div></article>`;
  }).join('');
  el.innerHTML=`<div class="vibe-carousel-track">${cards}</div><div class="vibe-carousel-nav">${top.map((_,i)=>`<button type="button" class="vibe-dot${i===vibeCarouselIdx?' on':''}" onclick="setVibeSlide(${i})"></button>`).join('')}</div>`;
}
function setVibeSlide(i){
  vibeCarouselIdx=i;
  renderVibeCarousel();
}
window.setVibeSlide=setVibeSlide;
function startVibeCarousel(){
  if(vibeCarouselTimer){clearInterval(vibeCarouselTimer);vibeCarouselTimer=null;}
  vibeCarouselTimer=setInterval(()=>{
    const fd=getViewData().filter(x=>x.tp==='l');
    if(!fd.length)return;
    vibeCarouselIdx=(vibeCarouselIdx+1)%Math.min(6,fd.length);
    renderVibeCarousel();
  },4600);
}
function updateCompactModeBtn(){
  const b=document.getElementById('compactModeBtn');
  if(!b)return;
  b.innerHTML=compactMode?'<i class="fas fa-compress"></i> Modo compacto: ON':'<i class="fas fa-expand"></i> Modo compacto: OFF';
  b.classList.toggle('on',compactMode);
}
function applyCompactMode(on,save=true){
  compactMode=!!on;
  document.body.classList.toggle('compact-mode',compactMode);
  updateCompactModeBtn();
  if(save){try{localStorage.setItem(COMPACT_MODE_KEY,compactMode?'1':'0')}catch(e){}}
}
function initCompactMode(){
  let stored=null;
  try{stored=localStorage.getItem(COMPACT_MODE_KEY)}catch(e){}
  if(stored==='1'||stored==='0'){
    applyCompactMode(stored==='1',false);
    return;
  }
  const autoCompact=window.matchMedia&&window.matchMedia('(max-width: 900px)').matches;
  applyCompactMode(autoCompact,false);
}
function toggleCompactMode(){
  applyCompactMode(!compactMode,true);
}
window.toggleCompactMode=toggleCompactMode;

function initPlantBar(){
  const el=document.getElementById('plantBar');if(!el)return;
  el.innerHTML='<span class="plant-lbl"><i class="fas fa-industry"></i> Plantas activas</span>'+
  '<span class="plant-hint">Clic = una planta · Ctrl+Clic = varias</span>'+
  PLANT_ORDER.map(k=>{const p=PLANTAS[k];const on=selectedPlantKeys.includes(k);return `<button type="button" class="pch${on?' on':''}" data-k="${k}" onclick="plantChipClick(event,'${k}')">${p.short}</button>`}).join('')+
  '<span class="plant-act"><button type="button" onclick="selectPlantKeys(PLANT_ORDER.slice())">Todas</button><button type="button" onclick="selectPlantKeys([\'lampazos\'])">Solo Lampazos</button></span>';
  updatePlantTitle();
}
/** Clic simple: solo esa planta. Ctrl/Cmd+Clic: añade o quita (multi-selección). */
function plantChipClick(ev,k){
  if(ev)ev.preventDefault();
  const multi=ev&&(ev.ctrlKey||ev.metaKey);
  if(multi){
    if(selectedPlantKeys.includes(k))selectedPlantKeys=selectedPlantKeys.filter(x=>x!==k);
    else selectedPlantKeys=[...selectedPlantKeys,k];
    if(selectedPlantKeys.length===0)selectedPlantKeys=[k];
  }else{
    selectedPlantKeys=[k];
  }
  drawPlantOverlays();syncAll();initPlantBar();
}
function selectPlantKeys(keys){selectedPlantKeys=keys.filter(x=>PLANTAS[x]);if(!selectedPlantKeys.length)selectedPlantKeys=PLANT_ORDER.slice();drawPlantOverlays();syncAll();initPlantBar();}
function updatePlantTitle(){
  const t=document.getElementById('plantTitle');if(!t)return;
  const pts=getSelectedPlants();t.textContent=pts.length>3?pts.length+' plantas':pts.map(p=>p.short).join(' · ');
}
function renderPlantLogisticsStrip(){
  const el=document.getElementById('plantLogisticsStrip');
  if(!el)return;
  const keys=selectedPlantKeys;
  const onlyL=keys.length===1&&keys[0]==='lampazos';
  const onlyJ=keys.length===1&&keys[0]==='jaltipan';
  const snap=PLANT_LOGISTICS_SNAPSHOT.jaltipan;
  if(onlyJ&&snap){
    const a=snap.cuentaAncla;
    const top=snap.otrasCuentas.slice(0,4).map(r=>`${r.n.substring(0,22)}${r.n.length>22?'…':''} (${r.shipments} emb.)`).join(' · ');
    const vop=snap.volActualTonAno?`<span>Vol. operativo ref. <b>~${Math.round(snap.volActualTonAno/1000)}K</b> ton/año</span>`:'';
    el.classList.add('on');
    el.innerHTML=`<span class="plant-log-badge"><i class="fas fa-truck-loading"></i> Jáltipan · logística</span>${vop}<span><b>${snap.compliancePct}%</b> cumplimiento</span><span>Emb. <b>${snap.shipments}</b> · Ped. nuevos <b>${snap.orderNew}</b> · Δ<b>${snap.delta}</b> · <b>${snap.productoAgregado}</b></span><span class="plant-log-ref" title="${a.n} · ${a.city}, ${a.state}">Ref.: <b>${a.n.substring(0,38)}</b> · ${a.city}, ${a.state}</span><span class="plant-log-more" title="${snap.fuente}">Otras cuentas (mismo corte): ${top}</span>`;
    return;
  }
  if(onlyL){
    const tot=totalActualesCarteraTon();
    const ref=PLANT_LOGISTICS_SNAPSHOT.lampazos;
    el.classList.add('on');
    el.innerHTML=`<span class="plant-log-badge"><i class="fas fa-industry"></i> Lampazos · cartera CRM</span><span>Actuales en tablero: <b>~${Math.round(tot/1000)}K</b> ton/año</span><span class="plant-log-more" title="${ref?ref.notaOperativa:''}">${ref?ref.fuente:'Cluster CAN-LAM'}</span>`;
    return;
  }
  if(keys.length>1){
    el.classList.add('on');
    el.innerHTML=`<span class="plant-log-badge"><i class="fas fa-layer-group"></i> Multisitio (${keys.length} plantas)</span><span>La <b>planta territorial</b> de cada cuenta es la <b>más cercana del catálogo completo</b>. Ves las cuentas cuya asignación es una de tus plantas activas y están a ≤${PLANT_CATCHMENT_KM} km. El total es <b>único</b> (zona compartida no duplica).</span>`;
    return;
  }
  if(keys.length===1){
    const p=PLANTAS[keys[0]];
    if(p){
      el.classList.add('on');
      el.innerHTML=`<span class="plant-log-badge"><i class="fas fa-industry"></i> ${p.short}</span><span>${p.city}, ${p.state} · ${p.cluster}. Solo cuentas cuya planta más cercana (toda la red) es <b>${p.short}</b>. <b>Ctrl+Clic</b> para comparar plantas.</span>`;
      return;
    }
  }
  el.classList.remove('on');
  el.innerHTML='';
}

function initF(){
  renderFilterChips();
  document.getElementById('lB').innerHTML=`<div class="li"><div class="ld" style="background:#ef4444"></div><b>Planta Covia</b></div>`+Object.keys(CO).map(k=>`<div class="li"><div class="ld" style="background:${CO[k]}"></div>${LB[k]}</div>`).join('');
}

function getFilteredData(){
  let rows=D;
  if(cT==='actual') rows=rows.filter(d=>d.tp==='a');
  else if(cT!=='all') rows=rows.filter(d=>d.s===cT);
  if(cQ) rows=rows.filter(d=>rowMatchesQuery(d,cQ));
  if(geoMinScore>0) rows=rows.filter(d=>geoScoreLead(d)>=geoMinScore);
  if(strictVerifiedOnly){
    const strictRows=rows.filter(isVerifiedBusinessRecord);
    // Hard safety: never leave the entire app with empty datasets.
    if(strictRows.length>0) rows=strictRows;
    else strictVerifiedOnly=false;
  }
  return rows;
}
function applyCatchmentSafe(rows){
  const inCatch=(rows||[]).filter(withinPlantCatchment);
  return inCatch.length?inCatch:(rows||[]);
}
/** Segmento + búsqueda + radio desde planta(s) activa(s) — coherente con KPIs y tabla */
function getViewData(){
  return applyCatchmentSafe(getFilteredData());
}

/** Filas de la matriz “comercial” (6 segmentos ancla — el resto de segmentos vive en chips/tabla). */
const OPPORTUNITY_MATRIX_ROWS=[
  {seg:'filtracion',title:'Filtración de Agua',tier:'alta',icon:'tint',color:'#ef4444'},
  {seg:'reciclaje',title:'Construcción/Reciclaje',tier:'alta',icon:'hard-hat',color:'#f97316'},
  {seg:'fracking',title:'Fracking/Petróleo',tier:'alta',icon:'oil-can',color:'#8b5cf6'},
  {seg:'deportiva',title:'Arena Deportiva',tier:'alto',icon:'futbol',color:'#ff6b6b'},
  {seg:'cuestre',title:'Arena Ecuestre',tier:'alto',icon:'horse',color:'#d97706'},
  {seg:'agricola',title:'Agricultura',tier:'alto',icon:'seedling',color:'#10b981'}
];
function matrixHintForSegment(seg,leadsInSeg){
  const mb=MERCADO_BASE[seg]||LB[seg]||'';
  if(!leadsInSeg.length)return mb;
  const cities=[...new Set(leadsInSeg.map(d=>d.d).filter(Boolean))].slice(0,3).join(' · ');
  return cities?`${cities} · ${mb}`:mb;
}
/** Bullets comerciales + reglas por cuenta (sin proveedor, producto). */
function salesPlaybookForLead(d){
  const arr=[...(SEG_SALES_PLAYBOOK[d.s]||SEG_SALES_PLAYBOOK._default)];
  const pv=getProv(d);
  if(/sin proveedor/i.test(pv))arr.unshift('Brecha clara: sin proveedor — entrar con piloto acotado, fecha de arranque y contacto compras/operaciones.');
  if((d.p||'').match(/feldespato|feldesp|caco3|carbonato|porcelana|esmalte/i))arr.unshift('Producto con minerales cerámicos: preparar cruce técnico arena + aditivos y prueba de laboratorio lado cliente.');
  return arr.slice(0,6);
}
function leadSalesCardHtml(d){
  const seg=d.s,ton=Math.round(effectiveTonProm(d)),score=Math.round(leadRowScore(d));
  const pv=getProv(d);
  const pShort=(d.p||'').length>70?(d.p||'').substring(0,68)+'…':(d.p||'—');
  const bullets=salesPlaybookForLead(d).map(b=>`<li>${escapeHtml(b)}</li>`).join('');
  return `<div class="sales-card"><div class="sales-card-h"><span class="bd" style="background:${CO[seg]||'#64748b'}">${LB[seg]||seg}</span> <strong>${escapeHtml(d.n)}</strong></div>`+
    `<div class="sales-meta">${escapeHtml(d.d)} · ~${ton} t prom · Score ML <b>${score}</b> · ${escapeHtml(pv)} · <span title="${escapeHtml(d.p||'')}">${escapeHtml(pShort)}</span></div>`+
    `<ul class="sales-ul">${bullets}</ul><div class="sales-links">Ampliar: ${leadSourceLinksHtml(d)}</div></div>`;
}
/**
 * kind: otherOnly = matriz vacía pero hay leads en otros segmentos.
 * kind: appendix = debajo de la matriz cuando hay pocas cuentas (briefing vendedor).
 */
function renderSalesIntelSection(leads,kind){
  const sorted=[...leads].sort((a,b)=>leadRowScore(b)-leadRowScore(a));
  if(!sorted.length)return'';
  if(kind==='otherOnly'){
    const intro='La <strong>matriz de 6 segmentos</strong> (alta prioridad / alto margen) no incluye Vidrio, Cerámica, Fundición, etc. <strong>Tu territorio sí tiene leads ahí</strong> — son la misma fuente que la tabla. Prioriza por score y por brecha de proveedor.';
    const bySeg={};
    sorted.forEach(d=>{if(!bySeg[d.s])bySeg[d.s]=[];bySeg[d.s].push(d)});
    const sk=Object.keys(bySeg).sort((a,b)=>{
      const sa=bySeg[a].reduce((s,x)=>s+leadRowScore(x),0);
      const sb=bySeg[b].reduce((s,x)=>s+leadRowScore(x),0);
      return sb-sa;
    });
    let h=`<div class="sales-territory-wrap"><p class="sales-territory-intro">${intro}</p>`;
    sk.forEach(seg=>{
      h+=`<h4 class="sales-seg-h"><span class="ld" style="background:${CO[seg]}"></span> ${LB[seg]} <span class="sales-seg-c">${bySeg[seg].length} cuenta(s)</span></h4>`;
      h+=bySeg[seg].sort((a,b)=>leadRowScore(b)-leadRowScore(a)).map(leadSalesCardHtml).join('');
    });
    return h+'</div>';
  }
  return `<div class="sales-appendix"><h4 class="sales-appendix-h"><i class="fas fa-user-tie"></i> Briefing comercial — sacar provecho a la vista actual</h4>${sorted.map(leadSalesCardHtml).join('')}</div>`;
}
/** Enlaces de contexto sectorial + búsqueda web (no sustituyen validación CRM). */
function segmentIntelLinksHtml(seg){
  const q=`${LB[seg]||seg} arena sílica industrial México`;
  const g=googleSearchUrl(q);
  const extra=(SEG_PUBLIC_REFS[seg]||[]).slice(0,2).map(r=>`<a class="matrix-mini-link" href="${escapeAttr(r.u)}" target="_blank" rel="noopener noreferrer" title="${escapeAttr(r.t)}">${escapeHtml(r.t)}</a>`);
  return `<div class="matrix-refs"><a class="matrix-mini-link" href="${g}" target="_blank" rel="noopener noreferrer" title="Buscar mercado y notas"><i class="fas fa-search"></i> Buscar</a>${extra.length?' · ':''}${extra.join(' · ')}</div>`;
}
/**
 * Matriz de oportunidad: con **subconjunto de plantas** solo se listan segmentos con ≥1 lead en vista (no “prioridad” en cero).
 * Con **todas** las plantas se muestran los 6 segmentos (incl. ceros) como panorama nacional.
 */
function renderOpportunityMatrix(){
  const root=document.getElementById('matrixRoot');
  const banner=document.getElementById('matrixBanner');
  const headSub=document.getElementById('matrixHeadSub');
  if(!root)return;
  const fd=getViewData();
  const leads=fd.filter(x=>x.tp==='l');
  const nationalView=selectedPlantKeys.length>=PLANT_ORDER.length;
  const rows=OPPORTUNITY_MATRIX_ROWS.map(r=>{
    const L=leads.filter(x=>x.s===r.seg);
    return {...r,n:L.length,leads:L};
  });
  const visible=nationalView?rows.slice():rows.filter(r=>r.n>0);
  const plantLabel=selectedPlantKeys.length===1&&PLANTAS[selectedPlantKeys[0]]
    ?`${PLANTAS[selectedPlantKeys[0]].short} · ${PLANTAS[selectedPlantKeys[0]].city}, ${PLANTAS[selectedPlantKeys[0]].state}`
    :selectedPlantKeys.map(k=>PLANTAS[k]?PLANTAS[k].short:k).join(' · ');
  if(headSub){
    headSub.textContent=nationalView
      ?`· Vista nacional (${PLANT_ORDER.length} plantas) · leads en filtro actual`
      :`· Territorio: ${plantLabel} · ≤${PLANT_CATCHMENT_KM} km · asignación global`;
  }
  if(banner){
    if(!nationalView&&visible.length===0){
      if(leads.length>0){
        banner.style.display='block';
        banner.className='matrix-banner matrix-banner-intel';
        banner.innerHTML=`<i class="fas fa-lightbulb"></i><div><strong>Hay ${leads.length} lead(s) en vista</strong> en segmentos fuera de la “matriz 6” (ej. Cerámica, Vidrio…). La tabla y el mapa ya los muestran; <b>abajo</b> va el plan por cuenta para el vendedor — misma data, más accionable.</div>`;
        root.innerHTML=renderSalesIntelSection(leads,'otherOnly');
        return;
      }
      banner.style.display='block';
      banner.className='matrix-banner matrix-banner-empty';
      const pk=selectedPlantKeys.length===1?PLANTAS[selectedPlantKeys[0]]:null;
      const explore=pk?googleSearchUrl(`prospección industrial sílice ${pk.city} ${pk.state} arena filtración`):googleSearchUrl('Covia México arena sílica prospección');
      banner.innerHTML=`<i class="fas fa-map-marked-alt"></i><div><strong>Sin cuentas en esta vista</strong> — 0 leads (ni en matriz ni en otros segmentos) para ${plantLabel} con los filtros actuales. <strong>Qué hacer:</strong> activa <b>Todas</b> u otra planta; relaja segmento a «Todos» o limpia la búsqueda. <a class="matrix-mini-link" href="${explore}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Explorar en la web (territorio)</a></div>`;
      root.innerHTML=`<p class="insight-muted matrix-skip-hint" style="margin:0">Sin datos en cartera para este filtro — no hay briefing comercial hasta que exista al menos un lead en vista.</p><p class="matrix-refs" style="margin-top:10px"><a class="matrix-mini-link" href="${explore}" target="_blank" rel="noopener noreferrer"><i class="fas fa-search"></i> Buscar pistas públicas en tu zona</a> · <span class="insight-muted" style="font-size:.72rem">Enlaces de apoyo; operación = CRM.</span></p>`;
      return;
    }
    banner.className='matrix-banner';
    if(!nationalView&&visible.length<rows.length){
      banner.style.display='block';
      banner.innerHTML=`<i class="fas fa-filter"></i><div>Mostrando solo segmentos con <b>≥1 lead</b> en tu territorio. Para ver los seis segmentos aunque estén en 0, selecciona <b>Todas</b> las plantas.</div>`;
    }else{
      banner.style.display='none';
      banner.innerHTML='';
    }
  }
  const sortByCount=(a,b)=>b.n-a.n;
  const alta=visible.filter(r=>r.tier==='alta').sort(sortByCount);
  const alto=visible.filter(r=>r.tier==='alto').sort(sortByCount);
  function colBlock(title,hIcon,hColor,subtitle,list){
    if(!list.length){
      return `<div class="tech-col matrix-col-empty"><h4><i class="fas ${hIcon}" style="color:${hColor}"></i> ${title}</h4><p class="insight-muted" style="margin:8px 0 0;font-size:.78rem">${subtitle}</p></div>`;
    }
    return `<div class="tech-col"><h4><i class="fas ${hIcon}" style="color:${hColor}"></i> ${title}</h4>`+
      list.map(r=>{
        const hint=matrixHintForSegment(r.seg,r.leads);
        const intel=segmentIntelLinksHtml(r.seg);
        return `<div class="lib" data-seg="${r.seg}"><div class="lib-icon" style="background:${r.color}"><i class="fas fa-${r.icon}"></i></div><div class="lib-info"><strong>${r.title}</strong><span><b>${r.n}</b> leads en vista · ${hint}</span>${intel}</div></div>`;
      }).join('')+'</div>';
  }
  const emptyAlta=!nationalView&&alta.length===0&&alto.length>0;
  const emptyAlto=!nationalView&&alto.length===0&&alta.length>0;
  let gridHtml=
    colBlock('Alta Prioridad','fa-chart-line','#ef4444',emptyAlta?'Ningún segmento “alta prioridad” con leads en esta vista — revisa otras plantas o vista nacional.':'Sin segmentos en esta categoría.',alta)+
    colBlock('Alto Margen','fa-chart-bar','#10b981',emptyAlto?'Ningún segmento “alto margen” con leads en esta vista.':'Sin segmentos en esta categoría.',alto);
  if(!nationalView&&leads.length>=1&&leads.length<=8&&visible.length>0){
    gridHtml+=renderSalesIntelSection(leads,'appendix');
  }
  root.innerHTML=gridHtml;
}

const _allPlantPtsCache=()=>PLANT_ORDER.map(k=>PLANTAS[k]).filter(Boolean);

/** Oculta Pipeline/Estrategias nacionales si no estás en “todas las plantas”. */
function updateNationalNarrativeVisibility(){
  const full=selectedPlantKeys.length>=PLANT_ORDER.length;
  const wrap=document.getElementById('nationalNarrativeBlocks');
  const ph=document.getElementById('nationalNarrativePlaceholder');
  if(wrap)wrap.style.display=full?'':'none';
  if(ph)ph.style.display=full?'none':'block';
}

/**
 * Leads en vista donde la 2ª planta más cercana (catálogo) también está a ≤radio y cerca de la 1ª — explica saltos al cambiar filtro.
 */
function renderOverlapPanel(){
  const el=document.getElementById('overlapPanel');
  if(!el)return;
  const fd=getViewData().filter(d=>d.tp==='l');
  const pts=_allPlantPtsCache();
  const border=[];
  fd.forEach(d=>{
    const ranked=pts.map(p=>({k:p.key,short:p.short,km:dist(p,d)})).sort((a,b)=>a.km-b.km||a.k.localeCompare(b.k));
    if(ranked.length<2)return;
    const a=ranked[0],b=ranked[1];
    if(b.km<=PLANT_CATCHMENT_KM&&(b.km-a.km)<=95)border.push({d,first:a,second:b,gap:b.km-a.km});
  });
  border.sort((x,y)=>x.gap-y.gap);
  const take=border.slice(0,40);
  if(!take.length){
    el.innerHTML='<p class="insight-muted">Ningún lead en vista con 2.ª planta a ≤'+PLANT_CATCHMENT_KM+' km y competencia &lt;95 km (o la vista está vacía).</p>';
    return;
  }
  el.innerHTML='<p class="overlap-intro" style="font-size:.8rem;line-height:1.45;color:#cbd5e1;margin:0 0 14px"><strong>Zona compartida:</strong> la <b>1.ª</b> columna es la planta territorial (más cercana en toda la red). Si la <b>2.ª</b> también está muy cerca, al activar solo esa otra planta la cuenta puede “cambiar” de territorio — por eso las sumas por planta no se suman como columnas independientes.</p>'+
  '<div style="overflow:auto;max-height:320px"><table class="insight-table"><thead><tr><th>Lead</th><th>1ª (asignada)</th><th>km</th><th>2ª más cercana</th><th>km</th><th>Δ</th></tr></thead><tbody>'+
  take.map(({d,first,second,gap})=>`<tr><td><b>${d.n.length>40?d.n.substring(0,38)+'…':d.n}</b></td><td>${first.short}</td><td>${first.km.toFixed(0)}</td><td>${second.short}</td><td>${second.km.toFixed(0)}</td><td>${gap.toFixed(0)}</td></tr>`).join('')+
  '</tbody></table></div>';
}

function coviaSetTab(tab){
  const ids=['inicio','mapa','ventas','bandeja','seguimiento','intel','datos'];
  if(!ids.includes(tab))tab='inicio';
  document.querySelectorAll('.tab-panel').forEach(p=>{
    p.classList.toggle('is-active',p.getAttribute('data-tab-panel')===tab);
  });
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.classList.toggle('on',b.getAttribute('data-tab')===tab);
  });
  if(tab==='mapa'&&typeof map!=='undefined'&&map){
    setTimeout(()=>{try{map.invalidateSize()}catch(e){}},160);
  }
  setTabVibeHero(tab);
  try{history.replaceState(null,'','#'+tab)}catch(e){}
}
window.coviaSetTab=coviaSetTab;
function currentActiveTab(){
  return document.querySelector('.tab-panel.is-active')?.getAttribute('data-tab-panel')||'inicio';
}

function renderBandejaPlata(){
  const root=document.getElementById('bandejaPlataRoot');
  if(!root)return;
  const leads=getViewData().filter(x=>x.tp==='l').sort((a,b)=>leadRowScore(b)-leadRowScore(a));
  if(!leads.length){
    root.innerHTML='<p class="insight-muted">No hay leads en la vista actual. Ajusta plantas, segmento o búsqueda.</p>';
    return;
  }
  root.innerHTML=leads.slice(0,30).map((d,idx)=>{
    const seg=d.s;
    const score=Math.round(leadRowScore(d));
    const ton=Math.round(effectiveTonProm(d));
    const bullets=salesPlaybookForLead(d).map(b=>`<li>${escapeHtml(b)}</li>`).join('');
    const prov=getProv(d);
    // Campos extendidos (estructura rica de prospección)
    const decisor=d.decisor||d.decisor_compra||'';
    const cEmail=(d.contacto&&d.contacto.email)||d.email||'';
    const cTel=(d.contacto&&d.contacto.tel)||d.tel_decisor||d.t||'';
    const prodsArr=d.prods_actuales||d.productos_actuales||(d.p?[d.p.substring(0,60)]:null)||[];
    const scoreP=d.score_p||d.score_prioridad||null;
    const propensity=d.propensity_score||null;
    const techStack=d.tech_stack||d.techstack||null;
    const licitacion=d.ultima_licitacion||d.licitacion||'';
    // Score ring color (AI)
    const ringColor=score>1500?'#10b981':score>800?'#00a3e0':score>400?'#f59e0b':'#64748b';
    // Decisor row
    const decisorHtml=decisor?`<div class="bj-decisor"><i class="fas fa-user-tie"></i> <strong>${escapeHtml(decisor)}</strong>${cEmail?` · <a href="mailto:${escapeHtml(cEmail)}" class="bj-link"><i class="fas fa-envelope"></i> ${escapeHtml(cEmail)}</a>`:''}${cTel?` · <a href="tel:${escapeHtml(cTel)}" class="bj-link"><i class="fas fa-phone"></i> ${escapeHtml(cTel)}</a>`:''}</div>`:'';
    // Productos actuales
    const prodsHtml=prodsArr.length?`<div class="bj-prods"><span class="bj-label">Prods. actuales:</span> ${prodsArr.map(p=>`<span class="bj-tag">${escapeHtml(p)}</span>`).join('')}</div>`:'';
    // Tech stack
    const techHtml=techStack&&techStack.length?`<div class="bj-prods"><span class="bj-label">Tech-Stack:</span> ${techStack.map(t=>`<span class="bj-tag bj-tag-tech">${escapeHtml(t)}</span>`).join('')}</div>`:'';
    // Licitación
    const licitHtml=licitacion?`<div class="bj-licit"><i class="fas fa-gavel"></i> ${escapeHtml(licitacion)}</div>`:'';
    // Score badges
    const scorePHtml=scoreP!=null?`<span class="bj-score-ext" title="Score prioridad comercial"><i class="fas fa-star"></i> P:${scoreP}</span>`:'';
    const propHtml=propensity!=null?`<span class="bj-score-prop" style="background:hsl(${propensity},60%,90%);color:hsl(${propensity},60%,25%);border-color:hsl(${propensity},60%,78%)" title="Propensión de compra (modelo predictivo)"><i class="fas fa-brain"></i> ${propensity}%</span>`:'';

    return `<div class="bandeja-card bj-card-anim" style="animation-delay:${idx*35}ms">
  <div class="bj-header">
    <div class="bj-header-left">
      <span class="bd" style="background:${CO[seg]||'#64748b'}">${LB[seg]||seg}</span>
      <strong class="bj-name">${escapeHtml(d.n)}</strong>
    </div>
    <div class="bj-scores">
      <span class="bj-score-ia" style="border-color:${ringColor};color:${ringColor}" title="Score IA (motor)">IA&nbsp;${score}</span>
      ${scorePHtml}${propHtml}
    </div>
  </div>
  <div class="bandeja-meta">${escapeHtml(d.d)} · <span class="bj-prov">${escapeHtml(prov)}</span> · <strong>${fmtNum(ton)}</strong> t prom</div>
  ${decisorHtml}
  ${prodsHtml}
  ${techHtml}
  ${licitHtml}
  <ol class="bandeja-steps">${bullets}</ol>
</div>`;
  }).join('');
}

function renderProductsByPlant(){
  const root=document.getElementById('productsByPlantRoot');
  if(!root)return;
  const data=window.COVIA_PRODUCTS_BY_PLANT||{};
  const keys=PLANT_ORDER.filter(k=>data[k]);
  if(!keys.length){
    root.innerHTML='<p class="insight-muted">Sin datos embebidos de productos por planta.</p>';
    return;
  }
  root.innerHTML='<p class="insight-muted" style="margin-bottom:14px">Referencia comercial por planta (complementa Excel «Productos por planta» y documentación interna).</p>'+
    keys.map(k=>{
      const p=data[k],lab=PLANTAS[k]?PLANTAS[k].label:k;
      const lines=(p.lines||[]).map(l=>`<li>${escapeHtml(l)}</li>`).join('');
      return `<div class="products-plant"><h4>${escapeHtml(lab)} <span style="font-size:.72rem;color:var(--muted)">${escapeHtml(p.cluster||'')}</span></h4><ul>${lines}</ul>${p.notes?`<p style="font-size:.72rem;color:var(--muted);margin-top:8px">${escapeHtml(p.notes)}</p>`:''}</div>`;
    }).join('');
}

function renderLeadIntelTable(showSkeleton=true){
  const root=document.getElementById('leadIntelTableRoot');
  if(!root)return;
  const token=++leadIntelRenderToken;
  const modeChip=(id,label,extra='')=>`<button type="button" class="lead-chip ${leadIntelMode===id?'on':''}" data-lead-mode="${id}">${label}${extra?` <span>${extra}</span>`:''}</button>`;
  const renderToolbar=(counts={all:0,internal:0,competitor:0,geoTrusted:0,withContact:0,verified:0,sources:0})=>`
  <div class="lead-search-wrap"><span class="lead-search-ico">🔍</span><input id="leadSearch" class="lead-search-input" type="text" placeholder="Buscar por cliente, zona, producto, proveedor..." value="${escapeAttr(leadIntelSearchQ)}"/></div>
  <div class="lead-toolbar">${modeChip('all','Todo',fmtNum(counts.all))}${modeChip('internal','Internos Covia',fmtNum(counts.internal))}${modeChip('competitor','Competencia / No Covia',fmtNum(counts.competitor))}<button type="button" class="lead-chip ${geoMinScore>=80?'on':''}" onclick="toggleGeoTrusted()" title="Solo coordenadas confiables (GeoScore >= 80)">Geo >= 80 <span>${fmtNum(counts.geoTrusted)}</span></button><button type="button" class="lead-chip ${strictVerifiedOnly?'on':''}" onclick="toggleVerifiedOnlyGlobal()" title="Solo cuentas con señal verificable (dominio/teléfono/fuente)">Solo verificadas <span>${fmtNum(counts.verified)}</span></button><button type="button" class="lead-chip" title="Leads con email o teléfono disponible">Con contacto <span>${fmtNum(counts.withContact)}</span></button><button type="button" class="lead-chip" title="Cantidad de fuentes activas en este filtro">Fuentes <span>${fmtNum(counts.sources)}</span></button><button type="button" class="lead-chip" id="leadImportXlsxBtn" title="Importar Leads Analysis / Importaciones"><i class="fas fa-file-import"></i> Importar XLS</button><button type="button" class="lead-chip" data-lead-action="clear" title="Limpiar búsqueda y volver a todo">Limpiar filtros</button><input id="leadImportXlsxInput" type="file" accept=".xlsx,.xls" multiple style="display:none" /></div>`;
  const renderSkeleton=()=>`${renderToolbar()}<div class="lead-skeleton-wrap">${Array.from({length:6}).map(()=>'<div class="lead-skeleton-row"><div class="sk sk-lg"></div><div class="sk"></div><div class="sk"></div><div class="sk sk-sm"></div><div class="sk sk-xs"></div></div>').join('')}</div>`;
  const renderBigFish=()=>`<div class="bigfish-wrap"><h4><i class="fas fa-fish"></i> Big Fish MX (cuentas objetivo)</h4><div class="leads-table-wrap"><table class="leads-table bigfish-table"><thead><tr><th>Empresa</th><th>Ubicación</th><th>Interés / Producto</th><th>Contacto Objetivo</th></tr></thead><tbody>${LEAD_BIG_FISH_MX.map(x=>`<tr><td><strong>${escapeHtml(x.empresa)}</strong></td><td>${escapeHtml(x.ubicacion)}</td><td>${escapeHtml(x.interes)}</td><td>${escapeHtml(x.puesto)}</td></tr>`).join('')}</tbody></table></div></div>`;
  const bindToolbar=()=>{
    const inp=document.getElementById('leadSearch');
    if(inp)inp.addEventListener('input',e=>{leadIntelSearchQ=String(e.target.value||'').toLowerCase().trim();renderLeadIntelTable(false)});
    document.querySelectorAll('[data-lead-mode]').forEach(el=>{
      el.addEventListener('click',()=>{
        leadIntelMode=String(el.getAttribute('data-lead-mode')||'all');
        renderLeadIntelTable(false);
      });
    });
    document.querySelectorAll('[data-lead-action="clear"]').forEach(el=>{
      el.addEventListener('click',()=>{
        leadIntelMode='all';
        leadIntelSearchQ='';
        geoMinScore=0;
        strictVerifiedOnly=false;
        renderLeadIntelTable(false);
      });
    });
    const impBtn=document.getElementById('leadImportXlsxBtn');
    const impInput=document.getElementById('leadImportXlsxInput');
    if(impBtn&&impInput){
      impBtn.addEventListener('click',()=>impInput.click());
      impInput.addEventListener('change',async e=>{
        const files=[...(e.target.files||[])];
        if(!files.length)return;
        try{await importLeadIntelXlsx(files)}catch(err){alert('No se pudo importar XLS. Revisa encabezados de columnas.');console.error(err)}
        impInput.value='';
      });
    }
    document.querySelectorAll('.lead-edit').forEach(el=>{
      el.addEventListener('change',e=>{
        const t=e.currentTarget;
        const leadId=t.getAttribute('data-lead-id');
        const field=t.getAttribute('data-field');
        if(!leadId||!field)return;
        if(field==='minerals'){
          const vals=[...t.selectedOptions].map(o=>o.value).filter(Boolean);
          setLeadMetaById(leadId,{minerals:vals.length?vals:['No aplica']});
        }else{
          setLeadMetaById(leadId,{[field]:String(t.value||'').trim()});
        }
        const lm=document.querySelector(`[data-lm-for="${leadId}"]`);
        if(lm)lm.textContent=leadLastModifiedLabel(leadEnrichCache[leadId]);
      });
    });
    document.querySelectorAll('.lead-edit-note').forEach(el=>{
      el.addEventListener('blur',e=>{
        const t=e.currentTarget;
        const leadId=t.getAttribute('data-lead-id');
        if(!leadId)return;
        setLeadMetaById(leadId,{observations:String(t.value||'').trim()});
        const lm=document.querySelector(`[data-lm-for="${leadId}"]`);
        if(lm)lm.textContent=leadLastModifiedLabel(leadEnrichCache[leadId]);
      });
    });
  };
  const paint=()=>{
    if(token!==leadIntelRenderToken)return;
    const baseRows=getViewData().filter(x=>x.tp==='l'||x.tp==='a');
    const isInternal=d=>d.tp==='a'||/covia/i.test(getProv(d));
    const isCompetitor=d=>!/covia/i.test(getProv(d))&&!/sin proveedor/i.test(getProv(d));
    const counts={
      all:baseRows.length,
      internal:baseRows.filter(isInternal).length,
      competitor:baseRows.filter(isCompetitor).length,
      geoTrusted:baseRows.filter(d=>geoScoreLead(d)>=80).length,
      withContact:baseRows.filter(d=>{
        const cEmail=(d.contacto&&d.contacto.email)||d.email||'';
        const cTel=(d.contacto&&d.contacto.tel)||d.tel_decisor||d.t||'';
        return (cEmail&&cEmail!=='—'&&cEmail.toLowerCase()!=='pendiente') || (cTel&&cTel!=='—'&&cTel.toLowerCase()!=='pendiente');
      }).length,
      verified:baseRows.filter(d=>/verificad/i.test(String(d.verification||''))).length,
      sources:new Set(baseRows.map(d=>String(d._src||d.src||'interno').trim().toLowerCase()).filter(Boolean)).size
    };
    const filteredByMode=baseRows.filter(d=>{
      if(leadIntelMode==='internal')return isInternal(d);
      if(leadIntelMode==='competitor')return isCompetitor(d);
      return true;
    });
    const leads=filteredByMode.sort((a,b)=>{
      const ap=(a.score_prioridad||Math.round(leadRowScore(a)));
      const bp=(b.score_prioridad||Math.round(leadRowScore(b)));
      return bp-ap;
    }).filter(d=>{
      if(!leadIntelSearchQ)return true;
      const decisor=d.decisor||d.decisor_compra||'';
      const cEmail=(d.contacto&&d.contacto.email)||d.email||'';
      const cTel=(d.contacto&&d.contacto.tel)||d.tel_decisor||d.t||'';
      const prov=getProv(d);
      const src=String(d._src||d.src||'');
      const searchBase=`${d.n||''} ${d.d||''} ${d.p||''} ${decisor} ${cEmail} ${cTel} ${prov} ${src}`.toLowerCase();
      return searchBase.includes(leadIntelSearchQ);
    });
    if(!leads.length){
      root.innerHTML=`${renderToolbar(counts)}<p class="insight-muted">Sin cuentas en el filtro actual.</p>${renderBigFish()}`;
      bindToolbar();
      return;
    }
    const rows=leads.slice(0,LEAD_INTEL_PAGE_SIZE).map(d=>{
      const pot=d.tp==='a'?(d.v||0):effectiveTonProm(d);
      const priority=(d.score_prioridad||Math.round(leadRowScore(d)));
      const prov=getProv(d);
      const leadId=leadIntelId(d);
      const meta=getLeadMeta(d,pot,priority);
      const supplier=meta.supplierOverride||prov;
      const typeOpts=LEAD_TYPE_OPTIONS.map(v=>`<option value="${escapeAttr(v)}" ${meta.tipo===v?'selected':''}>${escapeHtml(v)}</option>`).join('');
      const scoreOpts=LEAD_SCORE_OPTIONS.map(v=>`<option value="${escapeAttr(v)}" ${meta.leadScoring===v?'selected':''}>${escapeHtml(v)}</option>`).join('');
      const regionOpts=REGION_OPTIONS.map(v=>`<option value="${escapeAttr(v)}" ${meta.region===v?'selected':''}>${escapeHtml(v)}</option>`).join('');
      const mineralOpts=MINERAL_OPTIONS.map(v=>`<option value="${escapeAttr(v)}" ${(meta.minerals||[]).includes(v)?'selected':''}>${escapeHtml(v)}</option>`).join('');
      const status=isCompetitor(d)?{c:'hot',t:'ATAQUE COMPETENCIA'}:(priority>=90?{c:'hot',t:'ALTA PRIORIDAD'}:priority>=75?{c:'mid',t:'PRIORIDAD MEDIA'}:{c:'cold',t:'SEGUIMIENTO'});
      const tone=priority>=90?'ton-hot':'ton-stable';
      const decisor=d.decisor||d.decisor_compra||'—';
      const cEmail=(d.contacto&&d.contacto.email)||d.email||'—';
      const cTel=(d.contacto&&d.contacto.tel)||d.tel_decisor||d.t||'—';
      const src=String(d._src||d.src||'').replace(/_/g,' ');
      const dims=`<div class="lead-dim-row">${escapeHtml(meta.endMarket||LB[d.s]||d.s||'')}</div><div class="lead-dim-row">${escapeHtml(meta.subMarket||'Submercado: —')}</div><div class="lead-dim-row">${escapeHtml(meta.marketGroup||'Market Group: —')}</div><div class="lead-dim-row">${escapeHtml(meta.fy2025?`FY2025: ${meta.fy2025}`:'FY2025: —')}</div>`;
      const quick=`<button class="exp-btn" type="button" onclick="quickFollowupFromLead('${escapeAttr(d.n)}','${escapeAttr(decisor!=='—'?decisor:'')}')" title="Mandar a seguimiento">+ Seguimiento</button><button class="exp-btn" type="button" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(`${d.n} ${d.d}`)}','_blank')" title="OSINT rápido">OSINT</button>`;
      return `<tr>`+
        `<td><div class="lead-company">${escapeHtml(d.n)}</div><div class="lead-city">${escapeHtml(d.d)}</div></td>`+
        `<td><select class="lead-edit lead-edit-select" data-lead-id="${escapeAttr(leadId)}" data-field="tipo">${typeOpts}</select></td>`+
        `<td><select multiple class="lead-edit lead-edit-select lead-edit-multi" data-lead-id="${escapeAttr(leadId)}" data-field="minerals" title="Ctrl/Cmd + click para múltiple">${mineralOpts}</select></td>`+
        `<td><input class="lead-edit lead-edit-input" data-lead-id="${escapeAttr(leadId)}" data-field="supplierOverride" value="${escapeAttr(supplier)}"/></td>`+
        `<td><select class="lead-edit lead-edit-select" data-lead-id="${escapeAttr(leadId)}" data-field="leadScoring">${scoreOpts}</select></td>`+
        `<td><select class="lead-edit lead-edit-select" data-lead-id="${escapeAttr(leadId)}" data-field="region">${regionOpts}</select></td>`+
        `<td><input class="lead-edit lead-edit-input" data-lead-id="${escapeAttr(leadId)}" data-field="vendedor" value="${escapeAttr(meta.vendedor||'')}"/></td>`+
        `<td><textarea class="lead-edit-note" data-lead-id="${escapeAttr(leadId)}" placeholder="Observaciones comerciales...">${escapeHtml(meta.observations||'')}</textarea></td>`+
        `<td><span class="lead-lastmod" data-lm-for="${escapeAttr(leadId)}">${escapeHtml(leadLastModifiedLabel(meta))}</span></td>`+
        `<td>${escapeHtml(decisor)}</td>`+
        `<td><div>${cEmail!=='—'?`<a class="bj-link" href="mailto:${escapeAttr(cEmail)}">${escapeHtml(cEmail)}</a>`:'—'}</div><div class="lead-city">${cTel!=='—'?escapeHtml(cTel):'—'}</div></td>`+
        `<td><strong class="lead-ton ${tone}">${fmtNum(pot,2)}</strong> <span class="lead-ton-unit">ton</span></td>`+
        `<td><span class="lead-city">${escapeHtml(src||'registro interno')} · Geo ${escapeHtml(String(geoScoreLead(d)))}</span></td>`+
        `<td>${dims}</td>`+
        `<td><span class="status-pill status-${status.c}">${status.t}</span></td>`+
        `<td>${quick}</td>`+
        `</tr>`;
    }).join('');
    const universe=(Array.isArray(window.COVIA_REAL_LEADS)?window.COVIA_REAL_LEADS.length:0)+(Array.isArray(window.COVIA_RICH_LEADS_DEMO)?window.COVIA_RICH_LEADS_DEMO.length:0);
    root.innerHTML=`${renderToolbar(counts)}<p class="insight-muted">Mostrando ${fmtNum(Math.min(leads.length,LEAD_INTEL_PAGE_SIZE))} de ${fmtNum(leads.length)} cuentas filtradas (${fmtNum(counts.all)} totales en territorio). Universo cargado: <strong>${fmtNum(universe||counts.all)}</strong> leads potenciales.</p><div class="leads-table-wrap"><table class="leads-table"><thead><tr><th>Empresa / Cuenta</th><th>Tipo</th><th>Mineral</th><th>Proveedor actual</th><th>Lead Scoring</th><th>Región</th><th>Vendedor</th><th>Observaciones</th><th>LastModified</th><th>Contacto Clave</th><th>Email / Teléfono</th><th>Potencial (Ton)</th><th>Fuente BI/OSINT</th><th>Dimensiones BI</th><th>Estatus</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div>${renderBigFish()}`;
    bindToolbar();
  };
  if(showSkeleton){
    root.innerHTML=renderSkeleton();
    setTimeout(paint,140);
    return;
  }
  paint();
}

function quickFollowupFromLead(leadName,ownerHint=''){
  coviaSetTab('seguimiento');
  setTimeout(()=>{
    const lead=document.getElementById('fuLead');
    const owner=document.getElementById('fuOwner');
    const note=document.getElementById('fuNote');
    if(lead)lead.value=String(leadName||'');
    if(ownerHint&&owner)owner.value=String(ownerHint||'');
    if(note&&!note.value)note.value='Arranque de seguimiento desde Leads Inteligentes.';
    if(note)note.focus();
  },120);
}
window.quickFollowupFromLead=quickFollowupFromLead;

function renderTriangulatedLeadsTable(){
  const root=document.getElementById('triangulatedLeadsRoot');
  if(!root)return;
  const statusPill=s=>s==='hot'
    ?'<span class="status-pill status-hot">ALTA PRIORIDAD</span>'
    :'<span class="status-pill status-mid">POTENCIAL</span>';
  const rows=LEAD_TRIANGULATED.map(r=>{
    const pot=r.pot==null?'N/A':fmtNum(r.pot,2);
    const note=r.nota?`<div class="lead-city">${escapeHtml(r.nota)}</div>`:'';
    const verif=(r.email==='Verificación pendiente'||r.tel==='Verificación pendiente')?'<span class="lead-verif">Pendiente</span>':'';
    return `<tr>`+
      `<td>${escapeHtml(r.seg)}</td>`+
      `<td><div class="lead-company">${escapeHtml(r.empresa)}</div><div class="lead-city">${escapeHtml(r.ubic)}</div></td>`+
      `<td>${escapeHtml(r.contacto)}</td>`+
      `<td>${escapeHtml(r.email)} ${verif}</td>`+
      `<td>${escapeHtml(r.tel)}</td>`+
      `<td><strong class="lead-ton ton-stable">${pot}</strong>${r.pot==null?'':' <span class="lead-ton-unit">ton</span>'}${note}</td>`+
      `<td>${statusPill(r.status)}</td>`+
    `</tr>`;
  }).join('');
  root.innerHTML=`<div class="bigfish-wrap"><h4><i class="fas fa-database"></i> Base de Leads Potenciales Reales (Triangulada)</h4><p class="insight-muted" style="margin-bottom:8px">Formato decimal <code>es-MX</code> en toneladas. Contactos marcados como "Pendiente" requieren validación en Apollo/LinkedIn/Hunter antes de outreach.</p><div class="leads-table-wrap"><table class="leads-table bigfish-table"><thead><tr><th>Segmento</th><th>Empresa / Lead</th><th>Contacto Clave (Puesto Target)</th><th>Email Corporativo</th><th>Teléfono</th><th>Potencial (Ton)</th><th>Estatus</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function renderSalesScrapingPlaybook(){
  const root=document.getElementById('salesScrapingPlaybook');
  if(!root)return;
  const leads=getViewData().filter(x=>x.tp==='l');
  const realNamed=leads.filter(d=>!d._synth&&!/prospecto territorial/i.test(String(d.n||''))).length;
  const pending=leads.filter(d=>!((d.contacto&&d.contacto.email)||d.email)).length;
  const withContact=Math.max(0,leads.length-pending);
  const noProvider=leads.filter(d=>/sin proveedor/i.test(getProv(d))).length;
  const attackable=leads.filter(d=>{const pv=getProv(d).toLowerCase();return !pv.includes('covia')&&!pv.includes('sin proveedor');}).length;
  const topActions=[...leads].sort((a,b)=>leadRowScore(b)-leadRowScore(a)).slice(0,5);
  const topRows=topActions.map((d,i)=>`<tr><td>${i+1}</td><td><b>${escapeHtml(d.n)}</b><div class="lead-city">${escapeHtml(d.d||'—')}</div></td><td>${escapeHtml(LB[d.s]||d.s)}</td><td>${Math.round(leadRowScore(d))}</td><td>${escapeHtml(getProv(d))}</td><td>${fmtNum(effectiveTonProm(d))} ton</td><td>${/sin proveedor/i.test(getProv(d))?'Entrar con piloto 30d':'Ataque competencia con propuesta de sustitución'}</td></tr>`).join('');
  root.innerHTML=`<h3><i class="fas fa-magnifying-glass-chart"></i> Metodologías de Scraping Comercial (White / Grey / Black)</h3>
  <div class="pred-strip">
    <span><i class="fas fa-building"></i> Leads con nombre real en vista: <b>${fmtNum(realNamed)}</b></span>
    <span><i class="fas fa-envelope-open-text"></i> Leads sin email validado: <b>${fmtNum(pending)}</b></span>
    <span><i class="fas fa-balance-scale"></i> Compliance activo: <b>White + Grey ético</b></span>
  </div>
  <div class="pred-strip" style="margin-top:8px">
    <span><i class="fas fa-address-card"></i> Leads con contacto usable: <b>${fmtNum(withContact)}</b></span>
    <span><i class="fas fa-user-slash"></i> Sin proveedor declarado: <b>${fmtNum(noProvider)}</b></span>
    <span><i class="fas fa-bullseye"></i> Takeover competencia: <b>${fmtNum(attackable)}</b></span>
  </div>
  <div class="products-plant" style="margin-top:10px">
    <h4>Hallazgos accionables para junta comercial</h4>
    <div class="leads-table-wrap">
      <table class="leads-table bigfish-table">
        <thead><tr><th>#</th><th>Cuenta</th><th>Segmento</th><th>Score</th><th>Proveedor</th><th>Ton</th><th>Siguiente acción sugerida</th></tr></thead>
        <tbody>${topRows||'<tr><td colspan="7">Sin leads en el filtro actual.</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  <div class="tech-grid">
    <div class="products-plant"><h4>White Hat · Permitido</h4><ul><li>APIs oficiales (Google Places, Apollo, BuiltWith).</li><li>Google CSE + directorios industriales.</li><li>Rate limits + trazabilidad por fuente.</li></ul></div>
    <div class="products-plant"><h4>Grey Hat · Controlado</h4><ul><li>Dorking público: LinkedIn, X y web corporativa.</li><li>Extracción semiautomática en páginas públicas y reclutamiento (Greenhouse/Lever).</li><li>Parseo de PDF públicos (ferias, licitaciones) + validación humana.</li></ul></div>
    <div class="products-plant"><h4>Black Hat · Prohibido</h4><ul><li>No bypass de login/captcha.</li><li>No scraping de áreas privadas.</li><li>No bases filtradas o sin licencia.</li></ul></div>
  </div>
  <p class="insight-muted" style="margin-top:10px">Playbooks: <a class="bj-link" href="docs/SCRAPING_METHODS_PLAYBOOK.md" target="_blank" rel="noopener noreferrer">SCRAPING_METHODS_PLAYBOOK.md</a> · <a class="bj-link" href="docs/MULTISOURCE_LEAD_PIPELINE.md" target="_blank" rel="noopener noreferrer">MULTISOURCE_LEAD_PIPELINE.md</a></p>`;
}

function renderSalesSignalBoard(){
  const root=document.getElementById('salesSignalBoard');
  if(!root)return;
  const leads=getViewData().filter(x=>x.tp==='l');
  if(!leads.length){
    root.innerHTML='<p class="insight-muted">Sin señales comerciales en la vista actual (no hay leads).</p>';
    return;
  }
  const missingContact=leads.filter(d=>!((d.contacto&&d.contacto.email)||d.email||(d.contacto&&d.contacto.tel)||d.tel_decisor)).sort((a,b)=>leadRowScore(b)-leadRowScore(a)).slice(0,6);
  const quickWins=leads.filter(d=>distMin(d)<=60&&effectiveTonProm(d)>=2500).sort((a,b)=>leadRowScore(b)-leadRowScore(a)).slice(0,6);
  const segComp={};
  leads.forEach(d=>{
    const prov=getProv(d).toLowerCase();
    if(prov.includes('covia')||prov.includes('sin proveedor'))return;
    const k=LB[d.s]||d.s;
    segComp[k]=(segComp[k]||0)+1;
  });
  const compTop=Object.entries(segComp).sort((a,b)=>b[1]-a[1]).slice(0,5);
  root.innerHTML=`
  <h3><i class="fas fa-radar"></i> Signal Board · Hallazgos automáticos para vender</h3>
  <div class="tech-grid">
    <div class="products-plant">
      <h4>Quick wins por cercanía (<=60 km)</h4>
      <ul>${quickWins.map(d=>`<li><b>${escapeHtml(d.n)}</b> · ${escapeHtml(d.d||'—')} · ${fmtNum(effectiveTonProm(d))} ton · score ${Math.round(leadRowScore(d))}</li>`).join('')||'<li>Sin quick wins en este filtro.</li>'}</ul>
    </div>
    <div class="products-plant">
      <h4>Riesgo: leads sin contacto validado</h4>
      <ul>${missingContact.map(d=>`<li><b>${escapeHtml(d.n)}</b> · ${escapeHtml(LB[d.s]||d.s)} · score ${Math.round(leadRowScore(d))}</li>`).join('')||'<li>Todos los leads tienen contacto base.</li>'}</ul>
    </div>
    <div class="products-plant">
      <h4>Segmentos con takeover de competencia</h4>
      <ul>${compTop.map(([k,v])=>`<li><b>${escapeHtml(k)}</b>: ${fmtNum(v)} cuenta(s) con proveedor competidor</li>`).join('')||'<li>Sin segmentos con takeover detectado.</li>'}</ul>
    </div>
  </div>`;
}

let harvestedLeadsCache=null;
let harvestedLeadsLoading=false;
const HARVESTED_GENERIC_RE=/(^|\\b)(que es|preguntas frecuentes|wikipedia|composicion|como se fabrica|tipos de vidrio|propiedades)(\\b|$)/i;
function splitCsvRow(line){
  const out=[];let cur='';let inQ=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(inQ&&line[i+1]==='"'){cur+='"';i++;continue;}
      inQ=!inQ;continue;
    }
    if(ch===','&&!inQ){out.push(cur);cur='';continue;}
    cur+=ch;
  }
  out.push(cur);
  return out.map(x=>x.trim());
}
function parseCsvFast(text){
  const lines=String(text||'').split(/\r?\n/).filter(Boolean);
  if(lines.length<2)return [];
  const headers=splitCsvRow(lines[0]).map(h=>h.trim().toLowerCase());
  return lines.slice(1).map(l=>{
    const cols=splitCsvRow(l);const rec={};
    headers.forEach((h,idx)=>{rec[h]=cols[idx]||'';});
    return rec;
  });
}
async function loadHarvestedLeads(){
  if(Array.isArray(harvestedLeadsCache))return harvestedLeadsCache;
  if(harvestedLeadsLoading)return [];
  harvestedLeadsLoading=true;
  try{
    const res=await fetch(`data/harvested_leads.csv?v=${Date.now()}`);
    if(!res.ok)throw new Error('harvested csv not found');
    const txt=await res.text();
    const parsed=parseCsvFast(txt);
    harvestedLeadsCache=parsed.filter(r=>{
      const company=String(r.company||'').trim();
      const url=String(r.source_url||'');
      if(!company||company.length<3)return false;
      if(HARVESTED_GENERIC_RE.test(company))return false;
      if(/wikipedia|humanidades\.com|quimica\.es|bibliotecadigital/i.test(url))return false;
      return true;
    }).slice(0,1200);
  }catch(err){
    harvestedLeadsCache=[];
  }finally{
    harvestedLeadsLoading=false;
  }
  return harvestedLeadsCache;
}

function renderDataFusionPanels(){
  const root=document.getElementById('dataFusionPanel');
  if(!root)return;
  const leads=getViewData().filter(x=>x.tp==='l');
  if(!leads.length){
    root.innerHTML='<p class="insight-muted">Sin leads en vista para fusionar data avanzada.</p>';
    return;
  }
  const regionAgg={};
  const scoreAgg={};
  const mineralAgg={};
  const supplierAgg={};
  leads.forEach(d=>{
    const meta=getLeadMeta(d,effectiveTonProm(d),leadRowScore(d));
    const reg=meta.region||'N/D';
    const sc=meta.leadScoring||'N/D';
    const sup=meta.supplierOverride||getProv(d)||'N/D';
    regionAgg[reg]=(regionAgg[reg]||0)+1;
    scoreAgg[sc]=(scoreAgg[sc]||0)+1;
    supplierAgg[sup]=(supplierAgg[sup]||0)+1;
    (meta.minerals||['No aplica']).forEach(m=>{mineralAgg[m]=(mineralAgg[m]||0)+1;});
  });
  const topReg=Object.entries(regionAgg).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const topScore=Object.entries(scoreAgg).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const topMineral=Object.entries(mineralAgg).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topSupplier=Object.entries(supplierAgg).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(!Array.isArray(harvestedLeadsCache)&&!harvestedLeadsLoading){
    loadHarvestedLeads().then(()=>renderDataFusionPanels());
  }
  const harvested=Array.isArray(harvestedLeadsCache)?harvestedLeadsCache:[];
  const harvBySeg={};
  harvested.forEach(r=>{
    const sk=String(r.segment||'').toLowerCase();
    if(!sk)return;
    harvBySeg[sk]=(harvBySeg[sk]||0)+1;
  });
  const topHarvSeg=Object.entries(harvBySeg).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const topHarvRows=harvested.slice(0,10).map(r=>`<tr><td>${escapeHtml(r.company||'—')}</td><td>${escapeHtml((LB[r.segment]||r.segment||'—'))}</td><td>${escapeHtml(r.location||'—')}</td><td><a class="bj-link" href="${escapeAttr(r.source_url||'#')}" target="_blank" rel="noopener noreferrer">Fuente</a></td></tr>`).join('');
  root.innerHTML=`
  <h3><i class="fas fa-diagram-project"></i> Data Fusion (XLS + edición + enriquecimiento comercial)</h3>
  <div class="tech-grid">
    <div class="products-plant"><h4>Regiones activas</h4><ul>${topReg.map(([k,v])=>`<li><b>${escapeHtml(k)}</b>: ${fmtNum(v)} lead(s)</li>`).join('')||'<li>Sin región.</li>'}</ul></div>
    <div class="products-plant"><h4>Lead Scoring mix</h4><ul>${topScore.map(([k,v])=>`<li><b>${escapeHtml(k)}</b>: ${fmtNum(v)}</li>`).join('')||'<li>Sin score.</li>'}</ul></div>
    <div class="products-plant"><h4>Minerales detectados</h4><ul>${topMineral.map(([k,v])=>`<li><b>${escapeHtml(k)}</b>: ${fmtNum(v)}</li>`).join('')||'<li>Sin minerales.</li>'}</ul></div>
    <div class="products-plant"><h4>Mapa competitivo proveedor</h4><ul>${topSupplier.map(([k,v])=>`<li><b>${escapeHtml(k)}</b>: ${fmtNum(v)}</li>`).join('')||'<li>Sin proveedor.</li>'}</ul></div>
    <div class="products-plant"><h4>Scraping OSINT válido (archivo harvested)</h4><ul>${topHarvSeg.map(([k,v])=>`<li><b>${escapeHtml(LB[k]||k)}</b>: ${fmtNum(v)} hallazgo(s)</li>`).join('')||`<li>${harvestedLeadsLoading?'Cargando harvested_leads.csv...':'Sin harvested válido'}</li>`}</ul></div>
  </div>
  <div class="leads-table-wrap" style="margin-top:10px"><table class="leads-table bigfish-table"><thead><tr><th>Empresa detectada</th><th>Segmento</th><th>Ubicación</th><th>Fuente</th></tr></thead><tbody>${topHarvRows||'<tr><td colspan="4">Sin leads harvested de calidad en este momento.</td></tr>'}</tbody></table></div>
  <p class="insight-muted" style="margin-top:8px">Este bloque se recalcula con filtros, edición en tabla e importación XLS para llevar el insight a toda la página.</p>`;
}

function loadFollowups(){
  try{
    const raw=localStorage.getItem(FOLLOWUP_KEY);
    const arr=raw?JSON.parse(raw):[];
    return Array.isArray(arr)?arr:[];
  }catch(e){return []}
}
function saveFollowups(arr){
  try{localStorage.setItem(FOLLOWUP_KEY,JSON.stringify(arr.slice(0,1200)))}catch(e){}
}
function followupTodayISO(){return new Date().toISOString().slice(0,10)}
function followupStatusLabel(s){
  const map={nuevo:'nuevo',en_proceso:'en proceso',en_riesgo:'en riesgo',cerrado:'cerrado'};
  return map[s]||'nuevo';
}
function followupLeadOptions(){
  return [...getViewData().filter(d=>d.tp==='l').sort((a,b)=>leadRowScore(b)-leadRowScore(a)).slice(0,80)];
}
function addFollowup(){
  const lead=document.getElementById('fuLead')?.value?.trim()||'';
  const owner=document.getElementById('fuOwner')?.value?.trim()||'';
  const status=document.getElementById('fuStatus')?.value||'nuevo';
  const nextDate=document.getElementById('fuNextDate')?.value||'';
  const note=document.getElementById('fuNote')?.value?.trim()||'';
  if(!lead||!note){alert('Captura Lead y Comentario inicial.');return;}
  const now=Date.now();
  const arr=loadFollowups();
  arr.unshift({
    id:'fu_'+Math.random().toString(36).slice(2,9)+now.toString(36),
    lead,owner:owner||'Sin asignar',status,nextDate,
    createdAt:now,updatedAt:now,
    thread:[{by:'Sistema',text:note,ts:now}]
  });
  saveFollowups(arr);
  ['fuLead','fuOwner','fuNote'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  renderFollowupBoard();
}
function exportFollowupsJSON(){
  const blob=new Blob([JSON.stringify(loadFollowups(),null,2)],{type:'application/json;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='covia_followups.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1200);
}
function exportFollowupsCSV(){
  const rows=loadFollowups().map(r=>({
    id:r.id||'',
    lead:r.lead||'',
    owner:r.owner||'',
    status:r.status||'nuevo',
    nextDate:r.nextDate||'',
    createdAt:new Date(r.createdAt||Date.now()).toISOString(),
    updatedAt:new Date(r.updatedAt||Date.now()).toISOString(),
    comments:(r.thread||[]).map(t=>`${t.by||'Equipo'}|${new Date(t.ts||Date.now()).toISOString()}|${String(t.text||'').replace(/\n/g,' ')}`).join(' || ')
  }));
  dlCSV(toCSV(rows,['id','lead','owner','status','nextDate','createdAt','updatedAt','comments']),'covia_followups.csv');
}
function importFollowupsFile(ev){
  const f=ev?.target?.files?.[0];
  if(!f)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(String(reader.result||'[]'));
      if(!Array.isArray(parsed))throw new Error('Formato inválido');
      const cleaned=parsed.filter(x=>x&&x.lead).map(x=>({
        id:x.id||('fu_'+Math.random().toString(36).slice(2,9)+Date.now().toString(36)),
        lead:String(x.lead||'').trim(),
        owner:String(x.owner||'Sin asignar').trim(),
        status:['nuevo','en_proceso','en_riesgo','cerrado'].includes(x.status)?x.status:'nuevo',
        nextDate:String(x.nextDate||'').slice(0,10),
        createdAt:Number(x.createdAt)||Date.now(),
        updatedAt:Number(x.updatedAt)||Date.now(),
        thread:Array.isArray(x.thread)?x.thread.slice(-40):[]
      }));
      saveFollowups(cleaned);
      renderFollowupBoard();
      alert(`Importación completada: ${cleaned.length} seguimiento(s).`);
    }catch(e){
      alert('No se pudo importar el archivo JSON.');
    }
  };
  reader.readAsText(f);
  ev.target.value='';
}
window.exportFollowupsJSON=exportFollowupsJSON;
window.exportFollowupsCSV=exportFollowupsCSV;
window.importFollowupsFile=importFollowupsFile;
function addFollowupComment(id){
  const inp=document.getElementById('fuThread_'+id);
  const txt=(inp?.value||'').trim();
  if(!txt)return;
  const arr=loadFollowups();
  const ix=arr.findIndex(x=>x.id===id);
  if(ix<0)return;
  const now=Date.now();
  arr[ix].thread=Array.isArray(arr[ix].thread)?arr[ix].thread:[];
  arr[ix].thread.push({by:'Equipo',text:txt,ts:now});
  arr[ix].updatedAt=now;
  saveFollowups(arr);
  if(inp)inp.value='';
  renderFollowupBoard();
}
function deleteFollowup(id){
  if(!confirm('¿Eliminar este seguimiento?'))return;
  const arr=loadFollowups().filter(x=>x.id!==id);
  saveFollowups(arr);
  renderFollowupBoard();
}
window.addFollowup=addFollowup;
window.addFollowupComment=addFollowupComment;
window.deleteFollowup=deleteFollowup;
function renderFollowupBoard(){
  const root=document.getElementById('followupRoot');
  if(!root)return;
  const token=++followupsRenderToken;
  const options=followupLeadOptions();
  const datalist=`<datalist id="fuLeadOptions">${options.map(d=>`<option value="${escapeAttr(d.n)}">${escapeHtml((d.d||'')+' · '+(LB[d.s]||d.s))}</option>`).join('')}</datalist>`;
  const all=loadFollowups();
  const arr=all.filter(r=>{
    const o=String(r.owner||'Sin asignar');
    const st=String(r.status||'nuevo');
    const hay=followupSearchQ?`${r.lead||''} ${o} ${(r.thread||[]).map(t=>t.text||'').join(' ')}`.toLowerCase().includes(followupSearchQ):true;
    const ownerOk=followupOwnerFilter==='all'||o===followupOwnerFilter;
    const statusOk=followupStatusFilter==='all'||st===followupStatusFilter;
    return hay&&ownerOk&&statusOk;
  });
  const today=followupTodayISO();
  const byOwner={};
  all.forEach(x=>{const owner=x.owner||'Sin asignar';byOwner[owner]=(byOwner[owner]||0)+1});
  const allOwners=Object.keys(byOwner).sort((a,b)=>a.localeCompare(b,'es'));
  const ownerStats=Object.entries(byOwner).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`<span class="insight-pill"><b>${escapeHtml(k)}</b>: ${fmtNum(v)}</span>`).join('');
  const overdue=all.filter(r=>r.status!=='cerrado'&&r.nextDate&&r.nextDate<today).length;
  const dueToday=all.filter(r=>r.status!=='cerrado'&&r.nextDate===today).length;
  const closed=all.filter(r=>r.status==='cerrado').length;
  const open=Math.max(0,all.length-closed);
  const byStatus={nuevo:[],en_proceso:[],en_riesgo:[],cerrado:[]};
  all.forEach(r=>{(byStatus[r.status]||byStatus.nuevo).push(r)});
  const kanbanCol=(key,title,icon)=>`<div class="products-plant"><h4><i class="fas ${icon}"></i> ${title} <span class="lead-city">(${fmtNum((byStatus[key]||[]).length)})</span></h4>${(byStatus[key]||[]).slice(0,10).map(r=>`<div class="fu-k-card"><b>${escapeHtml(r.lead)}</b><div class="lead-city">${escapeHtml(r.owner||'Sin asignar')} · ${r.nextDate||'sin fecha'}</div></div>`).join('')||'<div class="lead-city">Sin cuentas.</div>'}</div>`;
  const rows=arr.slice(0,220).map((r,i)=>{
    const thread=(r.thread||[]).slice(-8).map(t=>`<div class="fu-thread-item"><b>${escapeHtml(t.by||'Equipo')}</b> · <span>${new Date(t.ts||Date.now()).toLocaleString('es-MX')}</span><div>${escapeHtml(t.text||'')}</div></div>`).join('');
    const statusCls=r.status==='cerrado'?'cold':r.status==='en_riesgo'?'hot':'mid';
    return `<tr>
      <td>${i+1}</td>
      <td><b>${escapeHtml(r.lead)}</b></td>
      <td>${escapeHtml(r.owner||'Sin asignar')}</td>
      <td><span class="status-pill status-${statusCls}">${escapeHtml((r.status||'nuevo').replace('_',' '))}</span></td>
      <td>${escapeHtml(r.nextDate||'—')}</td>
      <td>${new Date(r.updatedAt||r.createdAt||Date.now()).toLocaleString('es-MX')}</td>
      <td><details><summary>Ver hilo (${(r.thread||[]).length})</summary><div class="fu-thread">${thread||'<div class="fu-thread-item">Sin comentarios.</div>'}<div class="fu-thread-add"><input id="fuThread_${escapeAttr(r.id)}" placeholder="Agregar comentario..."/><button class="exp-btn" type="button" onclick="addFollowupComment('${escapeAttr(r.id)}')">Comentar</button><button class="exp-btn" type="button" onclick="deleteFollowup('${escapeAttr(r.id)}')">Eliminar</button></div></div></details></td>
    </tr>`;
  }).join('');
  if(token!==followupsRenderToken)return;
  root.innerHTML=`
  <div class="pred-strip"><span><i class="fas fa-clipboard-check"></i> Seguimientos: <b>${fmtNum(all.length)}</b></span><span><i class="fas fa-users"></i> Responsables: <b>${fmtNum(Object.keys(byOwner).length)}</b></span><span><i class="fas fa-comments"></i> Hilos: <b>${fmtNum(all.reduce((s,x)=>s+((x.thread||[]).length),0))}</b></span><span><i class="fas fa-triangle-exclamation"></i> Vencidos: <b>${fmtNum(overdue)}</b></span><span><i class="fas fa-calendar-day"></i> Hoy: <b>${fmtNum(dueToday)}</b></span><span><i class="fas fa-check-circle"></i> Cerrados: <b>${fmtNum(closed)}</b></span></div>
  ${ownerStats?`<div class="insight-actions" style="margin-top:8px">${ownerStats}</div>`:''}
  <div class="products-plant" style="margin-top:8px">
    <h4>Filtros y respaldo para juntas</h4>
    <div class="fu-form">
      <input id="fuSearch" placeholder="Buscar en lead/responsable/comentarios..." value="${escapeAttr(followupSearchQ)}"/>
      <select id="fuOwnerFilter"><option value="all">Todos los responsables</option>${allOwners.map(o=>`<option value="${escapeAttr(o)}" ${followupOwnerFilter===o?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>
      <select id="fuStatusFilter"><option value="all">Todos los estatus</option><option value="nuevo" ${followupStatusFilter==='nuevo'?'selected':''}>nuevo</option><option value="en_proceso" ${followupStatusFilter==='en_proceso'?'selected':''}>en proceso</option><option value="en_riesgo" ${followupStatusFilter==='en_riesgo'?'selected':''}>en riesgo</option><option value="cerrado" ${followupStatusFilter==='cerrado'?'selected':''}>cerrado</option></select>
      <button class="exp-btn" type="button" onclick="exportFollowupsCSV()"><i class="fas fa-file-csv"></i> CSV</button>
      <button class="exp-btn" type="button" onclick="exportFollowupsJSON()"><i class="fas fa-file-code"></i> JSON</button>
      <label class="exp-btn" style="display:inline-flex;align-items:center;cursor:pointer"><i class="fas fa-file-import"></i>&nbsp;Importar <input id="fuImportFile" type="file" accept="application/json" style="display:none"/></label>
    </div>
  </div>
  <div class="products-plant" style="margin-top:8px">
    <h4>Nuevo seguimiento</h4>
    ${datalist}
    <div class="fu-form">
      <input id="fuLead" list="fuLeadOptions" placeholder="Lead / Cliente"/>
      <input id="fuOwner" placeholder="Quién lo lleva"/>
      <select id="fuStatus"><option value="nuevo">nuevo</option><option value="en_proceso">en proceso</option><option value="en_riesgo">en riesgo</option><option value="cerrado">cerrado</option></select>
      <input id="fuNextDate" type="date"/>
      <input id="fuNote" placeholder="Comentario inicial / acuerdo de junta"/>
      <button class="exp-btn" type="button" onclick="addFollowup()">Guardar</button>
    </div>
  </div>
  <div class="tech-grid" style="margin-top:10px">
    ${kanbanCol('nuevo','Nuevos','fa-seedling')}
    ${kanbanCol('en_proceso','En proceso','fa-gears')}
    ${kanbanCol('en_riesgo','En riesgo','fa-triangle-exclamation')}
    ${kanbanCol('cerrado','Cerrados','fa-check')}
  </div>
  <div class="leads-table-wrap" style="margin-top:10px">
    <table class="leads-table bigfish-table">
      <thead><tr><th>#</th><th>Lead / Cliente</th><th>Responsable</th><th>Estatus</th><th>Próx. Fecha</th><th>Última actualización</th><th>Hilo</th></tr></thead>
      <tbody>${rows||'<tr><td colspan="7">Aún no hay seguimientos. Registra el primero para junta comercial.</td></tr>'}</tbody>
    </table>
  </div>`;
  const searchEl=document.getElementById('fuSearch');
  const ownerEl=document.getElementById('fuOwnerFilter');
  const statusEl=document.getElementById('fuStatusFilter');
  const importEl=document.getElementById('fuImportFile');
  if(searchEl)searchEl.addEventListener('input',e=>{followupSearchQ=String(e.target.value||'').toLowerCase().trim();renderFollowupBoard()});
  if(ownerEl)ownerEl.addEventListener('change',e=>{followupOwnerFilter=String(e.target.value||'all');renderFollowupBoard()});
  if(statusEl)statusEl.addEventListener('change',e=>{followupStatusFilter=String(e.target.value||'all');renderFollowupBoard()});
  if(importEl)importEl.addEventListener('change',importFollowupsFile);
}

function setKpi(id,val){
  if(_kpiTimers[id]){cancelAnimationFrame(_kpiTimers[id]);clearInterval(_kpiTimers[id]);delete _kpiTimers[id]}
  const el=document.getElementById(id);if(el){el.textContent=val;if(el.dataset.kpiRaw!==undefined)delete el.dataset.kpiRaw}
}
function syncAll(){
  // 1. Map markers
  let v=0;
  const baseFiltered=getFilteredData();
  const hasCatchmentData=baseFiltered.some(withinPlantCatchment);
  mkrs.forEach(m=>{
    const d=D[m.i];
    const segOk=cT==='all'||(cT==='actual'&&d.tp==='a')||d.s===cT;
    const qOk=!cQ||rowMatchesQuery(d,cQ);
    const radOk=hasCatchmentData?withinPlantCatchment(d):true;
    const geoOk=geoMinScore<=0||geoScoreLead(d)>=geoMinScore;
    const strictOk=!geoStrictMapOnly||d.tp==='a'||geoScoreLead(d)>=GEO_STRICT_MIN_SCORE;
    const verifiedOk=!strictVerifiedOnly||isVerifiedBusinessRecord(d);
    if(segOk&&qOk&&radOk&&geoOk&&strictOk&&verifiedOk){m.mk.addTo(map);v++}else m.mk.remove();
  });
  document.getElementById('mC').textContent=v;
  // 2. Table
  rT(cT,cQ);
  // 3. Charts
  updateCharts();
  // 4. KPIs + segment counters (filtered)
  const fd=getViewData();
  const acF=fd.filter(x=>x.tp==='a'),ldF=fd.filter(x=>x.tp==='l');
  const volPot=ldF.reduce((s,d)=>s+effectiveTonProm(d),0);
  const volKpi=computeKpiVolActual(acF);
  animateKpiNum('k1',acF.length,v=>fmtNum(v));
  animateKpiNum('k2',ldF.length,v=>fmtNum(v));
  setKpiSub('k2Sub',computeKpiLeadsSub(ldF.length));
  animateKpiNum('k3',volKpi.ton,v=>formatTonKpi(v));
  setKpiSub('k3Sub',volKpi.sub);
  animateKpiNum('k5',volPot,v=>formatTonPot(v));
  Object.keys(CO).forEach(k=>{
    const el=document.getElementById('sgc-'+k);
    if(el){const cnt=fd.filter(x=>x.s===k&&x.tp==='l').length;
      animateKpiNum('sgc-'+k,cnt,v=>fmtNum(v))}
  });
  renderOpportunityMatrix();
  const segDistinct=new Set(fd.map(d=>d.s)).size;
  animateKpiNum('k6',segDistinct,v=>fmtNum(v));
  const k7r=document.getElementById('k7rad'),k7s=document.getElementById('k7sub');
  if(k7r)k7r.textContent=PLANT_CATCHMENT_KM+' km';
  if(k7s){
    const geo80=fd.filter(d=>geoScoreLead(d)>=80).length;
    const extra=[
      geoMinScore>0?`Geo >= ${geoMinScore} activo`:'Geo sin filtro',
      geoStrictMapOnly?`Mapa ultra estricto >= ${GEO_STRICT_MIN_SCORE}`:'Mapa normal',
      `Geo80: ${fmtNum(geo80)}/${fmtNum(fd.length)}`
    ].join(' · ');
    k7s.textContent=`Radio ≤${PLANT_CATCHMENT_KM} km por planta territorial. ${extra}`;
  }
  const allDist=fd.map(d=>distMin(d));
  const avgKm=allDist.length?Math.round(allDist.reduce((a,b)=>a+b,0)/allDist.length):0;
  if(avgKm){animateKpiNum('k4',avgKm,v=>fmtNum(v)+' km')}else{setKpi('k4','—')}
  renderFilterChips();
  syncSegmentCardHighlight();
  renderAdvancedInsights();
  renderPrescriptiveInsights();
  renderPlantLogisticsStrip();
  updateNationalNarrativeVisibility();
  renderOverlapPanel();
  renderBandejaPlata();
  renderProductsByPlant();
  renderLeadIntelTable();
  renderTriangulatedLeadsTable();
  renderSalesScrapingPlaybook();
  renderSalesSignalBoard();
  renderDataFusionPanels();
  renderFollowupBoard();
  renderMapLeadPreviewPanel();
  renderVibeCarousel();
  setTabVibeHero(currentActiveTab());
  renderKpiDeltas();
}

function syncSegmentCardHighlight(){
  document.querySelectorAll('.sg').forEach(el=>{
    const dc=el.getAttribute('data-c');
    el.classList.toggle('on',!!dc&&cT===dc);
  });
}

function sF(f){
  cT=f;
  document.querySelectorAll('.tb').forEach(b=>{b.classList.remove('on');if(b.dataset.seg===f||(f==='all'&&b.dataset.seg==='all'))b.classList.add('on')});
  syncAll();
}
function qF(s){
  cT=s;
  document.querySelectorAll('.tb').forEach(b=>{b.classList.remove('on');if(b.dataset.seg===s)b.classList.add('on')});
  syncAll();
}
function doSearch(q){
  cQ=q.toLowerCase();
  if(searchDebounceTimer)clearTimeout(searchDebounceTimer);
  searchDebounceTimer=setTimeout(()=>{
    syncAll();
  },90);
}
function toggleGeoTrusted(){
  geoMinScore=geoMinScore>=80?0:80;
  syncAll();
}
window.toggleGeoTrusted=toggleGeoTrusted;
function toggleVerifiedOnlyGlobal(){
  strictVerifiedOnly=!strictVerifiedOnly;
  syncAll();
}
window.toggleVerifiedOnlyGlobal=toggleVerifiedOnlyGlobal;

let chartTop,chartSeg,chartPr,chartDist,chartPie,chartPredScore,chartPredFore,chartPredMix;
function initCh(){
  const L=document.body.classList.contains('covia-light');
  Chart.defaults.color=L?'#475569':'#64748b';
  Chart.defaults.borderColor=L?'rgba(15,23,42,.08)':'rgba(255,255,255,.04)';
  const g=L?'rgba(15,23,42,.08)':'rgba(255,255,255,.03)';
  const ac=D.filter(x=>x.tp==='a');const bs={};ac.forEach(d=>{bs[d.s]=(bs[d.s]||0)+d.v});
  chartPie=new Chart(document.getElementById('pC'),{type:'doughnut',data:{labels:Object.keys(bs).map(k=>LB[k]),datasets:[{data:Object.values(bs),backgroundColor:Object.keys(bs).map(k=>CO[k]),borderWidth:0}]},options:{responsive:true,cutout:'65%',plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}}}});
  const top=[...ac].sort((a,b)=>b.v-a.v).slice(0,12);
  chartTop=new Chart(document.getElementById('tC'),{type:'bar',data:{labels:top.map(d=>d.n.substring(0,13)),datasets:[{data:top.map(d=>d.v),backgroundColor:top.map(d=>CO[d.s]),borderRadius:4,borderWidth:0}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:g}},y:{grid:{display:false},ticks:{font:{size:9}}}}}});
  const sc={};D.filter(x=>x.tp==='l').forEach(d=>{sc[d.s]=(sc[d.s]||0)+1});
  chartSeg=new Chart(document.getElementById('sC'),{type:'doughnut',data:{labels:Object.keys(sc).map(k=>LB[k]),datasets:[{data:Object.values(sc),backgroundColor:Object.keys(sc).map(k=>CO[k]),borderWidth:0}]},options:{responsive:true,cutout:'55%',plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}}}});
  chartPr=new Chart(document.getElementById('prC'),{type:'bar',data:{labels:['Golf','Fracking','Filtración','Vidrio','Cerámica','Deportiva','Encuestre','Construcción','Agricultura'],datasets:[{label:'$/ton',data:[1000,2200,750,800,1100,550,450,400,380],backgroundColor:['#ff6b6b','#8b5cf6','#06b6d4','#3b82f6','#f59e0b','#ff6b6b','#d97706','#f97316','#10b981'],borderRadius:4,borderWidth:0}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:g}},x:{grid:{display:false},ticks:{font:{size:9}}}}}});
  const dA={};const dN={};D.filter(x=>x.tp==='l').forEach(d=>{dA[d.s]=(dA[d.s]||0)+distMin(d);dN[d.s]=(dN[d.s]||0)+1});Object.keys(dA).forEach(k=>dA[k]=Math.round(dA[k]/dN[k]));
  chartDist=new Chart(document.getElementById('dC'),{type:'bar',data:{labels:Object.keys(dA).map(k=>LB[k].substring(0,8)),datasets:[{label:'km',data:Object.values(dA),backgroundColor:Object.keys(dA).map(k=>CO[k]),borderRadius:4,borderWidth:0}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:g}},x:{grid:{display:false},ticks:{font:{size:8}}}}}});
  const elS=document.getElementById('chScoreDist'),elF=document.getElementById('chPotForecast'),elM=document.getElementById('chSegPriority');
  const optsY={responsive:true,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:g}},y:{grid:{display:false},ticks:{font:{size:9}}}}};
  const optsBar={responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:g}},x:{grid:{display:false},ticks:{font:{size:8}}}}};
  if(elS&&!chartPredScore)chartPredScore=new Chart(elS,{type:'bar',data:{labels:['—'],datasets:[{label:'Score ML',data:[0],backgroundColor:'#64748b',borderRadius:4}]},options:{...optsY,indexAxis:'y'}});
  if(elF&&!chartPredFore)chartPredFore=new Chart(elF,{type:'bar',data:{labels:['—'],datasets:[{label:'t potencial ×1.06',data:[0],backgroundColor:'#8b5cf6',borderRadius:4}]},options:optsBar});
  if(elM&&!chartPredMix)chartPredMix=new Chart(elM,{type:'bar',data:{labels:['—'],datasets:[{label:'Σ score IA',data:[0],backgroundColor:'#06b6d4',borderRadius:4}]},options:{...optsY,indexAxis:'y'}});
  updatePredCharts();
}

function updateCharts(){
  const fd=getViewData();
  const ac=fd.filter(x=>x.tp==='a');
  const ld=fd.filter(x=>x.tp==='l');
  const totalV=ac.reduce((s,d)=>s+d.v,0);
  // Pie - mix industry by vol
  const bs={};ac.forEach(d=>{bs[d.s]=(bs[d.s]||0)+d.v});
  if(chartPie){
    const ks=Object.keys(bs);
    if(!ks.length){chartPie.data.labels=['Sin datos'];
      chartPie.data.datasets[0].data=[1];
      chartPie.data.datasets[0].backgroundColor=['#334155'];
    }else{
      chartPie.data.labels=ks.map(k=>LB[k]);
      chartPie.data.datasets[0].data=Object.values(bs);
      chartPie.data.datasets[0].backgroundColor=ks.map(k=>CO[k]);
    }
    chartPie.update();
  }
  // Top clients bar
  if(chartTop){
    const top=[...ac].sort((a,b)=>b.v-a.v).slice(0,12);
    if(!top.length){chartTop.data.labels=['—'];chartTop.data.datasets[0].data=[0];chartTop.data.datasets[0].backgroundColor=['#334155']}
    else{chartTop.data.labels=top.map(d=>d.n.substring(0,13));chartTop.data.datasets[0].data=top.map(d=>d.v);chartTop.data.datasets[0].backgroundColor=top.map(d=>CO[d.s])}
    chartTop.update();
  }
  // Leads by segment
  if(chartSeg){
    const sc={};ld.forEach(d=>{sc[d.s]=(sc[d.s]||0)+1});
    const sk=Object.keys(sc);
    if(!sk.length){chartSeg.data.labels=['Sin leads'];chartSeg.data.datasets[0].data=[1];chartSeg.data.datasets[0].backgroundColor=['#334155']}
    else{chartSeg.data.labels=sk.map(k=>LB[k]);chartSeg.data.datasets[0].data=Object.values(sc);chartSeg.data.datasets[0].backgroundColor=sk.map(k=>CO[k])}
    chartSeg.update();
  }
  // Distance (leads only in filter)
  if(chartDist){
    const dA={};const dN={};ld.forEach(d=>{dA[d.s]=(dA[d.s]||0)+distMin(d);dN[d.s]=(dN[d.s]||0)+1});Object.keys(dA).forEach(k=>dA[k]=Math.round(dA[k]/dN[k]));
    const dk=Object.keys(dA);
    if(!dk.length){chartDist.data.labels=['—'];chartDist.data.datasets[0].data=[0];chartDist.data.datasets[0].backgroundColor=['#334155']}
    else{chartDist.data.labels=dk.map(k=>LB[k].substring(0,8));chartDist.data.datasets[0].data=Object.values(dA);chartDist.data.datasets[0].backgroundColor=dk.map(k=>CO[k])}
    chartDist.update();
  }
  updatePredCharts();
}

function buildScenarioStats(leads){
  const totalPot=leads.reduce((s,d)=>s+effectiveTonProm(d),0);
  const low=Math.round(totalPot*0.92);
  const base=Math.round(totalPot*1.06);
  const high=Math.round(totalPot*1.18);
  const attackable=leads.filter(d=>{const pv=getProv(d).toLowerCase();return !pv.includes('covia')&&!pv.includes('sin proveedor');}).length;
  const noProvider=leads.filter(d=>getProv(d).toLowerCase().includes('sin proveedor')).length;
  const avgScore=leads.length?Math.round(leads.reduce((s,d)=>s+leadRowScore(d),0)/leads.length):0;
  return {totalPot,low,base,high,attackable,noProvider,avgScore};
}

function renderAdvancedInsights(){
  const el=document.getElementById('insightPanel');
  if(!el)return;
  const fd=getViewData();
  const ld=fd.filter(x=>x.tp==='l'),ac=fd.filter(x=>x.tp==='a');
  if(!ld.length&&!ac.length){el.innerHTML='<p class="insight-muted">Sin datos en vista: revisa segmento/búsqueda o amplía el área (cuentas a ≤'+PLANT_CATCHMENT_KM+' km de la planta activa).</p>';return}
  const scored=ld.map(d=>({d,score:leadRowScore(d)})).sort((a,b)=>b.score-a.score).slice(0,5);
  const potBySeg={};
  ld.forEach(d=>{potBySeg[d.s]=(potBySeg[d.s]||0)+effectiveTonProm(d)});
  const topSeg=Object.entries(potBySeg).sort((a,b)=>b[1]-a[1])[0];
  const scen=buildScenarioStats(ld);
  const forecast=scen.base;
  const sinProv=scen.noProvider;
  const pills=[];
  if(topSeg)pills.push(`Priorizar <b>${LB[topSeg[0]]}</b>: mayor tonelaje potencial agregado.`);
  if(sinProv)pills.push(`<b>${sinProv}</b> lead(s) sin proveedor — candidatos a primer contacto.`);
  if(scen.attackable)pills.push(`<b>${scen.attackable}</b> cuenta(s) con proveedor NO Covia — objetivo takeover.`);
  if(scen.avgScore)pills.push(`Score promedio en vista: <b>${scen.avgScore}</b>`);
  if(scored[0])pills.push(`Top score: <b>${scored[0].d.n}</b> · ${distMin(scored[0].d).toFixed(0)} km a planta.`);
  const recos=scored.slice(0,4).map((x,i)=>{
    const pv=getProv(x.d);
    const action=/covia/i.test(pv)
      ?'Proteger contrato y ampliar SKU.'
      :(/sin proveedor/i.test(pv)?'Oferta fast-track + muestra técnica.':'Ataque competitivo: piloto + TCO comparativo.');
    return `<li><span class="ir-rank">${i+1}</span><span><b>${escapeHtml(x.d.n)}</b> · ${escapeHtml(LB[x.d.s])} · ${fmtNum(effectiveTonProm(x.d))} t<br><small>${escapeHtml(action)}</small></span></li>`;
  }).join('');
  const rows=scored.length?scored.map((x,i)=>`<tr><td>${i+1}</td><td>${x.d.n.substring(0,32)}</td><td>${LB[x.d.s]}</td><td>${Math.round(x.score)}</td><td>${distMin(x.d).toFixed(0)}</td><td class="insight-src">${leadSourceLinksHtml(x.d)}</td></tr>`).join(''):'<tr><td colspan="6">Sin leads en filtro</td></tr>';
  el.innerHTML=`<div class="insight-grid"><div class="insight-card"><div class="insight-lbl">Forecast Base</div><div class="insight-val">~${fmtNum(forecast)} t</div><div class="insight-sub">Escenario comercial base (+6%)</div></div><div class="insight-card"><div class="insight-lbl">Volumen Potencial</div><div class="insight-val">${fmtNum(scen.totalPot)} t</div><div class="insight-sub">${topSeg?`Segmento líder: ${LB[topSeg[0]]}`:'Sin segmento líder en filtro'}</div></div><div class="insight-card"><div class="insight-lbl">Takeover Competencia</div><div class="insight-val">${fmtNum(scen.attackable)}</div><div class="insight-sub">Cuentas con proveedor NO Covia</div></div></div><div class="insight-scenarios"><div class="insight-scenario"><span>Conservador</span><b>${fmtNum(scen.low)} t</b></div><div class="insight-scenario"><span>Base</span><b>${fmtNum(scen.base)} t</b></div><div class="insight-scenario"><span>Agresivo</span><b>${fmtNum(scen.high)} t</b></div></div><div class="insight-actions">${pills.map(p=>`<span class="insight-pill" title="Derivado de leads filtrados en el tablero">${p}</span>`).join('')}</div><div class="insight-reco"><h4>Recomendaciones prescriptivas inmediatas</h4><ul class="insight-reco-list">${recos||'<li><span>—</span><span>Sin recomendaciones en este filtro.</span></li>'}</ul></div><table class="insight-table"><thead><tr><th>#</th><th>Lead</th><th>Segmento</th><th>Score</th><th>km</th><th title="🔖 Fuentes en registro (si existen) + Google + Maps + contacto">Info+</th></tr></thead><tbody>${rows}</tbody></table><p class="insight-foot">Modelos avanzados (Prophet, sklearn, OR-Tools): carpeta <code>analytics/</code>. <strong>Vista:</strong> solo cuentas con distancia mínima a la(s) planta(s) seleccionada(s) ≤ <strong>${PLANT_CATCHMENT_KM} km</strong>. <strong>Info+:</strong> enlaces externos; dato base = registro Covia.</p>`;
}

function updatePredCharts(){
  const fd=getViewData().filter(x=>x.tp==='l');
  const strip=document.getElementById('predInsightStrip');
  if(strip){
    const scen=buildScenarioStats(fd);
    strip.innerHTML=`<div class="pred-strip"><span><i class="fas fa-chart-line"></i> Potencial agregado: <b>${fmtNum(scen.totalPot)} t</b></span><span><i class="fas fa-robot"></i> Score ML medio: <b>${fmtNum(scen.avgScore)}</b></span><span><i class="fas fa-rocket"></i> Base +6%: <b>${fmtNum(scen.base)} t</b></span><span><i class="fas fa-bullseye"></i> Takeover: <b>${fmtNum(scen.attackable)}</b></span><span><i class="fas fa-filter"></i> Leads: <b>${fmtNum(fd.length)}</b></span></div>`;
  }
  if(!fd.length){
    if(chartPredScore){chartPredScore.data.labels=['Sin leads'];chartPredScore.data.datasets[0].data=[0];chartPredScore.data.datasets[0].backgroundColor=['#64748b'];chartPredScore.update()}
    if(chartPredFore){chartPredFore.data.labels=['—'];chartPredFore.data.datasets[0].data=[0];chartPredFore.update()}
    if(chartPredMix){chartPredMix.data.labels=['—'];chartPredMix.data.datasets[0].data=[0];chartPredMix.update()}
    return
  }
  const scored=fd.map(d=>({d,s:leadRowScore(d)})).sort((a,b)=>b.s-a.s).slice(0,14);
  if(chartPredScore){
    chartPredScore.data.labels=scored.map(x=>x.d.n.substring(0,20));
    chartPredScore.data.datasets[0].data=scored.map(x=>Math.round(x.s));
    chartPredScore.data.datasets[0].backgroundColor=scored.map(x=>CO[x.d.s]);
    chartPredScore.update();
  }
  const potBySeg={};
  fd.forEach(d=>{potBySeg[d.s]=(potBySeg[d.s]||0)+effectiveTonProm(d)});
  const sk=Object.keys(potBySeg).sort((a,b)=>potBySeg[b]-potBySeg[a]);
  if(chartPredFore){
    chartPredFore.data.labels=sk.map(k=>LB[k].substring(0,12));
    chartPredFore.data.datasets[0].data=sk.map(k=>Math.round(potBySeg[k]*1.06));
    chartPredFore.data.datasets[0].backgroundColor=sk.map(k=>CO[k]);
    chartPredFore.update();
  }
  const priBySeg={};
  fd.forEach(d=>{priBySeg[d.s]=(priBySeg[d.s]||0)+leadRowScore(d)});
  const sk2=Object.keys(priBySeg).sort((a,b)=>priBySeg[b]-priBySeg[a]).slice(0,12);
  if(chartPredMix){
    chartPredMix.data.labels=sk2.map(k=>LB[k].substring(0,14));
    chartPredMix.data.datasets[0].data=sk2.map(k=>Math.round(priBySeg[k]));
    chartPredMix.data.datasets[0].backgroundColor=sk2.map(k=>CO[k]);
    chartPredMix.update();
  }
}

// ========== EXCEL/CSV EXPORT ==========
function toCSV(rows,cols){
  const hdr=cols.map(c=>c.h).join(',');
  const body=rows.map(r=>cols.map(c=>{const v=String(c.v(r));return v.includes(',')||v.includes('"')||v.includes('\n')?`"${v.replace(/"/g,'""')}"`:v}).join(',')).join('\n');
  return hdr+'\n'+body;
}
function dlCSV(csv,name){
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name+'.csv';document.body.appendChild(a);a.click();document.body.removeChild(a);
}
function toStyledExcelHtml({title,subtitle,columns,rows,fileName}){
  const now=new Date();
  const user=currentSessionUser();
  const dateTxt=now.toLocaleString('es-MX');
  const head=columns.map(c=>`<th>${escapeHtml(c.h)}</th>`).join('');
  const body=(rows||[]).map(r=>{
    const tds=columns.map(c=>{
      const raw=c.v(r);
      const v=raw==null?'':String(raw);
      const isNum=/^-?\d+([.,]\d+)?$/.test(v.replace(/\s/g,''));
      return `<td class="${isNum?'num':''}">${escapeHtml(v)}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(fileName||title||'Export')}</title><style>
    body{font-family:Segoe UI,Arial,sans-serif;margin:18px;background:#f6f9fc;color:#0f172a}
    .wrap{border:1px solid #dbe7f3;border-radius:14px;overflow:hidden;background:white;box-shadow:0 10px 26px rgba(15,23,42,.08)}
    .hero{padding:16px 18px;background:linear-gradient(135deg,#003f72,#00a3e0);color:white}
    .hero h1{margin:0;font-size:20px;letter-spacing:.2px}
    .hero p{margin:6px 0 0;font-size:12px;opacity:.95}
    .meta{display:flex;gap:18px;flex-wrap:wrap;padding:10px 18px;background:#f1f7ff;border-top:1px solid rgba(255,255,255,.28);color:#0b3a66;font-size:11px}
    table{width:100%;border-collapse:collapse}
    thead th{background:#0b5f97;color:#fff;padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:.04em;border-right:1px solid rgba(255,255,255,.15)}
    tbody td{padding:8px;border-bottom:1px solid #e8eef5;border-right:1px solid #edf3f9;font-size:11px;vertical-align:top}
    tbody tr:nth-child(even){background:#f9fcff}
    tbody tr:hover{background:#edf7ff}
    td.num{text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:#0b4f78}
  </style></head><body>
  <div class="wrap">
    <div class="hero"><h1>${escapeHtml(title||'Exportación')}</h1><p>${escapeHtml(subtitle||'Reporte generado')}</p></div>
    <div class="meta"><span><b>Generado:</b> ${escapeHtml(dateTxt)}</span><span><b>Usuario:</b> ${escapeHtml(user)}</span><span><b>Archivo:</b> ${escapeHtml(fileName||'reporte.xls')}</span></div>
    <table><thead><tr>${head}</tr></thead><tbody>${body||`<tr><td colspan="${columns.length||1}">Sin datos</td></tr>`}</tbody></table>
  </div>
  </body></html>`;
}
function dlStyledExcel(html,name){
  const blob=new Blob(['\uFEFF'+html],{type:'application/vnd.ms-excel;charset=utf-8;'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name+'.xls';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
}
function exportPrettyTable(rows,columns,fileName,title,subtitle){
  const html=toStyledExcelHtml({title,subtitle,columns,rows,fileName});
  dlStyledExcel(html,fileName);
}
function exportDirectorio(){
  const rows=getViewData().sort((a,b)=>(b.v||0)-(a.v||0));
  const columns=[
    {h:'#',v:d=>d._i},{h:'Empresa',v:d=>d.n},{h:'Segmento',v:d=>LB[d.s]},
    {h:'Tipo',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).tipo},
    {h:'Mineral',v:d=>(getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).minerals||[]).join(' | ')},
    {h:'Lead Scoring',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).leadScoring},
    {h:'Región',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).region},
    {h:'Vendedor',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).vendedor},
    {h:'LastModified',v:d=>leadLastModifiedLabel(getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)))},
    {h:'Proveedor Actual',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).supplierOverride||getProv(d)},
    {h:'End Market Description',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).endMarket||inferMercado(d)},
    {h:'Sub-market',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).subMarket||''},
    {h:'Product',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).product||d.p||''},
    {h:'Plant Name',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).plantName||((nearestPlant(d)||{}).label||'')},
    {h:'Customer group',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).customerGroup||''},
    {h:'Market Group',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).marketGroup||''},
    {h:'2025 FY ST',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).fy2025||''},
    {h:'Observaciones',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).observations||''},
    {h:'Ubicacion',v:d=>d.d},
    {h:'Distancia KM',v:d=>distMin(d).toFixed(0)},
    {h:'Mercado_vertical',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).endMarket||inferMercado(d)},
    {h:'Ton_prom_efectivo',v:d=>String(Math.round(effectiveTonProm(d)))},
    {h:'Score_ML',v:d=>Math.round(leadRowScore(d)).toString()},
    {h:'Volumen Ton',v:d=>d.tp==='a'?d.v:''},{h:'Potencial Ton',v:d=>d.tp==='l'?(d.pot||''):''},
    {h:'Producto',v:d=>d.p},{h:'Contacto',v:d=>d.t||''},
    {h:'URL_Buscar_Google',v:d=>googleSearchUrl(((d.n||'')+' '+(d.d||'')).trim())},
    {h:'URL_Maps',v:d=>mapsUrlForLead(d)}
  ];
  const label=cT==='all'?'Todos':cT==='actual'?'Clientes_Actuales':(LB[cT]||cT);
  const file=`COVIA_Directorio_${label}_${new Date().toISOString().slice(0,10)}`;
  exportPrettyTable(rows.map((d,i)=>({...d,_i:i+1})),columns,file,'COVIA MÉXICO · Directorio Completo',`Filtro activo: ${label}`);
}
function exportTopClientes(){
  const rows=getViewData().filter(x=>x.tp==='a').sort((a,b)=>b.v-a.v);
  const columns=[
    {h:'#',v:d=>d._i},{h:'Empresa',v:d=>d.n},{h:'Segmento',v:d=>LB[d.s]},
    {h:'Región',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).region},
    {h:'Mercado_vertical',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).endMarket||inferMercado(d)},
    {h:'Volumen Ton/Año',v:d=>d.v},{h:'Producto',v:d=>d.p},
    {h:'Proveedor Actual',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).supplierOverride||getProv(d)},
    {h:'Ubicacion',v:d=>d.d},{h:'Distancia KM',v:d=>distMin(d).toFixed(0)},{h:'Contacto',v:d=>d.t||''}
  ];
  const file='COVIA_Top_Clientes_'+new Date().toISOString().slice(0,10);
  exportPrettyTable(rows.map((d,i)=>({...d,_i:i+1})),columns,file,'COVIA MÉXICO · Top Clientes','Clientes actuales ordenados por volumen');
}
function exportLeadsSeg(){
  const rows=getViewData().filter(x=>x.tp==='l');
  const columns=[
    {h:'#',v:d=>d._i},{h:'Empresa',v:d=>d.n},{h:'Segmento',v:d=>LB[d.s]},
    {h:'Tipo',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).tipo},
    {h:'Mineral',v:d=>(getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).minerals||[]).join(' | ')},
    {h:'Lead Scoring',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).leadScoring},
    {h:'Región',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).region},
    {h:'Vendedor',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).vendedor},
    {h:'Mercado_vertical',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).endMarket||inferMercado(d)},
    {h:'Potencial Ton',v:d=>d.pot||''},{h:'Ton_prom_efectivo',v:d=>String(Math.round(effectiveTonProm(d)))},{h:'Producto',v:d=>d.p},
    {h:'Proveedor Actual',v:d=>getLeadMeta(d,effectiveTonProm(d),leadRowScore(d)).supplierOverride||getProv(d)},{h:'Ubicacion',v:d=>d.d},
    {h:'Distancia KM',v:d=>distMin(d).toFixed(0)},{h:'Contacto',v:d=>d.t||''},
    {h:'URL_Buscar_Google',v:d=>googleSearchUrl(((d.n||'')+' '+(d.d||'')).trim())},
    {h:'URL_Maps',v:d=>mapsUrlForLead(d)}
  ];
  const file='COVIA_Leads_'+new Date().toISOString().slice(0,10);
  exportPrettyTable(rows.map((d,i)=>({...d,_i:i+1})),columns,file,'COVIA MÉXICO · Leads por Segmento','Leads prospectados con enriquecimiento');
}
function exportMixIndustria(){
  const ac=getViewData().filter(x=>x.tp==='a');
  const totalV=ac.reduce((s,d)=>s+d.v,0);
  const sv={};ac.forEach(d=>{sv[d.s]=(sv[d.s]||0)+d.v});
  const rows=Object.entries(sv).sort((a,b)=>b[1]-a[1]).map(([k,v],i)=>({_i:i+1,seg:LB[k],vol:v,pct:totalV?(v/totalV*100).toFixed(1)+'%':'0%'}));
  const columns=[{h:'#',v:d=>d._i},{h:'Segmento',v:d=>d.seg},{h:'Volumen Ton',v:d=>d.vol},{h:'% del Total',v:d=>d.pct}];
  const file='COVIA_Mix_Industria_'+new Date().toISOString().slice(0,10);
  exportPrettyTable(rows,columns,file,'COVIA MÉXICO · Mix Industria','Distribución de volumen por segmento');
}
function exportDistancias(){
  const fd=getViewData();
  const dA={};const dN={};fd.forEach(d=>{dA[d.s]=(dA[d.s]||0)+distMin(d);dN[d.s]=(dN[d.s]||0)+1});
  const rows=Object.keys(dA).map((k,i)=>({_i:i+1,seg:LB[k],prom:Math.round(dA[k]/dN[k]),n:dN[k]})).sort((a,b)=>a.prom-b.prom);
  const columns=[{h:'#',v:d=>d._i},{h:'Segmento',v:d=>d.seg},{h:'Dist Promedio KM',v:d=>d.prom},{h:'# Empresas',v:d=>d.n}];
  const file='COVIA_Distancias_'+new Date().toISOString().slice(0,10);
  exportPrettyTable(rows,columns,file,'COVIA MÉXICO · Distancias','Distancia promedio por segmento');
}
function exportPrecios(){
  const rows=[
    {seg:'Golf',precio:1000},{seg:'Fracking',precio:2200},{seg:'Filtración',precio:750},
    {seg:'Vidrio',precio:800},{seg:'Cerámica',precio:1100},{seg:'Deportiva',precio:550},
    {seg:'Encuestre',precio:450},{seg:'Construcción',precio:400},{seg:'Agricultura',precio:380}
  ].map((r,i)=>({_i:i+1,...r}));
  const columns=[{h:'#',v:d=>d._i},{h:'Segmento',v:d=>d.seg},{h:'Precio USD/Ton',v:d=>d.precio}];
  const file='COVIA_Precios_Segmento_'+new Date().toISOString().slice(0,10);
  exportPrettyTable(rows,columns,file,'COVIA MÉXICO · Precio por Segmento','Referencia comercial USD/Ton');
}
function exportGeoIssues(){
  const rows=D
    .filter(d=>d.tp==='l')
    .map((d,i)=>({
      _i:i+1,
      empresa:d.n||'',
      segmento:LB[d.s]||d.s||'',
      ubicacion:d.d||'',
      lat:Number(d.lat||0),
      lng:Number(d.lng||0),
      geoScore:geoScoreLead(d),
      geoGrade:d._geoGrade||'',
      geoAdj:d._geoAdj||'',
      planta:(nearestPlant(d)||{}).short||'',
      distKm:Math.round(distMin(d)),
      proveedor:getProv(d)||'',
      fuente:String(d._src||d.src||'')
    }))
    .filter(r=>r.geoScore<80)
    .sort((a,b)=>a.geoScore-b.geoScore);
  if(!rows.length){alert('No hay issues geográficos bajo 80 en la vista actual.');return;}
  const columns=[
    {h:'#',v:d=>d._i},{h:'Empresa',v:d=>d.empresa},{h:'Segmento',v:d=>d.segmento},
    {h:'Ubicación',v:d=>d.ubicacion},{h:'Lat',v:d=>d.lat},{h:'Lng',v:d=>d.lng},
    {h:'GeoScore',v:d=>d.geoScore},{h:'GeoGrade',v:d=>d.geoGrade},{h:'Ajuste',v:d=>d.geoAdj},
    {h:'Planta Territorial',v:d=>d.planta},{h:'Distancia KM',v:d=>d.distKm},
    {h:'Proveedor',v:d=>d.proveedor},{h:'Fuente',v:d=>d.fuente}
  ];
  const file='COVIA_GeoIssues_'+new Date().toISOString().slice(0,10);
  exportPrettyTable(rows,columns,file,'COVIA MÉXICO · Geo Issues','Registros con confiabilidad geográfica menor a 80');
}
window.exportGeoIssues=exportGeoIssues;

function initTb(){
  const tabs=[{k:'all',l:'Todos'},...Object.keys(CO).map(k=>({k,l:LB[k]}))];
  document.getElementById('tB').innerHTML=tabs.map(t=>`<button class="tb${t.k==='all'?' on':''}" data-seg="${t.k}" onclick="swT('${t.k}',this)">${t.l}</button>`).join('');
  rT(cT,cQ);
}
function swT(k,el){
  cT=k;
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  syncAll();
}
const PROV_DEF={filtracion:'Silmex/Importación',fracking:'US Silica/Hi-Crush',agricola:'Perlita local',reciclaje:'Arenas regionales',deportiva:'Sin proveedor',cuestre:'Sin proveedor',vidrio:'Covia',ceramica:'Covia',fundicion:'Covia',construccion:'Covia',fibra:'Covia'};
function getProv(d){return d.prov||PROV_DEF[d.s]||'Desconocido'}
function rowMatchesQuery(d,q){
  if(!q)return true;
  const lb=(LB[d.s]||'').toLowerCase();
  const meta=getLeadMeta(d,effectiveTonProm(d),leadRowScore(d));
  const metaTxt=`${meta.tipo||''} ${(meta.minerals||[]).join(' ')} ${meta.leadScoring||''} ${meta.region||''} ${meta.vendedor||''} ${meta.observations||''} ${meta.supplierOverride||''} ${meta.endMarket||''} ${meta.subMarket||''} ${meta.marketGroup||''}`.toLowerCase();
  if(q==='encuestre'&&d.s==='cuestre')return true;
  return d.n.toLowerCase().includes(q)||d.d.toLowerCase().includes(q)||d.p.toLowerCase().includes(q)||d.s.includes(q)||lb.includes(q)||getProv(d).toLowerCase().includes(q)||metaTxt.includes(q);
}
/** Conteos de chips: búsqueda cQ + radio planta(s) activa(s) */
function countWithQ(rows){
  let r=rows;
  if(cQ)r=r.filter(d=>rowMatchesQuery(d,cQ));
  if(geoMinScore>0)r=r.filter(d=>geoScoreLead(d)>=geoMinScore);
  if(strictVerifiedOnly)r=r.filter(isVerifiedBusinessRecord);
  return applyCatchmentSafe(r).length;
}
function renderFilterChips(){
  const b=document.getElementById('fB');if(!b)return;
  const cs=[{k:'all',l:'Todos',c:countWithQ(D)},{k:'actual',l:'✅ Actuales',c:countWithQ(D.filter(x=>x.tp==='a'))}];
  Object.keys(CO).forEach(k=>cs.push({k,l:LB[k],c:countWithQ(D.filter(x=>x.s===k))}));
  const geoCount=countWithQ(D.filter(x=>geoScoreLead(x)>=80));
  const verCount=countWithQ(D.filter(isVerifiedBusinessRecord));
  b.innerHTML=cs.map(c=>`<span class="ch${c.k===cT?' on':''}" data-c="${c.k}" onclick="sF('${c.k}')">${c.l} (${c.c})</span>`).join('')+`<span class="ch${geoMinScore>=80?' on':''}" onclick="toggleGeoTrusted()" title="Solo coordenadas confiables (GeoScore >= 80)">Geo confiable (${geoCount})</span><span class="ch${strictVerifiedOnly?' on':''}" onclick="toggleVerifiedOnlyGlobal()" title="Solo cuentas con señal verificable de cliente real">Solo verificadas (${verCount})</span>`;
}
function provColor(p){if(p==='Covia')return'background:#10b981';if(p.includes('Sin'))return'background:#6b7280';if(p.includes('Import')||p.includes('US'))return'background:#ef4444';if(p.includes('local')||p.includes('regional'))return'background:#f59e0b';if(p.includes('Licit'))return'background:#8b5cf6';return'background:#64748b'}
function tableSortValue(d,key){
  const et=effectiveTonProm(d);
  const sc=leadRowScore(d);
  const meta=getLeadMeta(d,et,sc);
  switch(key){
    case 'empresa':return String(d.n||'').toLowerCase();
    case 'segmento':return String(LB[d.s]||d.s||'').toLowerCase();
    case 'mercado':return String(inferMercado(d)||'').toLowerCase();
    case 'tipo':return d.tp==='a'?0:1;
    case 'tipo_estado':return String(meta.tipo||'').toLowerCase();
    case 'mineral':return String((meta.minerals||[]).join(' | ')||'').toLowerCase();
    case 'leadscoring':return String(meta.leadScoring||'').toLowerCase();
    case 'region':return String(meta.region||'').toLowerCase();
    case 'vendedor':return String(meta.vendedor||'').toLowerCase();
    case 'lastmodified':return Number(meta.lastModifiedAt||0);
    case 'supplierx':return String(meta.supplierOverride||getProv(d)||'').toLowerCase();
    case 'endmarket':return String(meta.endMarket||inferMercado(d)||'').toLowerCase();
    case 'submarket':return String(meta.subMarket||'').toLowerCase();
    case 'fy2025':return Number(String(meta.fy2025||'').replace(/[^0-9.-]/g,''))||0;
    case 'proveedor':return String(getProv(d)||'').toLowerCase();
    case 'ubicacion':return String(d.d||'').toLowerCase();
    case 'planta':return String((nearestPlant(d)||{}).short||'').toLowerCase();
    case 'dist':return distMin(d);
    case 'ton':return effectiveTonProm(d);
    case 'score':return leadRowScore(d);
    case 'geoscore':return geoScoreLead(d);
    case 'volpot':return d.tp==='a'?(Number(d.v)||0):effectiveTonProm(d);
    case 'productos':return String(d.p||'').toLowerCase();
    case 'contacto':return String(d.t||'').toLowerCase();
    default:return String(d.n||'').toLowerCase();
  }
}
function sortRowsForTable(rows){
  const arr=[...rows];
  arr.sort((a,b)=>{
    const av=tableSortValue(a,tableSortKey);
    const bv=tableSortValue(b,tableSortKey);
    let cmp=0;
    if(typeof av==='number'&&typeof bv==='number')cmp=av-bv;
    else cmp=String(av).localeCompare(String(bv),'es',{sensitivity:'base'});
    if(cmp===0)cmp=String(a.n||'').localeCompare(String(b.n||''),'es',{sensitivity:'base'});
    return tableSortDir==='asc'?cmp:-cmp;
  });
  return arr;
}
function setTableSort(key){
  if(tableSortKey===key)tableSortDir=tableSortDir==='asc'?'desc':'asc';
  else{
    tableSortKey=key;
    tableSortDir=['dist','ton','score','volpot'].includes(key)?'desc':'asc';
  }
  syncAll();
}
window.setTableSort=setTableSort;
function rT(k,q){
  q=q!==undefined?q:(cQ||(document.getElementById('sI').value||'').toLowerCase());
  let rows=D;
  if(k==='actual') rows=rows.filter(d=>d.tp==='a');
  else   if(k!=='all') rows=rows.filter(d=>d.s===k);
  if(q)rows=rows.filter(d=>rowMatchesQuery(d,q));
  if(geoMinScore>0)rows=rows.filter(d=>geoScoreLead(d)>=geoMinScore);
  if(strictVerifiedOnly)rows=rows.filter(isVerifiedBusinessRecord);
  rows=applyCatchmentSafe(rows);
  rows=sortRowsForTable(rows);
  const isLight=document.body.classList.contains('covia-light');
  const bc={vidrio:'background:#3b82f6',ceramica:'background:#f59e0b',fundicion:'background:#a855f7',construccion:'background:#14b8a6',fibra:'background:#ec4899',deportiva:'background:#ff6b6b',cuestre:'background:#d97706',filtracion:'background:#06b6d4',fracking:'background:#8b5cf6',agricola:'background:#10b981',reciclaje:'background:#f97316'};
  const typeOpts=(v)=>LEAD_TYPE_OPTIONS.map(x=>`<option value="${escapeAttr(x)}" ${v===x?'selected':''}>${escapeHtml(x)}</option>`).join('');
  const scoreOpts=(v)=>LEAD_SCORE_OPTIONS.map(x=>`<option value="${escapeAttr(x)}" ${v===x?'selected':''}>${escapeHtml(x)}</option>`).join('');
  const regionOpts=(v)=>REGION_OPTIONS.map(x=>`<option value="${escapeAttr(x)}" ${v===x?'selected':''}>${escapeHtml(x)}</option>`).join('');
  const mineralOpts=(vals)=>MINERAL_OPTIONS.map(x=>`<option value="${escapeAttr(x)}" ${(vals||[]).includes(x)?'selected':''}>${escapeHtml(x)}</option>`).join('');
  const hs=(key,label,title='')=>{
    const arrow=tableSortKey===key?(tableSortDir==='asc'?' ▲':' ▼'):'';
    const tip=title?` title="${escapeAttr(title)}"`:'';
    return `<th class="sth" data-k="${key}" onclick="setTableSort('${key}')"${tip}>${label}${arrow}</th>`;
  };
  document.getElementById('tH').innerHTML='<tr><th>#</th>'+
    hs('empresa','Empresa')+
    hs('segmento','Segmento')+
    hs('mercado','Mercado','Mercado / vertical inferido')+
    hs('tipo_estado','Tipo')+
    hs('mineral','Mineral')+
    hs('leadscoring','Lead Scoring')+
    hs('region','Región')+
    hs('vendedor','Vendedor')+
    hs('lastmodified','LastModified')+
    hs('supplierx','Proveedor Actual')+
    hs('endmarket','End Market')+
    hs('submarket','Sub-market')+
    hs('fy2025','2025 FY ST')+
    hs('ubicacion','Ubicación')+
    hs('planta','Planta','Planta territorial: más cercana en todo el catálogo Covia; debes tenerla en el filtro y ≤'+PLANT_CATCHMENT_KM+' km')+
    hs('dist','Dist.')+
    hs('ton','Ton. (prom./año)','Cliente: volumen anual. Lead: ton. prom. potencial (estimado, nunca vacío)')+
    hs('score','Score ML','Score ML: potencial × peso segmento × cercanía × brecha proveedor × calidad de dato (hover en celda)')+
    hs('geoscore','GeoScore','Confiabilidad geográfica (0-100). 80+ recomendado')+
    hs('volpot','Vol/Pot')+
    hs('productos','Productos')+
    '<th title="Google, Maps y web/tel del registro — ampliar fuera del tablero">Info+</th>'+
    hs('contacto','Contacto')+
    '</tr>';
  document.getElementById('tBd').innerHTML=rows.map((d,i)=>{
    const own=nearestPlant(d);
    const km=distMin(d).toFixed(0),pv=getProv(d),potRaw=getPotAvg(d),et=effectiveTonProm(d),sc=leadRowScore(d),merc=inferMercado(d);
    const leadId=leadIntelId(d);
    const meta=getLeadMeta(d,et,sc);
    // Light-mode adaptive colors
    const tonColor=isLight?'#b45309':'#fbbf24';
    const mutedColor=isLight?'#64748b':'#94a3b8';
    const tonProm=`<b style="color:${tonColor};font-weight:700">${et.toLocaleString()}</b> <span style="color:${mutedColor};font-size:.72rem">t</span>${d.tp==='a'?` <span style="font-size:.65rem;color:${mutedColor}" title="Volumen anual registrado">act.</span>`:` <span style="font-size:.65rem;color:${mutedColor}" title="Potencial estimado">est.</span>`}`;
    const scHue=sc>1500?160:sc>800?200:sc>400?45:210;
    const scBg=isLight
      ?`background:linear-gradient(135deg,hsl(${scHue},60%,42%),hsl(${scHue},55%,34%))`
      :`background:linear-gradient(135deg,hsl(${scHue},65%,36%),hsl(${scHue},55%,26%))`;
    const scTip=escapeAttr(leadScoreTooltip(d));
    const scoreCell=`<span class="bd" style="${scBg};font-weight:800;min-width:42px;display:inline-block;text-align:center;cursor:help;color:#fff" title="${scTip}">${Math.round(sc)}</span>`;
    const potCell=d.tp==='a'?`<b>${d.v.toLocaleString()}</b> ton`:`<span style="color:${tonColor};font-weight:600">${d.pot||'N/A'}</span> ton <span style="color:${mutedColor};font-size:.75rem">(~${et.toLocaleString()} ${potRaw?'avg':'est.'})</span>`;
    const mercCell=`<span class="merc-cell" title="${merc.replace(/"/g,'')}">${merc.length>48?merc.substring(0,46)+'…':merc}</span>`;
    const tH=d.t?contactToHref(d.t):null;
    const tCell=d.t?(tH?`<a href="${escapeAttr(tH)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:none" title="Tel / web / mail si aplica">${escapeHtml(d.t)}</a>`:`<span>${escapeHtml(d.t)}</span>`):'<span style="color:var(--muted)">—</span>';
    // PLANTA badge: contrasting in light mode
    const plantaBg=isLight?'background:#dbeafe;color:#1e40af':'background:rgba(59,130,246,.22);color:#e2e8f0';
    const geoCell=`<span class="bd" style="background:${geoScoreLead(d)>=80?'#0ea5a4':geoScoreLead(d)>=65?'#f59e0b':'#ef4444'};font-weight:800;min-width:42px;display:inline-block;text-align:center;cursor:help;color:#fff" title="${escapeAttr(geoScoreHintText(d))}">${Math.round(geoScoreLead(d))}</span>`;
    const supplier=meta.supplierOverride||pv;
    const lastMod=leadLastModifiedLabel(meta);
    return `<tr><td>${i+1}</td><td><b>${d.n}</b></td><td><span class="bd" style="${bc[d.s]}">${LB[d.s]}</span></td><td>${mercCell}</td><td><select class="dir-edit-select dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="tipo">${typeOpts(meta.tipo)}</select></td><td><select multiple class="dir-edit-select dir-edit dir-edit-multi" data-lead-id="${escapeAttr(leadId)}" data-field="minerals" title="Ctrl/Cmd + click para múltiple">${mineralOpts(meta.minerals||[])}</select></td><td><select class="dir-edit-select dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="leadScoring">${scoreOpts(meta.leadScoring)}</select></td><td><select class="dir-edit-select dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="region">${regionOpts(meta.region)}</select></td><td><input class="dir-edit-input dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="vendedor" value="${escapeAttr(meta.vendedor||'')}" placeholder="Vendedor"/></td><td><span class="dir-lastmod" data-lm-for="${escapeAttr(leadId)}">${escapeHtml(lastMod)}</span></td><td><input class="dir-edit-input dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="supplierOverride" value="${escapeAttr(supplier)}" placeholder="Proveedor"/></td><td><input class="dir-edit-input dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="endMarket" value="${escapeAttr(meta.endMarket||'')}" placeholder="End market"/></td><td><input class="dir-edit-input dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="subMarket" value="${escapeAttr(meta.subMarket||'')}" placeholder="Sub-market"/></td><td><input class="dir-edit-input dir-edit" data-lead-id="${escapeAttr(leadId)}" data-field="fy2025" value="${escapeAttr(meta.fy2025||'')}" placeholder="0"/></td><td>${d.d}</td><td><span class="bd" style="${plantaBg};font-weight:700" title="Planta territorial (más cercana catálogo completo) ≤${PLANT_CATCHMENT_KM} km">${own.short}</span></td><td>${km}km</td><td>${tonProm}</td><td>${scoreCell}</td><td>${geoCell}</td><td>${potCell}</td><td><div>${d.p}</div><textarea class="dir-edit-note dir-edit-note-input" data-lead-id="${escapeAttr(leadId)}" placeholder="Observaciones...">${escapeHtml(meta.observations||'')}</textarea></td><td>${leadSourceLinksHtml(d)}</td><td>${tCell}</td></tr>`;
  }).join('');
  bindDirectoryEditors();
  bindDirectoryImport();
}

function bindDirectoryEditors(){
  document.querySelectorAll('.dir-edit').forEach(el=>{
    el.addEventListener('change',e=>{
      const t=e.currentTarget;
      const leadId=t.getAttribute('data-lead-id');
      const field=t.getAttribute('data-field');
      if(!leadId||!field)return;
      if(field==='minerals'){
        const vals=[...t.selectedOptions].map(o=>o.value).filter(Boolean);
        setLeadMetaById(leadId,{minerals:vals.length?vals:['No aplica']});
      }else{
        setLeadMetaById(leadId,{[field]:String(t.value||'').trim()});
      }
      const lm=document.querySelector(`[data-lm-for="${leadId}"]`);
      if(lm)lm.textContent=leadLastModifiedLabel(leadEnrichCache[leadId]);
      renderDataFusionPanels();
    });
  });
  document.querySelectorAll('.dir-edit-note-input').forEach(el=>{
    el.addEventListener('blur',e=>{
      const t=e.currentTarget;
      const leadId=t.getAttribute('data-lead-id');
      if(!leadId)return;
      setLeadMetaById(leadId,{observations:String(t.value||'').trim()});
      const lm=document.querySelector(`[data-lm-for="${leadId}"]`);
      if(lm)lm.textContent=leadLastModifiedLabel(leadEnrichCache[leadId]);
    });
  });
}

function bindDirectoryImport(){
  const btn=document.getElementById('dirImportXlsxBtn');
  const input=document.getElementById('dirImportXlsxInput');
  if(!btn||!input||btn.dataset.bound==='1')return;
  btn.dataset.bound='1';
  btn.addEventListener('click',()=>input.click());
  input.addEventListener('change',async e=>{
    const files=[...(e.target.files||[])];
    if(!files.length)return;
    try{
      await importLeadIntelXlsx(files);
      syncAll();
    }catch(err){
      alert('No se pudo importar XLS en Directorio. Revisa formato de columnas.');
      console.error(err);
    }
    input.value='';
  });
}

// ========== CHATBOT V2 WITH INLINE CHARTS ==========
function toggleChat(){const w=document.getElementById('chatWin');w.classList.toggle('open');document.getElementById('chatFab').querySelector('.notif').style.display='none';if(w.classList.contains('open'))document.getElementById('chatIn').focus()}
function askQ(q){document.getElementById('chatIn').value=q;sendMsg()}
function addMsg(txt,who){const box=document.getElementById('chatMsgs');const div=document.createElement('div');div.className='msg '+who;div.innerHTML=txt;box.appendChild(div);box.scrollTop=box.scrollHeight;return div}
function showTyping(){const box=document.getElementById('chatMsgs');const t=document.createElement('div');t.className='typing';t.id='typI';t.innerHTML='<span></span><span></span><span></span>';box.appendChild(t);box.scrollTop=box.scrollHeight}
function hideTyping(){const t=document.getElementById('typI');if(t)t.remove()}

function makeChart(container,type,labels,data,colors){
  chatChartId++;const id='cc'+chatChartId;
  const wrap=document.createElement('div');wrap.className='mini-chart';
  const cvs=document.createElement('canvas');cvs.id=id;wrap.appendChild(cvs);container.appendChild(wrap);
  setTimeout(()=>{new Chart(document.getElementById(id),{type,data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:0,borderRadius:type==='bar'?3:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type==='doughnut',position:'bottom',labels:{boxWidth:6,font:{size:8,family:'Inter'},color:'#94a3b8'}}},scales:type==='bar'?{y:{beginAtZero:true,grid:{color:'rgba(255,255,255,.03)'},ticks:{font:{size:7},color:'#64748b'}},x:{grid:{display:false},ticks:{font:{size:7},color:'#64748b'}}}:undefined}})},50);
}

let lastCtx={seg:null,results:[]};
function sendMsg(){const inp=document.getElementById('chatIn');const q=inp.value.trim();if(!q)return;addMsg(q,'user');inp.value='';showTyping();setTimeout(()=>{hideTyping();processQuery(q)},350+Math.random()*400)}

// ===== SMART NLP HELPERS =====
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?¡!.,;:()]/g,'').trim()}
function fuzzy(a,b){a=norm(a);b=norm(b);if(a.includes(b)||b.includes(a))return 1;let m=0;const w=b.split(/\s+/);w.forEach(ww=>{if(ww.length>2&&a.includes(ww))m++});return m/w.length}
function findCompany(q){
  const qn=norm(q);
  let best=null,bestS=0;
  D.forEach(d=>{
    const nn=norm(d.n);
    let sc=0;
    if(nn===qn)sc=1;
    else if(nn.includes(qn)||qn.includes(nn))sc=.9;
    else{const ws=qn.split(/\s+/);let h=0;ws.forEach(w=>{if(w.length>2&&nn.includes(w))h++});sc=ws.length?h/ws.length*0.7:0}
    if(sc>bestS){bestS=sc;best=d}
  });
  return bestS>.3?best:null;
}
function findSeg(q){
  const aliases={vidrio:['vidrio','glass','cristal','envase'],ceramica:['ceramica','porcelana','azulejo','piso','loseta','sanitario','bano','flux','esmalte ceramico','gres porcelanico','pasta ceramica','sanitarios masivos','fritas'],fundicion:['fundicion','fundidora','molde','metalurg'],construccion:['construccion','panel','cemix','tablaroca','fibrocemento'],fibra:['fibra','nutec','fibratec','aislante','refractario'],deportiva:['deportiva','deporte','futbol','golf','estadio','cancha','beisbol','bunker','padel','tenis','soccer','fifa','mundial'],cuestre:['cuestre','encuestre','ecuestre','hipico','caballo','charreria','lienzo','hipodromo','rodeo','equitacion','charro','yegua','jinete'],filtracion:['filtracion','filtro','agua','ptar','potabiliz','alberca','piscina','comapa','drenaje','tratamiento agua','simas'],fracking:['fracking','petroleo','proppant','pemex','schlumberger','halliburton','shale','gas','perforacion','pozo','hidraulic'],agricola:['agricola','agricultura','invernadero','sustrato','vivero','cultivo','campo','siembra','cosecha','hortaliza','fruta','tomate','berry','arandano','nopal','aguacate','huerto'],reciclaje:['reciclaje','concreto','cemex','holcim','mortero','asfalto','gcc','premezclado','constructora','vivienda','carretera','pavimento','ladrillo','block','adoquin','obra']};
  for(const[sk,al]of Object.entries(aliases))if(al.some(a=>q.includes(a)))return sk;
  return null;
}
function getPotAvg(d){
  if(!d||!d.pot)return 0;
  const raw=String(d.pot).replace(/,/g,'').replace(/–|—/g,'-').trim();
  const parts=raw.split('-').map(s=>parseFloat(String(s).trim())).filter(n=>!isNaN(n)&&isFinite(n)&&n>0);
  if(!parts.length)return 0;
  if(parts.length===1)return parts[0];
  return(parts[0]+parts[1])/2;
}
function effectiveTonProm(d){
  if(!d)return 1;
  if(d.tp==='a'){
    const v=Number(d.v)||0;
    if(v>0)return Math.round(v);
    return Math.max(1,Math.round(POT_FLOOR_BY_SEG[d.s]||400));
  }
  let x=getPotAvg(d);
  if(!x||x<=0)x=POT_FLOOR_BY_SEG[d.s]||500;
  return Math.max(1,Math.round(x));
}
function inferMercado(d){
  const base=MERCADO_BASE[d.s]||LB[d.s];
  const t=((d.p||'')+' '+(d.n||'')).toLowerCase();
  if(/ptar|comapa|simas|potabiliz|awwa|tratamiento agua|drenaje municipal|aguaydrenaje/i.test(t))return 'Tratamiento de agua · obra pública';
  if(/piscina|alberca|pool|aquazone/i.test(t))return 'Piscinas · equipos filtración';
  if(/golf|bunker|fifa|estadio|beisbol|futbol|mundial 2026|infield/i.test(t))return 'Infraestructura deportiva';
  if(/charro|hipico|ecuestre|lienzo|hipodromo/i.test(t))return 'Ecuestre y eventos tradicionales';
  if(/pemex|proppant|frack|pozo|schlumber|hallibur|newpek|burgos/i.test(t))return 'Upstream · estimulación';
  if(/cemex|holcim|gcc|mortero|concreto|premezclado/i.test(t))return 'Materiales cementería';
  if(/cerasil|porcelana|sanitario|azulejo|gres|toto|kohler/i.test(t))return 'Cerámica industrial y acabados';
  if(/vidrio|envase|cristal|float|libbey/i.test(t))return 'Vidrio plano y envases';
  if(/feldespato|flux|esmalte/i.test(t))return 'Cerámica · flux / feldespato (línea arena sílica en producto)';
  if(/carbonato|caco3|pcc|calcita/i.test(t))return 'Constr./reciclaje · CaCO₃ / filler (línea arena sílica en producto)';
  return base;
}
/** Escapa comillas en atributos HTML */
function escapeAttr(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function googleSearchUrl(query){return 'https://www.google.com/search?q='+encodeURIComponent(query)}
function mapsUrlForLead(d){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(((d.n||'')+' '+(d.d||'')).trim())}
function streetViewUrlForLead(d){
  if(Number.isFinite(d.lat)&&Number.isFinite(d.lng)){
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(`${d.lat},${d.lng}`)}`;
  }
  return mapsUrlForLead(d);
}
function latLngToTile(lat,lng,zoom=9){
  const n=Math.pow(2,zoom);
  const x=Math.floor((lng+180)/360*n);
  const latRad=lat*Math.PI/180;
  const y=Math.floor((1-Math.log(Math.tan(latRad)+1/Math.cos(latRad))/Math.PI)/2*n);
  return {x,y,z:zoom};
}
function osmStaticPreviewUrl(d,zoom=13,w=320,h=160){
  if(!Number.isFinite(d.lat)||!Number.isFinite(d.lng))return '';
  const t=latLngToTile(Number(d.lat),Number(d.lng),Math.max(6,Math.min(16,zoom)));
  return `https://tile.openstreetmap.org/${t.z}/${t.x}/${t.y}.png`;
}
/** Si el campo contacto parece dominio, teléfono, mail o URL → enlace usable */
function contactToHref(t){
  if(!t)return null;
  const s=String(t).trim();
  if(!s)return null;
  if(/^https?:\/\//i.test(s))return s;
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))return 'mailto:'+s;
  if(/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}([/?#].*)?$/i.test(s)&&!/\s/.test(s))return 'https://'+s.replace(/^https?:\/\//i,'');
  const digits=s.replace(/\D/g,'');
  if(digits.length>=8)return 'tel:'+s.replace(/[^\d+]/g,'');
  return null;
}
/** Iconos compactos: refs de investigación (dataset), Google, Maps, contacto/web */
function leadSourceLinksHtml(d){
  const q=((d.n||'')+' '+(d.d||'')).trim();
  const g=googleSearchUrl(q),m=mapsUrlForLead(d),c=contactToHref(d.t);
  const refBits=(Array.isArray(d.refs)?d.refs:[]).filter(r=>r&&r.u).slice(0,6).map((r,ix)=>
    `<a class="src-link src-ref" href="${escapeAttr(r.u)}" target="_blank" rel="noopener noreferrer" title="${escapeAttr(r.t||'Referencia '+ (ix+1))}"><i class="fas fa-bookmark"></i></a>`
  );
  const bits=[
    ...refBits,
    `<a class="src-link" href="${g}" target="_blank" rel="noopener noreferrer" title="Buscar en Google: ${escapeAttr(d.n)}"><i class="fas fa-search"></i></a>`,
    `<a class="src-link" href="${m}" target="_blank" rel="noopener noreferrer" title="Ver en Google Maps"><i class="fas fa-map-marker-alt"></i></a>`
  ];
  if(c)bits.push(`<a class="src-link" href="${c}" target="_blank" rel="noopener noreferrer" title="Contacto o sitio web (referido en registro)"><i class="fas fa-external-link-alt"></i></a>`);
  return `<span class="src-wrap" title="Marcadores = fuentes enlazadas al registro; resto = búsqueda/maps. Base Covia en CRM.">${bits.join('')}</span>`;
}
/** Bloque con texto para el chat (misma idea, más legible) */
function leadSourceLinksBlock(d){
  const q=((d.n||'')+' '+(d.d||'')).trim();
  const g=googleSearchUrl(q),m=mapsUrlForLead(d),c=contactToHref(d.t);
  let h=`<div class="src-block"><div class="src-block-h">Ampliar información <span class="src-hint">(clic — investigación fuera del tablero)</span></div>`;
  (Array.isArray(d.refs)?d.refs:[]).filter(r=>r&&r.u).forEach((r,ix)=>{
    h+=`<a class="src-row src-row-ref" href="${escapeAttr(r.u)}" target="_blank" rel="noopener noreferrer">🔗 ${escapeHtml(r.t||'Referencia '+(ix+1))}</a>`;
  });
  h+=`<a class="src-row" href="${g}" target="_blank" rel="noopener noreferrer" title="Abrir búsqueda en Google">🔎 Google · <span>${escapeAttr(d.n)}</span></a>`;
  h+=`<a class="src-row" href="${m}" target="_blank" rel="noopener noreferrer" title="Abrir ubicación en Maps">📍 ${escapeAttr(d.d||'—')}</a>`;
  if(c)h+=`<a class="src-row" href="${c}" target="_blank" rel="noopener noreferrer">🔗 Web / teléfono (referido)</a>`;
  h+=`<div class="src-base">Origen de los datos en pantalla: <strong>registro interno Mapa Covia</strong>. Los enlaces son ayudas; validar en CRM antes de actuar.</div></div>`;
  return h;
}
function renderPrescriptiveInsights(){
  const el=document.getElementById('prescriptivePanel');
  if(!el)return;
  const fd=getViewData();
  const ld=fd.filter(x=>x.tp==='l');
  const mercBy={};
  fd.forEach(d=>{const m=inferMercado(d);mercBy[m]=(mercBy[m]||0)+1});
  const topMerc=Object.entries(mercBy).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const bySeg={};
  ld.forEach(d=>{bySeg[d.s]=(bySeg[d.s]||0)+1});
  const topSeg=Object.entries(bySeg).sort((a,b)=>b[1]-a[1])[0];
  const sinP=ld.filter(d=>getProv(d).toLowerCase().includes('sin proveedor')).length;
  const tips=[];
  const sprint7=[];
  const sprint30=[];
  const sprint90=[];
  if(selectedPlantKeys.includes('jaltipan')&&PLANT_LOGISTICS_SNAPSHOT.jaltipan){
    const j=PLANT_LOGISTICS_SNAPSHOT.jaltipan;
    const vj=j.volActualTonAno?` Vol. operativo ref. ~${Math.round(j.volActualTonAno/1000)}K ton/año ·`:'';
    tips.push(`<strong>Jáltipan (logística):</strong>${vj} ${j.compliancePct}% cumplimiento · ${j.shipments} embarques / ${j.orderNew} pedidos (Δ${j.delta}). Referencia: ${j.cuentaAncla.n} (${j.cuentaAncla.city}).`);
  }
  if(selectedPlantKeys.length===1&&selectedPlantKeys[0]==='lampazos'&&PLANT_LOGISTICS_SNAPSHOT.lampazos){
    tips.push(`<strong>Lampazos (CAN-LAM):</strong> el KPI “Vol. Actual” con solo esta planta refleja la suma de cartera CRM; capacidad referencia ~350K ton/año en análisis de utilización.`);
  }
  if(topMerc.length)tips.push(`<strong>Mix de mercado (vista):</strong> ${topMerc.map(([m,c])=>`${m} <span style="opacity:.85">(${c})</span>`).join(' · ')}`);
  if(topSeg)tips.push(`<strong>Si priorizas ${LB[topSeg[0]]}:</strong> ${topSeg[1]} lead(s) en filtro — combina visita técnica + ficha bajo norma sectorial (p. ej. AWWA en filtración, especificación deportiva en arenas).`);
  if(sinP)tips.push(`<strong>Cierres más ágiles:</strong> ${sinP} lead(s) “Sin proveedor” — propuesta de sustitución directa y muestra bajo tu especificación.`);
  const topAttack=ld.filter(d=>{const pv=getProv(d).toLowerCase();return !pv.includes('covia')&&!pv.includes('sin proveedor');}).sort((a,b)=>leadRowScore(b)-leadRowScore(a)).slice(0,3);
  if(topAttack.length){
    sprint7.push(`Preparar paquete TCO comparativo para ${topAttack.map(x=>`<b>${escapeHtml(x.n)}</b>`).join(', ')}.`);
    sprint30.push(`Ejecutar piloto técnico en cuentas de competencia (top score) y bloquear fecha de decisión.`);
  }
  if(sinP>0)sprint7.push(`Atacar ${sinP} cuenta(s) sin proveedor con propuesta fast-track y SLA de entrega.`);
  if(topSeg)sprint30.push(`Concentrar coverage comercial en ${LB[topSeg[0]]} (mayor densidad de oportunidad actual).`);
  sprint90.push(`Cerrar acuerdo marco multisitio en la planta líder territorial para consolidar volumen recurrente.`);
  sprint90.push(`Actualizar modelo de prioridad con tasa real de conversión por proveedor y segmento.`);
  tips.push(`<strong>Asignación territorial:</strong> cada cuenta tiene una sola planta más cercana en el <b>catálogo completo</b>; el filtro muestra las que caen en tu selección a ≤${PLANT_CATCHMENT_KM} km. Con varias plantas activas el total es <b>único</b> (ver panel “Territorio compartido” para 2.ª opción).`);
  const intelMore=`<a class="matrix-mini-link" href="${googleSearchUrl('arena sílica industrial México prospección 2025')}" target="_blank" rel="noopener noreferrer"><i class="fas fa-search"></i> Buscar contexto sector (web)</a> · <a class="matrix-mini-link" href="https://www.gob.mx/" target="_blank" rel="noopener noreferrer">gob.mx</a> · <a class="matrix-mini-link" href="https://www.inegi.org.mx/" target="_blank" rel="noopener noreferrer">INEGI</a>`;
  const sprintCard=(title,rows)=>`<div class="presc-card"><div class="presc-kicker">${title}</div><ul>${(rows.length?rows:['Sin acciones sugeridas para este filtro.']).map(r=>`<li>${r}</li>`).join('')}</ul></div>`;
  el.innerHTML='<ul class="presc-list">'+tips.map(t=>`<li>${t}</li>`).join('')+'</ul>'+
  `<div class="presc-grid">${sprintCard('Sprint 7 días',sprint7)}${sprintCard('Sprint 30 días',sprint30)}${sprintCard('Sprint 90 días',sprint90)}</div>`+
  '<p class="presc-src"><i class="fas fa-info-circle"></i> Las estrategias usan la <strong>vista actual</strong> (segmento, búsqueda y regla de asignación + radio). Referencias operativas (p. ej. Jáltipan) cuando apliquen. Detalle por cuenta: columna <strong>Info+</strong> (🔖 fuentes en registro, búsqueda, maps) y <strong>Planta</strong> en la tabla.</p>'+
  `<p class="presc-src presc-intel">${intelMore}</p>`;
}
/**
 * Priorización tipo ML (heurística ponderada en cliente, sin servidor).
 * Features: ton.prom o vol. actual, peso de segmento, distancia a planta territorial, brecha de proveedor, riqueza de producto/refs.
 */
function leadScoreTooltip(d){
  const km=distMin(d);
  const pot=d.tp==='l'?effectiveTonProm(d):(Number(d.v)||0);
  const w=SEG_WEIGHT_IA[d.s]||1;
  const sinP=/sin proveedor/i.test(getProv(d));
  const prodPart=Math.min(0.12,(String(d.p||'').length)/1000);
  const refPart=0.04*(Array.isArray(d.refs)?d.refs.length:0);
  const dataBoost=1+prodPart+refPart;
  const provBoost=sinP?1.15:1;
  const line=d.tp==='l'
    ?`Fórmula: ton×${w.toFixed(2)}/(1+km/150)×${provBoost.toFixed(2)}×${dataBoost.toFixed(3)}`
    :`Fórmula: vol×${w.toFixed(2)}/(1+km/200)×${dataBoost.toFixed(3)}`;
  return [
    'Score ML (heurística ponderada, sin servidor):',
    `· Base: ~${Math.round(pot)} t`,
    `· Peso segmento: ×${w.toFixed(3)}`,
    `· Distancia: ${km.toFixed(0)} km`,
    sinP?'· Brecha proveedor: ×1.15 (sin proveedor)':'· Proveedor: ×1.00',
    `· Calidad dato: ×${dataBoost.toFixed(3)} (+${(prodPart*100).toFixed(1)}% texto +${(refPart*100).toFixed(1)}% refs)`,
    line
  ].join('\n');
}
function leadRowScore(d){
  const w=SEG_WEIGHT_IA[d.s]||1,km=distMin(d);
  const provBoost=/sin proveedor/i.test(getProv(d))?1.15:1;
  const dataBoost=1+Math.min(0.12,(String(d.p||'').length)/1000)+0.04*(Array.isArray(d.refs)?d.refs.length:0);
  if(d.tp==='l'){
    const pot=effectiveTonProm(d);
    return pot*w/(1+km/150)*provBoost*dataBoost;
  }
  return (d.v||0)*w/(1+km/200)*dataBoost;
}
function fmtCompany(d){
  const km=distMin(d).toFixed(0);const np=nearestPlant(d);const pv=getProv(d);
  return `🔎 <b>${d.n}</b><br><br>`+
  `<table class="dt">`+
  `<tr><td><b>Segmento</b></td><td><span class="bd" style="background:${CO[d.s]}">${LB[d.s]}</span></td></tr>`+
  `<tr><td><b>Mercado</b></td><td>${inferMercado(d)}</td></tr>`+
  `<tr><td><b>Tipo</b></td><td>${d.tp==='a'?'✅ Cliente Actual':'💡 Lead Potencial'}</td></tr>`+
  `<tr><td><b>${d.tp==='a'?'Volumen':'Potencial'}</b></td><td><b>${d.tp==='a'?d.v.toLocaleString()+' ton/año':d.pot+' ton/año'}</b></td></tr>`+
  `<tr><td><b>Producto</b></td><td>${d.p}</td></tr>`+
  `<tr><td><b>Distancia</b></td><td><b>${km} km</b> mín. · ref. <b>${np.short}</b>${getSelectedPlants().length>1?distBreakdown(d):''}</td></tr>`+
  `<tr><td><b>Ubicación</b></td><td>${d.d}</td></tr>`+
  `<tr><td><b>Proveedor</b></td><td>${pv}</td></tr>`+
  `<tr><td><b>Contacto</b></td><td>${d.t?escapeHtml(d.t):'—'}</td></tr>`+
  `</table>`+
  leadSourceLinksBlock(d);
}

function processQuery(q){
  const ql=norm(q);const qo=q;
  const ac=D.filter(x=>x.tp==='a'),ld=D.filter(x=>x.tp==='l');
  const totalV=ac.reduce((s,d)=>s+d.v,0);

  // ===== SALUDOS Y CONVERSACIÓN =====
  if(ql.match(/^(hola|hey|buenas|buenos dias|buenas tardes|que onda|hi|hello|saludos|como estas|que tal)/)){
    addMsg(`👋 ¡Hola! Soy <b>Covia AI V3</b>, tu asistente de inteligencia comercial.<br><br>Puedo ayudarte con:<br>• 📊 Análisis de datos y gráficos<br>• 🔎 Buscar cualquier empresa<br>• 📋 Info por segmento o ciudad — <b>feldespato</b> y <b>CaCO₃</b> van en <b>producto</b> (línea arena sílica), no como segmento: búscalos en texto o filtra <b>Cerámica</b> / <b>Constr/Recicl</b><br>• 🆚 Comparar segmentos<br>• 🏆 Rankings y estadísticas<br>• 💰 Análisis de oportunidades<br>• 🏭 Info de proveedores<br>• 🤖 <b>Score ML</b> en tabla: pasa el cursor sobre el número — explica tonelaje, segmento, km, brecha de proveedor y calidad de dato (heurística en el navegador)<br><br>Pregunta por <b>Juárez NL</b> si te refieres a la planta en Nuevo León (no Chihuahua). Ejemplo: <i>"leads con feldespato en producto"</i>`,'bot');return;
  }
  if(ql.match(/^(gracias|thanks|ok gracias|perfecto|genial|excelente|chido|va|sale)/)){
    addMsg(`✅ ¡Con gusto! ¿Algo más que necesites?`,'bot');return;
  }
  if(ql.match(/juarez.*chihuahua|chihuahua.*juarez|ciudad juarez|cd juarez|juarez chih\b/) && !ql.match(/benito|nuevo leon|monterrey|nl\b|periferic|metropolitan/)){
    addMsg(`🏭 <b>Aclaración planta Juárez Covia:</b> La unidad <b>Benito Juárez</b> está en <b>Nuevo León</b> (área MTY), <b>no</b> en Ciudad Juárez, Chihuahua.<br><br>En el tablero aparece como <b>Juárez NL</b> · ~25.66°N, -100.07°W · cluster AHU-JUA. Selecciónala en la barra de plantas para ver distancias y leads cercanos.`,'bot');return;
  }
  if(ql.match(/feldespato|feldespatico|carbonato|caco3|carbonato de calcio|pcc\b|calcita/) && !ql.match(/compar|vs\.?|versus|diferencia/)){
    const fk=D.filter(d=>/feldespato|flux|esmalte|fritas|gres|porcelana/i.test(d.p||d.n||''));
    const ck=D.filter(d=>/carbonato|caco3|pcc|calcita/i.test(d.p||d.n||'')&&!/feldespato|flux|esmalte|fritas/i.test(d.p||d.n||''));
    addMsg(`🧪 <b>Productos arena sílica</b> (detalle en columna Producto; segmento = Cerámica o Constr/Recicl)<br>• <b>Feldespato / flux / gres:</b> ${fk.length} contactos.<br>• <b>Carbonato CaCO₃ / PCC:</b> ${ck.length} contactos.<br><br>Filtra <b>Cerámica</b> o <b>Constr/Recicl</b> en el tablero o busca por ciudad. Datos de prospección — <b>validar en CRM</b>.`,'bot');return;
  }

  // ===== PREGUNTAS SOBRE QUIÉN/CUÁL/CUÁNTO =====
  // "¿Quién es el cliente más grande?" / "¿Cuál es el mayor?"
  if(ql.match(/quien.*(mas grande|mayor|mas (compra|vende|volumen))|cual.*mayor.*cliente|cliente.*mas.*grande|mas.*compra|mas.*tonelaje/)){
    const s=[...ac].sort((a,b)=>b.v-a.v);const top=s[0];
    addMsg(fmtCompany(top)+`<br>📊 Representa el <b>${(top.v/totalV*100).toFixed(1)}%</b> del volumen total.`,'bot');
    lastCtx.results=[top];return;
  }
  // "¿Cuántos clientes tenemos?" / "¿Cuántos leads hay?"
  if(ql.match(/cuantos (clientes|actuales)|numero de clientes|total.*clientes/)){
    const segC={};ac.forEach(d=>{segC[d.s]=(segC[d.s]||0)+1});
    const div=addMsg(`📋 <b>${ac.length} clientes actuales</b><br>Volumen total: <b>${totalV.toLocaleString()}</b> ton/año<br>Promedio: <b>${Math.round(totalV/ac.length).toLocaleString()}</b> ton/cliente<table class="dt"><tr><th>Segmento</th><th>Clientes</th></tr>${Object.entries(segC).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${LB[k]}</td><td>${v}</td></tr>`).join('')}</table>`,'bot');
    makeChart(div,'doughnut',Object.keys(segC).map(k=>LB[k]),Object.values(segC),Object.keys(segC).map(k=>CO[k]));return;
  }
  if(ql.match(/cuantos leads|numero de leads|total.*leads|cuantas oportunidades/)){
    const sc={};ld.forEach(d=>{sc[d.s]=(sc[d.s]||0)+1});
    const div=addMsg(`💡 <b>${ld.length} leads potenciales</b><br>En <b>${Object.keys(sc).length}</b> segmentos<table class="dt"><tr><th>Segmento</th><th>Leads</th></tr>${Object.entries(sc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${LB[k]}</td><td>${v}</td></tr>`).join('')}</table>`,'bot');
    makeChart(div,'doughnut',Object.keys(sc).map(k=>LB[k]),Object.values(sc),Object.keys(sc).map(k=>CO[k]));return;
  }
  // "¿Cuánto vendemos?" / "¿Cuál es nuestro volumen?"
  if(ql.match(/cuanto (vendemos|producimos|facturamos)|volumen total|nuestro volumen|nuestras ventas|cuanto.*ton/)){
    const s=[...ac].sort((a,b)=>b.v-a.v);
    const segV={};ac.forEach(d=>{segV[d.s]=(segV[d.s]||0)+d.v});
    const div=addMsg(`📦 <b>Volumen Total: ${totalV.toLocaleString()} ton/año</b><br><br>• <b>${ac.length}</b> clientes activos<br>• Promedio: <b>${Math.round(totalV/ac.length).toLocaleString()}</b> ton/cliente<br>• Top 1: <b>${s[0].n}</b> (${s[0].v.toLocaleString()} ton — ${(s[0].v/totalV*100).toFixed(1)}%)<br>• Top 2: <b>${s[1].n}</b> (${s[1].v.toLocaleString()} ton)<br>• Top 3: <b>${s[2].n}</b> (${s[2].v.toLocaleString()} ton)<table class="dt"><tr><th>Segmento</th><th>Ton</th><th>%</th></tr>${Object.entries(segV).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${LB[k]}</td><td>${v.toLocaleString()}</td><td>${(v/totalV*100).toFixed(1)}%</td></tr>`).join('')}</table>`,'bot');
    makeChart(div,'bar',Object.keys(segV).map(k=>LB[k].substring(0,8)),Object.values(segV),Object.keys(segV).map(k=>CO[k]));return;
  }

  // ===== COMPARAR SEGMENTOS =====
  if(ql.match(/compar|vs|versus|diferencia entre|cual.*mejor|que segmento.*(mejor|peor|grande|chico)/)){
    const segs=[];Object.keys(LB).forEach(k=>{if(ql.includes(norm(LB[k]))||findSeg(ql)===k)segs.push(k)});
    // if found 2+ segments, compare them
    if(segs.length>=2){
      const s1=segs[0],s2=segs[1];
      const d1=D.filter(d=>d.s===s1),d2=D.filter(d=>d.s===s2);
      const a1=d1.filter(x=>x.tp==='a'),a2_=d2.filter(x=>x.tp==='a');
      const v1=a1.reduce((s,d)=>s+d.v,0),v2=a2_.reduce((s,d)=>s+d.v,0);
      const l1=d1.filter(x=>x.tp==='l'),l2_=d2.filter(x=>x.tp==='l');
      const p1=l1.reduce((s,d)=>s+effectiveTonProm(d),0),p2=l2_.reduce((s,d)=>s+effectiveTonProm(d),0);
      const div=addMsg(`🆚 <b>${LB[s1]} vs ${LB[s2]}</b><table class="dt"><tr><th>Métrica</th><th>${LB[s1]}</th><th>${LB[s2]}</th></tr><tr><td>Total contactos</td><td><b>${d1.length}</b></td><td><b>${d2.length}</b></td></tr><tr><td>Clientes actuales</td><td>${a1.length}</td><td>${a2_.length}</td></tr><tr><td>Volumen actual</td><td>${v1.toLocaleString()} ton</td><td>${v2.toLocaleString()} ton</td></tr><tr><td>Leads</td><td>${l1.length}</td><td>${l2_.length}</td></tr><tr><td>Potencial estimado</td><td>~${Math.round(p1).toLocaleString()} ton</td><td>~${Math.round(p2).toLocaleString()} ton</td></tr></table>`,'bot');
      makeChart(div,'bar',['Actuales','Leads','Vol (K)','Pot (K)'],[a1.length,l1.length,Math.round(v1/1000),Math.round(p1/1000)].map((v,i)=>[v,[a2_.length,l2_.length,Math.round(v2/1000),Math.round(p2/1000)][i]]).flat(),[CO[s1],CO[s2],CO[s1],CO[s2],CO[s1],CO[s2],CO[s1],CO[s2]]);
      return;
    }
    // "¿Qué segmento es mejor?"
    const segM={};D.forEach(d=>{if(!segM[d.s])segM[d.s]={t:0,a:0,l:0,v:0,p:0};segM[d.s].t++;if(d.tp==='a'){segM[d.s].a++;segM[d.s].v+=d.v}else{segM[d.s].l++;segM[d.s].p+=effectiveTonProm(d)}});
    const ranked=Object.entries(segM).sort((a,b)=>(b[1].v+b[1].p)-(a[1].v+a[1].p));
    addMsg(`🏅 <b>Ranking de Segmentos</b> (por volumen actual + potencial)<table class="dt"><tr><th>#</th><th>Segmento</th><th>Actuales</th><th>Leads</th><th>Vol</th><th>Pot</th></tr>${ranked.map(([k,v],i)=>`<tr><td>${i+1}</td><td><b>${LB[k]}</b></td><td>${v.a}</td><td>${v.l}</td><td>${v.v.toLocaleString()}</td><td>~${Math.round(v.p).toLocaleString()}</td></tr>`).join('')}</table>`,'bot');return;
  }

  // ===== PROVEEDORES / COMPETENCIA =====
  if(ql.match(/proveedor|competencia|competidor|quien (nos |les )?provee|contra quien|rival/)){
    const seg=findSeg(ql);
    const subset=seg?D.filter(d=>d.s===seg):D;
    const pC={};subset.forEach(d=>{const p=getProv(d);pC[p]=(pC[p]||0)+1});
    const sorted=Object.entries(pC).sort((a,b)=>b[1]-a[1]);
    const div=addMsg(`🏭 <b>Proveedores${seg?' en '+LB[seg]:' — Todos'}</b><table class="dt"><tr><th>Proveedor</th><th>Empresas</th><th>%</th></tr>${sorted.map(([p,c])=>`<tr><td><b>${p}</b></td><td>${c}</td><td>${(c/subset.length*100).toFixed(1)}%</td></tr>`).join('')}</table><br>Total: <b>${subset.length}</b> empresas`,'bot');
    makeChart(div,'doughnut',sorted.map(x=>x[0].substring(0,12)),sorted.map(x=>x[1]),sorted.map((_,i)=>['#10b981','#ef4444','#f59e0b','#8b5cf6','#6b7280','#06b6d4','#ff6b6b','#f97316'][i%8]));return;
  }

  // ===== RESUMEN =====
  if(ql.match(/resumen|general|dashboard|overview|todo|dame.*numeros|estadisticas|status|como (vamos|estamos)/)){
    const segC={};D.forEach(d=>{segC[d.s]=(segC[d.s]||0)+1});
    const plSel=getSelectedPlants().map(p=>p.short).join(', ');
    const div=addMsg(`📊 <b>Resumen Mapa Covia V5</b><br><br>• <b>Plantas en filtro</b>: ${plSel}<br>• <b>${ac.length}</b> clientes actuales (dataset)<br>• <b>${ld.length}</b> leads potenciales (dataset)<br>• <b>${D.length}</b> total registros<br>• Volumen actual: <b>${totalV.toLocaleString()}</b> ton/año<br>• <b>${Object.keys(segC).length}</b> segmentos<br>• Distancias / territorio: <b>planta más cercana del catálogo completo</b> · radio tablero ≤${PLANT_CATCHMENT_KM} km<table class="dt"><tr><th>Segmento</th><th>Total</th></tr>${Object.entries(segC).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${LB[k]}</td><td>${v}</td></tr>`).join('')}</table>`,'bot');
    makeChart(div,'doughnut',Object.keys(segC).map(k=>LB[k]),Object.values(segC),Object.keys(segC).map(k=>CO[k]));return;
  }

  // ===== TOP N =====
  if(ql.match(/top\s*(\d+)|mayores|principales|grandes|ranking|mejores clientes|mas vend/)){
    const m=ql.match(/\d+/);const n=m?Math.min(parseInt(m[0]),30):5;const top=[...ac].sort((a,b)=>b.v-a.v).slice(0,n);
    const topV=top.reduce((s,d)=>s+d.v,0);
    const div=addMsg(`🏆 <b>Top ${n} Clientes por Volumen</b><table class="dt"><tr><th>#</th><th>Cliente</th><th>Segmento</th><th>Ton/año</th><th>%</th></tr>${top.map((d,i)=>`<tr><td>${i+1}</td><td><b>${d.n}</b></td><td>${LB[d.s]}</td><td>${d.v.toLocaleString()}</td><td>${(d.v/totalV*100).toFixed(1)}%</td></tr>`).join('')}</table><br>Estos ${n} = <b>${topV.toLocaleString()}</b> ton (<b>${(topV/totalV*100).toFixed(1)}%</b> del total)`,'bot');
    makeChart(div,'bar',top.map(d=>d.n.substring(0,10)),top.map(d=>d.v),top.map(d=>CO[d.s]));lastCtx.results=top;return;
  }

  // ===== LEADS POR SEGMENTO =====
  if(ql.match(/leads?\s*(por|x|de|cada|en)\s*seg|cuantos leads|distribucion leads|leads.*segmento/)){
    const sc={};ld.forEach(d=>{sc[d.s]=(sc[d.s]||0)+1});
    const div=addMsg(`💡 <b>Leads por Segmento</b> — Total: <b>${ld.length}</b><table class="dt"><tr><th>Segmento</th><th>Leads</th><th>%</th></tr>${Object.entries(sc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${LB[k]}</td><td><b>${v}</b></td><td>${(v/ld.length*100).toFixed(0)}%</td></tr>`).join('')}</table>`,'bot');
    makeChart(div,'doughnut',Object.keys(sc).map(k=>LB[k]),Object.values(sc),Object.keys(sc).map(k=>CO[k]));return;
  }

  // ===== POTENCIAL / OPORTUNIDAD =====
  if(ql.match(/potencial|mercado|oportunidad|cuanto.*ganar|ingreso.*posible|que.*podemos/)){
    const sp={};ld.forEach(d=>{sp[d.s]=(sp[d.s]||0)+effectiveTonProm(d)});
    let gt=0;const div=addMsg(`💰 <b>Potencial de Mercado</b><table class="dt"><tr><th>Segmento</th><th>Leads</th><th>Ton Potencial</th></tr>${Object.entries(sp).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{gt+=v;return`<tr><td>${LB[k]}</td><td>${D.filter(d=>d.s===k&&d.tp==='l').length}</td><td><b>${Math.round(v).toLocaleString()}</b></td></tr>`}).join('')}</table><br>🎯 Total potencial: ~<b>${Math.round(gt).toLocaleString()}</b> ton/año<br>📈 Vs actual (${totalV.toLocaleString()}): crecimiento de <b>${(gt/totalV*100).toFixed(0)}%</b>`,'bot');
    makeChart(div,'bar',Object.keys(sp).map(k=>LB[k].substring(0,8)),Object.values(sp).map(v=>Math.round(v)),Object.keys(sp).map(k=>CO[k]));return;
  }

  // ===== LEJANO / CERCANO =====
  if(ql.match(/lejano|mas lejos|distante|mas retirado/)){const sorted=[...D].map(d=>({...d,km:distMin(d)})).sort((a,b)=>b.km-a.km).slice(0,8);addMsg(`📍 <b>Los más lejanos a la planta</b><table class="dt"><tr><th>#</th><th>Empresa</th><th>Distancia</th><th>Ubicación</th><th>Segmento</th></tr>${sorted.map((d,i)=>`<tr><td>${i+1}</td><td><b>${d.n}</b></td><td><b>${d.km.toFixed(0)} km</b></td><td>${d.d}</td><td>${LB[d.s]}</td></tr>`).join('')}</table>`,'bot');return}
  if(ql.match(/cercano|mas cerca|proximo|pegado|junto/)){const sorted=[...D].map(d=>({...d,km:distMin(d)})).sort((a,b)=>a.km-b.km).slice(0,8);addMsg(`📍 <b>Los más cercanos a la planta</b><table class="dt"><tr><th>#</th><th>Empresa</th><th>Distancia</th><th>Ubicación</th><th>Segmento</th></tr>${sorted.map((d,i)=>`<tr><td>${i+1}</td><td><b>${d.n}</b></td><td><b>${d.km.toFixed(0)} km</b></td><td>${d.d}</td><td>${LB[d.s]}</td></tr>`).join('')}</table>`,'bot');return}

  // ===== SEGMENTO DETAIL =====
  const ms=findSeg(ql);
  if(ms){
    const items=D.filter(d=>d.s===ms),a2=items.filter(x=>x.tp==='a'),l2=items.filter(x=>x.tp==='l'),volA=a2.reduce((s,d)=>s+d.v,0);
    const potL=l2.reduce((s,d)=>s+effectiveTonProm(d),0);
    const show=[...a2.sort((a,b)=>b.v-a.v),...l2.sort((a,b)=>effectiveTonProm(b)-effectiveTonProm(a))].slice(0,10);
    const pC={};items.forEach(d=>{const p=getProv(d);pC[p]=(pC[p]||0)+1});
    const div=addMsg(`📋 <b>Segmento: ${LB[ms]}</b><br><br>• Actuales: <b>${a2.length}</b> (${volA.toLocaleString()} ton/año)<br>• Leads: <b>${l2.length}</b> (~${Math.round(potL).toLocaleString()} ton potencial)<br>• Total: <b>${items.length}</b><br>• Proveedores: ${Object.entries(pC).slice(0,3).map(([p,c])=>`<b>${p}</b> (${c})`).join(', ')}<table class="dt"><tr><th>Empresa</th><th>Tipo</th><th>Vol/Pot</th><th>Proveedor</th></tr>${show.map(d=>`<tr><td><b>${d.n}</b></td><td>${d.tp==='a'?'✅':'💡'}</td><td>${d.tp==='a'?d.v.toLocaleString():d.pot||'N/A'}</td><td>${getProv(d)}</td></tr>`).join('')}${items.length>10?`<tr><td colspan="4"><i>+${items.length-10} más</i></td></tr>`:''}</table>`,'bot');
    if(a2.length>0||l2.length>0)makeChart(div,'doughnut',['Actuales','Leads'],[a2.length||0,l2.length||0],[CO[ms],'rgba(255,255,255,.15)']);
    lastCtx.seg=ms;lastCtx.results=items;return;
  }

  // ===== ESTRATEGIAS =====
  if(ql.match(/estrateg|recomiend|prioridad|que (hago|debo|conviene)|accion|plan de|siguiente paso/)){addMsg(`🚀 <b>Top 10 Estrategias Prioritarias</b><br><br>1. 🔴 <b>Agua y Drenaje MTY</b> — 10K+ ton filtración. Gobierno = volumen seguro<br>2. 🔴 <b>CEMEX+Holcim+GCC</b> — 40K+ ton mortero. Visitar 3 en paralelo<br>3. 🟡 <b>Estadio BBVA</b> — Arena FIFA drenaje. Urgente: temporada 2026<br>4. 🟡 <b>7 Campos Golf</b> — $1,200/ton premium. Margen alto<br>5. 🟢 <b>PEMEX Burgos</b> — 80K+ ton proppant. El deal más grande<br>6. 🟢 <b>Lienzos Charros (12+)</b> — Blue ocean, sin competencia<br>7. 🟢 <b>Saint-Gobain+Mapei</b> — 15K+ ton morteros especiales<br>8. 🔵 <b>Albercas MTY</b> — Recurrente, fácil de cerrar<br>9. 🔵 <b>Club Hípico La Silla</b> — Arena premium importada → sustituir<br>10. 🔵 <b>Zona Lagunera Agro</b> — 6K ton, expandir a sustratos<br><br>💡 <b>Tip:</b> Prioriza los que tienen "Sin proveedor" — son oportunidad limpia.<br><br><span class="presc-src" style="display:block;margin-top:10px">Para indagar cada cuenta en el tablero, usa la columna <b>Info+</b> (Google / Maps) o pregunta por el nombre en el chat.</span>`,'bot');return}

  // ===== PIPELINE =====
  if(ql.match(/pipeline|matriz|cuentas clave|q1|q2|q3|q4|trimestre|calendario|cuando/)){addMsg(`📅 <b>Pipeline de Cuentas Clave</b><br><br>🔴 <b>Q1 (Ene-Mar) — Cerrar:</b><br>• Agua y Drenaje MTY — 10K ton<br>• CEMEX Concretos — 15K ton<br>• Estadio BBVA — Arena FIFA<br><br>🟡 <b>Q2 (Abr-Jun) — Negociar:</b><br>• Club Hípico La Silla — Premium<br>• Holcim + GCC — 18K ton<br>• Saint-Gobain Weber — 8K ton<br><br>🟢 <b>Q3 (Jul-Sep) — Desarrollar:</b><br>• PEMEX Burgos — Proppant piloto<br>• Zona Lagunera — Sustratos<br>• Red PTARs NL — 5 plantas<br><br>🔵 <b>Q4 (Oct-Dic) — Expandir:</b><br>• Mapei + Fassa Bortolo — Morteros<br>• Canchas Mundial 2026 — Arena<br>• Invernaderos García — Sustratos`,'bot');return}

  // ===== LISTADO DE PLANTAS (catálogo) =====
  if(ql.match(/listado.*plantas|cuantas plantas|plantas (covia|mexico|todas)|catalogo.*plant|todas las plantas/)){
    const rows=PLANT_ORDER.map(k=>{const p=PLANTAS[k];return `<tr><td><b>${p.label}</b></td><td>${p.city}, ${p.state}</td><td>${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</td><td>${p.cluster}</td><td>${p.pid}</td></tr>`}).join('');
    addMsg(`🏭 <b>Plantas Covia México</b> (${PLANT_ORDER.length})<br><small style="color:#94a3b8">USM: coordenadas aproximadas si no hay lat/lng en fuente.</small><table class="dt"><tr><th>Planta</th><th>Ciudad</th><th>Lat, Long</th><th>Cluster</th><th>ID</th></tr>${rows}</table>`,'bot');return;
  }
  // ===== PLANTA / UBICACIÓN (contexto selección) =====
  if(ql.match(/planta|lampazos|jaltipan|canoitas|ahuazotepec|apodaca|san juan|juarez|usm|tlaxcala|san jose|capacidad|donde estamos|nuestra ubicacion|fabrica/)){
    const pts=getSelectedPlants();
    const lines=pts.map(p=>`• <b>${p.label}</b> — ${p.city}, ${p.state} · ${p.cluster} · <code style="font-size:11px">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</code>${p.approx?' (aprox.)':''}`).join('<br>');
    const jLog=PLANT_LOGISTICS_SNAPSHOT.jaltipan;
    const jVol=jLog&&jLog.volActualTonAno?` · Vol. operativo ref. <b>~${Math.round(jLog.volActualTonAno/1000)}K</b> ton/año`:'';
    const jExtra=pts.some(p=>p.key==='jaltipan')&&jLog?`<br><br>📊 <b>Jáltipan — logística (reciente):</b>${jVol}<br><b>${jLog.compliancePct}%</b> cumplimiento · ${jLog.shipments} embarques / ${jLog.orderNew} pedidos nuevos · Δ${jLog.delta} · producto <b>${jLog.productoAgregado}</b><br>📍 Cuenta referencia en zona: <b>${jLog.cuentaAncla.n}</b> (${jLog.cuentaAncla.city}, ${jLog.cuentaAncla.state})<br><small style="color:#94a3b8">${jLog.fuente}</small><table class="dt" style="margin-top:8px"><tr><th>Cuenta (otros destinos)</th><th>Emb.</th><th>Cumpl.</th></tr>${jLog.otrasCuentas.slice(0,8).map(r=>`<tr><td>${r.n}${r.city?'<br><small style="color:#94a3b8">'+r.city+'</small>':''}</td><td>${r.shipments.toLocaleString()}</td><td>${r.compliance}%</td></tr>`).join('')}</table>`:'';
    addMsg(`🏭 <b>Referencia de plantas activas en el mapa</b> (${pts.map(p=>p.short).join(', ')})<br><br>${lines}<br><br>• 📦 Líneas: Cerasil, Granusil, Silice VC, Incast, SilverBond (referencia comercial)<br>• 📏 Territorio: cada cuenta va a la <b>planta más cercana del catálogo completo</b> (≤${PLANT_CATCHMENT_KM} km en tablero)<br>• 💡 Cambia la <b>barra de plantas</b> para filtrar cuentas por territorio.${jExtra}`,'bot');return}

  // ===== VOLUMEN =====
  if(ql.match(/volumen|tonelaje|produccion|cuanto vend|capacidad.*usada|utilizacion/)){
    const s=[...ac].sort((a,b)=>b.v-a.v);const util=(totalV/350000*100).toFixed(1);
    addMsg(`📦 <b>Análisis de Volumen</b><br><br>• Total vendido: <b>${totalV.toLocaleString()}</b> ton/año<br>• Capacidad planta: <b>350,000</b> ton/año<br>• Utilización: <b>${util}%</b><br>• Disponible: <b>${(350000-totalV).toLocaleString()}</b> ton<br>• Clientes: <b>${ac.length}</b><br>• Promedio/cliente: <b>${Math.round(totalV/ac.length).toLocaleString()}</b> ton<br><br>🏆 Mayor: <b>${s[0].n}</b> — ${s[0].v.toLocaleString()} ton (${(s[0].v/totalV*100).toFixed(1)}%)<br>🥈 2do: <b>${s[1].n}</b> — ${s[1].v.toLocaleString()} ton<br>🥉 3ro: <b>${s[2].n}</b> — ${s[2].v.toLocaleString()} ton<br>📉 Menor: <b>${s[s.length-1].n}</b> — ${s[s.length-1].v.toLocaleString()} ton`,'bot');return}

  // ===== DISTANCIA =====
  if(ql.match(/distancia|km|que tan lejos|radio|alcance/)){const avg=(D.reduce((s,d)=>s+distMin(d),0)/D.length).toFixed(0);const dA={};const dN={};D.forEach(d=>{dA[d.s]=(dA[d.s]||0)+distMin(d);dN[d.s]=(dN[d.s]||0)+1});const far=[...D].sort((a,b)=>distMin(b)-distMin(a))[0];const close=[...D].sort((a,b)=>distMin(a)-distMin(b))[0];const div=addMsg(`📏 <b>Análisis de Distancias</b> (${getSelectedPlants().map(p=>p.short).join(', ')})<br><br>• Promedio general: <b>${avg} km</b> (mín. a planta seleccionada)<br>• Más lejano: <b>${far.n}</b> (${distMin(far).toFixed(0)} km)<br>• Más cercano: <b>${close.n}</b> (${distMin(close).toFixed(0)} km)<table class="dt"><tr><th>Segmento</th><th>Dist. Prom.</th></tr>${Object.keys(dA).sort((a,b)=>dA[a]/dN[a]-dA[b]/dN[b]).map(k=>`<tr><td>${LB[k]}</td><td><b>${Math.round(dA[k]/dN[k])}</b> km</td></tr>`).join('')}</table>`,'bot');makeChart(div,'bar',Object.keys(dA).map(k=>LB[k].substring(0,6)),Object.keys(dA).map(k=>Math.round(dA[k]/dN[k])),Object.keys(dA).map(k=>CO[k]));return}

  // ===== AYUDA =====
  if(ql.match(/ayuda|help|que puedo|comandos|que sabes|para que sirves|funciones/)){addMsg(`🤖 <b>Covia AI V3 — Todo lo que puedo hacer:</b><br><br><b>📊 Análisis:</b><br>• "Resumen" o "¿Cómo vamos?"<br>• "¿Cuánto vendemos?"<br>• "¿Cuántos clientes tenemos?"<br><br><b>🏆 Rankings:</b><br>• "Top 5" / "Top 10"<br>• "¿Quién es el más grande?"<br>• "¿Cuál es el más lejano?"<br><br><b>📋 Segmentos:</b><br>• "Dime sobre fracking" / deportiva / filtración…<br>• <b>Feldespato</b> y <b>carbonato</b> → producto arena sílica; filtra <b>Cerámica</b> o <b>Constr/Recicl</b> o busca en texto<br>• "Compara cerámica vs vidrio"<br><br><b>🔎 Búsquedas:</b><br>• "CEMEX" — busca empresa<br>• "Monterrey" — busca por ciudad<br>• "¿Quién compra Cerasil?"<br><br><b>💼 Estrategia:</b><br>• "Estrategias"<br>• "Pipeline" / "Calendario"<br>• "¿Qué segmento conviene más?"<br><br><b>🏭 Otros:</b><br>• "Proveedores" / "Competencia"<br>• "Distancias"<br>• "Planta" / "Productos"<br><br>💡 Pregunta en <b>lenguaje natural</b>. <b>Juárez</b> en Covia = <b>Benito Juárez NL</b>, no Ciudad Juárez CHIH.`,'bot');return}

  // ===== BUSCAR EMPRESA (fuzzy) =====
  const cleanQ=ql.replace(/^(busca|buscar|info|informacion|dime|dame|datos|sobre|de|del|la|el|que|sabes|me|puedes|decir)\s+/g,'').trim();
  const exact=D.filter(d=>norm(d.n).includes(cleanQ));
  if(exact.length===1){addMsg(fmtCompany(exact[0]),'bot');lastCtx.results=exact;return}
  if(exact.length>1&&exact.length<=12){
    addMsg(`🔎 <b>${exact.length} resultado(s) para "${qo}"</b><table class="dt"><tr><th>Empresa</th><th>Seg</th><th>Tipo</th><th>Dist</th><th>Vol/Pot</th><th>Proveedor</th></tr>${exact.map(d=>`<tr><td><b>${d.n}</b></td><td>${LB[d.s]}</td><td>${d.tp==='a'?'✅':'💡'}</td><td>${distMin(d).toFixed(0)}km</td><td>${d.tp==='a'?d.v.toLocaleString():d.pot||'N/A'}</td><td>${getProv(d)}</td></tr>`).join('')}</table>`,'bot');
    lastCtx.results=exact;return;
  }
  const fc=findCompany(cleanQ);
  if(fc){addMsg(fmtCompany(fc),'bot');lastCtx.results=[fc];return}

  // ===== CIUDAD =====
  const cities=['monterrey','saltillo','reynosa','nuevo laredo','apodaca','garcia','pesqueria','monclova','san pedro','queretaro','linares','coahuila','tamaulipas','guadalupe','san nicolas','escobedo','cadereyta','santiago','allende','torreon','slp','chihuahua','tampico','matamoros','juarez','arteaga','zuazua','cienega'];
  const cm=cities.find(c=>ql.includes(c));
  if(cm){const ic=D.filter(d=>norm(d.d).includes(cm));if(ic.length>0){const a3=ic.filter(x=>x.tp==='a'),l3=ic.filter(x=>x.tp==='l');addMsg(`🏙️ <b>${ic.length} empresas en ${cm.charAt(0).toUpperCase()+cm.slice(1)}</b><br>• Actuales: <b>${a3.length}</b> | Leads: <b>${l3.length}</b><table class="dt"><tr><th>Empresa</th><th>Seg</th><th>Tipo</th><th>Vol/Pot</th></tr>${ic.slice(0,12).map(d=>`<tr><td><b>${d.n}</b></td><td>${LB[d.s]}</td><td>${d.tp==='a'?'✅':'💡'}</td><td>${d.tp==='a'?d.v.toLocaleString():d.pot||'N/A'}</td></tr>`).join('')}${ic.length>12?`<tr><td colspan="4"><i>+${ic.length-12} más</i></td></tr>`:''}</table>`,'bot');lastCtx.results=ic;return}}

  // ===== PRODUCTO =====
  if(ql.match(/producto|cerasil|silice|granusil|incast|silver|que (vendemos|producimos)|catalogo|linea de producto/)){const pr={};D.forEach(d=>{const p=d.p.split(' ')[0];pr[p]=(pr[p]||0)+1});const s=Object.entries(pr).sort((a,b)=>b[1]-a[1]).slice(0,12);const div=addMsg(`📦 <b>Productos más frecuentes</b><table class="dt"><tr><th>Producto</th><th>Empresas</th><th>%</th></tr>${s.map(([p,c])=>`<tr><td><b>${p}</b></td><td>${c}</td><td>${(c/D.length*100).toFixed(1)}%</td></tr>`).join('')}</table>`,'bot');makeChart(div,'bar',s.map(x=>x[0].substring(0,10)),s.map(x=>x[1]),s.map((_,i)=>['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#ff6b6b','#d97706','#ec4899','#f97316','#14b8a6','#a855f7'][i%12]));return}

  // ===== "SIN PROVEEDOR" / OPORTUNIDADES LIMPIAS =====
  if(ql.match(/sin proveedor|oportunidad limpia|facil|rapido de cerrar|bajo.*competencia|no tiene proveedor/)){
    const sp=D.filter(d=>d.tp==='l'&&(getProv(d)==='Sin proveedor'||getProv(d).includes('Sin')));
    const segC={};sp.forEach(d=>{segC[d.s]=(segC[d.s]||0)+1});
    addMsg(`🎯 <b>${sp.length} Leads SIN Proveedor</b> (oportunidad limpia)<table class="dt"><tr><th>Segmento</th><th>Leads sin prov.</th></tr>${Object.entries(segC).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${LB[k]}</td><td><b>${v}</b></td></tr>`).join('')}</table><br>💡 Estos leads NO tienen proveedor actual — son los más fáciles de cerrar.`,'bot');return;
  }

  // ===== SMART FALLBACK: busca por palabras sueltas =====
  const words=ql.split(/\s+/).filter(w=>w.length>2);
  const pm=D.filter(d=>{const h=norm(d.n+' '+d.d+' '+d.p+' '+(d.prov||'')+' '+LB[d.s]);return words.some(w=>h.includes(w))});
  if(pm.length>0&&pm.length<=20){
    addMsg(`🔎 <b>${pm.length} coincidencia(s) para "${qo}"</b><table class="dt"><tr><th>Empresa</th><th>Seg</th><th>Ubic</th><th>Tipo</th></tr>${pm.slice(0,10).map(d=>`<tr><td><b>${d.n}</b></td><td>${LB[d.s]}</td><td>${d.d}</td><td>${d.tp==='a'?'✅':'💡'}</td></tr>`).join('')}${pm.length>10?`<tr><td colspan="4"><i>+${pm.length-10} más</i></td></tr>`:''}</table>`,'bot');
    lastCtx.results=pm;return;
  }

  // ===== ULTIMATE FALLBACK =====
  addMsg(`🤔 No entendí "<b>${qo}</b>", pero puedo intentar esto:<br><br>🔎 Prueba buscar por:<br>• Nombre: <b>"CEMEX"</b>, <b>"Kohler"</b><br>• Ciudad: <b>"Monterrey"</b>, <b>"Saltillo"</b><br>• Segmento: <b>"Fracking"</b>, <b>"Golf"</b><br><br>📊 O pide análisis:<br>• <b>"¿Cómo vamos?"</b><br>• <b>"¿Quién es el más grande?"</b><br>• <b>"Compara cerámica vs vidrio"</b><br>• <b>"Proveedores"</b><br><br>💡 Tip: Escribe <b>"Ayuda"</b> para ver todo lo que puedo hacer.`,'bot');
}

function initSegmentCards(){
  const root=document.getElementById('segmentCards');
  if(!root)return;
  root.innerHTML=Object.keys(CO).map(k=>{
    const hint=(MERCADO_BASE[k]||'').split('·').map(s=>s.trim()).filter(Boolean)[0]||LB[k];
    return `<div class="sg vis" data-c="${k}" onclick="qF('${k}')"><h4><span class="sg-dot" style="background:${CO[k]}"></span>${LB[k]}</h4><div class="sv" id="sgc-${k}">0</div><div class="ss">${hint}</div></div>`;
  }).join('');
}

// INIT
/* ── Tilt 3D mouse tracking en .kpi cards ───────────────────────
   Sutil: máx ±6° en X, ±8° en Y. Se activa al entrar al card y se
   resetea al salir. Funciona con la clase CSS .tilt-active.
─────────────────────────────────────────────────────────────────*/
function initKpiTilt(){
  if(!document.body.classList.contains('covia-light'))return;
  document.querySelectorAll('.kpi').forEach(el=>{
    el.addEventListener('mouseenter',()=>el.classList.add('tilt-active'));
    el.addEventListener('mouseleave',()=>{
      el.classList.remove('tilt-active');
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    });
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      const dx=(e.clientX-cx)/r.width,dy=(e.clientY-cy)/r.height;
      el.style.setProperty('--rx',(-dy*6).toFixed(2)+'deg');
      el.style.setProperty('--ry',(dx*8).toFixed(2)+'deg');
    });
  });
}

/* ── KPI delta badges (renderiza en cada syncAll) ───────────────*/
function renderKpiDeltas(){
  const fd=getViewData();
  const allLeads=fd.filter(x=>x.tp==='l');
  const sinProv=allLeads.filter(d=>/sin proveedor/i.test(getProv(d))).length;
  const pctSin=allLeads.length?Math.round(sinProv/allLeads.length*100):0;
  const avgScore=allLeads.length?Math.round(allLeads.reduce((s,d)=>s+leadRowScore(d),0)/allLeads.length):0;
  // k1 delta
  _setDelta('k1delta', fd.filter(x=>x.tp==='a').length >= 5 ? 'positive' : 'neutral',
    fd.filter(x=>x.tp==='a').length >= 5 ? '▲ cartera activa' : '– sin actuales');
  // k2 delta: % sin proveedor
  _setDelta('k2delta', pctSin>40?'positive':pctSin>20?'neutral':'negative',
    `${pctSin}% sin proveedor`);
  // k5 delta: avg score
  _setDelta('k5delta', avgScore>800?'positive':avgScore>400?'neutral':'negative',
    `Score IA prom: ${fmtNum(avgScore)}`);
  // k6 delta
  const segs=new Set(allLeads.map(d=>d.s)).size;
  _setDelta('k6delta', segs>=6?'positive':segs>=3?'neutral':'negative', `${segs} segmentos`);
}
function _setDelta(id,cls,txt){
  const el=document.getElementById(id);
  if(!el)return;
  el.className='kpi-delta '+cls;
  el.innerHTML=txt;
}
function initGlobalCinematicGlow(){
  const root=document.documentElement;
  const onMove=(e)=>{
    const x=(e.clientX/window.innerWidth)*100;
    const y=(e.clientY/window.innerHeight)*100;
    root.style.setProperty('--mx',`${x.toFixed(2)}%`);
    root.style.setProperty('--my',`${y.toFixed(2)}%`);
  };
  window.addEventListener('mousemove',onMove,{passive:true});
}

window.onload=()=>{
  // Never mutate the production dataset with demo leads.
  // if(typeof window.injectRichLeadsDemo==='function')window.injectRichLeadsDemo();
  refreshLeadMineralsHeuristics();
  initGlobalCinematicGlow();
  initSegmentCards();
  initMap();initF();initCh();initTb();initPlantBar();
  initCompactMode();
  syncAll();
  initKpiTilt();
  startVibeCarousel();
  const hash=(location.hash||'').replace(/^#/,'');
  if(['inicio','mapa','ventas','bandeja','seguimiento','intel','datos'].includes(hash))coviaSetTab(hash);
  else coviaSetTab('inicio');
  window.addEventListener('hashchange',()=>{
    const h=(location.hash||'').replace(/^#/,'');
    if(['inicio','mapa','ventas','bandeja','seguimiento','intel','datos'].includes(h))coviaSetTab(h);
  });
  // Scroll observer
  const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis')})},{threshold:.1});
  document.querySelectorAll('.cc,.ts,.rs,.tech,.insight-wrap,.pred').forEach(el=>obs.observe(el));
};
