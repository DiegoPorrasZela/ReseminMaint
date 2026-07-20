import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, authFetch } from '../utils/api';
import { formatearFecha } from '../utils/fechas';

const TEXTO_ESTADO_MANT = {
  pendiente:  'Pendiente',
  en_proceso: 'En Proceso',
};

export default function DashboardScreen({ usuario }) {

  const [resumen,     setResumen]     = useState(null);
  const [cargando,    setCargando]    = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarResumen = async () => {
    try {
      const respuesta = await authFetch(`${API_URL}/reportes/resumen`);
      const datos     = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudo cargar el resumen');
        return;
      }
      setResumen(datos);
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  // Se recarga cada vez que el supervisor entra a esta pestaña,
  // así los KPIs siempre reflejan lo último registrado
  useFocusEffect(
    useCallback(() => {
      cargarResumen();
    }, [])
  );

  const onRefresh = () => {
    setRefrescando(true);
    cargarResumen();
  };

  if (cargando || !resumen) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4F72" />
        <Text style={styles.textoCargando}>Cargando resumen...</Text>
      </View>
    );
  }

  const eq = resumen.equipos        || {};
  const ma = resumen.mantenimientos || {};
  const ti = resumen.tipos          || {};

  const totalEquipos = (eq.operativo || 0) + (eq.en_mantenimiento || 0) + (eq.fuera_de_servicio || 0);

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
      }
    >

      <Text style={styles.saludo}>Hola, {usuario?.nombre}</Text>
      <Text style={styles.subSaludo}>Resumen general de la operación</Text>

      {resumen.vencidos > 0 && (
        <View style={styles.alertaVencidos}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.textoAlerta}>
            {resumen.vencidos} mantenimiento{resumen.vencidos > 1 ? 's' : ''} vencido{resumen.vencidos > 1 ? 's' : ''} sin completar
          </Text>
        </View>
      )}

      <Text style={styles.tituloSeccion}>Equipos ({totalEquipos})</Text>
      <View style={styles.filaKpis}>
        <View style={[styles.kpi, { borderTopColor: '#27AE60' }]}>
          <Text style={[styles.kpiNumero, { color: '#27AE60' }]}>{eq.operativo || 0}</Text>
          <Text style={styles.kpiLabel}>Operativos</Text>
        </View>
        <View style={[styles.kpi, { borderTopColor: '#F39C12' }]}>
          <Text style={[styles.kpiNumero, { color: '#F39C12' }]}>{eq.en_mantenimiento || 0}</Text>
          <Text style={styles.kpiLabel}>En Mantto.</Text>
        </View>
        <View style={[styles.kpi, { borderTopColor: '#E74C3C' }]}>
          <Text style={[styles.kpiNumero, { color: '#E74C3C' }]}>{eq.fuera_de_servicio || 0}</Text>
          <Text style={styles.kpiLabel}>Fuera de Serv.</Text>
        </View>
      </View>

      <Text style={styles.tituloSeccion}>Mantenimientos</Text>
      <View style={styles.filaKpis}>
        <View style={[styles.kpi, { borderTopColor: '#E67E22' }]}>
          <Text style={[styles.kpiNumero, { color: '#E67E22' }]}>{ma.pendiente || 0}</Text>
          <Text style={styles.kpiLabel}>Pendientes</Text>
        </View>
        <View style={[styles.kpi, { borderTopColor: '#2980B9' }]}>
          <Text style={[styles.kpiNumero, { color: '#2980B9' }]}>{ma.en_proceso || 0}</Text>
          <Text style={styles.kpiLabel}>En Proceso</Text>
        </View>
        <View style={[styles.kpi, { borderTopColor: '#27AE60' }]}>
          <Text style={[styles.kpiNumero, { color: '#27AE60' }]}>{ma.completado || 0}</Text>
          <Text style={styles.kpiLabel}>Completados</Text>
        </View>
      </View>

      <View style={styles.filaKpis}>
        <View style={[styles.kpi, { borderTopColor: '#1B4F72' }]}>
          <Text style={[styles.kpiNumero, { color: '#1B4F72' }]}>{ti.preventivo || 0}</Text>
          <Text style={styles.kpiLabel}>Preventivos</Text>
        </View>
        <View style={[styles.kpi, { borderTopColor: '#8E44AD' }]}>
          <Text style={[styles.kpiNumero, { color: '#8E44AD' }]}>{ti.correctivo || 0}</Text>
          <Text style={styles.kpiLabel}>Correctivos</Text>
        </View>
        <View style={[styles.kpi, { borderTopColor: '#C0392B' }]}>
          <Text style={[styles.kpiNumero, { color: '#C0392B' }]}>{resumen.vencidos || 0}</Text>
          <Text style={styles.kpiLabel}>Vencidos</Text>
        </View>
      </View>

      <Text style={styles.tituloSeccion}>Próximos trabajos</Text>

      {resumen.proximos.length === 0 ? (
        <View style={styles.tarjetaVacia}>
          <Text style={styles.textoVacio}>No hay trabajos pendientes 🎉</Text>
        </View>
      ) : (
        resumen.proximos.map((p) => (
          <View key={p.id} style={styles.tarjetaProximo}>
            <View style={styles.filaProximo}>
              <Text style={styles.codigoProximo}>{p.equipo_codigo}</Text>
              <Text style={styles.fechaProximo}>{formatearFecha(p.fecha_programada)}</Text>
            </View>
            <Text style={styles.nombreProximo}>{p.equipo_nombre}</Text>
            <Text style={styles.detalleProximo}>
              {p.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'} · {TEXTO_ESTADO_MANT[p.estado] || p.estado} · {p.tecnico_nombre}
            </Text>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  contenido: {
    padding: 16,
    paddingBottom: 30,
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
  saludo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  subSaludo: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 14,
  },
  alertaVencidos: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C0392B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  textoAlerta: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  filaKpis: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  kpi: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 3,
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  kpiNumero: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 2,
  },
  tarjetaVacia: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  textoVacio: {
    color: '#7F8C8D',
  },
  tarjetaProximo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  filaProximo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  codigoProximo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1B4F72',
    backgroundColor: '#EBF5FB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fechaProximo: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  nombreProximo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  detalleProximo: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
});