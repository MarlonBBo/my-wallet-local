import { useTransactionDatabase } from "@/database/useTransactionDatabase";
import { RootState } from "@/store";
import { addCategoria, removeCategoria } from "@/store/dataCategoriaSlice";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList, Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { formatarValor } from ".";

export default function Categorias() {
  const coresDisponiveis = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#FFEB3B',
  '#FF9800',
  '#FF5722',
];


  const dispatch = useDispatch();
  const transactionDatabase = useTransactionDatabase();

  const [novaCategoria, setNovaCategoria] = useState('');
  const [coresRestantes, setCoresRestantes] = useState<string[]>(coresDisponiveis);

  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

  const dataCategoria = useSelector((state: RootState) => state.dataCategoria.lista);
  const mostrarValores = useSelector((state: RootState) => state.visibilidade.mostrarValores);

  const dataCategoriaOrdenada = [...dataCategoria].sort((a, b) => b.valor - a.valor);

  useEffect(() => {
  const coresUsadas = dataCategoria.map(cat => cat.cor);
  setCoresRestantes(coresDisponiveis.filter(
    cor => !coresUsadas.includes(cor)
  ));
}, [dataCategoria]);

  const adicionarCategoria = async () => {
  if (novaCategoria.trim() === '' ) {
    Alert.alert("Atenção", "Preencha o nome da categoria!");
    return;
  }

  const nomeNormalizado = novaCategoria.trim().toLowerCase();
  const existeCategoria = dataCategoriaOrdenada.some(
    (cat) => cat.titulo.trim().toLowerCase() === nomeNormalizado
  );

  if (existeCategoria) {
    Alert.alert("Atenção", "Já existe uma categoria com esse nome!");
    return;
  }

  const cor = coresRestantes[Math.floor(Math.random() * coresRestantes.length)]

  try {

    const nova = {
      titulo: novaCategoria.trim(),
      cor: cor,
      valor: 0,
    };

    console.log(nova)

    const resultado = await transactionDatabase.CreateCategoria(nova);
    dispatch(addCategoria(resultado));

    setNovaCategoria('');

    setCoresRestantes(prev => prev.filter(c => c !== cor));
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
  }
};

 const deleteCategoria = (id: number) => {
  const categoria = dataCategoria.find(c => c.id === id);
  if (!categoria) {
    console.warn("Categoria não encontrada:", id);
    return;
  }

  Alert.alert(
    "Excluir Categoria",
    `Tem certeza que deseja excluir a categoria "${categoria.titulo}"?`,
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const corParaRecuperar = categoria.cor;

            await transactionDatabase.DeleteCategoriaAndRestoreValor(id);
            dispatch(removeCategoria(id));

            setCoresRestantes(prev => {
              const corExisteNasDisponiveis = coresDisponiveis.includes(corParaRecuperar);
              const corJaDisponivel = prev.includes(corParaRecuperar);
              if (corExisteNasDisponiveis && !corJaDisponivel) {
                return [...prev, corParaRecuperar];
              }
              return prev;
            });

          } catch (error) {
            console.error("Erro ao deletar categoria:", error);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  const abrirAcoes = (id: number) => {
    swipeableRefs.current[id]?.openRight?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categorias</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ paddingHorizontal: 20 }}
      >
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nome da categoria"
            placeholderTextColor="#999"
            style={styles.input}
            value={novaCategoria}
            onSubmitEditing={adicionarCategoria}
            returnKeyType="done"
            onChangeText={setNovaCategoria}
          />
          <TouchableOpacity
            onPress={() => (adicionarCategoria(), Keyboard.dismiss())}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Criar</Text>
            <Feather name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {dataCategoriaOrdenada.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="folder" size={40} color="#CCC" />
          <Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
        </View>
      ) : (
        <FlatList
          data={dataCategoriaOrdenada}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Swipeable
              ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
              renderRightActions={() => (
                <View style={styles.deleteActionContainer}>
                  <TouchableOpacity
                    onPress={() => deleteCategoria(item.id)}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={22} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              overshootRight={false}
              containerStyle={styles.swipeableContainer}
            >
              <TouchableOpacity
                onPress={() => abrirAcoes(item.id)}
                activeOpacity={10}
                style={styles.categoriaTouchable}
              >
                <View style={styles.categoriaItem}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.cor }]} />
                  <View style={styles.categoriaInfo}>
                    <Text style={styles.categoriaText}>{item.titulo}</Text>
                    <Text style={styles.categoriaValor}>
                      {mostrarValores ? formatarValor(item.valor) : 'R$ •••••'}
                    </Text>
                  </View>
                  <Feather name="chevron-left" size={24} color="#CCC" />
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#004880',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    height: 50,
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  addButton: {
    backgroundColor: '#004880',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  swipeableContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteButton: {
    backgroundColor: '#C2185B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderRadius: 12,
  },
  categoriaTouchable: {
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  colorIndicator: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 16,
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoriaValor: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
