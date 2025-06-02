import { CategoriaProps, useTransactionDatabase } from '@/database/useTransactionDatabase';
import { setDataCategoria } from '@/store/dataCategoriaSlice';
import { setTotal } from '@/store/totalSlice';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';



export default function BtnPlus() {

  const router = useRouter();


  const transactionDatabase = useTransactionDatabase();

  const [modalVisible, setModalVisible] = useState(false);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [valor, setValor] = useState('');
  const [categorias, setCategorias] = useState<CategoriaProps[]>([]);
  const [categoria, setCategoria] = useState<CategoriaProps | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {

  if (modalVisible) {
    async function loadCategorias() {
      const lista = await transactionDatabase.GetAllCategorias();
      setCategorias(lista);
    }

    loadCategorias();
  }
}, [modalVisible]);

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
        id: item.id,
        titulo: item.titulo,
        valor: item.valor,
        cor: item.cor,
      }));

      if(tipo === 'saida'){
        dispatch(setDataCategoria(newDataCategoria));
      }
      
      dispatch({ type: 'receitas/setReceitas', payload: newReceita });
      dispatch({ type: 'despesas/setDespesas', payload: newDespesas });

      setModalVisible(false);
      setTipo('saida');
      setValor('');
      setCategoria(null);

    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      alert("Erro ao salvar transação.");
    }
  };

  function nextScream(){
    router.push('/(tabs)/categorias') 
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" ,alignItems:"flex-end", width: "100%"}}>
              {tipo === 'saida' ? (
                <Text style={{fontWeight: "700", textAlign: "center", fontSize: 20}}>Definir Saída:</Text>
              ) :
              (
                <Text style={{fontWeight: "700", textAlign: "center", fontSize: 20}}>Definir Entrada:</Text>
              )
              }
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{backgroundColor: "#7C4DFF", width: 30, height: 30,borderRadius: 20, justifyContent: "center", alignContent: "center"}}>
                <Feather name='x' size={20} color={"#FFF"} style={{textAlign: "center"}}/>
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, tipo === 'saida' && styles.activeTab]} 
                onPress={() => setTipo('saida')}
              >
                <Text style={[styles.tabText, tipo === 'saida' && styles.activeText]}>Saída</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, tipo === 'entrada' && styles.activeTab]} 
                onPress={() => setTipo('entrada')}
              >
                <Text style={[styles.tabText, tipo === 'entrada' && styles.activeText]}>Entrada</Text>
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Digite o valor" 
              placeholderTextColor={"#000"}
              keyboardType='decimal-pad' 
              onChangeText={(text) => setValor(text)} 
              value={valor} 
            />

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
                  
                    <Picker.Item style={{color: 'black'}} label="Selecione uma categoria" value="" />
                  {categorias.map((cat) => (
                    <Picker.Item style={{color: 'black'}} key={cat.id} label={cat.titulo} value={cat.id} />
                  ))}
                </Picker>
              </View>
            )}

            {tipo === 'saida' && (
              <View>
                <TouchableOpacity  style={styles.addCategoria} onPress={()=> nextScream()}>
                  <Text style={{ color: '#7C4DFF', fontSize: 15, fontWeight: "600" }}>criar categoria</Text>
                </TouchableOpacity>
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
    justifyContent: "flex-end",
    position: "static"
  },
  activeText: {
    color: "#FFF"
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
  addCategoria: {
    borderBottomWidth: 1,
    paddingBottom: 0,
    height: 40,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
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
    color: "#FFF"
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
