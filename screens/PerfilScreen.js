import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, authFetch } from '../utils/api';

export default function PerfilScreen({ usuario, setUsuario }) {

  const [nombre,        setNombre]        = useState('');
  const [email,         setEmail]         = useState('');
  const [passActual,    setPassActual]    = useState('');
  const [passNueva,     setPassNueva]     = useState('');
  const [editando,      setEditando]      = useState(false);
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [cargando,      setCargando]      = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setEmail(usuario.email);
    }
  }, [usuario]);

  const handleActualizarPerfil = async () => {
    if (!nombre || !email) {
      Alert.alert('Error', 'Nombre y correo son obligatorios');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await authFetch(`${API_URL}/usuarios/${usuario.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre, email }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudo actualizar el perfil');
        return;
      }

      const usuarioActualizado = { ...usuario, nombre, email };
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditando(false);

    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarPassword = async () => {
    if (!passActual || !passNueva) {
      Alert.alert('Error', 'Completa ambos campos de contraseña');
      return;
    }
    if (passNueva.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await authFetch(`${API_URL}/usuarios/${usuario.id}/password`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password_actual: passActual, password_nueva: passNueva }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudo cambiar la contraseña');
        return;
      }

      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setPassActual('');
      setPassNueva('');
      setCambiandoPass(false);

    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('usuario');
            setUsuario(null);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor}>

      <View style={styles.tarjetaPerfil}>
        <View style={styles.avatar}>
          <Text style={styles.inicialAvatar}>
            {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.nombreUsuario}>{usuario?.nombre}</Text>
        <Text style={styles.rolUsuario}>
          {usuario?.rol === 'supervisor' ? 'Supervisor' : 'Técnico'}
        </Text>
      </View>

      <View style={styles.seccion}>
        <View style={styles.filaEncabezado}>
          <Text style={styles.tituloSeccion}>Datos Personales</Text>
          <TouchableOpacity onPress={() => setEditando(!editando)}>
            <Text style={styles.botonTexto}>{editando ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.etiqueta}>Nombre</Text>
        <TextInput
          style={[styles.input, !editando && styles.inputSoloLectura]}
          value={nombre}
          onChangeText={setNombre}
          editable={editando}
        />

        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, !editando && styles.inputSoloLectura]}
          value={email}
          onChangeText={setEmail}
          editable={editando}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {editando && (
          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDesactivado]}
            onPress={handleActualizarPerfil}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.textoBoton}>Guardar Cambios</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.seccion}>
        <View style={styles.filaEncabezado}>
          <Text style={styles.tituloSeccion}>Contraseña</Text>
          <TouchableOpacity onPress={() => setCambiandoPass(!cambiandoPass)}>
            <Text style={styles.botonTexto}>{cambiandoPass ? 'Cancelar' : 'Cambiar'}</Text>
          </TouchableOpacity>
        </View>

        {cambiandoPass && (
          <>
            <Text style={styles.etiqueta}>Contraseña actual</Text>
            <TextInput
              style={styles.input}
              value={passActual}
              onChangeText={setPassActual}
              secureTextEntry={true}
              placeholder="Tu contraseña actual"
            />

            <Text style={styles.etiqueta}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              value={passNueva}
              onChangeText={setPassNueva}
              secureTextEntry={true}
              placeholder="Mínimo 6 caracteres"
            />

            <TouchableOpacity
              style={[styles.boton, cargando && styles.botonDesactivado]}
              onPress={handleCambiarPassword}
              disabled={cargando}
            >
              {cargando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.textoBoton}>Actualizar Contraseña</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.botonSalir} onPress={handleCerrarSesion}>
        <Text style={styles.textoBotonSalir}>Cerrar Sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  tarjetaPerfil: {
    backgroundColor: '#1B4F72',
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F39C12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  inicialAvatar: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  nombreUsuario: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  rolUsuario: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 4,
  },
  seccion: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  botonTexto: {
    color: '#1B4F72',
    fontWeight: '600',
    fontSize: 14,
  },
  etiqueta: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F4F6F7',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2C3E50',
  },
  inputSoloLectura: {
    borderColor: 'transparent',
    backgroundColor: '#F4F6F7',
  },
  boton: {
    backgroundColor: '#1B4F72',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  botonDesactivado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  botonSalir: {
    borderWidth: 2,
    borderColor: '#E74C3C',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
    marginTop: 16,
    marginBottom: 40,
  },
  textoBotonSalir: {
    color: '#E74C3C',
    fontSize: 15,
    fontWeight: 'bold',
  },
});