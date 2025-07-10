import { useTransactionDatabase } from '@/database/useTransactionDatabase';
import { RootState } from '@/store';
import { setDataCategoria } from '@/store/dataCategoriaSlice';
import { setTotal } from '@/store/transactionSlice';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { formatarValor } from './(tabs)';

export default function Entrada() {

  const db = useTransactionDatabase();

  const dispatch = useDispatch();
  const [valorCentavos, setValorCentavos] = useState(0);
  const [title, setTitle] = useState('');

  const valorRef = useRef<TextInput>(null);
  const titleRef = useRef<TextInput>(null);

  const total = useSelector((state: RootState) => state.total.value);

  const handleAddTransaction = async () => {
    if (valorCentavos <= 0) {
      alert('Por favor, insira um valor válido para a transferência.');
      return;
    }

    if (title.length === 0) {
      alert('Por favor, insira de onde vem essa valor.');
      return;
    }

    try {
      await db.CreateTransaction({
        titleEntrada: title,
        type: 'entrada',
        value: valorCentavos,
        date: new Date().toISOString(),
      })

      const [somas, total, despesas, receitas] = await Promise.all([
        db.GetSomaPorCategoria(),
        db.GetTotalValue(),
        db.GetDespesas(),
        db.GetReceitas(),
      ]);

      const dataCategoria = somas.map(item => ({
        id: item.id,
        titulo: item.titulo,
        valor: item.valor,
        cor: item.cor
      }));
        
      dispatch(setDataCategoria(dataCategoria));
      dispatch(setTotal(total));
      dispatch({ type: 'despesas/setDespesas', payload: despesas });
      dispatch({ type: 'receitas/setReceitas', payload: receitas });

      setValorCentavos(0);
      setTitle('')
      router.push('/(tabs)');
    }catch (error) {
      console.error("Erro ao adicionar transação:", error);
      alert("Erro ao salvar transação.");
    }
  }

  const handleChange = (text: string) => {
    const numeros = text.replace(/\D/g, '');
    const numeroComoInt = parseInt(numeros || '0', 10);
    setValorCentavos(Math.max(numeroComoInt, 0));
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=> router.push('/(tabs)')}>
          <Feather name="x" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={{fontWeight: "bold", fontSize: 25}}>Entrada</Text>
        
      </View>

      <Text style={styles.title}>Qual é o valor da transferência?</Text>
      <Text style={styles.subtitle}>
        Saldo da conta <Text style={styles.saldo}>{formatarValor(total)}</Text>
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={valorCentavos === 0 ? '' : formatarValor(valorCentavos)}
        onChangeText={handleChange}
        placeholder="R$ 0,00"
        placeholderTextColor="#999"
        onSubmitEditing={() => titleRef.current?.focus()}
        returnKeyType="next"
      />

      <TextInput
        style={styles.inputTitle}
        keyboardType="default"
        value={title}
        onChangeText={e => setTitle(e)}
        placeholder="digite de onde vem essa valor"
        placeholderTextColor="#999"
        onSubmitEditing={() => handleAddTransaction()}
        ref={titleRef}
        returnKeyType="done"
      />


      <TouchableOpacity 
        style={{backgroundColor: '#004880', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 24, right: 24}}
        onPress={() => {
          handleAddTransaction();
        }}>
          <Feather name='arrow-right' size={30} color={'#FFF'} />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#555',
    marginBottom: 32,
  },
  saldo: {
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    fontSize: 32,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: '#000',
  },
  inputTitle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 25,
    paddingLeft: 10,
    fontStyle: "italic",
  },
});

