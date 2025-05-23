import BtnPlus from '@/components/BtnPlus';
import { RootState } from '@/store'; // ajuste conforme o caminho do seu store
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from "react";
import { InteractionManager, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Pie, PolarChart } from 'victory-native';

const DATA = [
  { label: "Educação", value: 10, color: "#FF0000" },
  { label: "Casa", value: 20.00, color: "#00FF00" },
  { label: "Alimentação", value: 30, color: "#0000FF" },
  { label: "Outros...", value: 70, color: "#696969" },
];

export default function Home() {

const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });

  return () => task.cancel();
}, []);

  const total = useSelector((state: RootState) => state.total.value);

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
          <Text style={{ fontWeight: "bold", fontSize: 30 }}>R${total.toFixed(2)}</Text>

          <TouchableOpacity style={{ width: 40, height: 30, alignItems: 'center', justifyContent: 'center', borderColor: '#696969' }}>
            <Feather name="eye" size={20} color="#A9A9A9" style={{ marginTop: 10 }} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name='arrow-up' size={30} color={'#32CD32'} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>Receitas</Text>
                <Text style={{ fontSize: 20, fontWeight: "500", color: "#32CD32" }}>R$6,600.00</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name='arrow-down' size={30} color={'#FF3009'} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>Despesas</Text>
                <Text style={{ fontSize: 20, fontWeight: "500", color: "#FF3009" }}>R$2,500.00</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Text style={{ fontSize: 20, fontWeight: "bold", paddingVertical: 20, paddingHorizontal: 10, paddingBottom: 5, color: "#696969" }}>Despesas por categoria</Text>

      {ready && (
          <View style={styles.graphContainer}>
            <View style={{height: 100, width: 100}}>
              <PolarChart
                data={DATA}
                labelKey={"label"}
                valueKey={"value"}
                colorKey={"color"}
              >
                <Pie.Chart innerRadius={30} />
              </PolarChart>
            </View>
            <SafeAreaView style={styles.datas}>
              {DATA.map((item, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%'}}>
                  <View style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: 10, marginRight: 10 }} />
                  <Text style={{ fontSize: 16 , color: "#696969", fontWeight: '600'}}>{item.label} </Text>
                  <Text style={{ fontSize: 16, marginLeft: 'auto', fontWeight: 'bold' }}>R${item.value},00</Text>
                </View>
              ))}
            </SafeAreaView>
          </View>
        )}

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
