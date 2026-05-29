import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import LoginScreen        from '../screens/LoginScreen';
import RegisterScreen     from '../screens/RegisterScreen';
import EquiposScreen      from '../screens/EquiposScreen';
import MantenimientoScreen from '../screens/MantenimientoScreen';
import HistorialScreen    from '../screens/HistorialScreen';
import PerfilScreen       from '../screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs({ usuario, setUsuario }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if      (route.name === 'Equipos')   iconName = focused ? 'construct'  : 'construct-outline';
          else if (route.name === 'Nuevo')      iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Historial')  iconName = focused ? 'list'       : 'list-outline';
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
      <Tab.Screen
        name="Equipos"
        component={EquiposScreen}
        options={{ title: 'Equipos' }}
      />

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

export default function AppNavigator({ usuario, setUsuario }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {usuario ? (
        <Stack.Screen name="Main">
          {(props) => <MainTabs {...props} usuario={usuario} setUsuario={setUsuario} />}
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