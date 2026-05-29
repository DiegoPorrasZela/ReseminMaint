// AppNavigator.js — Define toda la estructura de navegación de la app

// createNativeStackNavigator: crea un stack de pantallas (una encima de otra)
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// createBottomTabNavigator: crea la barra de pestañas en la parte inferior
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Ionicons son los íconos que vienen incluidos con Expo
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

// Importamos todas las pantallas
import LoginScreen        from '../screens/LoginScreen';
import RegisterScreen     from '../screens/RegisterScreen';
import EquiposScreen      from '../screens/EquiposScreen';
import MantenimientoScreen from '../screens/MantenimientoScreen';
import HistorialScreen    from '../screens/HistorialScreen';
import PerfilScreen       from '../screens/PerfilScreen';

// Creamos las instancias de los navegadores
const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ============================================================
// TabNavigator — Pantallas principales (con barra inferior)
// Recibe usuario y setUsuario para pasarlos a las pantallas
// ============================================================
function MainTabs({ usuario, setUsuario }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // tabBarIcon define el ícono de cada pestaña
        tabBarIcon: ({ focused, color, size }) => {
          // Elegimos el ícono según el nombre de la ruta
          let iconName;
          if      (route.name === 'Equipos')       iconName = focused ? 'construct'   : 'construct-outline';
          else if (route.name === 'Nuevo')          iconName = focused ? 'add-circle'  : 'add-circle-outline';
          else if (route.name === 'Historial')      iconName = focused ? 'list'        : 'list-outline';
          else if (route.name === 'Perfil')         iconName = focused ? 'person'      : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#F39C12', // Color del ícono activo
        tabBarInactiveTintColor: '#95A5A6', // Color del ícono inactivo
        headerStyle:      { backgroundColor: '#1B4F72' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Equipos"
        component={EquiposScreen}
        options={{ title: 'Equipos' }}
      />

      {/* Las pantallas que necesitan props extras usan una función flecha */}
      <Tab.Screen
        name="Nuevo"
        options={{ title: 'Nuevo Mant.' }}
      >
        {(props) => <MantenimientoScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ title: 'Historial' }}
      />

      <Tab.Screen
        name="Perfil"
        options={{ title: 'Mi Perfil' }}
      >
        {(props) => <PerfilScreen {...props} usuario={usuario} setUsuario={setUsuario} />}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

// ============================================================
// AppNavigator — Decide qué stack mostrar según si hay sesión
// ============================================================
export default function AppNavigator({ usuario, setUsuario }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {usuario ? (
        // Si hay un usuario logueado → mostramos las pantallas principales
        <Stack.Screen name="Main">
          {(props) => <MainTabs {...props} usuario={usuario} setUsuario={setUsuario} />}
        </Stack.Screen>
      ) : (
        // Si NO hay usuario → mostramos Login y Registro
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setUsuario={setUsuario} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}

    </Stack.Navigator>
  );
}
