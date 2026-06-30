import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, Platform,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, authFetch } from '../utils/api';

const formatearFecha = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function MantenimientoScreen({ usuario }) {

  const esSupervisor = usuario?.rol === 'supervisor';

  const [equipos,           setEquipos]           = useState([]);
  const [tecnicos,          setTecnicos]          = useState([]);
  const [equipoId,          setEquipoId]          = useState('');
  const [tecnicoId,         setTecnicoId]         = useState('');
  const [tipo,              setTipo]              = useState('preventivo');
  const [descripcion,       setDescripcion]       = useState('');
  const [fechaObj,          setFechaObj]          = useState(new Date());
  const [mostrarPicker,     setMostrarPicker]     = useState(false);
  const [cargando,          setCargando]          = useState(false);
  const [cargandoDatos,     setCargandoDatos]     = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const respEquipos  = await authFetch(`${API_URL}/equipos`);
      const datosEquipos = await respEquipos.json();
      setEquipos(datosEquipos);
      if (datosEquipos.length > 0) setEquipoId(datosEquipos[0].id.toString());

      if (esSupervisor) {
        const respTecnicos  = await authFetch(`${API_URL}/usuarios`);
        const datosTecnicos = await respTecnicos.json();

        if (!respTecnicos.ok) {
          Alert.alert('Error', datosTecnicos.error || 'No se pudieron cargar los técnicos');
        } else {
          const lista = Array.isArray(datosTecnicos) ? datosTecnicos : [];
          setTecnicos(lista);
          if (lista.length > 0) setTecnicoId(lista[0].id.toString());
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setCargandoDatos(false);
    }
  };

  const limpiarFormulario = () => {
    setDescripcion('');
    setFechaObj(new Date());
    setTipo('preventivo');
    if (equipos.length > 0) setEquipoId(equipos[0].id.toString());
    if (esSupervisor && tecnicos.length > 0) setTecnicoId(tecnicos[0].id.toString());
  };

  const onCambioFecha = (event, fechaSeleccionada) => {
    setMostrarPicker(Platform.OS === 'ios');
    if (event.type === 'set' && fechaSeleccionada) {
      setFechaObj(fechaSeleccionada);
    }
  };

  const handleEnviar = async () => {

    if (!equipoId) {
      Alert.alert('Error', 'Selecciona un equipo');
      return;
    }

    const idTecnico = esSupervisor ? parseInt(tecnicoId) : usuario.id;

    setCargando(true);

    try {
      const respuesta = await authFetch(`${API_URL}/mantenimientos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipo_id:        parseInt(equipoId),
          tecnico_id:       idTecnico,
          tipo,
          descripcion,
          fecha_programada: formatearFecha(fechaObj),
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

  if (cargandoDatos) {
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
        <Text style={styles.subTitulo}>
          {esSupervisor ? 'Modo Supervisor' : `Técnico: ${usuario?.nombre}`}
        </Text>

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

        {esSupervisor && (
          <>
            <Text style={styles.etiqueta}>Asignar Técnico *</Text>
            <View style={styles.pickerContenedor}>
              <Picker
                selectedValue={tecnicoId}
                onValueChange={(valor) => setTecnicoId(valor)}
              >
                {tecnicos.map((t) => (
                  <Picker.Item
                    key={t.id.toString()}
                    label={`${t.nombre} (${t.rol})`}
                    value={t.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}

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

        <Text style={styles.etiqueta}>Fecha programada *</Text>
        <TouchableOpacity
          style={styles.inputFecha}
          onPress={() => setMostrarPicker(true)}
        >
          <Text style={styles.textoFecha}>{formatearFecha(fechaObj)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#7F8C8D" />
        </TouchableOpacity>

        {mostrarPicker && (
          <DateTimePicker
            value={fechaObj}
            mode="date"
            display="default"
            onChange={onCambioFecha}
          />
        )}

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
  inputFecha: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoFecha: {
    fontSize: 16,
    color: '#2C3E50',
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
