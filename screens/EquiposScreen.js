import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { API_URL } from '../utils/api';

const COLORES_ESTADO = {
  operativo:         '#27AE60',
  en_mantenimiento:  '#F39C12',
  fuera_de_servicio: '#E74C3C',
};

const TEXTO_ESTADO = {
  operativo:         'Operativo',
  en_mantenimiento:  'En Mantenimiento',
  fuera_de_servicio: 'Fuera de Servicio',
};

export default function EquiposScreen() {

  const [equipos,     setEquipos]     = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/equipos`);
      const datos     = await respuesta.json();
      setEquipos(datos);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los equipos.\nVerifica la conexión al servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarEquipos();
  };

  const renderEquipo = ({ item }) => (
    <View style={styles.tarjeta}>

      <View style={styles.filaSuperior}>
        <Text style={styles.codigoEquipo}>{item.codigo}</Text>
        <View style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}>
          <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
        </View>
      </View>

      <Text style={styles.nombreEquipo}>{item.nombre}</Text>
      <Text style={styles.infoEquipo}>Tipo: {item.tipo}</Text>
      <Text style={styles.infoEquipo}>Ubicación: {item.ubicacion}</Text>

    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4F72" />
        <Text style={styles.textoCargando}>Cargando equipos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.conteo}>{equipos.length} equipos registrados</Text>

      <FlatList
        data={equipos}
        renderItem={renderEquipo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
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
    marginBottom: 8,
  },
  codigoEquipo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B4F72',
    backgroundColor: '#EBF5FB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
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
  nombreEquipo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  infoEquipo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
});