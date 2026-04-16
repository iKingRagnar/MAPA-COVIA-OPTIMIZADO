/* covia_geocode.js — Geocodificación offline para COVIA_DIRECTORIO
   Parchea window.COVIA_DIRECTORIO con lat/lng basado en el campo `d` (ciudad).
   Cubre ~240 variantes de nombres de ciudades mexicanas + algunas internacionales.
   ─────────────────────────────────────────────────────────────────────────── */
(function patchDirectorioCoords() {

  /* ── Tabla maestra: clave normalizada → [lat, lng] ─────────────────────── */
  const COORDS = {
    // ── Nuevo León ──────────────────────────────────────────────────────────
    'monterrey':             [25.6866, -100.3161],
    'apodaca':               [25.7778, -100.1885],
    'garcia':                [25.8167, -100.5500],
    'garza garcia':          [25.6583, -100.4042],
    'san pedro garza garcia':[25.6583, -100.4042],
    'san pedro':             [25.6583, -100.4042],
    'guadalupe nl':          [25.6781, -100.2591],
    'guadalupe nuevo leon':  [25.6781, -100.2591],
    'san nicolas de los garza':[25.7417,-100.2997],
    'san nicolas':           [25.7417, -100.2997],
    'santa catarina':        [25.6728, -100.4597],
    'general escobedo':      [25.7961, -100.3267],
    'escobedo':              [25.7961, -100.3267],
    'juarez nl':             [25.6526, -100.0843],
    'benito juarez nl':      [25.7350, -100.3750],
    'benito juarez nuevo leon':[25.7350,-100.3750],
    'el carmen nuevo leon':  [25.8833, -100.4167],
    'carmen nuevo leon':     [25.8833, -100.4167],
    'cienega de flores':     [25.9536, -100.1597],
    'cienega flores':        [25.9536, -100.1597],
    'cadereyta':             [25.5930, -99.9953],
    'montemorelos':          [25.1904, -99.8257],
    'linares':               [24.8623, -99.5684],
    'allende nl':            [25.2817, -99.8419],
    'lampazos':              [27.0272, -100.5037],
    'gral zuazua':           [25.8997, -100.0829],
    'zuazua':                [25.8997, -100.0829],
    'santiago nl':           [25.4320, -100.1545],
    'san martin nl':         [25.6400, -100.2200],
    'san agustin nl':        [25.7000, -100.4000],
    'abasolo nl':            [25.9694, -100.2542],
    'anahuac nl':            [27.2472, -100.1377],
    'los ramones':           [25.6750, -99.6386],
    'villaldama':            [26.5069, -100.4239],
    'sabinas hidalgo':       [26.4984, -100.1760],
    'doctor arroyo':         [23.6744, -99.9978],
    'hidalgo nl':            [26.1050, -99.8539],
    'el uro':                [25.5700, -100.4800],
    'pesqueria':             [25.7544, -99.9926],
    'nl norte':              [27.4771, -99.5163],

    // ── Coahuila ─────────────────────────────────────────────────────────────
    'saltillo':              [25.4232, -101.0053],
    'ramos arizpe':          [25.5457, -100.9479],
    'monclova':              [26.9040, -101.4241],
    'nava coahuila':         [28.4236, -100.7686],
    'arteaga coah':          [25.4659, -100.8313],
    'piedras negras':        [28.7000, -100.5332],
    'parras':                [25.4441, -102.1800],
    'castaños':              [26.7867, -101.7483],
    'castanos':              [26.7867, -101.7483],
    'villa hidalgo':         [27.7667, -100.9833],
    'coahuila':              [25.4232, -101.0053],
    'torreon':               [25.5428, -103.4068],
    'torreón coah':          [25.5428, -103.4068],

    // ── Tamaulipas ──────────────────────────────────────────────────────────
    'reynosa':               [26.0922, -98.2775],
    'nuevo laredo':          [27.4771, -99.5163],
    'altamira':              [22.4033, -97.9269],
    'tampico':               [22.2552, -97.8654],
    'san fernando tamps':    [24.8467, -98.1483],
    'gustavo diaz ordaz':    [26.2313, -98.5856],
    'matamoros':             [25.8700, -97.5027],
    'burgos basin':          [25.3833, -98.7667],
    'tamaulipas':            [23.7369, -98.9886],

    // ── Ciudad de México ─────────────────────────────────────────────────────
    'ciudad de mexico':      [19.4326, -99.1332],
    'cdmx':                  [19.4326, -99.1332],
    'azcapotzalco':          [19.4861, -99.1908],
    'benito juarez cdmx':    [19.3897, -99.1650],
    'gustavo a madero':      [19.4900, -99.1100],
    'iztapalapa':            [19.3558, -99.0914],
    'tlalpan cdmx':          [19.2875, -99.1697],
    'alvaro obregon':        [19.3600, -99.1989],

    // ── Estado de México ────────────────────────────────────────────────────
    'tlalnepantla':          [19.5397, -99.1947],
    'cuautitlan izcalli':    [19.6469, -99.2069],
    'naucalpan':             [19.4786, -99.2386],
    'huehuetoca':            [19.8369, -99.2258],
    'texcoco':               [19.5125, -98.8769],
    'jocotitlan':            [19.7028, -99.7900],
    'jilotepec':             [20.0128, -99.7298],
    'lerma':                 [19.2833, -99.5167],
    'toluca':                [19.2826, -99.6557],
    'santa maria totoltepec':[19.2700, -99.6700],
    'tultitlan':             [19.6441, -99.1641],
    'coacalco':              [19.6322, -99.0909],
    'temascalcingo':         [19.9333, -100.0167],
    'los reyes la paz':      [19.4100, -98.9908],
    'huixquilucan':          [19.3608, -99.3644],
    'pasteje':               [19.7028, -99.7900],

    // ── Hidalgo ─────────────────────────────────────────────────────────────
    'pachuca':               [20.1011, -98.7591],
    'mineral de la reforma': [20.0963, -98.7172],
    'tula de allende':       [20.0533, -99.3420],
    'tepeji del rio':        [20.0253, -99.3400],
    'ciudad sahagun':        [19.7814, -98.5706],
    'emiliano zapata hidalgo':[20.2583, -98.6500],
    'miguel hidalgo hidalgo':[20.1167, -98.7500],
    'hidalgo':               [20.1011, -98.7591],

    // ── Morelos ──────────────────────────────────────────────────────────────
    'cuernavaca':            [18.9242, -99.2216],
    'jiutepec':              [18.8833, -99.1667],
    'yautepec':              [18.8880, -99.0603],
    'ciudad ayala':          [18.7753, -98.9822],
    'tepetzingo':            [18.7744, -98.9361],
    'emiliano zapata morelos':[18.8519, -99.0936],

    // ── Puebla ───────────────────────────────────────────────────────────────
    'puebla':                [19.0414, -98.2063],
    'amozoc':                [19.0300, -98.0644],
    'san martin texmelucan': [19.2836, -98.4358],
    'chalchicomula de sesma':[18.9906, -97.5569],
    'zacapoaxtla':           [19.8811, -97.5775],
    'sierra norte puebla':   [19.9225, -97.9586],
    'san pablo del monte':   [19.1667, -98.2000],
    'zacatlan':              [19.9225, -97.9586],

    // ── Tlaxcala ─────────────────────────────────────────────────────────────
    'tetla':                 [19.3833, -98.2358],
    'tlaxcala':              [19.3138, -98.2372],
    'apizaco':               [19.4233, -98.1408],
    'mazatecochco':          [19.2233, -98.1167],
    'san pablo del monte tlaxcala':[19.1667,-98.2000],

    // ── San Luis Potosí ──────────────────────────────────────────────────────
    'san luis potosi':       [22.1565, -100.9855],
    'slp':                   [22.1565, -100.9855],
    'la pila slp':           [22.1100, -100.8700],
    'emiliano zapata slp':   [22.1000, -100.9200],
    'villa de reyes':        [21.8019, -100.9358],

    // ── Guanajuato ───────────────────────────────────────────────────────────
    'leon':                  [21.1236, -101.6863],
    'guanajuato':            [21.0190, -101.2574],
    'celaya':                [20.5237, -100.8178],
    'irapuato':              [20.6736, -101.3554],
    'apaseo el grande':      [20.5456, -100.6067],
    'penjamo':               [20.4236, -101.7186],
    'villagran':             [20.5269, -100.9833],
    'san jose de iturbide':  [21.0014, -100.3961],
    'pozo blanco':           [20.6000, -101.2000],

    // ── Querétaro ────────────────────────────────────────────────────────────
    'queretaro':             [20.5888, -100.3899],
    'san juan del rio':      [20.3863, -99.9987],
    'la griega':             [20.6200, -100.3500],
    'el marques':            [20.5481, -100.2614],

    // ── Jalisco ──────────────────────────────────────────────────────────────
    'guadalajara':           [20.6597, -103.3496],
    'tlajomulco':            [20.4716, -103.4341],
    'jalisco':               [20.6597, -103.3496],

    // ── Veracruz ─────────────────────────────────────────────────────────────
    'veracruz':              [19.1738, -96.1342],
    'coatzacoalcos':         [18.1421, -94.4457],
    'tierra blanca':         [18.4578, -96.3647],
    'poza rica':             [20.5333, -97.4500],
    'jaltipan':              [17.9736, -94.7139],
    'san juan evangelista':  [17.8856, -95.1369],
    'sur veracruz':          [18.1421, -94.4457],

    // ── Sonora ───────────────────────────────────────────────────────────────
    'hermosillo':            [29.0731, -110.9559],
    'sonora':                [29.0731, -110.9559],

    // ── Chihuahua ────────────────────────────────────────────────────────────
    'chihuahua':             [28.6329, -106.0691],
    'ciudad juarez':         [31.7400, -106.4850],
    'cd juarez':             [31.7400, -106.4850],

    // ── Baja California ──────────────────────────────────────────────────────
    'cerro prieto':          [32.4150, -115.3020],

    // ── Sinaloa ──────────────────────────────────────────────────────────────
    'los mochis':            [25.7908, -108.9857],
    'culiacan':              [24.8069, -107.3939],

    // ── Michoacán ────────────────────────────────────────────────────────────
    'morelia':               [19.7060, -101.1950],

    // ── Aguascalientes ───────────────────────────────────────────────────────
    'aguascalientes':        [21.8853, -102.2916],

    // ── Zacatecas ────────────────────────────────────────────────────────────
    'zacatecas':             [22.7709, -102.5832],

    // ── Oaxaca ───────────────────────────────────────────────────────────────
    'oaxaca':                [17.0732, -96.7266],

    // ── Guerrero ─────────────────────────────────────────────────────────────
    'acapulco':              [16.8531, -99.8237],

    // ── Quintana Roo ─────────────────────────────────────────────────────────
    'cancun':                [21.1743, -86.8466],

    // ── Tabasco ──────────────────────────────────────────────────────────────
    'villahermosa':          [17.9894, -92.9475],

    // ── Yucatán ──────────────────────────────────────────────────────────────
    'merida':                [20.9674, -89.5926],

    // ── Campeche ─────────────────────────────────────────────────────────────
    'ciudad del carmen':     [18.6483, -91.8286],
    'cd del carmen':         [18.6483, -91.8286],

    // ── Internacionales ─────────────────────────────────────────────────────
    'novi michigan':         [42.4806, -83.4755],
    'neuquen':               [-38.9516, -68.0591],
    'santiago rio haina':    [18.4735, -70.0095],
  };

  /* ── Normalizar: quita acentos, lowercase, strips puntuación extra ───── */
  function norm(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove accents
      .replace(/[.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ── Estado / abreviatura → ciudad capital (fallback) ────────────────── */
  const STATE_FALLBACK = {
    'nl':          [25.6866, -100.3161],
    'nuevo leon':  [25.6866, -100.3161],
    'coah':        [25.4232, -101.0053],
    'coahuila':    [25.4232, -101.0053],
    'tamps':       [23.7369, -98.9886],
    'tamaulipas':  [23.7369, -98.9886],
    'edomex':      [19.2826, -99.6557],
    'estado de mexico': [19.2826, -99.6557],
    'cdmx':        [19.4326, -99.1332],
    'ciudad de mexico': [19.4326, -99.1332],
    'hgo':         [20.1011, -98.7591],
    'hidalgo':     [20.1011, -98.7591],
    'qro':         [20.5888, -100.3899],
    'queretaro':   [20.5888, -100.3899],
    'gto':         [21.0190, -101.2574],
    'guanajuato':  [21.0190, -101.2574],
    'pue':         [19.0414, -98.2063],
    'puebla':      [19.0414, -98.2063],
    'jal':         [20.6597, -103.3496],
    'jalisco':     [20.6597, -103.3496],
    'slp':         [22.1565, -100.9855],
    'ver':         [19.1738, -96.1342],
    'veracruz':    [19.1738, -96.1342],
    'vz':          [19.1738, -96.1342],
    'son':         [29.0731, -110.9559],
    'sonora':      [29.0731, -110.9559],
    'tl':          [19.3138, -98.2372],
    'tlaxcala':    [19.3138, -98.2372],
    'mex':         [19.2826, -99.6557],
    'mx':          [19.4326, -99.1332],
    'mor':         [18.9242, -99.2216],
    'morelos':     [18.9242, -99.2216],
    'gt':          [21.0190, -101.2574],
    'co':          [25.4232, -101.0053],
    'bc':          [32.4150, -115.3020],
  };

  /* ── Resolver una ciudad a [lat, lng] ─────────────────────────────────── */
  function resolve(city) {
    if (!city) return null;
    const n = norm(city);
    if (!n) return null;

    // 1. Exact match
    if (COORDS[n]) return COORDS[n];

    // 2. Partial-key: find longest key that the input contains
    let best = null, bestLen = 0;
    for (const key of Object.keys(COORDS)) {
      if (n.includes(key) && key.length > bestLen) {
        best = COORDS[key]; bestLen = key.length;
      }
    }
    if (best) return best;

    // 3. State-abbreviation tokens at end of string
    const tokens = n.split(/[\s/,]+/);
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (STATE_FALLBACK[tokens[i]]) return STATE_FALLBACK[tokens[i]];
    }

    // 4. Any token that matches a coordinate key
    for (const tok of tokens) {
      if (COORDS[tok]) return COORDS[tok];
    }

    return null;
  }

  /* ── Tiny jitter so stacked pins don't overlap ────────────────────────── */
  function jitter() { return (Math.random() - 0.5) * 0.04; }

  /* ── Patch COVIA_DIRECTORIO ──────────────────────────────────────────── */
  function patch() {
    const dir = window.COVIA_DIRECTORIO;
    if (!Array.isArray(dir)) return;

    let patched = 0;
    dir.forEach(row => {
      if (row.lat && row.lng && row.lat !== 0 && row.lng !== 0) return; // already has coords
      const coords = resolve(row.d) || resolve(row.region);
      if (coords) {
        row.lat = coords[0] + jitter();
        row.lng = coords[1] + jitter();
        patched++;
      }
    });

    console.log('[Covia Geocode] patched ' + patched + ' / ' + dir.length + ' directorio entries with coordinates.');
  }

  // Run immediately if COVIA_DIRECTORIO exists, else wait for it
  if (window.COVIA_DIRECTORIO) {
    patch();
  } else {
    Object.defineProperty(window, 'COVIA_DIRECTORIO', {
      configurable: true,
      set: function(val) {
        Object.defineProperty(window, 'COVIA_DIRECTORIO', { value: val, writable: true, configurable: true });
        patch();
      }
    });
  }

})();
