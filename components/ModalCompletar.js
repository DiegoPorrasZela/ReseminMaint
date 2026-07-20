import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';

// Modal para completar un mantenimiento registrando las observaciones
// del trabajo realizado (regla de negocio: todo cierre deja constancia).
export default function ModalCompletar({ visible, equipoNombre, onCancelar, onConfirmar }) {

  const [observaciones, setObservaciones] = useState('');

  const confirmar = () => {
    onConfirmar(observaciones.trim());
    setObservaciones('');
  };

  const cancelar = () => {
    setObservaciones('');
    onCancelar();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancelar}>
      <View style={styles.fondo}>
        <View style={styles.caja}>

          <Text style={styles.titulo}>Completar Mantenimiento</Text>
          <Text style={styles.subtitulo}>{equipoNombre}</Text>

          <Text style={styles.etiqueta}>Observaciones del trabajo realizado</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Se cambió el filtro hidráulico y se ajustó la presión..."
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.filaBotones}>
            <TouchableOpacity style={styles.botonCancelar} onPress={cancelar}>
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonConfirmar} onPress={confirmar}>
              <Text style={styles.textoConfirmar}>Completar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  caja: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4F72',
  },
  subtitulo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    height: 90,
  },
  filaBotones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  botonCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  textoCancelar: {
    color: '#7F8C8D',
    fontWeight: '600',
  },
  botonConfirmar: {
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  textoConfirmar: {
    color: '#fff',
    fontWeight: 'bold',
  },
});