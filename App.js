import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

export default function App() {

  const [usuario,  setUsuario]  = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const datos = await AsyncStorage.getItem('usuario');
      if (datos !== null) {
        setUsuario(JSON.parse(datos));
      }
    } catch (error) {
      console.log('Error al verificar sesión:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.pantallaCarga}>
        <ActivityIndicator size="large" color="#1B4F72" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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