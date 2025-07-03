import { useTransactionDatabase } from '@/database/useTransactionDatabase';
import { RootState } from '@/store';
import { setDataCategoria } from '@/store/dataCategoriaSlice';
import { setTotal } from '@/store/transactionSlice';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { formatarValor } from './(tabs)';

export default function Saida() {

  const db = useTransactionDatabase();

  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [valorCentavos, setValorCentavos] = useState(0);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | string | null>(null);
  
  const categorias = useSelector((state: RootState) => state.dataCategoria.lista);
  const total = useSelector((state: RootState) => state.total.value);

  const items = [
    ...categorias.map(cat => ({
      label: cat.titulo,
      value: cat.id
    })),
    { label: '+ Criar nova categoria', value: 'nova-categoria' }
  ];


  const handleAddTransaction = async () => {
    if (!categoriaSelecionada || valorCentavos === 0) {
      alert('Por favor, insira um valor válido para a transferência.');
      return;
    }

    try {
      await db.CreateTransaction({
        categoryId: typeof categoriaSelecionada === 'number' ? categoriaSelecionada : 0, 
        type: 'saida',
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
      setCategoriaSelecionada(null);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> router.push('/(tabs)')}>
            <Feather name="x" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={{fontWeight: "bold", fontSize: 25}}>Saída</Text>
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
        />

        <View style={{marginTop: 20, width: '100%', gap: 15 }}>
          <View style={{ zIndex: 1000 }}>
            <DropDownPicker
              searchPlaceholder="Buscar categoria..."
              open={open}
              value={categoriaSelecionada}
              items={items}
              onPress={() => {
                Keyboard.dismiss();
              }}
              setOpen={setOpen}
              setValue={setCategoriaSelecionada}
              onChangeValue={(value) => {
                if (value === 'nova-categoria') {
                  setOpen(false); 
                  setCategoriaSelecionada(null)
                  router.push('/(tabs)/categorias');
                } else {
                  setCategoriaSelecionada(value);
                }
              }}
              placeholder="Selecione uma categoria"
              style={styles.dropDown}
              dropDownContainerStyle={[styles.dropDownContainer, { maxHeight: 300 }]}
              textStyle={styles.dropDownText}
              placeholderStyle={styles.placeholderStyle}
              listMode="SCROLLVIEW"
              ArrowDownIconComponent={() => <Feather name="chevron-down" size={20} color="#004880" />}
              ArrowUpIconComponent={() => <Feather name="chevron-up" size={20} color="#004880" />}
            />

          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={{
          backgroundColor: '#004880',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 24,
          right: 24
        }}
        onPress={handleAddTransaction}
      >
        <Feather name='arrow-right' size={30} color={'#FFF'} />
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  dropDown: {
  borderColor: '#DDD',
  borderWidth: 1,
  borderRadius: 12,
  backgroundColor: '#FAFAFA',
  height: 50,
  paddingHorizontal: 12,
  justifyContent: 'center',
},

dropDownContainer: {
  borderColor: '#DDD',
  borderWidth: 1,
  borderRadius: 12,
  backgroundColor: '#FFF',
},

dropDownText: {
  fontSize: 15,
  color: '#333',
  fontWeight: '500',
},

placeholderStyle: {
  color: '#999',
  fontSize: 15,
},

addCategoria: {
  alignItems: 'flex-start',
},

addCategoriaText: {
  color: '#888',
  fontSize: 15,
  fontWeight: "600",
},

});

