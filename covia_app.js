// covia_app.js — Main Application Logic for Covia Mexico Intelligence Platform v6
// Handles: Auth, Navigation, Dashboard KPIs, Map, CRM Kanban, Analytics, AI Research

(function() {
'use strict';

// ─── STATE ───────────────────────────────────────────────────────────────────
let currentTab = 'dashboard';
let mapInstance = null;
let mapMarkers = [];
let activeSegFilters = new Set(['all']);
let charts = {};
let selectedLeadId = null;
let aiSelectedId = null;

// ─── AUTH ────────────────────────────────────────────────────────────────────
function initAuth() {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  // Check existing session
  if (sessionStorage.getItem('covia_auth') === 'true') {
    showApp();
    return;
  }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    // Validate
    const validDomain = email.endsWith('@coviacorp.com') || email.endsWith('@covia.com');
    const validPassword = password === 'covia2026';

    if (!validDomain || !validPassword) {
      loginError.textContent = !validDomain
        ? 'Solo se permiten correos @coviacorp.com o @covia.com'
        : 'Contraseña incorrecta. Contacta a tu administrador.';
      loginError.classList.add('visible');
      btn.classList.remove('loading');
      return;
    }

    loginError.classList.remove('visible');
    btn.classList.add('loading');

    setTimeout(() => {
      sessionStorage.setItem('covia_auth', 'true');
      sessionStorage.setItem('covia_user_email', email);
      sessionStorage.setItem('covia_user_name', email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()));
      btn.classList.remove('loading');
      showApp();
    }, 800);
  });

  // Input: clear error
  document.querySelectorAll('#login-form input').forEach(input => {
    input.addEventListener('input', () => loginError.classList.remove('visible'));
  });
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  const app = document.getElementById('app');
  app.classList.add('visible');

  // Set user info
  const name = sessionStorage.getItem('covia_user_name') || 'Usuario';
  const email = sessionStorage.getItem('covia_user_email') || '';
  document.getElementById('user-name-display').textContent = name;
  document.getElementById('user-avatar-text').textContent = name.charAt(0).toUpperCase();
  document.getElementById('user-email-display').textContent = email;

  // Init CRM
  if (window.CRM) window.CRM.init();

  // Init app
  navigateTo('dashboard');
}

function logout() {
  sessionStorage.clear();
  document.getElementById('app').classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-form').reset();
  document.getElementById('login-error').classList.remove('visible');
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
function navigateTo(tab) {
  currentTab = tab;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });

  // Update topbar
  const tabMeta = {
    dashboard: { title: 'Dashboard Comercial', sub: 'KPIs y métricas de ventas en tiempo real' },
    mapa: { title: 'Mapa de Territorio', sub: 'Clientes y leads georeferenciados' },
    crm: { title: 'CRM & Pipeline', sub: 'Gestión del ciclo de ventas' },
    analytics: { title: 'Analytics Avanzado', sub: 'Forecasting y análisis de portafolio' },
    ia: { title: 'IA Investigación', sub: 'Inteligencia comercial asistida por IA' },
  };
  const meta = tabMeta[tab] || { title: 'Covia MX', sub: '' };
  document.getElementById('topbar-title').textContent = meta.title;
  document.getElementById('topbar-subtitle').textContent = meta.sub;

  // Show/hide panels
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');

  // Init tab content
  if (tab === 'dashboard') initDashboard();
  else if (tab === 'mapa') initMap();
  else if (tab === 'crm') initCRM();
  else if (tab === 'analytics') initAnalytics();
  else if (tab === 'ia') initAIPanel();
}

// ─── PARTICLE BACKGROUND ─────────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const N = 80;

  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      a: Math.random() * 0.5 + 0.1,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,75,135,${p.a})`;
      ctx.fill();
    });
    // Draw connections
    particles.forEach((p, i) => {
      particles.slice(i+1).forEach(q => {
        const d = Math.hypot(p.x-q.x, p.y-q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,75,135,${0.06 * (1 - d/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function initDashboard() {
  if (!window.CRM) return;
  const kpis = window.CRM.computeKPIs();
  renderKPIs(kpis);
  renderCharts(kpis);
  renderTopClients();
  renderRecentActivity();
}

function renderKPIs(kpis) {
  const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n?.toLocaleString() ?? '—';
  const fmtMXN = n => '$' + fmt(n);

  const kpiData = [
    { id:'kpi-leads', label:'Leads Totales', value: kpis.totalLeads, icon:'fa-users', color:'#004b87', sub:'prospecto al cierre' },
    { id:'kpi-clientes', label:'Clientes Activos', value: kpis.clientesActivos, icon:'fa-handshake', color:'#10b981', sub:'con contrato vigente' },
    { id:'kpi-conversion', label:'Tasa Conversión', value: kpis.tasaConversion+'%', icon:'fa-chart-line', color:'#0066cc', sub:'leads → clientes', gradient:true },
    { id:'kpi-cartera', label:'Vol. Cartera Actual', value: fmt(kpis.volCartera)+' ton', icon:'fa-boxes', color:'#f59e0b', sub:'toneladas/año' },
    { id:'kpi-potencial', label:'Potencial Leads', value: fmt(kpis.potencialLeads)+' ton', icon:'fa-rocket', color:'#00a3e0', sub:'toneladas estimadas' },
    { id:'kpi-pipeline', label:'Cotizaciones Pipeline', value: kpis.cotizacionesPipeline, icon:'fa-file-invoice', color:'#a78bfa', sub:'cotizado o mayor' },
    { id:'kpi-revenue', label:'Revenue Estimado', value: fmtMXN(kpis.revenuePipeline), icon:'fa-peso-sign', color:'#10b981', sub:'MXN pipeline activo', gradient:true },
  ];

  const secondary = [
    { label:'Contactados', value: kpis.contactados, icon:'fa-phone', color:'#004b87', sub:'Contactos realizados' },
    { label:'Efic. Contactación', value: kpis.eficienciaContactacion+'%', icon:'fa-bullseye', color:'#10b981', sub:'% leads contactados' },
    { label:'Cot. Generadas', value: kpis.cotizacionesGeneradas, icon:'fa-file-alt', color:'#0066cc', sub:'cotizaciones enviadas' },
    { label:'Conv. Cot→Venta', value: kpis.conversionCotizacion+'%', icon:'fa-funnel-dollar', color:'#f59e0b', sub:'% cotiz. ganadas' },
    { label:'Ton. Convertidas', value: fmt(kpis.tonsConvertidas)+' ton', icon:'fa-weight', color:'#00a3e0', sub:'leads cerrados' },
    { label:'Top Segmento', value: kpis.topSegmento, icon:'fa-star', color:'#a78bfa', sub:'mayor potencial' },
  ];

  const grid1 = document.getElementById('kpi-grid-primary');
  const grid2 = document.getElementById('kpi-grid-secondary');
  if (!grid1 || !grid2) return;

  grid1.innerHTML = kpiData.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon" style="color:${k.color};background:${k.color}20"><i class="fas ${k.icon}"></i></div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.gradient?'gradient':''}">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');

  grid2.innerHTML = secondary.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon" style="color:${k.color};background:${k.color}20"><i class="fas ${k.icon}"></i></div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" style="font-size:22px">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');
}

function renderCharts(kpis) {
  // Destroy existing
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 12, boxWidth: 10 } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family:'Inter',size:10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family:'Inter',size:10 } } }
    }
  };

  // Pipeline Funnel
  const pipelineCtx = document.getElementById('chart-pipeline');
  if (pipelineCtx) {
    const stages = window.PIPELINE_STAGES || [];
    const activeSt = stages.filter(s => s.id !== 'perdido');
    charts.pipeline = new Chart(pipelineCtx, {
      type: 'bar',
      data: {
        labels: activeSt.map(s => s.label),
        datasets: [{
          label: 'Leads',
          data: activeSt.map(s => kpis.stageBreakdown?.[s.id] || 0),
          backgroundColor: activeSt.map(s => s.color + '90'),
          borderColor: activeSt.map(s => s.color),
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
    });
  }

  // Segment Donut
  const segCtx = document.getElementById('chart-segments');
  if (segCtx) {
    const segs = window.SEGMENTOS || {};
    const bd = kpis.segmentBreakdown || {};
    const entries = Object.entries(bd).filter(([,v]) => v.volCartera + v.potencial > 0).sort((a,b) => (b[1].volCartera+b[1].potencial)-(a[1].volCartera+a[1].potencial)).slice(0,8);
    charts.segments = new Chart(segCtx, {
      type: 'doughnut',
      data: {
        labels: entries.map(([k]) => segs[k]?.label || k),
        datasets: [{
          data: entries.map(([,v]) => Math.round(v.volCartera + v.potencial)),
          backgroundColor: entries.map(([k]) => (segs[k]?.color || '#004b87') + 'cc'),
          borderColor: entries.map(([k]) => segs[k]?.color || '#004b87'),
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family:'Inter',size:10 }, padding:8, boxWidth:8 } }
        },
        cutout: '65%',
      }
    });
  }

  // Volume trend (monthly simulated)
  const trendCtx = document.getElementById('chart-trend');
  if (trendCtx) {
    const months = ['Oct','Nov','Dic','Ene','Feb','Mar','Abr'];
    const base = Math.round(kpis.volCartera / 12);
    const data = months.map((m,i) => Math.round(base * (0.85 + Math.random() * 0.3)));
    charts.trend = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Embarques (ton)',
          data,
          borderColor: '#004b87',
          backgroundColor: 'rgba(0,75,135,0.08)',
          pointBackgroundColor: '#004b87',
          pointRadius: 4,
          tension: 0.4,
          fill: true,
        }]
      },
      options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
    });
  }
}

function renderTopClients() {
  const container = document.getElementById('top-clients-list');
  if (!container) return;
  const clients = (window.COVIA_CLIENTS || []).filter(c => c.tp === 'a').sort((a,b) => b.v - a.v).slice(0,8);
  const max = clients[0]?.v || 1;
  const segs = window.SEGMENTOS || {};

  container.innerHTML = clients.map(c => {
    const pct = Math.round((c.v / max) * 100);
    const seg = segs[c.s] || {};
    return `
      <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:600;color:var(--t1);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.n}</div>
          <div style="font-size:12px;font-weight:700;color:var(--t1);margin-left:8px;flex-shrink:0">${c.v?.toLocaleString()} ton</div>
        </div>
        <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${seg.color||'#004b87'},${seg.color||'#0066cc'});border-radius:2px;transition:width 0.8s ease"></div>
        </div>
        <div style="font-size:10px;color:var(--t3);margin-top:4px">${seg.label||c.s} · ${c.d}</div>
      </div>
    `;
  }).join('');
}

function renderRecentActivity() {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;

  const allActs = [];
  (window.COVIA_LEADS || []).forEach(l => {
    const acts = window.CRM?.getActivities(l.id) || [];
    acts.forEach(a => allActs.push({ ...a, leadName: l.n, leadId: l.id }));
  });

  allActs.sort((a,b) => new Date(b.date) - new Date(a.date));
  const recent = allActs.slice(0, 10);

  const typeConfig = {
    cotizacion: { color: '#0066cc', icon: 'fa-file-invoice' },
    llamada: { color: '#004b87', icon: 'fa-phone' },
    email: { color: '#00a3e0', icon: 'fa-envelope' },
    reunion: { color: '#10b981', icon: 'fa-users' },
    visita: { color: '#f59e0b', icon: 'fa-map-marker-alt' },
    etapa: { color: '#a78bfa', icon: 'fa-arrow-right' },
  };

  if (!recent.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>Sin actividad reciente</p></div>';
    return;
  }

  container.innerHTML = recent.map(a => {
    const cfg = typeConfig[a.tipo] || { color: '#64748b', icon: 'fa-circle' };
    return `
      <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer" onclick="window.APP.openLeadDetail('${a.leadId}')">
        <div style="width:28px;height:28px;border-radius:50%;background:${cfg.color}20;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas ${cfg.icon}" style="font-size:11px;color:${cfg.color}"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:600;color:var(--t1);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.leadName}</div>
          <div style="font-size:11px;color:var(--t2);line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.nota}</div>
          <div style="font-size:10px;color:var(--t3);margin-top:2px">${a.date} · ${a.user || 'Sistema'}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── MAP ──────────────────────────────────────────────────────────────────────
function initMap() {
  const container = document.getElementById('leaflet-map');
  if (!container) return;

  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }

  mapInstance = L.map('leaflet-map', {
    center: [23.5, -102.5],
    zoom: 5,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    maxZoom: 18,
    subdomains: 'abcd',
  }).addTo(mapInstance);

  // Add plants
  const plantas = window.PLANTAS || {};
  Object.values(plantas).forEach(p => {
    if (!p.approx) {
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#f59e0b;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(245,158,11,0.6)"></div>`,
        className: '', iconSize: [14,14], iconAnchor: [7,7]
      });
      L.marker([p.lat, p.lng], { icon }).addTo(mapInstance)
        .bindPopup(`<div class="map-popup"><div class="popup-name" style="color:#f59e0b">🏭 ${p.label}</div><div style="font-size:11px;color:#94a3b8">${p.addr}</div><div style="font-size:11px;color:#94a3b8">${p.city}, ${p.state}</div></div>`, {maxWidth:280});
    }
  });

  renderMapMarkers();
  renderMapFilters();
  updateMapStats();
}

function getMarkerIcon(record) {
  const segs = window.SEGMENTOS || {};
  const seg = segs[record.s] || {};
  const color = seg.color || '#004b87';
  const isClient = record.tp === 'a';
  const size = isClient ? 12 : 10;
  const shadow = isClient ? `0 0 10px ${color}90` : 'none';
  const border = isClient ? `3px solid ${color}` : `2px solid ${color}80`;
  const bg = isClient ? color : color + '60';

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:${border};border-radius:50%;box-shadow:${shadow}"></div>`,
    className: '', iconSize: [size,size], iconAnchor: [size/2,size/2]
  });
}

// ─── MAP DATA MERGE ───────────────────────────────────────────────────────────
// Merges the detailed ALL_RECORDS (~79) with every COVIA_DIRECTORIO entry
// that has lat/lng coordinates, de-duplicating by company name.
function getMapData() {
  const base = window.ALL_RECORDS || [];
  const existingNames = new Set(base.map(r => (r.n || '').toLowerCase().trim()));
  const dirEntries = (window.COVIA_DIRECTORIO || [])
    .filter(r => r.lat && r.lng && !existingNames.has((r.n || '').toLowerCase().trim()))
    .map(r => ({
      id: 'DIR_' + (r.id || r.n),
      n:  r.n,
      s:  r.s,
      tp: (r.tipo === 'Cliente actual') ? 'a' : 'l',
      d:  r.d || r.region || '',
      lat: r.lat,
      lng: r.lng,
      v:   r.v   || 0,
      pot: r.pot || 0,
      p:   r.mineral || r.mercado_vertical || ''
    }));
  return [...base, ...dirEntries];
}

function renderMapMarkers() {
  if (!mapInstance) return;

  mapMarkers.forEach(m => m.remove());
  mapMarkers = [];

  const all = getMapData();
  const segs = window.SEGMENTOS || {};

  all.forEach(r => {
    if (!r.lat || !r.lng) return;
    if (!activeSegFilters.has('all') && !activeSegFilters.has(r.s)) return;

    const icon = getMarkerIcon(r);
    const seg = segs[r.s] || {};
    const segColor = seg.color || '#004b87';
    const isClient = r.tp === 'a';

    const popup = L.popup({ maxWidth: 280, className: '' }).setContent(`
      <div class="map-popup">
        <div class="popup-name">${r.n}</div>
        <div>
          <span class="popup-seg" style="background:${segColor}20;color:${segColor}">${seg.label || r.s}</span>
          <span style="font-size:10px;color:#94a3b8;margin-left:6px">${isClient ? '✅ Cliente activo' : '🎯 Lead'}</span>
        </div>
        <div class="popup-row">Ubicación <span>${r.d || '—'}</span></div>
        ${isClient ? `<div class="popup-row">Volumen <span>${(r.v||0).toLocaleString()} ton/año</span></div>` : `<div class="popup-row">Potencial <span>${r.pot || '—'} ton/año</span></div>`}
        <div class="popup-row">Producto <span style="max-width:150px;overflow:hidden;text-overflow:ellipsis">${r.p || '—'}</span></div>
        ${r.decisor ? `<div class="popup-row">Contacto <span>${r.decisor}</span></div>` : ''}
        ${!isClient ? `<button class="popup-btn" onclick="window.APP.openLeadDetail('${r.id}');if(window._leafletMap)window._leafletMap.closePopup()">Ver en CRM →</button>` : ''}
      </div>
    `);

    const marker = L.marker([r.lat, r.lng], { icon }).addTo(mapInstance);
    marker.bindPopup(popup);
    mapMarkers.push(marker);
  });

  window._leafletMap = mapInstance;
  updateMapStats();
}

function renderMapFilters() {
  const container = document.getElementById('map-seg-filters');
  if (!container) return;
  const segs = window.SEGMENTOS || {};
  const all = getMapData();

  // Count by segment
  const counts = {};
  all.forEach(r => { counts[r.s] = (counts[r.s]||0)+1; });

  const chips = Object.entries(segs).filter(([k]) => counts[k] > 0).map(([k,v]) => `
    <span class="seg-chip ${activeSegFilters.has(k)||activeSegFilters.has('all')?'active':''}"
      style="border-color:${v.color}40;${(activeSegFilters.has(k)||activeSegFilters.has('all'))?'background:'+v.color+'20;color:'+v.color:''}"
      data-seg="${k}" onclick="window.APP.toggleSegFilter('${k}')">
      <i class="fas ${v.icon}"></i>${v.label} <span style="opacity:0.6">${counts[k]||0}</span>
    </span>
  `).join('');

  container.innerHTML = `
    <span class="seg-chip ${activeSegFilters.has('all')?'active':''}" style="${activeSegFilters.has('all')?'background:rgba(0,75,135,0.2);color:#004b87;border-color:rgba(0,75,135,0.4)':''}" onclick="window.APP.toggleSegFilter('all')">
      <i class="fas fa-globe"></i>Todos <span style="opacity:0.6">${all.length}</span>
    </span>
    ${chips}
  `;
}

function updateMapStats() {
  const all = getMapData();
  const visible = activeSegFilters.has('all') ? all : all.filter(r => activeSegFilters.has(r.s));
  const clients = visible.filter(r => r.tp === 'a');
  const leads = visible.filter(r => r.tp === 'l');
  const volTotal = clients.reduce((s,c) => s+c.v, 0);

  const statEl = document.getElementById('map-stats-content');
  if (statEl) {
    statEl.innerHTML = `
      <div class="map-stat-row"><span class="label">Puntos visibles</span><span class="value">${visible.length}</span></div>
      <div class="map-stat-row"><span class="label">Clientes activos</span><span class="value" style="color:var(--green)">${clients.length}</span></div>
      <div class="map-stat-row"><span class="label">Leads</span><span class="value" style="color:var(--sky)">${leads.length}</span></div>
      <div class="map-stat-row"><span class="label">Vol. visible</span><span class="value">${(volTotal/1000).toFixed(0)}K ton</span></div>
    `;
  }
}

// ─── CRM KANBAN ───────────────────────────────────────────────────────────────
function initCRM() {
  renderKanban();
}

function renderKanban(searchQuery) {
  const board = document.getElementById('kanban-board');
  if (!board || !window.CRM) return;

  const stages = window.PIPELINE_STAGES || [];
  const leadsAll = window.CRM.getLeads();

  // Filter by search
  const leads = searchQuery ? leadsAll.filter(l =>
    l.n?.toLowerCase().includes(searchQuery) ||
    l.d?.toLowerCase().includes(searchQuery) ||
    l.s?.toLowerCase().includes(searchQuery)
  ) : leadsAll;

  board.innerHTML = stages.filter(s => s.id !== 'perdido' && s.id !== 'ganado').map(stage => {
    const stageleads = leads.filter(l => l.pipeline_stage === stage.id);
    return renderKanbanColumn(stage, stageleads);
  }).join('') + (() => {
    const ganados = leads.filter(l => l.pipeline_stage === 'ganado');
    const perdidos = leads.filter(l => l.pipeline_stage === 'perdido');
    return renderKanbanColumn(stages.find(s=>s.id==='ganado'), ganados) +
           renderKanbanColumn(stages.find(s=>s.id==='perdido'), perdidos);
  })();
}

function renderKanbanColumn(stage, leads) {
  if (!stage) return '';
  const segs = window.SEGMENTOS || {};
  const potTotal = leads.reduce((s,l) => {
    const p = l.pot ? l.pot.toString().replace(/,/g,'').split('-') : ['0'];
    const avg = p.length===2 ? (parseFloat(p[0])+parseFloat(p[1]))/2 : parseFloat(p[0]);
    return s + (isNaN(avg)?0:avg);
  }, 0);

  const cards = leads.sort((a,b) => (b.score_prioridad||0)-(a.score_prioridad||0)).map(l => renderLeadCard(l, segs)).join('');

  return `
    <div class="kanban-column">
      <div class="kanban-col-header" style="border-top:3px solid ${stage.color}">
        <span class="col-icon" style="color:${stage.color}"><i class="fas ${stage.icon}"></i></span>
        <span class="col-title">${stage.label}</span>
        <span class="col-count" style="background:${stage.color}20;color:${stage.color}">${leads.length}</span>
      </div>
      ${potTotal > 0 ? `<div style="padding:6px 10px;font-size:10px;color:var(--t3);border-bottom:1px solid var(--border)">~${Math.round(potTotal/1000)}K ton potencial</div>` : ''}
      <div class="kanban-col-body">
        ${cards || '<div class="empty-state" style="padding:20px"><i class="fas fa-inbox" style="font-size:24px"></i><p>Sin leads</p></div>'}
      </div>
    </div>
  `;
}

function renderLeadCard(l, segs) {
  const seg = segs[l.s] || {};
  const score = l.score_prioridad || 0;
  const scoreClass = score >= 85 ? 'score-high' : score >= 70 ? 'score-med' : 'score-low';
  const activities = window.CRM?.getActivities(l.id) || [];
  const lastAct = activities[0];

  return `
    <div class="lead-card" onclick="window.APP.openLeadDetail('${l.id}')">
      <div class="lc-name">${l.n}</div>
      <div class="lc-badges">
        <span class="seg-badge" style="background:${seg.color||'#004b87'}20;color:${seg.color||'#004b87'};border:1px solid ${seg.color||'#004b87'}30">
          <i class="fas ${seg.icon||'fa-circle'}" style="font-size:9px"></i>${seg.label||l.s}
        </span>
      </div>
      <div class="lc-loc"><i class="fas fa-map-marker-alt" style="font-size:9px"></i>${l.d||'—'}</div>
      <div class="lc-pot"><i class="fas fa-boxes" style="font-size:9px;color:var(--t3)"></i> Pot: <strong>${l.pot||'—'}</strong> ton/año</div>
      ${l.decisor && l.decisor !== 'Pendiente enriquecimiento' ? `<div style="font-size:10px;color:var(--t3);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><i class="fas fa-user" style="font-size:9px"></i> ${l.decisor}</div>` : ''}
      <div class="lc-footer">
        <span class="score-badge ${scoreClass}"><i class="fas fa-bolt" style="font-size:9px"></i>${score}</span>
        <span class="lc-date">${lastAct ? lastAct.date : (l.ultima_actividad||'—')}</span>
      </div>
    </div>
  `;
}

function openLeadDetail(id) {
  const allRecords = window.ALL_RECORDS || [];
  const base = allRecords.find(r => r.id === id);
  if (!base) return;
  const record = window.CRM ? window.CRM.resolve(base) : base;

  selectedLeadId = id;

  // If not on CRM tab, switch to it first
  if (currentTab !== 'crm') navigateTo('crm');

  const panel = document.getElementById('lead-detail-panel');
  if (!panel) return;

  renderLeadDetailPanel(record);
  panel.classList.add('open');
}

function renderLeadDetailPanel(r) {
  const panel = document.getElementById('lead-detail-panel');
  if (!panel) return;

  const segs = window.SEGMENTOS || {};
  const seg = segs[r.s] || {};
  const stages = window.PIPELINE_STAGES || [];
  const currentStage = r.pipeline_stage || 'prospecto';
  const activities = r.seguimiento || [];
  const quotations = r.cotizaciones || [];

  const typeConfig = {
    cotizacion: { color: '#0066cc', icon: 'fa-file-invoice' },
    llamada: { color: '#004b87', icon: 'fa-phone' },
    email: { color: '#00a3e0', icon: 'fa-envelope' },
    reunion: { color: '#10b981', icon: 'fa-users' },
    visita: { color: '#f59e0b', icon: 'fa-map-marker-alt' },
    etapa: { color: '#a78bfa', icon: 'fa-arrow-right' },
  };

  panel.innerHTML = `
    <div class="ldp-header">
      <div class="ldp-title-area">
        <div class="ldp-title">${r.n}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="seg-badge" style="background:${seg.color||'#004b87'}20;color:${seg.color||'#004b87'}">
            <i class="fas ${seg.icon||'fa-circle'}"></i>${seg.label||r.s}
          </span>
          <span style="font-size:11px;color:var(--t3)">${r.tp==='a'?'✅ Cliente activo':'🎯 Lead'}</span>
          ${r.score_prioridad ? `<span class="score-badge ${r.score_prioridad>=85?'score-high':r.score_prioridad>=70?'score-med':'score-low'}"><i class="fas fa-bolt"></i>${r.score_prioridad}</span>` : ''}
        </div>
      </div>
      <button class="ldp-close" onclick="document.getElementById('lead-detail-panel').classList.remove('open')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="ldp-body">
      <!-- Company Info -->
      <div class="ldp-section">
        <div class="ldp-section-title"><i class="fas fa-building"></i> Empresa</div>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Ubicación</div><div class="info-val">${r.d||'—'}</div></div>
          <div class="info-item"><div class="info-label">Segmento</div><div class="info-val">${seg.label||r.s}</div></div>
          <div class="info-item"><div class="info-label">${r.tp==='a'?'Vol. Actual':'Vol. Potencial'}</div><div class="info-val">${r.tp==='a'?((r.v||0).toLocaleString()+' ton/año'):(r.pot||'—')+' ton/año'}</div></div>
          <div class="info-item"><div class="info-label">Proveedor actual</div><div class="info-val">${r.prov||'—'}</div></div>
          <div class="info-item" style="grid-column:1/-1"><div class="info-label">Producto</div><div class="info-val">${r.p||'—'}</div></div>
        </div>
      </div>

      <!-- Contact -->
      <div class="ldp-section">
        <div class="ldp-section-title"><i class="fas fa-user"></i> Contacto</div>
        <div class="info-grid">
          <div class="info-item" style="grid-column:1/-1"><div class="info-label">Decisor</div><div class="info-val">${r.decisor||'Pendiente enriquecimiento'}</div></div>
          <div class="info-item"><div class="info-label">Email</div><div class="info-val"><a href="mailto:${r.contacto?.email}">${r.contacto?.email||'—'}</a></div></div>
          <div class="info-item"><div class="info-label">Teléfono</div><div class="info-val"><a href="tel:${r.contacto?.tel}">${r.contacto?.tel||'—'}</a></div></div>
          ${r.contacto?.linkedin ? `<div class="info-item" style="grid-column:1/-1"><div class="info-label">LinkedIn</div><div class="info-val"><a href="${r.contacto.linkedin}" target="_blank">Ver perfil →</a></div></div>` : ''}
        </div>
      </div>

      <!-- AI Research -->
      ${r.ai_research ? `
      <div class="ldp-section">
        <div class="ldp-section-title"><i class="fas fa-robot"></i> Inteligencia IA</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span class="ai-status-badge ${r.ai_research.estado==='activo'?'ai-activo':r.ai_research.estado==='posible_baja'?'ai-posible-baja':'ai-no-verificado'}">
            ${r.ai_research.estado==='activo'?'✅ Activo':r.ai_research.estado==='posible_baja'?'❌ Posible baja':'⚠️ No verificado'}
          </span>
          <span style="font-size:11px;color:var(--t3)">Confianza: <strong style="color:var(--t1)">${r.ai_research.confidence}%</strong></span>
        </div>
        ${r.ai_research.senales_compra?.length ? `
          <div style="margin-bottom:8px">
            <div style="font-size:10px;font-weight:600;color:var(--t3);text-transform:uppercase;margin-bottom:6px">Señales de compra</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${r.ai_research.senales_compra.map(s=>`<span class="ai-signal-tag"><i class="fas fa-bolt"></i>${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${r.ai_research.fuentes?.length ? `
          <div style="font-size:10px;font-weight:600;color:var(--t3);text-transform:uppercase;margin-bottom:6px">Fuentes</div>
          <div>${r.ai_research.fuentes.map(f=>`<span class="source-tag"><i class="fas fa-link"></i>${f}</span>`).join('')}</div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Pipeline Stage -->
      <div class="ldp-section">
        <div class="ldp-section-title"><i class="fas fa-stream"></i> Etapa Pipeline</div>
        <div class="stage-selector">
          ${(window.PIPELINE_STAGES||[]).map(s => `
            <button class="stage-btn ${currentStage===s.id?'current':''}" onclick="window.APP.setLeadStage('${r.id}','${s.id}')"
              style="${currentStage===s.id?'border-color:'+s.color+';background:'+s.color+'15;color:'+s.color:''}">
              <span class="stage-icon" style="color:${s.color}"><i class="fas ${s.icon}"></i></span>
              <span class="stage-label">${s.label}</span>
              ${currentStage===s.id?'<i class="fas fa-check" style="color:'+s.color+'"></i>':''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Quotations -->
      <div class="ldp-section">
        <div class="ldp-section-title"><i class="fas fa-file-invoice-dollar"></i> Cotizaciones</div>
        ${quotations.length ? `
          <table class="quot-table">
            <thead><tr><th>Producto</th><th>Ton</th><th>Total MXN</th><th>Estado</th></tr></thead>
            <tbody>
              ${quotations.map(q=>`
                <tr>
                  <td>${q.producto}</td>
                  <td>${q.toneladas?.toLocaleString()}</td>
                  <td>$${q.total?.toLocaleString()}</td>
                  <td><span class="quot-status quot-${q.status}">${q.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="font-size:12px;color:var(--t3)">Sin cotizaciones registradas.</p>'}
      </div>

      <!-- Activity Timeline -->
      <div class="ldp-section">
        <div class="ldp-section-title"><i class="fas fa-history"></i> Seguimiento</div>
        ${activities.length ? `
          <div class="activity-timeline">
            ${activities.slice(0,8).map(a => {
              const cfg = typeConfig[a.tipo] || { color:'#64748b', icon:'fa-circle' };
              return `
                <div class="activity-item">
                  <div class="activity-dot" style="background:${cfg.color}20;color:${cfg.color}">
                    <i class="fas ${cfg.icon}" style="font-size:11px"></i>
                  </div>
                  <div class="activity-content">
                    <div class="act-note">${a.nota}</div>
                    <div class="act-meta"><span>${a.date}</span><span>${a.user||'Sistema'}</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : '<p style="font-size:12px;color:var(--t3)">Sin actividad registrada.</p>'}
      </div>
    </div>

    <div class="ldp-actions">
      <button class="action-btn blue" onclick="window.APP.logActivityModal('${r.id}')">
        <i class="fas fa-phone"></i> Registrar Contacto
      </button>
      <button class="action-btn purple" onclick="window.APP.registerQuotationModal('${r.id}')">
        <i class="fas fa-file-invoice"></i> Registrar Cotización
      </button>
      <button class="action-btn green" onclick="window.APP.advanceStage('${r.id}')">
        <i class="fas fa-arrow-right"></i> Avanzar Etapa
      </button>
    </div>
  `;
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
function initAnalytics() {
  if (!window.CRM) return;
  const kpis = window.CRM.computeKPIs();
  renderAnalyticsCharts(kpis);
}

function renderAnalyticsCharts(kpis) {
  // Destroy existing analytics charts
  ['chart-vol-seg','chart-conv-funnel','chart-monthly-pot','chart-priority-scatter'].forEach(id => {
    if (charts[id]) { try{charts[id].destroy();}catch(e){} }
  });

  const segs = window.SEGMENTOS || {};
  const bd = kpis.segmentBreakdown || {};

  // Volume by segment (bar)
  const vsCtx = document.getElementById('chart-vol-seg');
  if (vsCtx) {
    const entries = Object.entries(bd).sort((a,b) => b[1].volCartera - a[1].volCartera).slice(0, 10);
    charts['chart-vol-seg'] = new Chart(vsCtx, {
      type: 'bar',
      data: {
        labels: entries.map(([k]) => segs[k]?.label || k),
        datasets: [
          { label: 'Cartera Actual (ton)', data: entries.map(([,v]) => Math.round(v.volCartera)), backgroundColor: '#004b8790', borderColor: '#004b87', borderWidth: 1, borderRadius: 4 },
          { label: 'Potencial Leads (ton)', data: entries.map(([,v]) => Math.round(v.potencial)), backgroundColor: '#0066cc90', borderColor: '#0066cc', borderWidth: 1, borderRadius: 4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color:'#94a3b8', font:{family:'Inter',size:11} } } },
        scales: {
          x: { grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
          y: { grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
        }
      }
    });
  }

  // Conversion funnel
  const cfCtx = document.getElementById('chart-conv-funnel');
  if (cfCtx) {
    const stages = window.PIPELINE_STAGES || [];
    const counts = stages.filter(s=>s.id!=='perdido').map(s => ({
      label: s.label,
      count: kpis.stageBreakdown?.[s.id] || 0,
      color: s.color,
    }));
    charts['chart-conv-funnel'] = new Chart(cfCtx, {
      type: 'bar',
      data: {
        labels: counts.map(c=>c.label),
        datasets: [{
          data: counts.map(c=>c.count),
          backgroundColor: counts.map(c=>c.color+'90'),
          borderColor: counts.map(c=>c.color),
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
          y: { grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#94a3b8', font:{family:'Inter',size:11} } },
        }
      }
    });
  }

  // Monthly potential (simulated)
  const mpCtx = document.getElementById('chart-monthly-pot');
  if (mpCtx) {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const realized = [0,0,0,kpis.volCartera/12,kpis.volCartera/12,kpis.volCartera/12].map(v=>Math.round(v));
    const forecast = months.map((_,i) => i >= 3 ? Math.round(kpis.potencialLeads/12 * (0.1 + i*0.08)) : 0);
    charts['chart-monthly-pot'] = new Chart(mpCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Cartera Actual', data: [...realized, ...Array(6).fill(kpis.volCartera/12).map(v=>Math.round(v))], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', pointRadius: 3, tension: 0.4, fill: true },
          { label: 'Forecast Pipeline', data: forecast, borderColor: '#0066cc', backgroundColor: 'rgba(0,102,204,0.08)', pointRadius: 3, tension: 0.4, fill: true, borderDash: [4,4] },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color:'#94a3b8', font:{family:'Inter',size:11} } } },
        scales: {
          x: { grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
          y: { grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
        }
      }
    });
  }

  // Top leads by priority scatter
  const psCtx = document.getElementById('chart-priority-scatter');
  if (psCtx) {
    const leads = window.CRM?.getLeads() || [];
    const topLeads = leads.filter(l => l.score_prioridad > 0).sort((a,b) => b.score_prioridad - a.score_prioridad).slice(0, 20);
    const segColors = Object.fromEntries(Object.entries(segs).map(([k,v]) => [k, v.color || '#004b87']));

    charts['chart-priority-scatter'] = new Chart(psCtx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Leads por prioridad',
          data: topLeads.map((l,i) => {
            const pot = l.pot ? l.pot.toString().replace(/,/g,'').split('-') : ['0'];
            const avg = pot.length===2?(parseFloat(pot[0])+parseFloat(pot[1]))/2:parseFloat(pot[0]);
            return { x: l.score_prioridad||0, y: isNaN(avg)?0:avg, label: l.n };
          }),
          backgroundColor: topLeads.map(l => (segColors[l.s]||'#004b87') + 'cc'),
          pointRadius: 7,
          pointHoverRadius: 10,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const d = ctx.raw;
                const l = topLeads[ctx.dataIndex];
                return [`${l?.n}`, `Prioridad: ${d.x}`, `Potencial: ${Math.round(d.y)} ton`];
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Score Prioridad', color: '#94a3b8', font:{family:'Inter',size:11} }, grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
          y: { title: { display: true, text: 'Potencial (ton/año)', color: '#94a3b8', font:{family:'Inter',size:11} }, grid: { color:'rgba(255,255,255,0.04)' }, ticks: { color:'#64748b', font:{family:'Inter',size:10} } },
        }
      }
    });
  }
}

// ─── AI RESEARCH PANEL ───────────────────────────────────────────────────────
function initAIPanel() {
  renderAILeadList();
  const reportCard = document.getElementById('ai-report-card-body');
  if (reportCard) {
    reportCard.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-robot" style="background:linear-gradient(135deg,#004b87,#00a3e0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text"></i>
        <h3>Selecciona un lead</h3>
        <p>Elige un lead de la lista para iniciar la investigación de IA</p>
      </div>
    `;
  }
}

function renderAILeadList(searchQuery) {
  const container = document.getElementById('ai-lead-list');
  if (!container || !window.CRM) return;

  let leads = window.CRM.getLeads();
  if (searchQuery) {
    leads = leads.filter(l => l.n?.toLowerCase().includes(searchQuery) || l.s?.toLowerCase().includes(searchQuery));
  }
  leads = leads.sort((a,b) => (b.ai_research?.confidence||0) - (a.ai_research?.confidence||0));

  const segs = window.SEGMENTOS || {};

  container.innerHTML = leads.map(l => {
    const ai = l.ai_research || {};
    const statusClass = ai.estado === 'activo' ? 'ai-activo' : ai.estado === 'posible_baja' ? 'ai-posible-baja' : 'ai-no-verificado';
    const statusText = ai.estado === 'activo' ? '✅ Activo' : ai.estado === 'posible_baja' ? '❌ Posible baja' : '⚠️ No verificado';
    const seg = segs[l.s] || {};

    return `
      <div class="ai-lead-item ${aiSelectedId===l.id?'selected':''}" onclick="window.APP.selectAILead('${l.id}')">
        <div class="ai-confidence-ring">
          <canvas id="ring-${l.id}" width="48" height="48"></canvas>
          <span class="ai-confidence-val" style="color:${ai.confidence>=80?'#10b981':ai.confidence>=60?'#f59e0b':'#ef4444'}">${ai.confidence||0}</span>
        </div>
        <div class="ai-lead-info">
          <div class="ai-lead-name">${l.n}</div>
          <div class="ai-lead-sub">${seg.label||l.s} · ${l.d||'—'}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span class="ai-status-badge ${statusClass}" style="font-size:10px;padding:2px 7px">${statusText}</span>
          </div>
          ${ai.senales_compra?.length ? `
            <div class="ai-signals" style="margin-top:4px">
              ${ai.senales_compra.slice(0,2).map(s=>`<span class="ai-signal-tag">${s}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Draw confidence rings
  requestAnimationFrame(() => {
    leads.forEach(l => {
      const canvas = document.getElementById('ring-'+l.id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const conf = l.ai_research?.confidence || 0;
      const color = conf >= 80 ? '#10b981' : conf >= 60 ? '#f59e0b' : '#ef4444';
      const angle = (conf / 100) * Math.PI * 2 - Math.PI/2;
      ctx.clearRect(0, 0, 48, 48);
      ctx.beginPath();
      ctx.arc(24, 24, 19, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(24, 24, 19, -Math.PI/2, angle);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  });
}

function selectAILead(id) {
  aiSelectedId = id;
  document.querySelectorAll('.ai-lead-item').forEach(el => {
    el.classList.toggle('selected', el.onclick?.toString().includes(`'${id}'`));
  });
  renderAIReport(id);
}

function renderAIReport(id) {
  const allRecords = window.ALL_RECORDS || [];
  const base = allRecords.find(r => r.id === id);
  if (!base) return;
  const record = window.CRM ? window.CRM.resolve(base) : base;

  const reportBody = document.getElementById('ai-report-card-body');
  const reportTitle = document.getElementById('ai-report-title');
  if (!reportBody) return;

  if (reportTitle) {
    reportTitle.textContent = record.n;
    document.getElementById('ai-report-sub').textContent = (window.SEGMENTOS?.[record.s]?.label || record.s) + ' · ' + (record.d || '—');
  }

  // Show loading
  reportBody.innerHTML = `
    <div class="ai-loading">
      <div class="ai-spinner"></div>
      <div class="ai-loading-text">Analizando perfil comercial...</div>
      <div class="ai-loading-steps">
        <div class="ai-step active" id="ai-step-1"><i class="fas fa-search"></i> Buscando en LinkedIn...</div>
        <div class="ai-step" id="ai-step-2"><i class="fas fa-globe"></i> Analizando web corporativa...</div>
        <div class="ai-step" id="ai-step-3"><i class="fas fa-database"></i> Cruzando ImportGenius...</div>
        <div class="ai-step" id="ai-step-4"><i class="fas fa-chart-bar"></i> Generando perfil IA...</div>
      </div>
    </div>
  `;

  // Simulate AI steps
  const steps = [1, 2, 3, 4];
  steps.forEach((n, i) => {
    setTimeout(() => {
      document.getElementById(`ai-step-${n}`)?.classList.add('done');
      if (n < 4) document.getElementById(`ai-step-${n+1}`)?.classList.add('active');
    }, (i+1) * 600);
  });

  setTimeout(() => {
    renderAIReportContent(record);
  }, 2800);
}

function renderAIReportContent(r) {
  const reportBody = document.getElementById('ai-report-card-body');
  if (!reportBody) return;

  const ai = r.ai_research || {};
  const segs = window.SEGMENTOS || {};
  const seg = segs[r.s] || {};

  const statusClass = ai.estado === 'activo' ? 'ai-activo' : ai.estado === 'posible_baja' ? 'ai-posible-baja' : 'ai-no-verificado';
  const statusText = ai.estado === 'activo' ? '✅ Contacto Activo' : ai.estado === 'posible_baja' ? '❌ Posible Baja' : '⚠️ No Verificado';

  const potText = r.pot ? `${r.pot} ton/año` : r.tp==='a' ? `${(r.v||0).toLocaleString()} ton/año (actual)` : 'Por determinar';
  const precios = window.PRECIO_REFERENCIA || {};
  const precio = precios[r.s] || precios.default || 1600;
  const pot = r.pot ? r.pot.toString().replace(/,/g,'').split('-') : ['0'];
  const avgTon = pot.length===2?(parseFloat(pot[0])+parseFloat(pot[1]))/2:parseFloat(pot[0]);
  const revenueEst = isNaN(avgTon) ? 0 : Math.round(avgTon * precio);

  reportBody.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">
      <span class="ai-status-badge ${statusClass}">${statusText}</span>
      <span style="font-size:12px;color:var(--t3)">Confianza: <strong style="color:var(--t1)">${ai.confidence}%</strong></span>
      <span style="font-size:11px;color:var(--t3)">Ver: ${ai.ultima_verificacion||'—'}</span>
    </div>

    <div class="ai-report-section">
      <h4><i class="fas fa-building"></i> Perfil Empresarial</h4>
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:12px;line-height:1.7;color:var(--t2)">
        <strong style="color:var(--t1)">${r.n}</strong> opera en el segmento de <strong>${seg.label||r.s}</strong> con base en ${r.d||'México'}.
        Consume principalmente <em>${r.p||seg.product||'productos minerales'}</em>.
        Proveedor actual identificado: <strong>${r.prov||'No determinado'}</strong>.
        ${r.decisor && r.decisor !== 'Pendiente enriquecimiento' ? `El decisor de compras identificado es <strong>${r.decisor}</strong>.` : 'El decisor de compras requiere verificación adicional.'}
      </div>
    </div>

    ${ai.senales_compra?.length ? `
    <div class="ai-report-section">
      <h4><i class="fas fa-bolt"></i> Señales de Compra Detectadas</h4>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${ai.senales_compra.map(s => `
          <div style="display:flex;align-items:flex-start;gap:8px;padding:8px;background:rgba(0,75,135,0.06);border:1px solid rgba(0,75,135,0.15);border-radius:8px">
            <i class="fas fa-bolt" style="color:#004b87;font-size:11px;margin-top:1px"></i>
            <span style="font-size:12px;color:var(--t2)">${s}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="ai-report-section">
      <h4><i class="fas fa-chart-bar"></i> Estimación Comercial</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="padding:10px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:10px;text-align:center">
          <div style="font-size:10px;color:var(--t3);text-transform:uppercase;margin-bottom:4px">Potencial</div>
          <div style="font-size:16px;font-weight:700;color:#10b981">${potText}</div>
        </div>
        <div style="padding:10px;background:rgba(0,102,204,0.08);border:1px solid rgba(0,102,204,0.15);border-radius:10px;text-align:center">
          <div style="font-size:10px;color:var(--t3);text-transform:uppercase;margin-bottom:4px">Revenue Est.</div>
          <div style="font-size:16px;font-weight:700;color:#004b87">${revenueEst > 0 ? '$'+revenueEst.toLocaleString() : '—'} MXN</div>
        </div>
      </div>
    </div>

    ${ai.fuentes?.length ? `
    <div class="ai-report-section">
      <h4><i class="fas fa-database"></i> Fuentes de Inteligencia</h4>
      <div>${ai.fuentes.map(f=>`<span class="source-tag"><i class="fas fa-link"></i>${f}</span>`).join('')}</div>
    </div>
    ` : ''}

    <div class="ai-report-section">
      <h4><i class="fas fa-lightbulb"></i> Recomendación Covia IA</h4>
      <div style="padding:12px;background:linear-gradient(135deg,rgba(0,75,135,0.08),rgba(0,102,204,0.08));border:1px solid rgba(0,75,135,0.2);border-radius:10px;font-size:12px;line-height:1.7;color:var(--t2)">
        ${ai.confidence >= 85
          ? `<strong style="color:#10b981">Alta prioridad de acción.</strong> Este lead presenta múltiples señales positivas de compra y alta confianza de perfil. Recomendamos contacto directo esta semana con propuesta técnica personalizada para ${seg.product||'producto Covia'}. Potencial de cierre estimado en 30-60 días.`
          : ai.confidence >= 65
          ? `<strong style="color:#f59e0b">Prioridad media.</strong> El perfil requiere validación adicional. Sugerimos iniciar con contacto no intrusivo (LinkedIn + email) para confirmar necesidad activa. Establecer punto de contacto antes de presentar propuesta formal.`
          : `<strong style="color:#94a3b8">Perfil por enriquecer.</strong> Este lead necesita investigación adicional para confirmar idoneidad. Verificar actividad actual de la empresa y validar contacto decisor antes de invertir recursos comerciales.`
        }
      </div>
    </div>

    <button class="action-btn purple" style="width:100%;margin-top:8px" onclick="window.APP.openLeadDetail('${r.id}')">
      <i class="fas fa-external-link-alt"></i> Ver en CRM Pipeline
    </button>
  `;
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function logActivityModal(id) {
  const allRecords = window.ALL_RECORDS || [];
  const record = allRecords.find(r => r.id === id);
  if (!record) return;

  const modal = createModal('Registrar Actividad', `
    <div class="form-field">
      <label>Tipo de actividad</label>
      <select id="modal-tipo">
        <option value="llamada">📞 Llamada telefónica</option>
        <option value="email">📧 Email enviado</option>
        <option value="reunion">👥 Reunión</option>
        <option value="visita">🗺️ Visita presencial</option>
        <option value="cotizacion">📄 Cotización</option>
      </select>
    </div>
    <div class="form-field">
      <label>Nota / Resumen</label>
      <textarea id="modal-nota" placeholder="Describe la actividad realizada..."></textarea>
    </div>
  `, () => {
    const tipo = document.getElementById('modal-tipo')?.value;
    const nota = document.getElementById('modal-nota')?.value?.trim();
    if (!nota) { showToast('Ingresa una nota de la actividad', 'error'); return; }
    window.CRM?.logActivity(id, tipo, nota);
    closeModal();
    showToast('Actividad registrada correctamente', 'success');
    if (selectedLeadId === id) openLeadDetail(id);
    if (currentTab === 'dashboard') renderRecentActivity();
  });
}

function registerQuotationModal(id) {
  const modal = createModal('Registrar Cotización', `
    <div class="form-row">
      <div class="form-field">
        <label>Producto</label>
        <select id="q-producto">
          ${(window.COVIA_PRODUCTS||[]).map(p=>`<option value="${p.name}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Toneladas</label>
        <input type="number" id="q-ton" placeholder="ej: 500" min="1">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Precio/ton (MXN)</label>
        <input type="number" id="q-precio" placeholder="ej: 1800" min="1">
      </div>
      <div class="form-field">
        <label>Válida hasta</label>
        <input type="date" id="q-valida">
      </div>
    </div>
    <div class="form-field">
      <label>Total MXN (calculado)</label>
      <input type="number" id="q-total" readonly placeholder="Automático" style="background:rgba(255,255,255,0.02)">
    </div>
    <div class="form-field">
      <label>Notas adicionales</label>
      <textarea id="q-notas" placeholder="Condiciones especiales, descuentos, etc."></textarea>
    </div>
  `, () => {
    const producto = document.getElementById('q-producto')?.value;
    const ton = parseFloat(document.getElementById('q-ton')?.value);
    const precio = parseFloat(document.getElementById('q-precio')?.value);
    const valida = document.getElementById('q-valida')?.value;
    const notas = document.getElementById('q-notas')?.value;

    if (!ton || !precio) { showToast('Ingresa toneladas y precio/ton', 'error'); return; }

    window.CRM?.addQuotation(id, {
      producto, toneladas: ton, precio_ton: precio,
      total: Math.round(ton * precio),
      valida_hasta: valida,
      notas, status: 'pendiente'
    });
    closeModal();
    showToast('Cotización registrada. Lead avanzado a "Cotizado"', 'success');
    if (selectedLeadId === id) openLeadDetail(id);
    renderKanban();
    if (currentTab === 'dashboard') initDashboard();
  });

  // Auto-calculate total
  ['q-ton','q-precio'].forEach(fid => {
    document.getElementById(fid)?.addEventListener('input', () => {
      const t = parseFloat(document.getElementById('q-ton')?.value)||0;
      const p = parseFloat(document.getElementById('q-precio')?.value)||0;
      const totalEl = document.getElementById('q-total');
      if (totalEl) totalEl.value = t > 0 && p > 0 ? Math.round(t*p) : '';
    });
  });

  // Set default date (30 days)
  const defDate = new Date(); defDate.setDate(defDate.getDate()+30);
  document.getElementById('q-valida').value = defDate.toISOString().split('T')[0];
}

function advanceStage(id) {
  const stages = ['prospecto','contactado','cotizado','negociacion','ganado'];
  const current = window.CRM?.getStage(id) || (window.ALL_RECORDS?.find(r=>r.id===id)?.pipeline_stage) || 'prospecto';
  const idx = stages.indexOf(current);
  if (idx < stages.length - 1) {
    const next = stages[idx+1];
    window.CRM?.setStage(id, next);
    showToast(`Avanzado a: ${next.charAt(0).toUpperCase()+next.slice(1)}`, 'success');
    openLeadDetail(id);
    renderKanban();
    if (currentTab === 'dashboard') initDashboard();
  } else {
    showToast('El lead ya se encuentra en la etapa máxima', 'info');
  }
}

function setLeadStage(id, stage) {
  window.CRM?.setStage(id, stage);
  showToast(`Etapa actualizada: ${stage}`, 'success');
  openLeadDetail(id);
  renderKanban();
  if (currentTab === 'dashboard') initDashboard();
}

function createModal(title, bodyHtml, onConfirm) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="window.APP.closeModal()"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.APP.closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="window._modalConfirm && window._modalConfirm()">Confirmar</button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  window._modalConfirm = onConfirm;
  return overlay;
}

function closeModal() {
  const m = document.getElementById('active-modal');
  if (m) m.remove();
  window._modalConfirm = null;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]||'fa-info-circle'}"></i>${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── GLOBAL API ───────────────────────────────────────────────────────────────
window.APP = {
  navigateTo,
  logout,
  toggleSegFilter: function(seg) {
    if (seg === 'all') {
      activeSegFilters = new Set(['all']);
    } else {
      activeSegFilters.delete('all');
      if (activeSegFilters.has(seg)) {
        activeSegFilters.delete(seg);
        if (!activeSegFilters.size) activeSegFilters = new Set(['all']);
      } else {
        activeSegFilters.add(seg);
      }
    }
    renderMapFilters();
    renderMapMarkers();
  },
  openLeadDetail,
  setLeadStage,
  advanceStage,
  logActivityModal,
  registerQuotationModal,
  closeModal,
  selectAILead,
  searchCRM: function(q) { renderKanban(q.toLowerCase()); },
  searchAI: function(q) { renderAILeadList(q.toLowerCase()); },
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  initAuth();

  // Nav items
  document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.tab));
  });
});

})();
