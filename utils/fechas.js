// Utilidades de fechas compartidas por las pantallas

// Devuelve la fecha en formato YYYY-MM-DD (hora local)
export const fechaISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Muestra una fecha de la API en formato corto DD/MM/YYYY
export const formatearFecha = (valor) => {
  if (!valor) return '—';
  const [y, m, d] = String(valor).substring(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

// Un mantenimiento está vencido si su fecha programada ya pasó
// y todavía no fue completado
export const esVencido = (mantenimiento) =>
  mantenimiento.estado !== 'completado' &&
  String(mantenimiento.fecha_programada).substring(0, 10) < fechaISO(new Date());