import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { API_URL, authFetch } from '../utils/api';

const ORDEN_ESTADO = { pendiente: 0, en_proceso: 1, completado: 2 };

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

export default function MisTareasScreen({ usuario }) {

  const [tareas,      setTareas]      = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarTareas = useCallback(async () => {
    try {
      const respuesta = await authFetch(`${API_URL}/mantenimientos/mis-tareas`);
      const datos     = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudieron cargar las tareas');
        return;
      }

      const ordenadas = [...datos].sort(
        (a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]
      );
      setTareas(ordenadas);
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarTareas();
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const respuesta = await authFetch(`${API_URL}/mantenimientos/${id}/estado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado: nuevoEstado }),
      });

      if (respuesta.ok) {
        setTareas((prev) => {
          const actualizadas = prev.map((t) =>
            t.id === id ? { ...t, estado: nuevoEstado } : t
          );
          return [...actualizadas].sort(
            (a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]
          );
        });
      } else {
        const datos = await respuesta.json();
        Alert.alert('Error', datos.error || 'No se pudo actualizar el estado');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  const mostrarOpciones = (item) => {
    Alert.alert(
      'Cambiar Estado',
      `Equipo: ${item.equipo_nombre}`,
      [
        { text: 'Pendiente',  onPress: () => cambiarEstado(item.id, 'pendiente')  },
        { text: 'En Proceso', onPress: () => cambiarEstado(item.id, 'en_proceso') },
        { text: 'Completado', onPress: () => cambiarEstado(item.id, 'completado') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const pendientes  = tareas.filter((t) => t.estado === 'pendiente').length;
  const enProceso   = tareas.filter((t) => t.estado === 'en_proceso').length;
  const completadas = tareas.filter((t) => t.estado === 'completado').length;

  const renderTarea = ({ item }) => (
    <View style={[styles.tarjeta, item.estado === 'completado' && styles.tarjetaCompletada]}>

      <View style={styles.filaSuperior}>
        <Text style={styles.equipoNombre} numberOfLines={1}>{item.equipo_nombre}</Text>
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}
          onPress={() => mostrarOpciones(item)}
        >
          <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.equipoCodigo}>{item.equipo_codigo}</Text>

      <View style={styles.filaInfo}>
        <Text style={styles.etiqueta}>Tipo:</Text>
        <Text style={styles.valor}>
          {item.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
        </Text>
      </View>

      <View style={styles.filaInfo}>
        <Text style={styles.etiqueta}>Fecha:</Text>
        <Text style={styles.valor}>
          {new Date(item.fecha_programada).toLocaleDateString('es-PE')}
        </Text>
      </View>

      {item.descripcion ? (
        <Text style={styles.descripcion}>{item.descripcion}</Text>
      ) : null}

    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4F72" />
        <Text style={styles.textoCargando}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>

      <View style={styles.resumen}>
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNumero, { color: '#E67E22' }]}>{pendientes}</Text>
          <Text style={styles.resumenLabel}>Pendientes</Text>
        </View>
        <View style={styles.separadorResumen} />
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNumero, { color: '#2980B9' }]}>{enProceso}</Text>
          <Text style={styles.resumenLabel}>En Proceso</Text>
        </View>
        <View style={styles.separadorResumen} />
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNumero, { color: '#27AE60' }]}>{completadas}</Text>
          <Text style={styles.resumenLabel}>Completadas</Text>
        </View>
      </View>

      {tareas.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>No tienes tareas asignadas</Text>
          <Text style={styles.textoVacioSub}>Un supervisor te asignará mantenimientos</Text>
        </View>
      ) : (
        <FlatList
          data={tareas}
          renderItem={renderTarea}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
        />
      )}
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
  resumen: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 10,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  resumenItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resumenLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
  },
  separadorResumen: {
    width: 1,
    backgroundColor: '#ECF0F1',
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
  tarjetaCompletada: {
    opacity: 0.65,
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
  equipoCodigo: {
    fontSize: 12,
    color: '#1B4F72',
    backgroundColor: '#EBF5FB',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 10,
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
    width: 52,
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
});
