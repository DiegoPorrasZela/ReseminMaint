import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { API_URL, authFetch } from '../utils/api';
import { esVencido, formatearFecha } from '../utils/fechas';
import { exportarPDF, exportarExcel } from '../utils/reportes';
import ModalCompletar from '../components/ModalCompletar';

const COLORES_ESTADO = {
  pendiente:  '#E67E22',
  en_proceso: '#2980B9',
  completado: '#27AE60',
};

const TEXTO_ESTADO = {
  pendiente:  'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
};

const FILTROS_ESTADO = [
  { clave: 'todos',      texto: 'Todos'      },
  { clave: 'pendiente',  texto: 'Pendientes' },
  { clave: 'en_proceso', texto: 'En Proceso' },
  { clave: 'completado', texto: 'Completados'},
  { clave: 'vencidos',   texto: 'Vencidos'   },
];

const FILTROS_TIPO = [
  { clave: 'todos',      texto: 'Todos'       },
  { clave: 'preventivo', texto: 'Preventivos' },
  { clave: 'correctivo', texto: 'Correctivos' },
];

export default function HistorialScreen({ usuario }) {

  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [refrescando,    setRefrescando]    = useState(false);
  const [filtroEstado,   setFiltroEstado]   = useState('todos');
  const [filtroTipo,     setFiltroTipo]     = useState('todos');
  const [tareaACerrar,   setTareaACerrar]   = useState(null);
  const [exportando,     setExportando]     = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const respuesta = await authFetch(`${API_URL}/mantenimientos`);
      const datos     = await respuesta.json();
      setMantenimientos(datos);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarHistorial();
  };

  const cambiarEstado = async (id, nuevoEstado, observaciones = null) => {
    try {
      const respuesta = await authFetch(`${API_URL}/mantenimientos/${id}/estado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado: nuevoEstado, observaciones }),
      });

      if (respuesta.ok) {
        // Se recarga para reflejar fecha de cierre y sincronización del equipo
        cargarHistorial();
      } else {
        const datos = await respuesta.json();
        Alert.alert('Error', datos.error || 'No se pudo actualizar el estado');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const eliminarMantenimiento = (item) => {
    Alert.alert(
      'Eliminar Mantenimiento',
      `¿Eliminar el registro de ${item.equipo_nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const respuesta = await authFetch(`${API_URL}/mantenimientos/${item.id}`, {
                method: 'DELETE',
              });
              if (respuesta.ok) {
                cargarHistorial();
              } else {
                const datos = await respuesta.json();
                Alert.alert('Error', datos.error || 'No se pudo eliminar');
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo conectar al servidor');
            }
          },
        },
      ]
    );
  };

  const mostrarOpciones = (item) => {
    const opciones = [
      { text: 'Pendiente',  onPress: () => cambiarEstado(item.id, 'pendiente')  },
      { text: 'En Proceso', onPress: () => cambiarEstado(item.id, 'en_proceso') },
      { text: 'Completado', onPress: () => setTareaACerrar(item) },
    ];

    if (usuario?.rol === 'supervisor') {
      opciones.push({
        text: 'Eliminar registro',
        style: 'destructive',
        onPress: () => eliminarMantenimiento(item),
      });
    }

    opciones.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Cambiar Estado', `Equipo: ${item.equipo_nombre}`, opciones);
  };

  const puedeEditar = (item) =>
    usuario?.rol === 'supervisor' || item.tecnico_id === usuario?.id;

  // Aplica los filtros seleccionados sobre la lista completa
  const filtrados = mantenimientos.filter((m) => {
    const pasaEstado =
      filtroEstado === 'todos'    ? true :
      filtroEstado === 'vencidos' ? esVencido(m) :
      m.estado === filtroEstado;

    const pasaTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;

    return pasaEstado && pasaTipo;
  });

  const textoFiltro = () => {
    const partes = [];
    partes.push(FILTROS_ESTADO.find((f) => f.clave === filtroEstado)?.texto || 'Todos');
    if (filtroTipo !== 'todos') {
      partes.push(FILTROS_TIPO.find((f) => f.clave === filtroTipo)?.texto);
    }
    return partes.join(' / ');
  };

  const exportar = () => {
    if (filtrados.length === 0) {
      Alert.alert('Sin datos', 'No hay registros para exportar con los filtros actuales');
      return;
    }

    Alert.alert(
      'Exportar Reporte',
      `Se exportarán ${filtrados.length} registros (${textoFiltro()})`,
      [
        { text: 'PDF',    onPress: () => generarReporte('pdf')   },
        { text: 'Excel',  onPress: () => generarReporte('excel') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const generarReporte = async (formato) => {
    setExportando(true);
    try {
      if (formato === 'pdf') {
        await exportarPDF(filtrados, textoFiltro());
      } else {
        await exportarExcel(filtrados);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el reporte');
    } finally {
      setExportando(false);
    }
  };

  const renderChips = (filtros, valorActual, setValor) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filaChips}
    >
      {filtros.map((f) => (
        <TouchableOpacity
          key={f.clave}
          style={[styles.chip, valorActual === f.clave && styles.chipActivo]}
          onPress={() => setValor(f.clave)}
        >
          <Text style={[styles.textoChip, valorActual === f.clave && styles.textoChipActivo]}>
            {f.texto}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMantenimiento = ({ item }) => (
    <View style={styles.tarjeta}>

      <View style={styles.filaSuperior}>
        <Text style={styles.equipoNombre} numberOfLines={1}>{item.equipo_nombre}</Text>

        {puedeEditar(item) ? (
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}
            onPress={() => mostrarOpciones(item)}
          >
            <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}>
            <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
          </View>
        )}
      </View>

      <View style={styles.filaCodigos}>
        <Text style={styles.equipoCodigo}>{item.equipo_codigo}</Text>
        {esVencido(item) && (
          <Text style={styles.badgeVencido}>VENCIDO</Text>
        )}
      </View>

      <View style={styles.filaInfo}>
        <Text style={styles.etiqueta}>Tipo:</Text>
        <Text style={styles.valor}>
          {item.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
        </Text>
      </View>

      <View style={styles.filaInfo}>
        <Text style={styles.etiqueta}>Técnico:</Text>
        <Text style={styles.valor}>{item.tecnico_nombre}</Text>
      </View>

      <View style={styles.filaInfo}>
        <Text style={styles.etiqueta}>Fecha:</Text>
        <Text style={styles.valor}>{formatearFecha(item.fecha_programada)}</Text>
      </View>

      {item.estado === 'completado' && item.fecha_completado ? (
        <View style={styles.filaInfo}>
          <Text style={styles.etiqueta}>Cerrado:</Text>
          <Text style={styles.valor}>{formatearFecha(item.fecha_completado)}</Text>
        </View>
      ) : null}

      {item.descripcion ? (
        <Text style={styles.descripcion}>{item.descripcion}</Text>
      ) : null}

      {item.estado === 'completado' && item.observaciones ? (
        <Text style={styles.observaciones}>Obs: {item.observaciones}</Text>
      ) : null}

    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4F72" />
        <Text style={styles.textoCargando}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>

      <View style={styles.filtros}>
        {renderChips(FILTROS_ESTADO, filtroEstado, setFiltroEstado)}
        {renderChips(FILTROS_TIPO, filtroTipo, setFiltroTipo)}
      </View>

      <View style={styles.filaConteo}>
        <Text style={styles.conteo}>{filtrados.length} registros</Text>

        <TouchableOpacity
          style={[styles.botonExportar, exportando && styles.botonDesactivado]}
          onPress={exportar}
          disabled={exportando}
        >
          {exportando
            ? <ActivityIndicator size="small" color="#fff" />
            : (
              <>
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text style={styles.textoExportar}>Exportar</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>

      {filtrados.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>No hay mantenimientos para mostrar</Text>
          <Text style={styles.textoVacioSub}>Prueba cambiando los filtros o crea uno en "Nuevo"</Text>
        </View>
      ) : (
        <FlatList
          data={filtrados}
          renderItem={renderMantenimiento}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
        />
      )}

      <ModalCompletar
        visible={tareaACerrar !== null}
        equipoNombre={tareaACerrar?.equipo_nombre || ''}
        onCancelar={() => setTareaACerrar(null)}
        onConfirmar={(observaciones) => {
          cambiarEstado(tareaACerrar.id, 'completado', observaciones || null);
          setTareaACerrar(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCargando: {
    marginTop: 12,
    color: '#7F8C8D',
  },
  textoVacio: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  textoVacioSub: {
    fontSize: 13,
    color: '#BDC3C7',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  filtros: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  filaChips: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F6F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  chipActivo: {
    backgroundColor: '#1B4F72',
    borderColor: '#1B4F72',
  },
  textoChip: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  textoChipActivo: {
    color: '#fff',
  },
  filaConteo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  conteo: {
    color: '#7F8C8D',
    fontSize: 13,
  },
  botonExportar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  botonDesactivado: {
    opacity: 0.6,
  },
  textoExportar: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    marginRight: 8,
  },
  filaCodigos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  equipoCodigo: {
    fontSize: 12,
    color: '#1B4F72',
    backgroundColor: '#EBF5FB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeVencido: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#C0392B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
    overflow: 'hidden',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  textoBadge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  filaInfo: {
    flexDirection: 'row',
    marginTop: 4,
  },
  etiqueta: {
    fontSize: 13,
    color: '#7F8C8D',
    width: 68,
  },
  valor: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '500',
  },
  descripcion: {
    marginTop: 10,
    fontSize: 13,
    color: '#7F8C8D',
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 8,
  },
  observaciones: {
    marginTop: 8,
    fontSize: 13,
    color: '#27AE60',
    fontStyle: 'italic',
  },
});