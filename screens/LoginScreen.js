// LoginScreen.js — Pantalla de inicio de sesión

// Importamos React y el hook useState para manejar el estado del formulario
import React, { useState } from 'react';

// Importamos los componentes de React Native que usaremos
import {
  View,                  // Contenedor (como un div en HTML)
  Text,                  // Para mostrar texto
  TextInput,             // Campo de texto editable
  TouchableOpacity,      // Botón que responde al toque con efecto
  StyleSheet,            // Para crear estilos como objetos JS
  Alert,                 // Muestra alertas nativas del sistema
  ActivityIndicator,     // Spinner de carga
  KeyboardAvoidingView,  // Evita que el teclado tape el formulario
  Platform,              // Detecta si es iOS o Android
} from 'react-native';

// AsyncStorage guarda datos de forma persistente en el dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importamos la URL base del servidor
import { API_URL } from '../utils/api';

// El componente recibe navigation (para navegar) y setUsuario (para actualizar la sesión)
export default function LoginScreen({ navigation, setUsuario }) {

  // useState crea una variable reactiva: cuando cambia, la pantalla se actualiza
  const [email,    setEmail]    = useState(''); // Valor del campo email
  const [password, setPassword] = useState(''); // Valor del campo contraseña
  const [cargando, setCargando] = useState(false); // Controla el spinner de carga

  // Función que se ejecuta al presionar "Ingresar"
  const handleLogin = async () => {

    // Validación: verificamos que los campos no estén vacíos
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return; // Salimos de la función si hay error
    }

    setCargando(true); // Mostramos el spinner

    try {
      // fetch hace una petición HTTP al servidor backend
      // method: 'POST' significa que estamos enviando datos
      // headers: le decimos al servidor que enviamos JSON
      // body: los datos que enviamos, convertidos a texto JSON
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      // Convertimos la respuesta del servidor de JSON a objeto JavaScript
      const datos = await respuesta.json();

      // respuesta.ok es true si el servidor respondió con código 200-299
      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'Credenciales incorrectas');
        return;
      }

      // Guardamos el usuario en AsyncStorage para mantener la sesión
      // JSON.stringify convierte el objeto a texto para poder guardarlo
      await AsyncStorage.setItem('usuario', JSON.stringify(datos.usuario));

      // Actualizamos el estado global en App.js — esto cambia la navegación automáticamente
      setUsuario(datos.usuario);

    } catch (error) {
      // Este catch se ejecuta si el servidor no responde (ej: backend apagado)
      Alert.alert('Error', 'No se pudo conectar al servidor.\nVerifica que el backend esté corriendo.');
    } finally {
      // finally siempre se ejecuta, sin importar si hubo error o no
      setCargando(false); // Ocultamos el spinner
    }
  };

  return (
    // KeyboardAvoidingView sube el contenido cuando aparece el teclado
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      {/* Encabezado con el nombre de la app */}
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>ReseminMaint</Text>
        <Text style={styles.subtitulo}>Control de Mantenimiento Minero</Text>
      </View>

      {/* Formulario de login */}
      <View style={styles.formulario}>

        <Text style={styles.etiqueta}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@resemin.com"
          value={email}           // El valor viene del estado
          onChangeText={setEmail} // Cada vez que el usuario escribe, actualiza el estado
          keyboardType="email-address"
          autoCapitalize="none"   // No capitaliza automáticamente
        />

        <Text style={styles.etiqueta}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}  // Oculta los caracteres (modo contraseña)
        />

        {/* Botón de login — se desactiva mientras carga */}
        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDesactivado]}
          onPress={handleLogin}
          disabled={cargando}
        >
          {/* Muestra spinner o texto según el estado de carga */}
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.textoBoton}>Ingresar</Text>
          }
        </TouchableOpacity>

        {/* Enlace a la pantalla de registro */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.enlace}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

// StyleSheet.create organiza todos los estilos — similar a CSS
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,                    // Ocupa todo el espacio disponible
    backgroundColor: '#F4F6F7',
  },
  encabezado: {
    backgroundColor: '#1B4F72',
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',       // Centra los hijos horizontalmente
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F39C12',
  },
  subtitulo: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 8,
  },
  formulario: {
    padding: 24,
    marginTop: 10,
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
  boton: {
    backgroundColor: '#1B4F72',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  botonDesactivado: {
    opacity: 0.6, // Reduce la opacidad para indicar que está desactivado
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enlace: {
    color: '#1B4F72',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
  },
});
