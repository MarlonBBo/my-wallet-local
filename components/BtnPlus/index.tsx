import { useTransactionDatabase } from '@/database/useTransactionDatabase';
import { setTotal } from '@/store/totalSlice';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

export default function BtnPlus() {

    const [modalVisible, setModalVisible] = useState(false);
    const [categoria, setCategoria] = useState('');
    const [tipo, setTipo] = useState<'entrada' | 'saida' | ''>('');
    const [valor, setValor] = useState('');

    const transactionDatabase = useTransactionDatabase();

    const dispatch = useDispatch();

    async function handleAddTransaction() {
        if (categoria === '' || tipo === '' || valor === '') {
            alert('Preencha todos os campos');
            return;
        }
        
        transactionDatabase.CreateTransaction({
          category: categoria,
          type: tipo,
          value: Number(valor),
          date: new Date().toISOString(),
        })

        const newTotal = await transactionDatabase.GetTotalValue(); // ou calcule manualmente se preferir
        dispatch(setTotal(newTotal));

        setModalVisible(false);
        setCategoria('');
        setTipo('');
        setValor('');
    }

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
            <View style={{ width: '100%',height: 45 , justifyContent: "center", borderWidth: 1, borderColor: '#696969', padding: 5, borderRadius: 10 }}>
                <Picker
                    selectedValue={categoria}
                    onValueChange={(itemValue) => setCategoria(itemValue)}
                    style={{ width: '100%' }}
                    >
                    <Picker.Item label="Categoria" value=""  />
                    <Picker.Item label="Alimentação" value="alimentacao" />
                    <Picker.Item label="Transporte" value="transporte" />
                    <Picker.Item label="Lazer" value="lazer" />
                </Picker>
            </View>

            <TextInput style={{
                height: 45,
                width: '100%',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#696969",
                paddingLeft: 20,
                }}
                placeholder="Digite o valor"
                keyboardType='decimal-pad'
                onChangeText={(text) => setValor(text)}
                value={valor}
            />

            <View style={{ width: '100%',height: 45 , justifyContent: "center", borderWidth: 1, borderColor: '#696969', padding: 5, borderRadius: 10 }}>
                <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={{ width: '100%' }}
                    >
                    <Picker.Item label="Entrada/Saida" value="" />
                    <Picker.Item label="Entrada" value="entrada" />
                    <Picker.Item label="Saida" value="saida" />
                    </Picker>
            </View>
            <TouchableOpacity onPress={() => handleAddTransaction()} style={styles.closeButton}>
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
    backgroundColor: '#f5f5f5',
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
  closeButton: {
    backgroundColor: '#7C4DFF',
    padding: 10,
    borderRadius: 8,
  }
});
