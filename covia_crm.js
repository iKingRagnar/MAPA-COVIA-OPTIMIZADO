// covia_crm.js — CRM Pipeline State Management for Covia Mexico Intelligence Platform v6
// All state persisted to localStorage. No backend required.

(function() {
'use strict';

const STORAGE_KEY = 'covia_crm_v6';
const ACTIVITIES_KEY = 'covia_activities_v6';
const QUOTATIONS_KEY = 'covia_quotations_v6';

// ─── PIPELINE STAGES ────────────────────────────────────────────────────────
window.PIPELINE_STAGES = [
  { id: 'prospecto',    label: 'Prospecto',    icon: 'fa-search',         color: '#64748b', order: 0 },
  { id: 'contactado',   label: 'Contactado',   icon: 'fa-phone',          color: '#3b82f6', order: 1 },
  { id: 'cotizado',     label: 'Cotizado',     icon: 'fa-file-invoice',   color: '#8b5cf6', order: 2 },
  { id: 'negociacion',  label: 'Negociación',  icon: 'fa-handshake',      color: '#f59e0b', order: 3 },
  { id: 'ganado',       label: 'Ganado',       icon: 'fa-trophy',         color: '#10b981', order: 4 },
  { id: 'perdido',      label: 'Perdido',      icon: 'fa-times-circle',   color: '#ef4444', order: 5 },
];

// ─── CRM STATE MANAGER ───────────────────────────────────────────────────────
window.CRM = {
  _state: null,
  _activities: null,
  _quotations: null,

  // Initialize — loads from localStorage or seeds from clean data
  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { this._state = JSON.parse(saved); } catch(e) { this._state = {}; }
    } else {
      this._state = {};
    }

    const savedAct = localStorage.getItem(ACTIVITIES_KEY);
    if (savedAct) {
      try { this._activities = JSON.parse(savedAct); } catch(e) { this._activities = {}; }
    } else {
      this._activities = {};
    }

    const savedQuot = localStorage.getItem(QUOTATIONS_KEY);
    if (savedQuot) {
      try { this._quotations = JSON.parse(savedQuot); } catch(e) { this._quotations = {}; }
    } else {
      this._quotations = {};
    }

    // Seed default activities for demo leads
    this._seedDemoData();
  },

  _seedDemoData() {
    const demoActivities = {
      'L001': [
        {id:'A001',date:'2026-04-01',tipo:'cotizacion',nota:'Cotización enviada: 2,500 ton Arena Sílica 30/50 a $1,980/ton. Total: $4,950,000 MXN. Válida 30 días.',user:'Carlos López'},
        {id:'A002',date:'2026-03-20',tipo:'llamada',nota:'Llamada con Ing. Andrés Garza. Confirmó interés en ampliar volumen. Próxima reunión 1 Abr.',user:'Carlos López'},
        {id:'A003',date:'2026-03-10',tipo:'email',nota:'Envío de ficha técnica Arena Sílica VC Granel + certificados NSF y especificaciones mesh.',user:'María Torres'},
      ],
      'L005': [
        {id:'A010',date:'2026-04-05',tipo:'reunion',nota:'Reunión presencial Vitro Monterrey. Negociando contrato marco 2026-2027 para nueva línea envases.',user:'Carlos López'},
        {id:'A011',date:'2026-03-28',tipo:'cotizacion',nota:'Cotización: 5,000 ton Sílica Float/mes. Precio $2,150/ton. Total anual ~$129,000,000 MXN.',user:'Carlos López'},
      ],
      'L040': [
        {id:'A020',date:'2026-04-02',tipo:'cotizacion',nota:'Cotización mantenimiento Estadio BBVA: 150 ton Arena Técnica FIFA. $2,050/ton = $307,500 MXN.',user:'María Torres'},
        {id:'A021',date:'2026-03-25',tipo:'visita',nota:'Visita técnica Estadio BBVA. Evaluación estado actual césped artificial + arena existente.',user:'María Torres'},
      ],
      'L030': [
        {id:'A030',date:'2026-03-28',tipo:'llamada',nota:'Llamada Patricia Solís CEMEX. Muy interesada en arena para premezclados Planta Apodaca. Solicita cotización formal.',user:'Carlos López'},
        {id:'A031',date:'2026-03-15',tipo:'email',nota:'Primer contacto vía LinkedIn + email. Presentación portafolio Covia Mexico.',user:'Carlos López'},
      ],
      'L070': [
        {id:'A040',date:'2026-03-30',tipo:'reunion',nota:'Reunión virtual con John Williams Halliburton. Burgos Basin: necesidad urgente Proppant 20/40 Q3-2026.',user:'Juan Pérez'},
        {id:'A041',date:'2026-03-22',tipo:'email',nota:'Envío especificaciones Proppant 20/40 y 40/70 + certificados API RP 19C.',user:'Juan Pérez'},
      ],
    };

    const demoQuotations = {
      'L001': [{id:'Q001',fecha:'2026-04-01',producto:'Arena Sílica Granular 30/50',toneladas:2500,precio_ton:1980,total:4950000,valida_hasta:'2026-05-01',status:'pendiente',notas:'Espera aprobación Dir. Compras'}],
      'L005': [{id:'Q010',fecha:'2026-03-28',producto:'Sílica Bajo Hierro (Vidrio Float)',toneladas:5000,precio_ton:2150,total:10750000,valida_hasta:'2026-04-28',status:'pendiente',notas:'Contrato marco mensual'}],
      'L040': [{id:'Q020',fecha:'2026-04-02',producto:'Arena Deportiva FIFA/ITF Cert.',toneladas:150,precio_ton:2050,total:307500,valida_hasta:'2026-05-02',status:'pendiente',notas:'Mantenimiento anual estadio'}],
      'L043': [{id:'Q030',fecha:'2026-04-03',producto:'Arena Técnica FIFA/ITF (certificada)',toneladas:800,precio_ton:2100,total:1680000,valida_hasta:'2026-05-03',status:'pendiente',notas:'Proyecto infraestructura Mundial 2026'}],
    };

    // Only seed if empty
    Object.keys(demoActivities).forEach(id => {
      if (!this._activities[id]) this._activities[id] = demoActivities[id];
    });
    Object.keys(demoQuotations).forEach(id => {
      if (!this._quotations[id]) this._quotations[id] = demoQuotations[id];
    });

    this._save();
  },

  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(this._activities));
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(this._quotations));
  },

  // Get override stage for a record id
  getStage(id) {
    return this._state[id] ? this._state[id].pipeline_stage : null;
  },

  // Set stage override
  setStage(id, stage) {
    if (!this._state[id]) this._state[id] = {};
    this._state[id].pipeline_stage = stage;
    this._state[id].ultima_actividad = new Date().toISOString().split('T')[0];
    this.logActivity(id, 'etapa', `Etapa avanzada a: ${stage}`, 'Sistema');
    this._save();
  },

  // Get activities for a record
  getActivities(id) {
    return this._activities[id] || [];
  },

  // Log activity
  logActivity(id, tipo, nota, user) {
    if (!this._activities[id]) this._activities[id] = [];
    this._activities[id].unshift({
      id: 'A' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      tipo,
      nota,
      user: user || sessionStorage.getItem('covia_user_email') || 'Usuario'
    });
    this._save();
  },

  // Get quotations for a record
  getQuotations(id) {
    return this._quotations[id] || [];
  },

  // Add quotation
  addQuotation(id, quot) {
    if (!this._quotations[id]) this._quotations[id] = [];
    const q = {
      id: 'Q' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      ...quot
    };
    this._quotations[id].unshift(q);
    // Auto-advance to cotizado
    const currentStage = this.getStage(id) || 'prospecto';
    const stages = ['prospecto','contactado','cotizado','negociacion','ganado','perdido'];
    if (stages.indexOf(currentStage) < stages.indexOf('cotizado')) {
      this.setStage(id, 'cotizado');
    }
    this.logActivity(id, 'cotizacion', `Cotización registrada: ${quot.toneladas} ton de ${quot.producto} a $${quot.precio_ton?.toLocaleString()}/ton. Total: $${quot.total?.toLocaleString()} MXN`, 'Usuario');
    this._save();
    return q;
  },

  // Update quotation status
  updateQuotationStatus(recordId, quotId, status) {
    const quots = this._quotations[recordId] || [];
    const q = quots.find(q => q.id === quotId);
    if (q) {
      q.status = status;
      if (status === 'aceptada') this.setStage(recordId, 'ganado');
      if (status === 'rechazada') this.logActivity(recordId, 'cotizacion', `Cotización rechazada por cliente.`, 'Usuario');
      this._save();
    }
  },

  // Get resolved record (merges base data with CRM overrides)
  resolve(baseRecord) {
    if (!baseRecord) return null;
    const override = this._state[baseRecord.id] || {};
    return {
      ...baseRecord,
      pipeline_stage: override.pipeline_stage || baseRecord.pipeline_stage || 'prospecto',
      ultima_actividad: override.ultima_actividad || baseRecord.ultima_actividad,
      cotizaciones: this.getQuotations(baseRecord.id),
      seguimiento: this.getActivities(baseRecord.id),
    };
  },

  // ─── KPI COMPUTATIONS ──────────────────────────────────────────────────────
  computeKPIs() {
    const allRecords = window.ALL_RECORDS || [];
    const clients = allRecords.filter(r => r.tp === 'a');
    const leads = allRecords.filter(r => r.tp === 'l').map(l => this.resolve(l));

    const totalLeads = leads.length;
    const clientesActivos = clients.length;
    const tasaConversion = totalLeads > 0 ? ((clientesActivos / (clientesActivos + totalLeads)) * 100).toFixed(1) : 0;

    // Volume
    const volCartera = clients.reduce((s, c) => s + (c.v || 0), 0);

    // Potential tonnage from leads
    let potencialLeads = 0;
    leads.forEach(l => {
      if (l.pot) {
        const parts = l.pot.toString().replace(/,/g, '').split('-');
        const avg = parts.length === 2 ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2 : parseFloat(parts[0]);
        if (!isNaN(avg)) potencialLeads += avg;
      }
    });

    // Pipeline stages
    const stageOrder = ['prospecto','contactado','cotizado','negociacion','ganado','perdido'];
    const contactados = leads.filter(l => stageOrder.indexOf(l.pipeline_stage) >= stageOrder.indexOf('contactado')).length;
    const cotizados = leads.filter(l => stageOrder.indexOf(l.pipeline_stage) >= stageOrder.indexOf('cotizado')).length;
    const enNegociacion = leads.filter(l => l.pipeline_stage === 'negociacion').length;
    const ganados = leads.filter(l => l.pipeline_stage === 'ganado').length;
    const eficienciaContactacion = totalLeads > 0 ? ((contactados / totalLeads) * 100).toFixed(1) : 0;
    const conversionCotizacion = cotizados > 0 ? ((ganados / cotizados) * 100).toFixed(1) : 0;

    // Revenue estimation (leads pipeline)
    const precios = window.PRECIO_REFERENCIA || {};
    let revenuePipeline = 0;
    leads.filter(l => stageOrder.indexOf(l.pipeline_stage) >= stageOrder.indexOf('cotizado')).forEach(l => {
      const pot = l.pot ? l.pot.toString().replace(/,/g, '').split('-') : ['0'];
      const avgTon = pot.length === 2 ? (parseFloat(pot[0]) + parseFloat(pot[1])) / 2 : parseFloat(pot[0]);
      const precio = precios[l.s] || precios.default || 1600;
      if (!isNaN(avgTon)) revenuePipeline += avgTon * precio;
    });

    // Active quotation values from CRM
    let revenueCotizaciones = 0;
    Object.values(this._quotations).forEach(quots => {
      quots.forEach(q => {
        if (q.status === 'pendiente' || q.status === 'aceptada') revenueCotizaciones += (q.total || 0);
      });
    });

    // Top segment by potential
    const segPot = {};
    leads.forEach(l => {
      const pot = l.pot ? l.pot.toString().replace(/,/g, '').split('-') : ['0'];
      const avgTon = pot.length === 2 ? (parseFloat(pot[0]) + parseFloat(pot[1])) / 2 : parseFloat(pot[0]);
      if (!isNaN(avgTon)) segPot[l.s] = (segPot[l.s] || 0) + avgTon;
    });
    const topSeg = Object.entries(segPot).sort((a,b) => b[1]-a[1])[0];
    const topSegLabel = topSeg ? (window.SEGMENTOS?.[topSeg[0]]?.label || topSeg[0]) : '—';

    // Toneladas leads convertidos
    const tonsConvertidas = leads.filter(l => l.pipeline_stage === 'ganado').reduce((s,l) => {
      const pot = l.pot ? l.pot.toString().replace(/,/g, '').split('-') : ['0'];
      const avg = pot.length === 2 ? (parseFloat(pot[0]) + parseFloat(pot[1])) / 2 : parseFloat(pot[0]);
      return s + (isNaN(avg) ? 0 : avg);
    }, 0);

    return {
      totalLeads,
      clientesActivos,
      tasaConversion,
      volCartera,
      potencialLeads: Math.round(potencialLeads),
      cotizacionesPipeline: cotizados,
      revenuePipeline: Math.round(revenuePipeline + revenueCotizaciones),
      contactados,
      eficienciaContactacion,
      cotizacionesGeneradas: cotizados,
      conversionCotizacion,
      tonsConvertidas: Math.round(tonsConvertidas),
      topSegmento: topSegLabel,
      enNegociacion,
      ganados,
      // Segment breakdown for charts
      segmentBreakdown: (() => {
        const bd = {};
        [...clients, ...leads].forEach(r => {
          if (!bd[r.s]) bd[r.s] = {clientes:0,leads:0,volCartera:0,potencial:0};
          if (r.tp === 'a') { bd[r.s].clientes++; bd[r.s].volCartera += (r.v || 0); }
          else {
            bd[r.s].leads++;
            const pot = r.pot ? r.pot.toString().replace(/,/g,'').split('-') : ['0'];
            const avg = pot.length===2 ? (parseFloat(pot[0])+parseFloat(pot[1]))/2 : parseFloat(pot[0]);
            if (!isNaN(avg)) bd[r.s].potencial += avg;
          }
        });
        return bd;
      })(),
      stageBreakdown: (() => {
        const bd = {};
        stageOrder.forEach(s => { bd[s] = leads.filter(l => l.pipeline_stage === s).length; });
        return bd;
      })(),
    };
  },

  // Get all leads resolved with CRM state
  getLeads(filter) {
    const leads = (window.COVIA_LEADS || []).map(l => this.resolve(l));
    if (!filter) return leads;
    return leads.filter(filter);
  },

  // Get leads by stage
  getLeadsByStage(stage) {
    return this.getLeads(l => l.pipeline_stage === stage);
  },

  // Reset all CRM state (for development)
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(QUOTATIONS_KEY);
    this._state = {};
    this._activities = {};
    this._quotations = {};
    this._seedDemoData();
  },

  // Add a lead from the Directorio to the Kanban pipeline
  addLeadFromDirectory(row) {
    if (!row) return;
    const id = 'DIR_' + (row._id !== undefined ? row._id : Date.now());
    // Check if already in CRM
    if (this._state[id]) return;
    // Seed in state
    this._state[id] = {
      pipeline_stage: 'prospecto',
      score_prioridad: row.score_ml || 50,
      decisor: row.contacto || '',
      ai_research: '',
      _from_dir: true
    };
    this._save();

    // Also push to COVIA_LEADS if not there
    if (window.COVIA_LEADS && !window.COVIA_LEADS.find(l => l.id === id)) {
      window.COVIA_LEADS.push({
        id, n: row.n, s: row.s, tp: 'l',
        d: row.d, v: row.v || 0, pot: row.pot || 0,
        p: row.p, prov: row.prov,
        lat: 0, lng: 0,
        lead_scoring: row.lead_scoring || 'P3',
        region: row.region || '',
        pipeline_stage: 'prospecto',
        score_prioridad: row.score_ml || 50,
      });
    }
  }
};

})();
