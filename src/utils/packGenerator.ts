import JSZip from 'jszip';
import {
  POWER_CHUNKS,
  ENTRECASA_PHRASES,
  CONNECTED_SPEECH_LESSONS,
  SCENARIOS,
} from '../data/defaultData';

export interface PackFileItem {
  name: string;
  category: string;
  sizeDesc: string;
  format: 'zip' | 'html' | 'txt' | 'csv';
  description: string;
}

export const PACK_DELIVERABLES: PackFileItem[] = [
  {
    name: 'Pack_Ingles_Facil_y_Fluido_Completo.zip',
    category: 'Paquete Maestro',
    sizeDesc: 'Todo incluido en 1 archivo ZIP',
    format: 'zip',
    description: 'Guía imprimible, flashcards Anki/Excel, cheatsheets de texto, plan de 30 días y reproductor de bolsillo offline.',
  },
  {
    name: '01_Guia_Maestra_Ingles_Facil_y_Fluido_Imprimible.html',
    category: 'Ebook / PDF Imprimible',
    sizeDesc: 'Alta calidad para imprimir / guardar PDF',
    format: 'html',
    description: 'Manual completo de 100 bloques, fonética en español, trucos de pronunciación y situaciones reales formateado para lectura e impresión.',
  },
  {
    name: '02_100_Bloques_Conversacionales_Cheatsheet.txt',
    category: 'Cheatsheet de Bolsillo',
    sizeDesc: 'Texto plano universal',
    format: 'txt',
    description: 'Lista condensada para tener en notas del celular, WhatsApp personal o consultar rápidamente.',
  },
  {
    name: '03_Cuaderno_Fonetica_y_Pronunciacion_Nativa.txt',
    category: 'Entrenamiento de Oído',
    sizeDesc: 'Reglas de sonido y reducciones',
    format: 'txt',
    description: 'Por qué no entendés a los nativos: reducciones ("gonna", "wanna", "coulda"), enlaces de sonidos y flap T.',
  },
  {
    name: '04_Tarjetas_Flashcards_Anki_Excel.csv',
    category: 'Flashcards Digitales',
    sizeDesc: 'Compatible Anki, Quizlet, Excel',
    format: 'csv',
    description: 'Archivo CSV formateado para importar a Anki, Quizlet o ver en hojas de cálculo con fonética y ejemplos.',
  },
  {
    name: '05_Plan_de_Accion_30_Dias_Fluidez.txt',
    category: 'Hoja de Ruta',
    sizeDesc: '10 minutos diarios',
    format: 'txt',
    description: 'Calendario de 30 días guiado paso a paso para desarrollar reflejo muscular sin aburrirte.',
  },
  {
    name: '06_Reproductor_Audio_Offline_De_Bolsillo.html',
    category: 'App Offline de Bolsillo',
    sizeDesc: 'Funciona 100% sin internet',
    format: 'html',
    description: 'Mini aplicación interactiva en un solo archivo con pronunciación de voz en 2 velocidades (0.8x y 1.0x) para tu celular o laptop.',
  },
];

/**
 * Triggers a browser file download from a Blob with mobile-safe lifetime
 */
export function downloadBlob(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_self';
  a.rel = 'noopener';
  document.body.appendChild(a);
  try {
    a.click();
  } catch (_e) {
    // fallback
  }
  document.body.removeChild(a);
  // Keep ObjectURL alive for 60s so mobile browser download managers don't abort
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, 60000);
  return url;
}

/**
 * Triggers download of raw text or HTML
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8'): string {
  const blob = new Blob([content], { type: mimeType });
  return downloadBlob(blob, filename);
}

/**
 * Generates the clean printable Master Guide HTML
 */
export function generateMasterPdfHtml(): string {
  const chunkRows = POWER_CHUNKS.map((c, i) => `
    <div class="chunk-card">
      <div class="chunk-header">
        <span class="chunk-number">#${i + 1}</span>
        <span class="chunk-title">${escapeHtml(c.chunk)}</span>
        <span class="chunk-badge ${c.level || 'principiante'}">${(c.level || 'General').toUpperCase()}</span>
      </div>
      <div class="chunk-phonetic">🗣 Fonética rápida: <strong>${escapeHtml(c.phoneticSpelling || '')}</strong></div>
      <p class="chunk-use"><strong>Cuándo se usa:</strong> ${escapeHtml(c.realUse)}</p>
      <div class="chunk-examples">
        ${c.examples.map(ex => `
          <div class="example-item">
            <span class="en">🇬🇧 ${escapeHtml(ex.en)}</span>
            <span class="es">🇪🇸 ${escapeHtml(ex.es)}</span>
            ${ex.soundTip ? `<span class="sound">💡 Sonido: ${escapeHtml(ex.soundTip)}</span>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="chunk-trap">⚠️ <strong>Error típico de escuela a evitar:</strong> ${escapeHtml(c.trapToAvoid)}</div>
    </div>
  `).join('');

  const entrecasaRows = ENTRECASA_PHRASES.map(p => `
    <div class="phrase-row">
      <div class="situation"><strong>${escapeHtml(p.categoryLabel)}:</strong> ${escapeHtml(p.spanishSituation)}</div>
      <div class="stiff">❌ Formal/Escolar: <span>${escapeHtml(p.schoolStiff)}</span></div>
      <div class="native">✅ Fluido & Real: <strong>${escapeHtml(p.entrecasaNative)}</strong></div>
      ${p.phoneticEasy ? `<div class="phonetic">🗣 Pronunciación en español: <em>"${escapeHtml(p.phoneticEasy)}"</em></div>` : ''}
      <div class="tip">💡 ${escapeHtml(p.cozyTip)}</div>
    </div>
  `).join('');

  const speechLessons = CONNECTED_SPEECH_LESSONS.map(l => `
    <div class="speech-box">
      <h3>${escapeHtml(l.title)}</h3>
      <p class="sub">${escapeHtml(l.subtitle)}</p>
      <div class="pattern-pill">${escapeHtml(l.pattern)}</div>
      <div class="compare-table">
        <div class="comp-col">
          <div class="comp-title">Como te lo enseñaron (escrito)</div>
          <div class="comp-val stiff">${escapeHtml(l.schoolVersion)}</div>
        </div>
        <div class="comp-col">
          <div class="comp-title">Como suena realmente en la calle</div>
          <div class="comp-val nat">${escapeHtml(l.nativePronunciation)}</div>
          <div class="phon">🗣 ${escapeHtml(l.phoneticGuide)}</div>
        </div>
      </div>
      <p class="explanation">${escapeHtml(l.explanation)}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Guía Maestra: Inglés Fácil y Fluido - Los 100 Bloques Conversacionales</title>
  <style>
    @page {
      margin: 1.5cm;
      size: A4;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      margin: 0;
      padding: 30px;
      background: #f8fafc;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 14px 24px;
      border-radius: 12px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
    }
    .print-btn {
      background: #f59e0b;
      color: #0f172a;
      font-weight: 700;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover { background: #fbbf24; }
    .book-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 50px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .cover-header {
      text-align: center;
      border-bottom: 3px solid #f59e0b;
      padding-bottom: 35px;
      margin-bottom: 40px;
    }
    .badge-top {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 1px;
      padding: 6px 16px;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      margin: 10px 0;
      line-height: 1.2;
    }
    .subtitle {
      font-size: 17px;
      color: #475569;
      max-width: 650px;
      margin: 0 auto;
    }
    .manifesto {
      background: #f1f5f9;
      border-left: 5px solid #f59e0b;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .manifesto h2 {
      margin-top: 0;
      font-size: 18px;
      color: #0f172a;
    }
    .rule-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .rule-card {
      background: #ffffff;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      border: 1px solid #e2e8f0;
    }
    .rule-card strong { color: #d97706; display: block; margin-bottom: 4px; }
    h2.section-heading {
      font-size: 22px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 40px;
      margin-bottom: 25px;
    }
    .chunk-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 20px;
      background: #fafafa;
      page-break-inside: avoid;
    }
    .chunk-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .chunk-number {
      font-weight: 800;
      color: #d97706;
      font-size: 14px;
    }
    .chunk-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .chunk-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #475569;
    }
    .chunk-phonetic {
      font-size: 13px;
      color: #0369a1;
      background: #e0f2fe;
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .chunk-use {
      font-size: 13px;
      color: #334155;
      margin: 8px 0;
    }
    .chunk-examples {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      margin: 10px 0;
    }
    .example-item {
      padding: 6px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 13px;
    }
    .example-item:last-child { border-bottom: none; }
    .example-item .en { display: block; font-weight: 600; color: #0f172a; }
    .example-item .es { display: block; color: #64748b; font-size: 12px; }
    .example-item .sound { display: block; color: #b45309; font-size: 11px; margin-top: 2px; }
    .chunk-trap {
      font-size: 12px;
      color: #991b1b;
      background: #fef2f2;
      padding: 6px 10px;
      border-radius: 6px;
      margin-top: 8px;
    }
    .phrase-row {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .phrase-row .situation { font-size: 13px; color: #475569; margin-bottom: 6px; }
    .phrase-row .stiff { font-size: 12px; color: #94a3b8; text-decoration: line-through; }
    .phrase-row .native { font-size: 15px; color: #0f172a; margin: 4px 0; }
    .phrase-row .phonetic { font-size: 12px; color: #0284c7; }
    .phrase-row .tip { font-size: 11px; color: #64748b; margin-top: 4px; }
    .speech-box {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 20px;
      background: #ffffff;
      page-break-inside: avoid;
    }
    .speech-box h3 { margin: 0 0 4px 0; font-size: 16px; color: #0f172a; }
    .speech-box .sub { font-size: 12px; color: #64748b; margin: 0 0 10px 0; }
    .pattern-pill {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-weight: 700;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .compare-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .comp-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .comp-val.stiff { color: #dc2626; font-size: 14px; font-weight: 600; }
    .comp-val.nat { color: #059669; font-size: 15px; font-weight: 800; }
    .comp-col .phon { font-size: 12px; color: #0284c7; margin-top: 2px; }
    .speech-box .explanation { font-size: 12px; color: #475569; margin: 0; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print-bar { display: none !important; }
      .book-container { box-shadow: none; padding: 0; max-width: 100%; }
      .chunk-card, .phrase-row, .speech-box { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong style="color: #f59e0b;">📘 Guía Lista para Imprimir o Guardar como PDF</strong>
      <div style="font-size: 12px; color: #cbd5e1;">Hacé clic en el botón de la derecha para abrir el diálogo de impresión de tu navegador.</div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>

  <div class="book-container">
    <div class="cover-header">
      <div class="badge-top">Edición Completa · Audio-Kit Oficial</div>
      <h1>Inglés Fácil y Fluido</h1>
      <p class="subtitle">La forma sencilla de aprender el idioma y hablarlo con soltura real. Los 100 bloques conversacionales, fonética en español y frases de rescate.</p>
    </div>

    <div class="manifesto">
      <h2>🎯 El Método en 3 Reglas de Oro</h2>
      <p style="font-size: 13px; color: #475569; margin: 0;">
        Olvidate de las listas de gramática teórica de 1995. Los nativos no arman oraciones conjugando verbos en el aire; ensamblan bloques de construcción fijados en la memoria auditiva y muscular.
      </p>
      <div class="rule-grid">
        <div class="rule-card">
          <strong>1. Bloques (Chunks)</strong>
          Aprendé frases completas que ya tienen sentido juntas ("Can I get...", "I was wondering if...").
        </div>
        <div class="rule-card">
          <strong>2. Sonido Real</strong>
          El inglés hablado une consonantes y reduce vocales ("gonna", "wanna", flap T).
        </div>
        <div class="rule-card">
          <strong>3. Reflejo Muscular</strong>
          Repetí en voz alta 10 minutos por día hasta que salga solo sin traducir del español.
        </div>
      </div>
    </div>

    <h2 class="section-heading">📚 Los 100 Bloques de Construcción Conversacional</h2>
    ${chunkRows}

    <h2 class="section-heading">⚡ Reglas de Sonido Conectado (Connected Speech)</h2>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
      Por qué cuando un nativo habla rápido no le entendés nada, aunque al leerlo conozcas todas las palabras:
    </p>
    ${speechLessons}

    <h2 class="section-heading">🏠 Frases de Entrecasa, Cafetería y Rescate</h2>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
      Las expresiones exactas para la vida cotidiana, pedir comida, solucionar confusiones y sentirte como en casa:
    </p>
    ${entrecasaRows}

    <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
      © Inglés Fácil y Fluido · Material protegido para uso personal de estudiantes registrados.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Plain text cheatsheet for phone notepad or WhatsApp
 */
export function generateTextCheatsheet(): string {
  const lines: string[] = [
    '========================================================================',
    '       INGLÉS FÁCIL Y FLUIDO - CHEATSHEET DE 100 BLOQUES DE BOLSILLO     ',
    '========================================================================',
    'Guía rápida para llevar en el celular (Notas, Keep, WhatsApp personal).',
    'Objetivo: Usar bloques directos sin traducir palabra por palabra.',
    '',
    '------------------------------------------------------------------------',
    'SECCIÓN 1: BLOQUES DE CONSTRUCCIÓN PRINCIPALES',
    '------------------------------------------------------------------------',
  ];

  POWER_CHUNKS.forEach((c, i) => {
    lines.push(`[${i + 1}] ${c.chunk.toUpperCase()}`);
    if (c.phoneticSpelling) {
      lines.push(`    🗣 Pronunciación en español: ${c.phoneticSpelling}`);
    }
    lines.push(`    💡 Uso real: ${c.realUse}`);
    lines.push(`    ⚠️ Evitar error escolar: ${c.trapToAvoid}`);
    c.examples.forEach(ex => {
      lines.push(`    • EN: "${ex.en}"`);
      lines.push(`      ES: "${ex.es}"`);
    });
    lines.push('');
  });

  lines.push('------------------------------------------------------------------------');
  lines.push('SECCIÓN 2: FRASES DE ENTRECASA Y RESCATE COTIDIANO');
  lines.push('------------------------------------------------------------------------');

  ENTRECASA_PHRASES.forEach((p, i) => {
    lines.push(`[${i + 1}] Situación: ${p.spanishSituation}`);
    lines.push(`    ❌ No digas escolar: ${p.schoolStiff}`);
    lines.push(`    ✅ Decí natural: ${p.entrecasaNative}`);
    if (p.phoneticEasy) {
      lines.push(`    🗣 Fonética: ${p.phoneticEasy}`);
    }
    lines.push(`    💡 Tip: ${p.cozyTip}`);
    lines.push('');
  });

  lines.push('========================================================================');
  lines.push('Inglés Fácil y Fluido - Practicá 10 minutos al día en voz alta.');
  lines.push('========================================================================');

  return lines.join('\n');
}

/**
 * CSV file formatted for Anki, Quizlet, Excel, Google Sheets
 */
export function generateCsvFlashcards(): string {
  const headers = ['Nivel', 'Categoria', 'Frase_Ingles', 'Fonetica_Espanol', 'Traduccion_Espanol', 'Consejo_Pronunciacion', 'Uso_Real'];
  const rows: string[][] = [headers];

  POWER_CHUNKS.forEach(c => {
    const mainEx = c.examples[0] || { en: c.chunk, es: c.literalMeaning, soundTip: '' };
    rows.push([
      c.level || 'General',
      c.category,
      mainEx.en,
      c.phoneticSpelling || '',
      mainEx.es,
      mainEx.soundTip || c.trapToAvoid,
      c.realUse,
    ]);
  });

  ENTRECASA_PHRASES.forEach(p => {
    rows.push([
      p.level || 'Principiante',
      p.categoryLabel,
      p.entrecasaNative,
      p.phoneticEasy || p.pronunciationGuide,
      p.spanishSituation,
      p.cozyTip,
      `Reemplaza la versión acartonada: "${p.schoolStiff}"`,
    ]);
  });

  // UTF-8 BOM so Excel opens it with proper accents and ñ
  const csvContent = '\uFEFF' + rows.map(r => r.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  return csvContent;
}

/**
 * Connected speech and phonetics notes
 */
export function generateConnectedSpeechNotes(): string {
  const lines: string[] = [
    '========================================================================',
    '       CUADERNO DE FONÉTICA Y SONIDO CONECTADO (CONNECTED SPEECH)       ',
    '========================================================================',
    'Por qué los nativos no suenan como el profesor de secundaria:',
    '',
  ];

  CONNECTED_SPEECH_LESSONS.forEach((l, i) => {
    lines.push(`LECCIÓN ${i + 1}: ${l.title}`);
    lines.push(`Subtítulo: ${l.subtitle}`);
    lines.push(`Patrón: ${l.pattern}`);
    lines.push(`- Como te lo escriben: ${l.schoolVersion}`);
    lines.push(`- Como suena hablado:   ${l.nativePronunciation}`);
    lines.push(`- Fonética en español:  ${l.phoneticGuide}`);
    lines.push(`- Explicación:          ${l.explanation}`);
    lines.push('Ejemplos hablados:');
    l.examples.forEach(ex => {
      lines.push(`  • Formal:   ${ex.formal}`);
      lines.push(`    Nativo:   ${ex.nativeSpoken}`);
      lines.push(`    Español:  ${ex.translation}`);
    });
    lines.push('\n------------------------------------------------------------------------\n');
  });

  return lines.join('\n');
}

/**
 * 30-Day study plan
 */
export function generateStudyPlan(): string {
  return `========================================================================
             PLAN DE ACCIÓN DE 30 DÍAS: FLUIDEZ DE BOLSILLO
========================================================================
Compromiso: 10 minutos por día en voz alta. Cero gramática pesada.

SEMANA 1: CONSTRUIR EL MOTOR BÁSICO (Días 1 al 7)
------------------------------------------------------------------------
• Día 1: Dominar "Can I get / Can I have" para pedir cualquier cosa en la vida.
• Día 2: Frases salvavidas: "Sorry, I did not catch that. Say it again slower?"
• Día 3: Pedir la cuenta y hacer compras sin decir "Please bring me...".
• Día 4: Sonidos conectados 1: Reemplazar "going to" por "gonna".
• Día 5: Sonidos conectados 2: Reemplazar "want to" por "wanna".
• Día 6: Simulación de cafetería: Pedir un café y pagar en voz alta 5 veces.
• Día 7: Repaso de la semana: Grábate en el celular diciendo 3 frases seguidas.

SEMANA 2: CHARLAS DE ENTRECASA Y RELAJARSE (Días 8 al 14)
------------------------------------------------------------------------
• Día 8: Estar en casa de un amigo: "Make yourself at home", "Put the kettle on".
• Día 9: Ofrecer y rechazar con amabilidad: "I am good for now, thanks!".
• Día 10: Eliminar la traducción literal de "tener que": usar "gotta".
• Día 11: Decir que estás cansado como un nativo: "I am pretty beat today".
• Día 12: La T suave (Flap T): Water suena como "uá-rer", Better como "bé-rer".
• Día 13: Practicar en el gimnasio de reflejos: reaccionar en menos de 5 seg.
• Día 14: Día de escucha pasiva: pon los audios mientras caminás o cocinás.

SEMANA 3: SOLTURA Y OPINIONES SIN MIEDO (Días 15 al 21)
------------------------------------------------------------------------
• Día 15: Opinar con soltura: "If you ask me...", "I'm leaning towards...".
• Día 16: Conectar ideas con naturalidad: "To be honest...", "As far as I know...".
• Día 17: Cómo reaccionar cuando alguien te cuenta algo: "No way!", "Makes sense".
• Día 18: Manejar una confusión en el aeropuerto o viaje sin paralizarse.
• Día 19: Simulación de videollamada o trabajo informal.
• Día 20: Repasar las tarjetas Flashcards (Anki/Excel) 15 minutos.
• Día 21: Auto-evaluación: Notarás que ya no traducís en la cabeza cada palabra.

SEMANA 4: AUTOMATIZACIÓN Y FLUIDEZ MUSCULAR (Días 22 al 30)
------------------------------------------------------------------------
• Día 22: Desarmar la rigidez: Usar "You're good / Don't sweat it" en vez de disculpas.
• Día 23: Bloques de rescate en restaurantes: cambiar un plato, pedir aderezos.
• Día 24: Hablar con la Profe en la app: tener 1 consulta o conversación completa.
• Día 25: Repaso intensivo de las 10 contracciones clave del inglés hablado.
• Día 26: Simular una conversación de viaje de principio a fin.
• Día 27: Practicar frases a velocidad 1.0x (ritmo nativo de la calle).
• Día 28: Compartir una anécdota sencilla usando "Long story short...".
• Día 29: Ensayo general: leer en voz alta la Guía Maestra completa.
• Día 30: ¡Objetivo cumplido! Tu aparato fonador y cerebro ya reconocen el ritmo.

========================================================================
¡Felicitaciones por invertir en tu soltura y libertad al comunicarte!
`;
}

/**
 * Self-contained Single-File Offline Pocket Audio Player HTML
 * Works completely offline in any mobile or desktop browser without internet!
 */
export function generateOfflinePocketPlayerHtml(): string {
  const audioPhrasesJson = JSON.stringify([
    ...POWER_CHUNKS.map((c, i) => ({
      id: `chunk-${i}`,
      category: '100 Bloques Clave',
      title: c.chunk,
      phonetic: c.phoneticSpelling || '',
      meaning: c.literalMeaning,
      phrase: c.examples[0]?.en || c.chunk,
      translation: c.examples[0]?.es || c.realUse,
      tip: c.trapToAvoid,
    })),
    ...ENTRECASA_PHRASES.map((p, i) => ({
      id: `entrecasa-${i}`,
      category: p.categoryLabel,
      title: p.entrecasaNative,
      phonetic: p.phoneticEasy || p.pronunciationGuide,
      meaning: p.schoolStiff,
      phrase: p.audioText || p.entrecasaNative,
      translation: p.spanishSituation,
      tip: p.cozyTip,
    })),
  ]);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reproductor Offline de Bolsillo · Inglés Fácil y Fluido</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0B081E;
      color: #F8FAFC;
      padding: 16px;
      min-height: 100vh;
    }
    .container { max-width: 680px; margin: 0 auto; padding-bottom: 60px; }
    header {
      text-align: center;
      padding: 24px 0 16px;
      border-bottom: 1px solid #231A4D;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #FBBF24;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    h1 { margin: 6px 0; font-size: 24px; font-weight: 900; color: #FFF; }
    p.subtitle { color: #94A3B8; font-size: 13px; margin: 0; }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      background: #140F33;
      padding: 16px;
      border-radius: 16px;
      border: 1px solid #2B205D;
    }
    .speed-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: #CBD5E1;
    }
    .btn-group { display: flex; gap: 8px; }
    .speed-btn {
      background: #1E1747;
      border: 1px solid #3C2E75;
      color: #FFF;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
    }
    .speed-btn.active {
      background: #F59E0B;
      color: #0F172A;
      border-color: #F59E0B;
    }
    input[type="text"] {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      background: #0B081E;
      border: 1px solid #3C2E75;
      color: #FFF;
      font-size: 14px;
    }
    input[type="text"]:focus { outline: none; border-color: #F59E0B; }
    .phrase-list { display: flex; flex-direction: column; gap: 12px; }
    .phrase-card {
      background: #140F33;
      border: 1px solid #281D54;
      border-radius: 14px;
      padding: 16px;
      transition: border-color 0.2s;
    }
    .phrase-card:hover { border-color: #F59E0B; }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .cat-tag { font-size: 10px; font-weight: 700; color: #FBBF24; text-transform: uppercase; }
    .play-btn {
      background: #F59E0B;
      color: #0B081E;
      border: none;
      font-weight: 800;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .play-btn:hover { background: #FCD34D; }
    .phrase-en { font-size: 16px; font-weight: 800; color: #FFF; margin-bottom: 4px; }
    .phrase-phon {
      font-size: 13px;
      color: #38BDF8;
      background: rgba(56, 189, 248, 0.1);
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .phrase-es { font-size: 13px; color: #94A3B8; margin-bottom: 6px; }
    .phrase-tip { font-size: 11px; color: #A78BFA; }
    .offline-notice {
      text-align: center;
      font-size: 12px;
      color: #34D399;
      background: rgba(52, 211, 153, 0.1);
      padding: 8px;
      border-radius: 8px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">100% Offline · Sin conexión requerida</div>
      <h1>Audio-Kit de Bolsillo</h1>
      <p class="subtitle">Escuchá la pronunciación nativa en cualquier lugar desde tu celular o computadora.</p>
    </header>

    <div class="controls">
      <div class="speed-bar">
        <span>Velocidad de reproducción:</span>
        <div class="btn-group">
          <button class="speed-btn active" id="btn-slow" onclick="setSpeed(0.8)">0.8x (Pausado)</button>
          <button class="speed-btn" id="btn-normal" onclick="setSpeed(1.0)">1.0x (Nativo)</button>
        </div>
      </div>
      <input type="text" id="search-input" placeholder="Buscar frase, palabra o situación en español/inglés..." oninput="handleSearch()">
    </div>

    <div class="phrase-list" id="list-container"></div>

    <div class="offline-notice">
      ✓ Guardá este archivo en tus favoritos o archivos locales. Funciona para siempre sin internet ni suscripción.
    </div>
  </div>

  <script>
    const PHRASES = ${audioPhrasesJson};
    let currentSpeed = 0.8;
    let filteredList = [...PHRASES];

    function setSpeed(speed) {
      currentSpeed = speed;
      document.getElementById('btn-slow').className = speed === 0.8 ? 'speed-btn active' : 'speed-btn';
      document.getElementById('btn-normal').className = speed === 1.0 ? 'speed-btn active' : 'speed-btn';
    }

    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }

    function playAudio(text) {
      try {
        const ctx = getAudioContext();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        }
      } catch(e) {}

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = 'en-US';
          utter.rate = currentSpeed;
          const voices = window.speechSynthesis.getVoices();
          const usVoice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en'));
          if (usVoice) utter.voice = usVoice;
          window.speechSynthesis.speak(utter);
        } catch(e) {
          console.warn('Speech error', e);
        }
      } else {
        alert('Para escuchar en celular, abrí este archivo con Google Chrome o Safari.');
      }
    }

    function renderList() {
      const container = document.getElementById('list-container');
      if (filteredList.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:#94A3B8;">No se encontraron frases con esa búsqueda.</div>';
        return;
      }
      container.innerHTML = filteredList.map(item => \`
        <div class="phrase-card">
          <div class="card-top">
            <span class="cat-tag">\${item.category}</span>
            <button class="play-btn" onclick="playAudio('\${item.phrase.replace(/'/g, "\\\\'")}')">
              ▶ Escuchar
            </button>
          </div>
          <div class="phrase-en">\${item.phrase}</div>
          \${item.phonetic ? \`<div class="phrase-phon">🗣 \${item.phonetic}</div>\` : ''}
          <div class="phrase-es">\${item.translation}</div>
          \${item.tip ? \`<div class="phrase-tip">💡 \${item.tip}</div>\` : ''}
        </div>
      \`).join('');
    }

    function handleSearch() {
      const q = document.getElementById('search-input').value.toLowerCase().trim();
      if (!q) {
        filteredList = [...PHRASES];
      } else {
        filteredList = PHRASES.filter(p =>
          p.phrase.toLowerCase().includes(q) ||
          p.translation.toLowerCase().includes(q) ||
          p.phonetic.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      renderList();
    }

    // Init voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
    renderList();
  </script>
</body>
</html>`;
}

/**
 * Creates the complete .ZIP package using JSZip and triggers the real download!
 */
export async function generateAndDownloadZipPackage(onProgress?: (percent: number, stepText: string) => void): Promise<void> {
  const zip = new JSZip();

  onProgress?.(15, 'Generando Guía Maestra PDF Imprimible...');
  const masterGuideHtml = generateMasterPdfHtml();
  zip.file('01_Guia_Maestra_Ingles_Facil_y_Fluido_Imprimible.html', masterGuideHtml);

  onProgress?.(35, 'Generando Cheatsheet de 100 Bloques de Bolsillo...');
  const textCheatsheet = generateTextCheatsheet();
  zip.file('02_100_Bloques_Conversacionales_Cheatsheet.txt', textCheatsheet);

  onProgress?.(50, 'Compilando Cuaderno de Fonética y Sonido Conectado...');
  const connectedNotes = generateConnectedSpeechNotes();
  zip.file('03_Cuaderno_Fonetica_y_Pronunciacion_Nativa.txt', connectedNotes);

  onProgress?.(65, 'Preparando Tarjetas Flashcards Anki / Excel...');
  const csvFlashcards = generateCsvFlashcards();
  zip.file('04_Tarjetas_Flashcards_Anki_Excel.csv', csvFlashcards);

  onProgress?.(75, 'Creando Plan de Acción de 30 Días...');
  const studyPlan = generateStudyPlan();
  zip.file('05_Plan_de_Accion_30_Dias_Fluidez.txt', studyPlan);

  onProgress?.(85, 'Construyendo Reproductor de Audio Offline de Bolsillo...');
  const offlinePlayerHtml = generateOfflinePocketPlayerHtml();
  zip.file('06_Reproductor_Audio_Offline_De_Bolsillo.html', offlinePlayerHtml);

  // Dedicated guide for playing audio on phones
  const audioMobileGuide = `========================================================================
 GUÍA OFICIAL: CÓMO ESCUCHAR LOS AUDIOS EN TU CELULAR (ANDROID O IPHONE)
========================================================================

¡Hola! Esta guía rápida te resuelve cualquier duda para escuchar las frases
claramente en tu celular o computadora.

¿CÓMO ESCUCHAR LAS FRASES?
------------------------------------------------------------------------
Tenés dos formas súper sencillas:

OPCIÓN 1 (RECOMENDADA): EL REPRODUCTOR DE BOLSILLO
Abrí el archivo "06_Reproductor_Audio_Offline_De_Bolsillo.html" en tu celular.
- Funciona 100% SIN INTERNET.
- Te permite tocar cualquier frase y escucharla en 2 velocidades (0.8x y 1.0x).
- Tiene buscador instantáneo en español e inglés.

OPCIÓN 2: LA BÓVEDA WEB EN VIVO (ONLINE)
Si querés voces nativas ultra-realistas generadas con audio de estudio,
podés abrir el enlace web de la bóveda que recibiste tras tu compra.
Ahí tenés el reproductor web directo y podés descargar frases sueltas en WAV.

¿TOCÁS Y NO ESCUCHÁS NADA EN TU CELULAR?
------------------------------------------------------------------------
Si tocás "Escuchar" y no sale sonido, es por una de estas 3 razones comunes:

1. ¿Tenés un iPhone?
   Revisá la palanquita lateral de tu iPhone (el interruptor físico de silencio).
   Si muestra una franja naranja, el celular está en "Mute" y silencia los reproductores.
   Movelo hacia adelante para desactivar el silencio.

2. ¿Volumen multimedia bajo?
   Apretá los botones de volumen del celular. Asegurate de que el "Volumen multimedia"
   (el de música y videos) esté alto, no solo el volumen de llamadas.

3. ¿Lo abriste desde la carpeta de descargas o WhatsApp?
   En algunos celulares Android (Samsung, Xiaomi, Motorola), abrir un archivo HTML
   directamente desde el visor de archivos puede bloquear el audio por seguridad.
   SOLUCIÓN: Tocá el archivo, elegí "Compartir" o los 3 puntos (⋮) y seleccioná
   "Abrir con Google Chrome" o "Abrir con Safari".

¿PREGUNTAS O NECESITÁS AYUDA CON TU PACK?
Escribinos directamente a: inglesfacilyfluido@gmail.com
========================================================================`;
  zip.file('00_LEEME_COMO_ESCUCHAR_AUDIOS_EN_CELULAR.txt', audioMobileGuide);

  // Readme instructions
  const readme = `========================================================================
             ¡BIENVENIDO/A A TU AUDIO-KIT: INGLÉS FÁCIL Y FLUIDO!
========================================================================

Gracias por adquirir el paquete oficial de "Inglés Fácil y Fluido".
Todos estos materiales fueron diseñados para que hables con soltura y sin
quedarte congelado/a traduciendo palabra por palabra.

CONTENIDO DE ESTA CARPETA:
------------------------------------------------------------------------
1. "01_Guia_Maestra_Ingles_Facil_y_Fluido_Imprimible.html"
   Hacé doble clic para abrirla en cualquier navegador (Chrome, Safari, Edge).
   Tiene un botón superior para IMPRIMIR o GUARDAR COMO PDF en alta calidad.

2. "02_100_Bloques_Conversacionales_Cheatsheet.txt"
   Archivo de texto universal para copiar a las notas de tu celular (Keep, Apple Notes).

3. "03_Cuaderno_Fonetica_y_Pronunciacion_Nativa.txt"
   La explicación de cómo se unen las palabras en la vida real ("gonna", "wanna", flap T).

4. "04_Tarjetas_Flashcards_Anki_Excel.csv"
   Podés abrirlo en Excel/Google Sheets o importarlo directamente a la app Anki / Quizlet.

5. "05_Plan_de_Accion_30_Dias_Fluidez.txt"
   Calendario guiado de 10 minutos al día para desarrollar reflejo muscular.

6. "06_Reproductor_Audio_Offline_De_Bolsillo.html"
   ¡Tu joya de bolsillo! Abrilo en tu celular o laptop: funciona 100% SIN INTERNET
   y te permite escuchar cualquier frase en velocidad pausada (0.8x) o nativa (1.0x).

RECOMENDACIÓN DE USO:
- Semana 1: 10 minutos al día con el Reproductor Offline y la Sección 1 de la Guía.
- Repetir siempre en voz alta, nunca en silencio.

¡Muchos éxitos en tu camino hacia la fluidez real!
Equipo de Inglés Fácil y Fluido
`;
  zip.file('00_LEEME_PRIMERO_Instrucciones.txt', readme);

  onProgress?.(95, 'Comprimiendo archivo ZIP final...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  onProgress?.(100, '¡Descarga lista!');
  downloadBlob(zipBlob, 'Pack_Ingles_Facil_y_Fluido_Completo.zip');
}

/**
 * Escapes HTML characters for safety in generated docs
 */
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
