import BtnEntradaSaida from '@/components/BtnEntradaSaida';
import { useTransactionDatabase } from '@/database/useTransactionDatabase';
import { RootState } from '@/store';
import { toggleVisibilidade } from '@/store/visibilidadeSlice';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { Pie, PolarChart } from "victory-native";

export function formatarValor(valorEmCentavos: number): string {
  const valorEmReais = valorEmCentavos / 100;
  return valorEmReais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export default function Home() {
  const transactionDatabase = useTransactionDatabase();
  const dispatch = useDispatch();

  const [ready, setReady] = useState(false);
  const [dataGrafico, setDataGrafico] = useState<any[]>([]);

  const datasOrdenadas = [...dataGrafico].sort((a, b) => b.value - a.value);


  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        setReady(false);
        
        const todasCategorias = await transactionDatabase.GetSomaPorCategoria();
        dispatch({ type: 'dataCategoria/setDataCategoria', payload: todasCategorias });

        const despesasPorCategoria = await transactionDatabase.GetSomaPorCategoria();
        const graficoData = despesasPorCategoria
          .filter(item => item.valor > 0)
          .map(item => ({
            label: item.titulo,
            value: item.valor,
            color: item.cor,
          }));
        setDataGrafico(graficoData);

        const newTotal = await transactionDatabase.GetTotalValue();
        dispatch({ type: 'total/setTotal', payload: newTotal });

        const newTotalReceitas = await transactionDatabase.GetReceitas();
        dispatch({ type: 'receitas/setReceitas', payload: newTotalReceitas });

        const newTotalDespesas = await transactionDatabase.GetDespesas();
        dispatch({ type: 'despesas/setDespesas', payload: newTotalDespesas });

        setReady(true);
      };

      carregarDados();
    }, [])
  );

  const total = useSelector((state: RootState) => state.total.value);
  const receitas = useSelector((state: RootState) => state.receitas.value);
  const despesas = useSelector((state: RootState) => state.despesas.value);
  const mostrarValores = useSelector((state: RootState) => state.visibilidade.mostrarValores);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Olá, Bem-vindo!</Text>
          <Text style={styles.headerSubtitle}>Este é o resumo da sua carteira</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Saldo Total</Text>
            <TouchableOpacity onPress={() => dispatch(toggleVisibilidade())}>
              <Feather name={mostrarValores ? "eye" : "eye-off"} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>
            {mostrarValores ? formatarValor(total) : 'R$ •••••'}
          </Text>
          <View style={styles.incomeExpenseContainer}>
            <View style={styles.incomeExpenseBox}>
              <Feather name="arrow-up-circle" size={24} color="#00A86B" />
              <View>
                <Text style={styles.incomeExpenseLabel}>Receitas</Text>
                <Text style={styles.incomeValue}>
                  {mostrarValores ? formatarValor(receitas) : 'R$ •••••'}
                </Text>
              </View>
            </View>
            <View style={styles.incomeExpenseBox}>
              <Feather name="arrow-down-circle" size={24} color="#E53935" />
              <View>
                <Text style={styles.incomeExpenseLabel}>Despesas</Text>
                <Text style={styles.expenseValue}>
                  {mostrarValores ? formatarValor(despesas) : 'R$ •••••'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Despesas por Categoria</Text>

        {!ready ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#004880" />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : dataGrafico.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="pie-chart" size={40} color="#CCC" />
            <Text style={styles.emptyText}>Sem dados de despesas para exibir.</Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <View style={styles.chartWrapper}>
              <PolarChart
                data={dataGrafico} 
                labelKey={"label"} 
                valueKey={"value"} 
                colorKey={"color"} 
              >
                <Pie.Chart innerRadius={50}/>
              </PolarChart>
            </View>
            <View style={styles.legendContainer}>
              {datasOrdenadas.map((item, index) => {
                const percentage = despesas > 0 ? (item.value / despesas) * 100 : 0;
                return (
                  <View key={index} style={styles.legendItem}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.label}</Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text style={styles.legendValue}>
                        {mostrarValores ? formatarValor(item.value) : 'R$ •••••'}
                      </Text>
                      {mostrarValores && (
                        <Text style={styles.legendPercentage}>
                          {percentage.toFixed(2)}%
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
      <BtnEntradaSaida />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#004880',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: '#005A9C',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceTitle: {
    color: '#FFF',
    fontSize: 16,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  incomeExpenseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incomeExpenseLabel: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  incomeValue: {
    color: '#00A86B',
    fontSize: 16,
    fontWeight: '600',
  },
  expenseValue: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#999',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartWrapper: {
    height: 180,
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  legendPercentage: {
    fontSize: 13,
    color: '#777',
  },
});
