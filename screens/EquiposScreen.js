// EquiposScreen.js — Catálogo de equipos mineros

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { API_URL } from '../utils/api';

// Colores para cada estado del equipo
const COLORES_ESTADO = {
  operativo:          '#27AE60', // Verde
  en_mantenimiento:   '#F39C12', // Naranja
  fuera_de_servicio:  '#E74C3C', // Rojo
};

// Textos en español para mostrar al usuario
const TEXTO_ESTADO = {
  operativo:          'Operativo',
  en_mantenimiento:   'En Mantenimiento',
  fuera_de_servicio:  'Fuera de Servicio',
};

export default function EquiposScreen() {

  // Estado que guardará la lista de equipos recibida del servidor
  const [equipos,     setEquipos]     = useState([]);
  // true mientras la primera carga está en proceso
  const [cargando,    setCargando]    = useState(true);
  // true mientras se está refrescando (al deslizar hacia abajo)
  const [refrescando, setRefrescando] = useState(false);

  // useEffect con [] se ejecuta UNA SOLA VEZ cuando el componente se monta
  useEffect(() => {
    cargarEquipos();
  }, []); // El [] vacío significa "solo al montar"

  // Función asíncrona que hace fetch al backend
  const cargarEquipos = async () => {
    try {
      // GET al endpoint /api/equipos — no necesita body ni headers especiales
      const respuesta = await fetch(`${API_URL}/equipos`);
      const datos     = await respuesta.json();
      setEquipos(datos); // Guardamos la lista en el estado
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los equipos.\nVerifica la conexión al servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  // Se llama cuando el usuario desliza hacia abajo para refrescar
  const onRefresh = () => {
    setRefrescando(true);
    cargarEquipos();
  };

  // renderEquipo define cómo se ve CADA elemento de la lista
  // FlatList llama a esta función por cada equipo en el arreglo
  const renderEquipo = ({ item }) => (
    <View style={styles.tarjeta}>

      {/* Fila superior: código y badge de estado */}
      <View style={styles.filaSuperior}>
        <Text style={styles.codigoEquipo}>{item.codigo}</Text>
        {/* El color del badge cambia según el estado */}
        <View style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}>
          <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
        </View>
      </View>

      <Text style={styles.nombreEquipo}>{item.nombre}</Text>
      <Text style={styles.infoEquipo}>Tipo: {item.tipo}</Text>
      <Text style={styles.infoEquipo}>Ubicación: {item.ubicacion}</Text>

    </View>
  );

  // Mientras carga la primera vez, mostramos un spinner centrado
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

      {/* FlatList renderiza listas largas de forma eficiente */}
      <FlatList
        data={equipos}                                          // El arreglo de datos
        renderItem={renderEquipo}                               // Cómo dibujar cada item
        keyExtractor={(item) => item.id.toString()}             // ID único por item
        contentContainerStyle={styles.lista}
        refreshControl={
          // RefreshControl agrega el gesto de "tirar para refrescar"
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
    // Sombra en Android
    elevation: 3,
    // Sombra en iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filaSuperior: {
    flexDirection: 'row',          // Elementos en fila horizontal
    justifyContent: 'space-between', // Uno a cada lado
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
