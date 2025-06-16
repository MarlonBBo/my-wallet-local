import { useTransactionDatabase } from "@/database/useTransactionDatabase";
import { RootState } from "@/store";
import { addCategoria, removeCategoria } from "@/store/dataCategoriaSlice";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList, Swipeable } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { formatarValor } from ".";

export default function Categorias() {
  const coresDisponiveis = [
    '#FF5252',
    '#CDDC39',
    '#00BCD4',
    '#7C4DFF',
    '#EC407A',
    '#AB47BC',
    '#66BB6A',
    '#FFEB3B',
    '#42A5F5',
    '#FF8A65',
  ];

  const dispatch = useDispatch();
  const router = useRouter();
  const transactionDatabase = useTransactionDatabase();

  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaCor, setNovaCor] = useState('#000000');
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
  if (novaCategoria.trim() === '') {
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

  try {

    const nova = {
      titulo: novaCategoria.trim(),
      cor: novaCor,
      valor: 0,
    };

    const resultado = await transactionDatabase.CreateCategoria(nova);
    dispatch(addCategoria(resultado));

    setNovaCategoria('');
    setNovaCor('#000000');

    setCoresRestantes(prev => prev.filter(cor => cor !== novaCor));
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorias</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inputContainer}
      >
        <TextInput
          placeholder="Nome da categoria"
          placeholderTextColor="#999"
          style={styles.input}
          value={novaCategoria}
          onChangeText={setNovaCategoria}
        />

        <View style={styles.colorPickerContainer}>
          <FlatList
            data={coresRestantes.length > 0 ? coresRestantes : coresDisponiveis}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            horizontal
            renderItem={({ item: cor }) => (
              <TouchableOpacity
                style={[
                  styles.colorCircle,
                  { backgroundColor: cor },
                  novaCor === cor && styles.colorCircleSelected,
                ]}
                onPress={() => setNovaCor(cor)}
              >
                {novaCor === cor && <Text style={styles.corText}>✔</Text>}
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            ListEmptyComponent={
              <Text style={{ color: '#999' }}>Todas as cores estão em uso</Text>
            }
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={adicionarCategoria}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>

      </KeyboardAvoidingView>

      {dataCategoriaOrdenada.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma Categoria cadastrada</Text>
      ) : (
        <FlatList
          data={dataCategoriaOrdenada}
          keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Swipeable
              containerStyle={{ borderRadius: 2 }}
              ref={(ref) => { swipeableRefs.current[item.id] = ref; }}
              renderRightActions={() => (
                <TouchableOpacity
                  onPress={() => deleteCategoria(item.id)}
                  style={{
                    width: 50,
                    height: '80%',
                    backgroundColor: '#C2185B',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                  }}
                >
                  <Feather name="trash-2" size={20} color="white" />
                </TouchableOpacity>
              )}
              overshootRight={false}
            >
              <TouchableOpacity
                onPress={() => abrirAcoes(item.id)}
                activeOpacity={10}
              >
                <View style={[
                  styles.categoriaItem,
                  { backgroundColor: "#FFF", borderWidth: 2, borderColor: item.cor }
                ]}>
                  <Text style={styles.categoriaText}>
                    {item.titulo} - {mostrarValores ? formatarValor(item.valor) : "*****"}
                  </Text>
                  <Feather name="chevron-left" size={20} color="black" />
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
    backgroundColor: '#F2F2F2',
    gap: 10,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    padding: 16,
    backgroundColor: '#004880',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  inputContainer: {
    padding: 16,
    
  },
  input: {
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  corPreview: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  corText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#004880',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  categoriaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoriaText: {
    fontSize: 16,
    color: "#000",
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 9,
    borderRadius: 12,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  colorCircleSelected: {
    borderColor: '#004880',
    borderWidth: 3,
  },
  fecharModal: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: 120,
    alignItems: 'center',
  },
  fecharTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C4DFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
