import { CategoriaProps, useTransactionDatabase } from '@/database/useTransactionDatabase';
import { setDataCategoria } from '@/store/dataCategoriaSlice';
import { setTotal } from '@/store/totalSlice';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function BtnPlus() {

  const transactionDatabase = useTransactionDatabase();

  const [modalVisible, setModalVisible] = useState(false);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [valor, setValor] = useState('');
  const [categorias, setCategorias] = useState<CategoriaProps[]>([]);
  const [categoria, setCategoria] = useState<CategoriaProps | null>(null);

  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      async function loadCategorias() {
        const lista = await transactionDatabase.GetAllCategorias();
        setCategorias(lista);
      }

      loadCategorias();
    }, [transactionDatabase])
  );

  const handleAddTransaction = async () => {
    if (tipo === 'saida' && (!categoria || valor === '')) {
      alert('Preencha todos os campos');
      return;
    }
    if (tipo === 'entrada' && valor === '') {
      alert('Preencha o valor');
      return;
    }

    const entradaCategoriaPadrao = { id: 0, titulo: 'Entrada', cor: '#00FF00' };


    try {
      await transactionDatabase.CreateTransaction({
        category: tipo === 'entrada' ? entradaCategoriaPadrao : categoria!,
        type: tipo,
        value: parseFloat(valor),
        date: new Date().toISOString(),
      });

      const newDataCategoriaRaw = await transactionDatabase.GetSomaPorCategoria();
      const newDespesas = await transactionDatabase.GetDespesas();
      const newReceita = await transactionDatabase.GetReceitas();
      const newTotal = await transactionDatabase.GetTotalValue();

      dispatch(setTotal(newTotal));

      const newDataCategoria = newDataCategoriaRaw.map((item) => ({
        categoria: item.titulo,
        amount: item.valor,
        cor: item.cor,
      }));

      if(tipo === 'saida'){
        dispatch(setDataCategoria(newDataCategoria));
      }
      dispatch({ type: 'receitas/setReceitas', payload: newReceita });
      dispatch({ type: 'despesas/setDespesas', payload: newDespesas });

      setModalVisible(false);
      setTipo('entrada');
      setValor('');
      setCategoria(null);

    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      alert("Erro ao salvar transação.");
    }
  };

  return (
    <View style={styles.container}>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={{alignItems:"flex-end", width: "100%"}}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name='x' size={20} color={"black"}/>
              </TouchableOpacity>
            </View>

            {/* Abas de Entrada e Saída */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, tipo === 'saida' && styles.activeTab]} 
                onPress={() => setTipo('saida')}
              >
                <Text style={styles.tabText}>Saída</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, tipo === 'entrada' && styles.activeTab]} 
                onPress={() => setTipo('entrada')}
              >
                <Text style={styles.tabText}>Entrada</Text>
              </TouchableOpacity>
            </View>

            {/* Campo de valor (sempre) */}
            <TextInput 
              style={styles.input} 
              placeholder="Digite o valor" 
              keyboardType='decimal-pad' 
              onChangeText={(text) => setValor(text)} 
              value={valor} 
            />

            {/* Select de categoria (apenas para Saída) */}
            {tipo === 'saida' && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={categoria?.id || ''}
                  onValueChange={(itemValue) => {
                    const selected = categorias.find(cat => cat.id === itemValue);
                    if (selected) setCategoria(selected);
                  }}
                  style={{ width: '100%' }}
                >
                  <Picker.Item label="Selecione uma categoria" value="" />
                  {categorias.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.titulo} value={cat.id} />
                  ))}
                </Picker>
              </View>
            )}

            <TouchableOpacity onPress={handleAddTransaction} style={styles.addButton}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: "600" }}>Adicionar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fab: {
    backgroundColor: '#7C4DFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    borderColor: '#696969',
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    gap: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7C4DFF',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#7C4DFF',
  },
  tabText: {
    color: '#000',
  },
  input: {
    height: 45,
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#696969",
    paddingLeft: 20,
  },
  pickerContainer: {
    width: '100%',
    height: 45,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: '#696969',
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: '#7C4DFF',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
});
