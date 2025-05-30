import BtnPlus from '@/components/BtnPlus';
import { useTransactionDatabase } from '@/database/useTransactionDatabase';
import { RootState } from '@/store'; // ajuste conforme o caminho do seu store
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from "react";
import { InteractionManager, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Pie, PolarChart } from 'victory-native';


export default function Home() {

const transactionDatabase = useTransactionDatabase();

// const { id, titulo, cor} = useLocalSearchParams<{ id: string, titulo: string, cor: string, abrir: string }>();

// const categoriaSelecionada = {
//     id,
//     titulo,
//     cor,
//   };

const dispatch = useDispatch();

const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    const carregarSaldos = async () => {

      const newDataCategoria = await transactionDatabase.GetSomaPorCategoria();
      dispatch({ type: 'dataCategoria/setDataCategoria', payload: newDataCategoria });

      const newTotal = await transactionDatabase.GetTotalValue();
      dispatch({ type: 'total/setTotal', payload: newTotal });

      const newTotalReceitas = await transactionDatabase.GetReceitas();
      dispatch({ type: 'receitas/setReceitas', payload: newTotalReceitas });

      const newTotalDespesas = await transactionDatabase.GetDespesas();
      dispatch({ type: 'despesas/setDespesas', payload: newTotalDespesas });

      setReady(true);
    };

    carregarSaldos();
  });

  return () => task.cancel();
}, []);

  const total = useSelector((state: RootState) => state.total.value);
  const Receitas = useSelector((state: RootState) => state.receitas.value);
  const Despesas = useSelector((state: RootState) => state.despesas.value);
  const dataCaregoria = useSelector((state: RootState) => state.dataCategoria.lista);


  function handleRemoveTransactions() {
    transactionDatabase.DeleteAllTransactions();
    transactionDatabase.DeleteAllCategoria();
    dispatch({ type: 'total/setTotal', payload: 0 });
    dispatch({ type: 'receitas/setReceitas', payload: 0 });
    dispatch({ type: 'despesas/setDespesas', payload: 0 });
    dispatch({ type: 'dataCategoria/setDataCategoria', payload: []});
  }

    const dataCaregoriaOrdenada = [...dataCaregoria].sort((a, b) => b.valor - a.valor);
    const topCategorias = dataCaregoriaOrdenada.slice(0, 3); 
    const outras = dataCaregoriaOrdenada.slice(3);       

    const outrasSoma = outras.reduce((acc, item) => acc + item.valor, 0);

    const categoriasFinal = [...topCategorias];
    if (outrasSoma > 0) {
      categoriasFinal.push({
        id: 0,
        titulo: 'Outras',
        valor: outrasSoma,
        cor: '#A9A9A9',
      });
    }

    const dataGrafico = categoriasFinal.map(item => ({
      label: item.titulo,
      value: item.valor,
      color: item.cor,
    }));

    const categoriasComValor = categoriasFinal.filter(item => item.valor > 0);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.header}>
        <View style={styles.status}>
          <Text style={styles.side}>Home</Text>

          <View style={styles.centerContainer}>
            <Feather name='chevron-left' size={20} color={'black'} />
            <Text style={styles.title}>Maio</Text>
            <Feather name='chevron-right' size={20} color={'black'} />
          </View>

          <Image
            style={styles.avatar}
            source={require('../../assets/images/pf.png')}
            contentFit="cover"
          />
        </View>

        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 10 }}>
          <Text style={{ fontWeight: "600", fontSize: 15, color: "#696969" }}>Saldo Total</Text>
          <Text style={{ fontWeight: "bold", fontSize: 30 }}>R${total}</Text>

          <TouchableOpacity onPress={handleRemoveTransactions} style={{ width: 40, height: 30, alignItems: 'center', justifyContent: 'center', borderColor: '#696969' }}>
            <Feather name="eye" size={20} color="#A9A9A9" style={{ marginTop: 10 }} />
          </TouchableOpacity>

          {Receitas === 0 && Despesas === 0 ? (
            <Text style={{ fontSize: 16, textAlign: 'center', color: '#A9A9A9', marginTop: 20 }}>
              Nenhuma movimentação registrada no período.
            </Text>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name='arrow-up' size={30} color={'#32CD32'} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>Receitas</Text>
                  <Text style={{ fontSize: 20, fontWeight: "500", color: "#32CD32" }}>R${Receitas}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name='arrow-down' size={30} color={'#FF3009'} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>Despesas</Text>
                  <Text style={{ fontSize: 20, fontWeight: "500", color: "#FF3009" }}>R${Despesas}</Text>
                </View>
              </View>
            </View>
          )}

        </View>
      </SafeAreaView>

      <Text style={{ fontSize: 20, fontWeight: "bold", paddingVertical: 20, paddingHorizontal: 10, paddingBottom: 5, color: "#696969" }}>Despesas por categoria</Text>

      {
        !ready ? (
          <Text style={{ fontSize: 16, textAlign: 'center', color: '#A9A9A9', marginTop: 20 }}>
            Carregando...
          </Text>
        ) : !(categoriasComValor.length > 0) ? (
          <Text style={{ fontSize: 16, textAlign: 'center', color: '#A9A9A9', marginTop: 20 }}>
            Não há dados de despesas
          </Text>
        ) : (
          <TouchableOpacity style={styles.graphContainer}>
            <View style={{ height: 100, width: 100 }}>
              <PolarChart
                data={dataGrafico}
                labelKey={"label"}
                valueKey={"value"}
                colorKey={"color"}
              >
                <Pie.Chart innerRadius={30} />
              </PolarChart>
            </View>
            <SafeAreaView style={styles.datas}>
              {categoriasComValor.map((item, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%' }}>
                  <View style={{ width: 10, height: 10, backgroundColor: item.cor, borderRadius: 10, marginRight: 10 }} />
                  <Text style={{ fontSize: 16, color: "#696969", fontWeight: '600' }}>{item.titulo} </Text>
                  <Text style={{ fontSize: 16, marginLeft: 'auto', fontWeight: 'bold' }}>R${item.valor},00</Text>
                </View>
              ))}
            </SafeAreaView>
          </TouchableOpacity>
        )
      }



       <BtnPlus />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F7FC",
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 15,
    height: 300,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
  },
  side: {
    color: '#000',
    fontSize: 20,
    width: 55,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'semibold',
    fontFamily: 'Inter',
    fontSize: 20,
    textDecorationColor: '#000',
    textDecorationLine: 'underline',
    color: '#000',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#696969',
  },
  graphContainer: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datas: {
    flexDirection: 'column',
    height: '100%',
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 15,
  }
});
