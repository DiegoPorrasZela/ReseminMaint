import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { API_URL } from '../utils/api';

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

export default function HistorialScreen() {

  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [refrescando,    setRefrescando]    = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/mantenimientos`);
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

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const respuesta = await fetch(`${API_URL}/mantenimientos/${id}/estado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado: nuevoEstado }),
      });

      if (respuesta.ok) {
        setMantenimientos((prev) =>
          prev.map((m) => m.id === id ? { ...m, estado: nuevoEstado } : m)
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
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

  const renderMantenimiento = ({ item }) => (
    <View style={styles.tarjeta}>

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
        <Text style={styles.etiqueta}>Técnico:</Text>
        <Text style={styles.valor}>{item.tecnico_nombre}</Text>
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
        <Text style={styles.textoCargando}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.conteo}>{mantenimientos.length} registros</Text>

      {mantenimientos.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.textoVacio}>No hay mantenimientos registrados</Text>
          <Text style={styles.textoVacioSub}>Ve a la pestaña "Nuevo" para crear uno</Text>
        </View>
      ) : (
        <FlatList
          data={mantenimientos}
          renderItem={renderMantenimiento}
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
  },
  conteo: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#7F8C8D',
    fontSize: 13,
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
});