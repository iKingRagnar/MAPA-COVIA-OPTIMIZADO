/* covia_table_engine.js — Sort · Multi-Filter · Column Manager · Excel Export
   Covia Mexico Intelligence Platform v6.3
   ─────────────────────────────────────────────────────────────────────────── */
(function (window) {
  'use strict';

  const TE = {};
  window.TableEngine = TE;

  /* ── State ───────────────────────────────────────────────────────────────── */
  const ST = {};   // keyed by tableId

  /* ── Init ────────────────────────────────────────────────────────────────── */
  TE.init = function (cfg) {
    // cfg: { id, getData, columns:[{key,label,type?,hide?,width?}], title, onRender }
    ST[cfg.id] = {
      id:        cfg.id,
      getData:   cfg.getData,
      columns:   cfg.columns,
      title:     cfg.title || 'Datos',
      onRender:  cfg.onRender,
      sortCol:   null,
      sortDir:   'asc',
      colFilters:{},           // colKey → Set<string>
      hiddenCols: new Set(cfg.columns.filter(c => c.hide).map(c => c.key))
    };
  };

  /* ── Sort ────────────────────────────────────────────────────────────────── */
  TE.sort = function (id, colKey) {
    const s = ST[id]; if (!s) return;
    if (s.sortCol === colKey) {
      s.sortDir = s.sortDir === 'asc' ? 'desc' : null;
      if (!s.sortDir) s.sortCol = null;
    } else {
      s.sortCol = colKey; s.sortDir = 'asc';
    }
    s.onRender();
  };

  TE.getSortDir = function (id, colKey) {
    const s = ST[id]; if (!s) return null;
    return s.sortCol === colKey ? s.sortDir : null;
  };

  /* ── Process (filter + sort) ──────────────────────────────────────────────── */
  TE.process = function (id, rawData) {
    const s = ST[id]; if (!s) return rawData;

    // Column filters
    let data = rawData.filter(row => {
      for (const [k, vals] of Object.entries(s.colFilters)) {
        if (!vals || vals.size === 0) continue;
        if (!vals.has(String(row[k] ?? ''))) return false;
      }
      return true;
    });

    // Sort
    if (s.sortCol && s.sortDir) {
      const col = s.columns.find(c => c.key === s.sortCol);
      const isNum = col && col.type === 'number';
      data = [...data].sort((a, b) => {
        let va = a[s.sortCol], vb = b[s.sortCol];
        if (isNum) {
          va = parseFloat(va) || 0; vb = parseFloat(vb) || 0;
          return s.sortDir === 'asc' ? va - vb : vb - va;
        }
        va = String(va ?? '').toLowerCase();
        vb = String(vb ?? '').toLowerCase();
        const c = va.localeCompare(vb, 'es');
        return s.sortDir === 'asc' ? c : -c;
      });
    }
    return data;
  };

  /* ── Filter helpers ──────────────────────────────────────────────────────── */
  TE.hasFilter   = (id, k) => !!(ST[id] && ST[id].colFilters[k]);
  TE.activeCount = (id)    => Object.keys(ST[id]?.colFilters || {}).length;
  TE.clearAll    = function (id) { if (ST[id]) { ST[id].colFilters = {}; ST[id].onRender(); } };

  /* ── Filter Popup ────────────────────────────────────────────────────────── */
  TE.openFilter = function (id, colKey, anchorEl, ev) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }

    const existing = document.getElementById('te-fp');
    const sameTrigger = existing && existing.dataset.id === id && existing.dataset.col === colKey;
    existing && existing.remove();
    document.removeEventListener('mousedown', TE._fpOut, true);
    if (sameTrigger) return;

    const s = ST[id]; if (!s) return;
    const col   = s.columns.find(c => c.key === colKey) || { label: colKey };
    const base  = s.getData();
    const selVals = s.colFilters[colKey];      // Set or undefined

    // Build unique value map
    const vm = {};
    base.forEach(r => { const v = String(r[colKey] ?? ''); vm[v] = (vm[v] || 0) + 1; });
    const vals = Object.keys(vm).sort((a, b) => a.localeCompare(b, 'es'));

    const fp = document.createElement('div');
    fp.className = 'te-fp'; fp.id = 'te-fp';
    fp.dataset.id = id; fp.dataset.col = colKey;

    fp.innerHTML =
      `<div class="te-fp-hd">
        <span><i class="fas fa-filter" style="color:var(--sky);margin-right:5px;font-size:10px"></i>${col.label}</span>
        <button onclick="document.getElementById('te-fp')?.remove()" class="te-fp-x">×</button>
       </div>
       <div class="te-fp-srch">
         <i class="fas fa-search" style="color:var(--t4);font-size:11px"></i>
         <input type="text" class="te-fp-si" placeholder="Buscar valor…"
           oninput="window.TableEngine._fpSrch(this,'${id}','${colKey}')">
       </div>
       <div class="te-fp-acts">
         <button class="te-fp-ab" onclick="window.TableEngine._fpAll('${id}','${colKey}',true)"><i class="fas fa-check-square"></i> Todos</button>
         <button class="te-fp-ab" onclick="window.TableEngine._fpAll('${id}','${colKey}',false)"><i class="far fa-square"></i> Ninguno</button>
       </div>
       <div class="te-fp-list" id="te-fp-list">
         ${vals.map(v => {
           const checked = !selVals || selVals.has(v) ? 'checked' : '';
           const label   = v || '<em style="color:var(--t4)">vacío</em>';
           return `<label class="te-fp-row">
             <input type="checkbox" class="te-fp-chk" value="${v.replace(/"/g,'&quot;')}" ${checked}>
             <span class="te-fp-lbl">${label}</span>
             <span class="te-fp-cnt">${vm[v]}</span>
           </label>`;
         }).join('')}
       </div>
       <div class="te-fp-ft">
         <button class="te-fp-apply" onclick="window.TableEngine._fpApply('${id}','${colKey}')">
           <i class="fas fa-check"></i> Aplicar
         </button>
         <button class="te-fp-clear" onclick="window.TableEngine._fpClear('${id}','${colKey}')">Limpiar</button>
       </div>`;

    document.body.appendChild(fp);

    // Position
    const r = anchorEl.getBoundingClientRect();
    const W = 268, maxL = window.innerWidth - W - 8;
    fp.style.top  = (r.bottom + window.scrollY + 4) + 'px';
    fp.style.left = Math.max(8, Math.min(r.left + window.scrollX, maxL)) + 'px';

    fp.querySelector('.te-fp-si')?.focus();
    setTimeout(() => document.addEventListener('mousedown', TE._fpOut, true), 60);
  };

  TE._fpOut = function (e) {
    const fp = document.getElementById('te-fp');
    if (fp && !fp.contains(e.target)) {
      fp.remove(); document.removeEventListener('mousedown', TE._fpOut, true);
    }
  };

  TE._fpSrch = function (inp, id, colKey) {
    const q = inp.value.toLowerCase();
    document.querySelectorAll('#te-fp-list .te-fp-row').forEach(row => {
      row.style.display = (row.querySelector('.te-fp-lbl')?.textContent || '').toLowerCase().includes(q) ? '' : 'none';
    });
  };

  TE._fpAll = function (id, colKey, val) {
    document.querySelectorAll('#te-fp-list .te-fp-chk').forEach(c => c.checked = val);
  };

  TE._fpApply = function (id, colKey) {
    const s = ST[id]; if (!s) return;
    const checked = [...document.querySelectorAll('#te-fp-list .te-fp-chk:checked')].map(c => c.value);
    const total   = document.querySelectorAll('#te-fp-list .te-fp-chk').length;
    if (checked.length === 0 || checked.length === total) delete s.colFilters[colKey];
    else s.colFilters[colKey] = new Set(checked);
    document.getElementById('te-fp')?.remove();
    document.removeEventListener('mousedown', TE._fpOut, true);
    s.onRender();
  };

  TE._fpClear = function (id, colKey) {
    const s = ST[id]; if (!s) return;
    delete s.colFilters[colKey];
    document.getElementById('te-fp')?.remove();
    document.removeEventListener('mousedown', TE._fpOut, true);
    s.onRender();
  };

  /* ── Column Manager ──────────────────────────────────────────────────────── */
  TE.openColManager = function (id, anchorEl, ev) {
    if (ev) ev.stopPropagation();
    const ex = document.getElementById('te-cm');
    if (ex) { ex.remove(); document.removeEventListener('mousedown', TE._cmOut, true); return; }

    const s = ST[id]; if (!s) return;
    const cm = document.createElement('div');
    cm.className = 'te-cm'; cm.id = 'te-cm';

    cm.innerHTML =
      `<div class="te-cm-hd">
         <span><i class="fas fa-table-columns" style="color:var(--navy);margin-right:6px"></i>Gestionar Columnas</span>
         <button onclick="document.getElementById('te-cm')?.remove()" class="te-fp-x">×</button>
       </div>
       <div class="te-cm-sub">Haz clic en una columna para mostrar/ocultar</div>
       <div class="te-cm-grid">
         ${s.columns.map(col => `
           <button class="te-cm-chip ${s.hiddenCols.has(col.key) ? 'off' : 'on'}"
             onclick="window.TableEngine._toggleColBtn('${id}','${col.key}',this)">
             <i class="fas fa-${s.hiddenCols.has(col.key) ? 'eye-slash' : 'eye'}"></i>
             ${col.label}
           </button>`).join('')}
       </div>
       <div class="te-cm-ft">
         <button class="te-cm-showall" onclick="window.TableEngine.showAll('${id}')">
           <i class="fas fa-eye"></i> Mostrar todas
         </button>
       </div>`;

    document.body.appendChild(cm);
    const r = anchorEl.getBoundingClientRect();
    const W = 380;
    cm.style.top  = (r.bottom + window.scrollY + 4) + 'px';
    cm.style.left = Math.max(8, r.right + window.scrollX - W) + 'px';
    setTimeout(() => document.addEventListener('mousedown', TE._cmOut, true), 60);
  };

  TE._cmOut = function (e) {
    const cm = document.getElementById('te-cm');
    if (cm && !cm.contains(e.target)) {
      cm.remove(); document.removeEventListener('mousedown', TE._cmOut, true);
    }
  };

  TE._toggleColBtn = function (id, colKey, btn) {
    const s = ST[id]; if (!s) return;
    if (s.hiddenCols.has(colKey)) {
      s.hiddenCols.delete(colKey);
      btn.className = 'te-cm-chip on';
      btn.querySelector('i').className = 'fas fa-eye';
    } else {
      s.hiddenCols.add(colKey);
      btn.className = 'te-cm-chip off';
      btn.querySelector('i').className = 'fas fa-eye-slash';
    }
    s.onRender();
  };

  TE.showAll = function (id) {
    const s = ST[id]; if (!s) return;
    s.hiddenCols.clear();
    document.getElementById('te-cm')?.remove();
    document.removeEventListener('mousedown', TE._cmOut, true);
    s.onRender();
  };

  TE.isHidden = (id, k) => !!(ST[id] && ST[id].hiddenCols.has(k));

  /* ── Build TH HTML ───────────────────────────────────────────────────────── */
  TE.buildTH = function (id, col, extraClass) {
    const dir = TE.getSortDir(id, col.key);
    const flt = TE.hasFilter(id, col.key);
    const sortIcon = dir === 'asc'
      ? '<i class="fas fa-sort-up   te-si active"></i>'
      : dir === 'desc'
        ? '<i class="fas fa-sort-down te-si active"></i>'
        : '<i class="fas fa-sort     te-si"></i>';
    return `<th class="te-th${flt ? ' te-th-flt' : ''}${extraClass ? ' ' + extraClass : ''}"
                style="${col.width ? 'min-width:' + col.width : ''}">
      <div class="te-th-in">
        <span class="te-th-lbl" onclick="window.TableEngine.sort('${id}','${col.key}')" title="Ordenar por ${col.label}">
          ${col.label}${sortIcon}
        </span>
        <button class="te-flt-btn${flt ? ' on' : ''}"
          onclick="window.TableEngine.openFilter('${id}','${col.key}',this,event)"
          title="Filtrar ${col.label}">
          <i class="fas fa-filter"></i>${flt ? '<span class="te-flt-dot"></span>' : ''}
        </button>
      </div>
    </th>`;
  };

  /* ── Excel Export ─────────────────────────────────────────────────────────── */
  TE.exportExcel = function (id, data) {
    const s = ST[id]; if (!s) return;
    const rows    = data || s.getData();
    const visCols = s.columns.filter(c => !s.hiddenCols.has(c.key));
    const now     = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const stamp   = new Date().toISOString().slice(0, 10);

    const navy  = '#004b87', sky = '#00a3e0', light = '#eef4fb';
    const segC  = { vidrio:'#0066cc',ceramica:'#dc6803',fundicion:'#7c3aed',construccion:'#15803d',fibra:'#0284c7',deportiva:'#c2410c',ecuestre:'#854d0e',filtracion:'#0f766e',fracking:'#4338ca',agricola:'#166534' };
    const scoreS = v => v==='P1-Priority'?'background:#fef2f2;color:#dc2626':v==='P2'?'background:#fffbeb;color:#d97706':v==='P3'?'background:#eff6ff;color:#2563eb':v==='Construcción'?'background:#f0fdf4;color:#15803d':'';

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${s.title.slice(0,31)}</x:Name>
<x:WorksheetOptions><x:FreezePanes/><x:FrozenNoSplit/><x:SplitHorizontal>4</x:SplitHorizontal><x:TopRowBottomPane>4</x:TopRowBottomPane></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml></head>
<body><table border="0" cellspacing="0" cellpadding="0" style="font-family:Calibri,Arial,sans-serif;font-size:10pt;border-collapse:collapse">
<tr height="44"><td colspan="${visCols.length}" style="background:${navy};color:#fff;font-size:18pt;font-weight:700;text-align:center;padding:0 16px;letter-spacing:-.5px">
  ◈ &nbsp; COVIA MEXICO — INTELIGENCIA COMERCIAL
</td></tr>
<tr height="26"><td colspan="${visCols.length}" style="background:${sky};color:#fff;font-size:11pt;font-weight:600;text-align:center;padding:0 16px">
  ${s.title.toUpperCase()} &nbsp;·&nbsp; ${rows.length.toLocaleString('es-MX')} registros exportados
</td></tr>
<tr height="20"><td colspan="${visCols.length}" style="background:${light};color:#475569;font-size:9pt;text-align:right;padding:0 16px;border-bottom:2px solid ${navy}">
  Exportado el ${now} &nbsp;|&nbsp; Confidencial — Uso exclusivo Covia Mexico
</td></tr>
<tr height="32">${visCols.map(c => `<td style="background:${navy};color:#fff;font-weight:700;font-size:10pt;text-align:center;padding:6px 8px;border:1px solid #003870;white-space:nowrap">${c.label}</td>`).join('')}</tr>
${rows.map((row, i) => {
  const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
  return `<tr height="21">${visCols.map(col => {
    const raw = row[col.key] ?? '';
    const isNum = col.type === 'number';
    let val = raw, sty = `background:${bg};border:1px solid #e2e8f0;padding:3px 7px;font-size:9pt;vertical-align:middle`;
    if (isNum) {
      sty += `;text-align:right;font-weight:600;color:${navy}`;
      val = parseFloat(raw) ? parseFloat(raw).toLocaleString('es-MX') : (raw || '');
    } else if (col.key === 'lead_scoring') {
      const sc = scoreS(String(raw));
      if (sc) sty = `${sc};border:1px solid #e2e8f0;padding:3px 7px;font-size:9pt;text-align:center;font-weight:700;vertical-align:middle`;
    } else if (col.key === 's') {
      const c = segC[String(raw)] || '#64748b';
      sty += `;color:${c};font-weight:700`;
    }
    return `<td style="${sty}">${String(val).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td>`;
  }).join('')}</tr>`;
}).join('')}
<tr height="18"><td colspan="${visCols.length}" style="background:${light};color:#94a3b8;font-size:8pt;text-align:center;padding:4px;border-top:2px solid ${navy}">
  Generado por Covia Mexico Intelligence Platform v6 &nbsp;·&nbsp; ${new Date().getFullYear()}
</td></tr>
</table></body></html>`;

    const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `Covia_${s.title.replace(/[^a-zA-Z0-9]/g,'_')}_${stamp}.xls`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

})(window);
