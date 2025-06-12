import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BtnEntradaSaida() {

    return (
      <View style={styles.fab}>
        <TouchableOpacity style={styles.transacoesSaida} onPress={() => router.push('/saida')}>
          <Feather name="chevron-up" size={28} color="white" />
          <Text style={styles.textTeansacoes}>Saída</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.transacoesEntrada} onPress={() => router.push('/entrada')}>
          <Feather name="chevron-down" size={28} color="white" />
          <Text style={styles.textTeansacoes}>Entrada</Text>
        </TouchableOpacity>
      </View>
    )
}

const styles = StyleSheet.create({
  textTeansacoes: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transacoesSaida: {
    backgroundColor: '#004880',
    flexDirection: 'row',
    width: "50%",
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: "100%",
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
  },
  transacoesEntrada: {
    backgroundColor: '#004880',
    flexDirection: 'row',
    width: "50%",
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: "100%",
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
  },
  fab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 20,
    gap: 5,
    alignSelf: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  }})
