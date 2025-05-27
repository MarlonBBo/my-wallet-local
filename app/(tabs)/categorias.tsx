import { useTransactionDatabase } from "@/database/useTransactionDatabase";
import { RootState } from "@/store";
import { addCategoria, removeCategoria, setDataCategoria } from "@/store/dataCategoriaSlice";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

export default function Categorias() {

  const transactionDatabase = useTransactionDatabase();

  const router = useRouter();

  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaCor, setNovaCor] = useState('#000000');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

    useEffect(() => {
    async function fetchCategorias() {
      try {
        const result = await transactionDatabase.GetAllCategorias();
        dispatch(setDataCategoria(result));
        console.log("Categorias fetched:", result);
      } catch (error) {
        console.error("Error fetching categorias:", error);
      }
    }

    fetchCategorias();
  }, []);


  const coresDisponiveis = [
    '#FF5722', '#03A9F4', '#4CAF50', '#FFC107', '#9C27B0', '#E91E63',
    '#00BCD4', '#FF9800', '#8BC34A', '#795548', '#607D8B', '#F44336',
  ];

  const adicionarCategoria = async () => {
  if (novaCategoria.trim() === '') {
    Alert.alert("Atenção", "Preencha o nome da categoria!");
    return;
  }
  try {
    setLoading(true);
    const result = await transactionDatabase.CreateCategoria({
      titulo: novaCategoria,
      cor: novaCor,
      valor: 0
    });
    dispatch(addCategoria(result));
    setNovaCategoria('');
    setNovaCor('#000000');
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const deleteCategoria = async (id: number) => {
    try {
      await transactionDatabase.DeleteCategoriaById(id);
      dispatch(removeCategoria(id));
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
    }
  };

  const confirmarExclusao = (id: number) => {
    Alert.alert(
      "Confirmação",
      "Tem certeza que deseja excluir esta categoria?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteCategoria(id) }
      ]
    );
  };

  // const navigateProps = (id: number, titulo: string, cor: string) => {
  //   router.push({
  //     pathname: "/(tabs)",
  //     params: { id: id.toString(), titulo, cor}
  //   });
  // };


  const dataCaregoria = useSelector((state: RootState) => state.dataCategoria.lista);

  const dataCaregoriaOrdenada = [...dataCaregoria].sort((a, b) => b.valor - a.valor);


  return (
    <View style={styles.container}>
      <StatusBar style="light" />

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
              data={coresDisponiveis}
              keyExtractor={(item) => item}
              horizontal
              renderItem={({ item: cor }) => (
                <TouchableOpacity
                  style={[styles.colorCircle, { backgroundColor: cor }, novaCor === cor && styles.colorCircleSelected]}
                  onPress={() => setNovaCor(cor)}
                >
                  {novaCor === cor && <Text style={styles.corText}>✔</Text>}
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 8 }}
            />
          </View>

        <TouchableOpacity style={styles.addButton} onPress={adicionarCategoria} disabled={loading}>
          {loading ? <Text style={{ color: 'white' }}>...</Text> : <Feather name="plus" size={24} color="#FFF" />}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {dataCaregoriaOrdenada.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma Categoria cadastrada</Text>
            ) : (
              <FlatList
                data={dataCaregoriaOrdenada}
                keyExtractor={(item) => item.id != null ? item.id.toString() : item.titulo}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                      router.push({
                        pathname: '/(tabs)',
                        params: { id: item.id.toString(), titulo: item.titulo, cor: item.cor }
                      });
                    }} style={[styles.categoriaItem, { backgroundColor: item.cor || '#FFF' }]}>
                    <Text style={styles.categoriaText}>{item.titulo} - R$ {(item.valor ?? 0).toFixed(2)}</Text>
                    <TouchableOpacity onPress={()=> confirmarExclusao(item.id)} style={{backgroundColor: "red", width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10}}>
                      <Feather name="trash-2" size={20} color={"white"}/>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            )    
      }

      
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
    backgroundColor: '#7C4DFF',
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
    backgroundColor: '#7C4DFF',
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
    color: '#FFF',
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
    borderColor: '#7C4DFF',
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
