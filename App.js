// App.js — Componente raíz de la aplicación
// Es el primer archivo que se ejecuta al abrir la app

// React es la librería principal — siempre se importa
import React, { useState, useEffect } from 'react';

// Componentes de React Native para la pantalla de carga
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// NavigationContainer envuelve toda la navegación de la app
import { NavigationContainer } from '@react-navigation/native';

// AsyncStorage permite guardar y leer datos localmente en el dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nuestro navegador principal que define las pantallas
import AppNavigator from './navigation/AppNavigator';

export default function App() {

  // usuario: guarda los datos del usuario logueado (null = sin sesión)
  const [usuario,  setUsuario]  = useState(null);

  // cargando: true mientras verificamos si hay una sesión guardada
  const [cargando, setCargando] = useState(true);

  // useEffect se ejecuta una sola vez al montar el componente ([] vacío)
  useEffect(() => {
    verificarSesion();
  }, []);

  // Verifica si el usuario ya había iniciado sesión anteriormente
  const verificarSesion = async () => {
    try {
      // AsyncStorage.getItem busca el valor guardado con la clave 'usuario'
      const datos = await AsyncStorage.getItem('usuario');

      if (datos !== null) {
        // JSON.parse convierte el texto guardado de vuelta a un objeto JS
        setUsuario(JSON.parse(datos));
      }
    } catch (error) {
      console.log('Error al verificar sesión:', error);
    } finally {
      // finally siempre se ejecuta — dejamos de cargar
      setCargando(false);
    }
  };

  // Mientras verificamos la sesión, mostramos una pantalla de carga
  if (cargando) {
    return (
      <View style={styles.pantallaCarga}>
        <ActivityIndicator size="large" color="#1B4F72" />
      </View>
    );
  }

  // NavigationContainer es el contenedor obligatorio de React Navigation
  return (
    <NavigationContainer>
      {/*
        Pasamos usuario y setUsuario al navegador:
        - usuario: para saber si mostrar login o las pantallas principales
        - setUsuario: para que las pantallas puedan cambiar el estado (login/logout)
      */}
      <AppNavigator usuario={usuario} setUsuario={setUsuario} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  pantallaCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B4F72',
  },
});
