import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';

import { fechaISO, formatearFecha, esVencido } from './fechas';

const TEXTO_ESTADO = {
  pendiente:  'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
};

const TEXTO_TIPO = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
};

// ============================================
// REPORTE PDF (expo-print + expo-sharing)
// ============================================
export const exportarPDF = async (mantenimientos, subtitulo = 'Todos los registros') => {

  const total       = mantenimientos.length;
  const completados = mantenimientos.filter((m) => m.estado === 'completado').length;
  const enProceso   = mantenimientos.filter((m) => m.estado === 'en_proceso').length;
  const pendientes  = mantenimientos.filter((m) => m.estado === 'pendiente').length;
  const vencidos    = mantenimientos.filter(esVencido).length;

  const filas = mantenimientos.map((m, i) => `
    <tr style="background-color:${i % 2 === 0 ? '#ffffff' : '#f4f6f7'}">
      <td>${m.equipo_codigo}</td>
      <td>${m.equipo_nombre}</td>
      <td>${m.tecnico_nombre}</td>
      <td>${TEXTO_TIPO[m.tipo] || m.tipo}</td>
      <td>${TEXTO_ESTADO[m.estado] || m.estado}${esVencido(m) ? ' ⚠' : ''}</td>
      <td>${formatearFecha(m.fecha_programada)}</td>
      <td>${formatearFecha(m.fecha_completado)}</td>
      <td>${m.observaciones || m.descripcion || '—'}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body   { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #2C3E50; }
          h1     { color: #1B4F72; margin: 0; font-size: 22px; }
          h2     { color: #7F8C8D; font-weight: normal; font-size: 13px; margin: 4px 0 0 0; }
          .cabecera { border-bottom: 3px solid #F39C12; padding-bottom: 12px; margin-bottom: 16px; }
          .resumen  { display: flex; margin-bottom: 18px; }
          .kpi      { flex: 1; text-align: center; background: #EBF5FB; margin-right: 8px;
                      border-radius: 8px; padding: 10px 4px; }
          .kpi .num { font-size: 20px; font-weight: bold; color: #1B4F72; }
          .kpi .lbl { font-size: 10px; color: #7F8C8D; }
          .kpi.rojo .num { color: #C0392B; }
          table  { width: 100%; border-collapse: collapse; font-size: 10px; }
          th     { background: #1B4F72; color: white; padding: 6px 4px; text-align: left; }
          td     { padding: 6px 4px; border-bottom: 1px solid #ECF0F1; }
          .pie   { margin-top: 20px; font-size: 9px; color: #95A5A6; text-align: center; }
        </style>
      </head>
      <body>
        <div class="cabecera">
          <h1>RESEMIN — Reporte de Mantenimientos</h1>
          <h2>Sistema de Control de Mantenimiento Minero &nbsp;|&nbsp; Filtro: ${subtitulo}
              &nbsp;|&nbsp; Generado: ${formatearFecha(fechaISO(new Date()))}</h2>
        </div>

        <div class="resumen">
          <div class="kpi"><div class="num">${total}</div><div class="lbl">TOTAL</div></div>
          <div class="kpi"><div class="num">${pendientes}</div><div class="lbl">PENDIENTES</div></div>
          <div class="kpi"><div class="num">${enProceso}</div><div class="lbl">EN PROCESO</div></div>
          <div class="kpi"><div class="num">${completados}</div><div class="lbl">COMPLETADOS</div></div>
          <div class="kpi rojo"><div class="num">${vencidos}</div><div class="lbl">VENCIDOS</div></div>
        </div>

        <table>
          <tr>
            <th>Código</th><th>Equipo</th><th>Técnico</th><th>Tipo</th>
            <th>Estado</th><th>Programado</th><th>Completado</th><th>Detalle</th>
          </tr>
          ${filas}
        </table>

        <div class="pie">
          ReseminMaint — Reporte generado automáticamente desde la aplicación móvil
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType:    'application/pdf',
    dialogTitle: 'Compartir reporte PDF',
    UTI:         'com.adobe.pdf',
  });
};

// ============================================
// REPORTE EXCEL (SheetJS + expo-file-system)
// ============================================
export const exportarExcel = async (mantenimientos) => {

  const filas = mantenimientos.map((m) => ({
    'Código':           m.equipo_codigo,
    'Equipo':           m.equipo_nombre,
    'Técnico':          m.tecnico_nombre,
    'Tipo':             TEXTO_TIPO[m.tipo] || m.tipo,
    'Estado':           TEXTO_ESTADO[m.estado] || m.estado,
    'Vencido':          esVencido(m) ? 'Sí' : 'No',
    'Fecha Programada': formatearFecha(m.fecha_programada),
    'Fecha Completado': formatearFecha(m.fecha_completado),
    'Descripción':      m.descripcion || '',
    'Observaciones':    m.observaciones || '',
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);

  // Anchos de columna para que el Excel se lea bien
  hoja['!cols'] = [
    { wch: 10 }, { wch: 28 }, { wch: 22 }, { wch: 12 }, { wch: 12 },
    { wch: 8 },  { wch: 16 }, { wch: 16 }, { wch: 40 }, { wch: 40 },
  ];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Mantenimientos');

  const base64 = XLSX.write(libro, { type: 'base64', bookType: 'xlsx' });

  const ruta = `${FileSystem.cacheDirectory}reporte_mantenimientos_${fechaISO(new Date())}.xlsx`;
  await FileSystem.writeAsStringAsync(ruta, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(ruta, {
    mimeType:    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Compartir reporte Excel',
    UTI:         'org.openxmlformats.spreadsheetml.sheet',
  });
};