import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import LoginScreen         from '../screens/LoginScreen';
import DashboardScreen     from '../screens/DashboardScreen';
import RegisterScreen      from '../screens/RegisterScreen';
import EquiposScreen       from '../screens/EquiposScreen';
import MantenimientoScreen from '../screens/MantenimientoScreen';
import MisTareasScreen     from '../screens/MisTareasScreen';
import HistorialScreen     from '../screens/HistorialScreen';
import PerfilScreen        from '../screens/PerfilScreen';
import UsuariosScreen      from '../screens/UsuariosScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabsSupervisor({ usuario, setUsuario }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if      (route.name === 'Inicio')     iconName = focused ? 'speedometer' : 'speedometer-outline';
          else if (route.name === 'Equipos')    iconName = focused ? 'construct'  : 'construct-outline';
          else if (route.name === 'Nuevo')      iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Historial')  iconName = focused ? 'list'       : 'list-outline';
          else if (route.name === 'Usuarios')   iconName = focused ? 'people'     : 'people-outline';
          else if (route.name === 'Perfil')     iconName = focused ? 'person'     : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#F39C12',
        tabBarInactiveTintColor: '#95A5A6',
        headerStyle:      { backgroundColor: '#1B4F72' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Inicio" options={{ title: 'Inicio' }}>
        {(props) => <DashboardScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen name="Equipos" options={{ title: 'Equipos' }}>
        {(props) => <EquiposScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen name="Nuevo" options={{ title: 'Nuevo Mant.' }}>
        {(props) => <MantenimientoScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen name="Historial" options={{ title: 'Historial' }}>
        {(props) => <HistorialScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen
        name="Usuarios"
        component={UsuariosScreen}
        options={{ title: 'Usuarios' }}
      />

      <Tab.Screen name="Perfil" options={{ title: 'Mi Perfil' }}>
        {(props) => <PerfilScreen {...props} usuario={usuario} setUsuario={setUsuario} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function TabsTecnico({ usuario, setUsuario }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if      (route.name === 'Equipos')   iconName = focused ? 'construct'       : 'construct-outline';
          else if (route.name === 'MisTareas') iconName = focused ? 'clipboard'       : 'clipboard-outline';
          else if (route.name === 'Historial') iconName = focused ? 'list'            : 'list-outline';
          else if (route.name === 'Perfil')    iconName = focused ? 'person'          : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#F39C12',
        tabBarInactiveTintColor: '#95A5A6',
        headerStyle:      { backgroundColor: '#1B4F72' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Equipos" options={{ title: 'Equipos' }}>
        {(props) => <EquiposScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen name="MisTareas" options={{ title: 'Mis Tareas' }}>
        {(props) => <MisTareasScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen name="Historial" options={{ title: 'Historial' }}>
        {(props) => <HistorialScreen {...props} usuario={usuario} />}
      </Tab.Screen>

      <Tab.Screen name="Perfil" options={{ title: 'Mi Perfil' }}>
        {(props) => <PerfilScreen {...props} usuario={usuario} setUsuario={setUsuario} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ usuario, setUsuario }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        <Stack.Screen name="Main">
          {(props) =>
            usuario.rol === 'supervisor'
              ? <TabsSupervisor {...props} usuario={usuario} setUsuario={setUsuario} />
              : <TabsTecnico    {...props} usuario={usuario} setUsuario={setUsuario} />
          }
        </Stack.Screen>
      ) : (
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
