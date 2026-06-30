import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { API_URL, authFetch } from '../utils/api';

const COLORES_ROL = {
  supervisor: '#1B4F72',
  tecnico:    '#27AE60',
};

export default function UsuariosScreen() {

  const [usuarios,    setUsuarios]    = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const respuesta = await authFetch(`${API_URL}/usuarios`);
      const datos     = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudieron cargar los usuarios');
        return;
      }

      setUsuarios(Array.isArray(datos) ? datos : []);
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarUsuarios();
  };

  const cambiarRol = async (id, nuevoRol) => {
    try {
      const respuesta = await authFetch(`${API_URL}/usuarios/${id}/rol`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rol: nuevoRol }),
      });

      if (respuesta.ok) {
        setUsuarios((prev) =>
          prev.map((u) => u.id === id ? { ...u, rol: nuevoRol } : u)
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el rol');
    }
  };

  const mostrarOpcionesRol = (item) => {
    Alert.alert(
      'Cambiar Rol',
      item.nombre,
      [
        { text: 'Técnico',    onPress: () => cambiarRol(item.id, 'tecnico')    },
        { text: 'Supervisor', onPress: () => cambiarRol(item.id, 'supervisor') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const renderUsuario = ({ item }) => (
    <View style={styles.tarjeta}>

      <View style={styles.filaSuperior}>
        <View style={styles.avatar}>
          <Text style={styles.inicialAvatar}>
            {item.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoUsuario}>
          <Text style={styles.nombreUsuario}>{item.nombre}</Text>
          <Text style={styles.emailUsuario}>{item.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.badgeRol, { backgroundColor: COLORES_ROL[item.rol] }]}
          onPress={() => mostrarOpcionesRol(item)}
        >
          <Text style={styles.textoBadge}>
            {item.rol === 'supervisor' ? 'Supervisor' : 'Técnico'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4F72" />
        <Text style={styles.textoCargando}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.conteo}>{usuarios.length} usuarios registrados</Text>

      <FlatList
        data={usuarios}
        renderItem={renderUsuario}
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
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F39C12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inicialAvatar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoUsuario: {
    flex: 1,
  },
  nombreUsuario: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  emailUsuario: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  badgeRol: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  textoBadge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
