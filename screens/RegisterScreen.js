// RegisterScreen.js — Pantalla de registro de nuevo usuario

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';

// Picker es el componente de lista desplegable (dropdown)
import { Picker } from '@react-native-picker/picker';

import { API_URL } from '../utils/api';

export default function RegisterScreen({ navigation }) {

  // Un estado por cada campo del formulario
  const [nombre,           setNombre]           = useState('');
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [confirmarPass,    setConfirmarPass]    = useState('');
  const [rol,              setRol]              = useState('tecnico'); // Valor inicial
  const [cargando,         setCargando]         = useState(false);

  const handleRegister = async () => {

    // Validaciones antes de enviar al servidor
    if (!nombre || !email || !password || !confirmarPass) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (password !== confirmarPass) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      // Enviamos los datos al endpoint de registro
      // La contraseña se encriptará en el servidor con bcrypt
      const respuesta = await fetch(`${API_URL}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre, email, password, rol }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudo crear la cuenta');
        return;
      }

      // Si el registro fue exitoso, redirigimos al login
      Alert.alert(
        'Cuenta creada',
        'Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.',
        [{ text: 'Ir al Login', onPress: () => navigation.navigate('Login') }]
      );

    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    // ScrollView permite desplazarse si el contenido es más largo que la pantalla
    <ScrollView style={styles.contenedor}>

      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Crear Cuenta</Text>
        <Text style={styles.subtitulo}>ReseminMaint — Resemin S.A.</Text>
      </View>

      <View style={styles.formulario}>

        <Text style={styles.etiqueta}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Juan Pérez"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@resemin.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.etiqueta}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        <Text style={styles.etiqueta}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Repite la contraseña"
          value={confirmarPass}
          onChangeText={setConfirmarPass}
          secureTextEntry={true}
        />

        {/* Picker es el componente de selección desplegable */}
        <Text style={styles.etiqueta}>Rol en la empresa</Text>
        <View style={styles.pickerContenedor}>
          <Picker
            selectedValue={rol}              // El valor actualmente seleccionado
            onValueChange={(valor) => setRol(valor)} // Se actualiza al cambiar selección
          >
            <Picker.Item label="Técnico"     value="tecnico" />
            <Picker.Item label="Supervisor"  value="supervisor" />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDesactivado]}
          onPress={handleRegister}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.textoBoton}>Registrarse</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.enlace}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  encabezado: {
    backgroundColor: '#1B4F72',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F39C12',
  },
  subtitulo: {
    fontSize: 13,
    color: '#BDC3C7',
    marginTop: 6,
  },
  formulario: {
    padding: 24,
    paddingBottom: 40,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContenedor: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  boton: {
    backgroundColor: '#1B4F72',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  botonDesactivado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enlace: {
    color: '#1B4F72',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
