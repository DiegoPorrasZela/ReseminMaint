import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Modal, TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { API_URL, authFetch } from '../utils/api';

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

export default function EquiposScreen({ usuario }) {

  const esSupervisor = usuario?.rol === 'supervisor';

  const [equipos,       setEquipos]       = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [refrescando,   setRefrescando]   = useState(false);

  // Estado del formulario de crear/editar equipo (solo supervisor)
  const [modalVisible,  setModalVisible]  = useState(false);
  const [equipoEditado, setEquipoEditado] = useState(null); // null = crear nuevo
  const [codigo,        setCodigo]        = useState('');
  const [nombre,        setNombre]        = useState('');
  const [tipo,          setTipo]          = useState('');
  const [ubicacion,     setUbicacion]     = useState('');
  const [guardando,     setGuardando]     = useState(false);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const respuesta = await authFetch(`${API_URL}/equipos`);
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

  const cambiarEstadoEquipo = async (id, nuevoEstado) => {
    try {
      const respuesta = await authFetch(`${API_URL}/equipos/${id}/estado`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado: nuevoEstado }),
      });

      if (respuesta.ok) {
        setEquipos((prev) =>
          prev.map((eq) => eq.id === id ? { ...eq, estado: nuevoEstado } : eq)
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del equipo');
    }
  };

  const abrirCrear = () => {
    setEquipoEditado(null);
    setCodigo('');
    setNombre('');
    setTipo('');
    setUbicacion('');
    setModalVisible(true);
  };

  const abrirEditar = (item) => {
    setEquipoEditado(item);
    setCodigo(item.codigo);
    setNombre(item.nombre);
    setTipo(item.tipo);
    setUbicacion(item.ubicacion);
    setModalVisible(true);
  };

  const guardarEquipo = async () => {
    if (!codigo.trim() || !nombre.trim() || !tipo.trim() || !ubicacion.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setGuardando(true);
    try {
      const url    = equipoEditado
        ? `${API_URL}/equipos/${equipoEditado.id}`
        : `${API_URL}/equipos`;
      const metodo = equipoEditado ? 'PUT' : 'POST';

      const respuesta = await authFetch(url, {
        method:  metodo,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ codigo, nombre, tipo, ubicacion }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudo guardar el equipo');
        return;
      }

      setModalVisible(false);
      cargarEquipos();

    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setGuardando(false);
    }
  };

  const mostrarOpcionesEstado = (item) => {
    Alert.alert(
      'Cambiar Estado',
      item.nombre,
      [
        { text: 'Operativo',         onPress: () => cambiarEstadoEquipo(item.id, 'operativo')         },
        { text: 'En Mantenimiento',  onPress: () => cambiarEstadoEquipo(item.id, 'en_mantenimiento')  },
        { text: 'Fuera de Servicio', onPress: () => cambiarEstadoEquipo(item.id, 'fuera_de_servicio') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const renderEquipo = ({ item }) => (
    <View style={styles.tarjeta}>

      <View style={styles.filaSuperior}>
        <Text style={styles.codigoEquipo}>{item.codigo}</Text>

        {usuario?.rol === 'supervisor' ? (
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}
            onPress={() => mostrarOpcionesEstado(item)}
          >
            <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.badge, { backgroundColor: COLORES_ESTADO[item.estado] }]}>
            <Text style={styles.textoBadge}>{TEXTO_ESTADO[item.estado]}</Text>
          </View>
        )}
      </View>

      <Text style={styles.nombreEquipo}>{item.nombre}</Text>
      <Text style={styles.infoEquipo}>Tipo: {item.tipo}</Text>
      <Text style={styles.infoEquipo}>Ubicación: {item.ubicacion}</Text>

      {esSupervisor && (
        <TouchableOpacity style={styles.botonEditar} onPress={() => abrirEditar(item)}>
          <Ionicons name="pencil" size={14} color="#1B4F72" />
          <Text style={styles.textoEditar}>Editar</Text>
        </TouchableOpacity>
      )}

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

      <View style={styles.filaConteo}>
        <Text style={styles.conteo}>{equipos.length} equipos registrados</Text>

        {esSupervisor && (
          <TouchableOpacity style={styles.botonNuevo} onPress={abrirCrear}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.textoNuevo}>Nuevo Equipo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={equipos}
        renderItem={renderEquipo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>

            <Text style={styles.tituloModal}>
              {equipoEditado ? 'Editar Equipo' : 'Nuevo Equipo'}
            </Text>

            <Text style={styles.etiquetaModal}>Código *</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej: EQ-006"
              value={codigo}
              onChangeText={setCodigo}
              autoCapitalize="characters"
            />

            <Text style={styles.etiquetaModal}>Nombre *</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej: Jumbo Drill Muki FF"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.etiquetaModal}>Tipo *</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej: Perforadora"
              value={tipo}
              onChangeText={setTipo}
            />

            <Text style={styles.etiquetaModal}>Ubicación *</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej: Nivel 2 - Galería B"
              value={ubicacion}
              onChangeText={setUbicacion}
            />

            <View style={styles.filaBotonesModal}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoCancelarModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botonGuardarModal, guardando && { opacity: 0.6 }]}
                onPress={guardarEquipo}
                disabled={guardando}
              >
                {guardando
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.textoGuardarModal}>Guardar</Text>
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
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
  botonNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F39C12',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  textoNuevo: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  botonEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EBF5FB',
  },
  textoEditar: {
    color: '#1B4F72',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  cajaModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4F72',
    marginBottom: 12,
  },
  etiquetaModal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
    marginTop: 10,
  },
  inputModal: {
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  filaBotonesModal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  botonCancelarModal: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  textoCancelarModal: {
    color: '#7F8C8D',
    fontWeight: '600',
  },
  botonGuardarModal: {
    backgroundColor: '#F39C12',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  textoGuardarModal: {
    color: '#fff',
    fontWeight: 'bold',
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
