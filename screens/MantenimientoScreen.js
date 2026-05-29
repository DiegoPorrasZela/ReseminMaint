import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../utils/api';

export default function MantenimientoScreen({ usuario }) {

  const [equipos,         setEquipos]         = useState([]);
  const [equipoId,        setEquipoId]        = useState('');
  const [tipo,            setTipo]            = useState('preventivo');
  const [descripcion,     setDescripcion]     = useState('');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [cargando,        setCargando]        = useState(false);
  const [cargandoEquipos, setCargandoEquipos] = useState(true);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/equipos`);
      const datos     = await respuesta.json();
      setEquipos(datos);
      if (datos.length > 0) setEquipoId(datos[0].id.toString());
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los equipos');
    } finally {
      setCargandoEquipos(false);
    }
  };

  const limpiarFormulario = () => {
    setDescripcion('');
    setFechaProgramada('');
    setTipo('preventivo');
    if (equipos.length > 0) setEquipoId(equipos[0].id.toString());
  };

  const handleEnviar = async () => {

    if (!equipoId) {
      Alert.alert('Error', 'Selecciona un equipo');
      return;
    }
    if (!fechaProgramada) {
      Alert.alert('Error', 'Ingresa la fecha programada');
      return;
    }

    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fechaProgramada)) {
      Alert.alert('Formato incorrecto', 'La fecha debe ser YYYY-MM-DD\nEjemplo: 2025-06-15');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/mantenimientos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipo_id:        parseInt(equipoId),
          tecnico_id:       usuario.id,
          tipo,
          descripcion,
          fecha_programada: fechaProgramada,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        Alert.alert('Error', datos.error || 'No se pudo registrar el mantenimiento');
        return;
      }

      Alert.alert(
        'Registrado',
        'El mantenimiento fue registrado correctamente',
        [{ text: 'OK', onPress: limpiarFormulario }]
      );

    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoEquipos) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1B4F72" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.formulario}>

        <Text style={styles.tituloSeccion}>Nuevo Mantenimiento</Text>
        <Text style={styles.subTitulo}>Técnico: {usuario?.nombre}</Text>

        <Text style={styles.etiqueta}>Equipo *</Text>
        <View style={styles.pickerContenedor}>
          <Picker
            selectedValue={equipoId}
            onValueChange={(valor) => setEquipoId(valor)}
          >
            {equipos.map((eq) => (
              <Picker.Item
                key={eq.id.toString()}
                label={`${eq.codigo} — ${eq.nombre}`}
                value={eq.id.toString()}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.etiqueta}>Tipo *</Text>
        <View style={styles.pickerContenedor}>
          <Picker selectedValue={tipo} onValueChange={(valor) => setTipo(valor)}>
            <Picker.Item label="Preventivo" value="preventivo" />
            <Picker.Item label="Correctivo" value="correctivo" />
          </Picker>
        </View>

        <Text style={styles.etiqueta}>Descripción del trabajo</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinea]}
          placeholder="Describe el trabajo a realizar..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.etiqueta}>Fecha programada * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 2025-06-15"
          value={fechaProgramada}
          onChangeText={setFechaProgramada}
        />

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDesactivado]}
          onPress={handleEnviar}
          disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.textoBoton}>Registrar Mantenimiento</Text>
          }
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
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulario: {
    padding: 20,
    paddingBottom: 40,
  },
  tituloSeccion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4F72',
    marginBottom: 4,
  },
  subTitulo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputMultilinea: {
    height: 100,
  },
  pickerContenedor: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  boton: {
    backgroundColor: '#F39C12',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  botonDesactivado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});