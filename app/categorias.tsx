import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// import WheelColorPicker from 'react-native-wheel-color-picker'; // Removido

export default function Categorias() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([
    { id: 1, titulo: 'Alimentação', cor: '#FF5722', valor: 0 },
    { id: 2, titulo: 'Transporte', cor: '#03A9F4', valor: 0 },
  ]);

  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaCor, setNovaCor] = useState('#000000');
  const [novoValor, setNovoValor] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  // Cores predefinidas
  const coresDisponiveis = [
    '#FF5722', '#03A9F4', '#4CAF50', '#FFC107', '#9C27B0', '#E91E63',
    '#00BCD4', '#FF9800', '#8BC34A', '#795548', '#607D8B', '#F44336',
  ];

  const adicionarCategoria = () => {
    if (novaCategoria.trim() === '') {
      Alert.alert("Atenção", "Preencha o nome da categoria!");
      return;
    }

    const nova = {
      id: Date.now(),
      titulo: novaCategoria.trim(),
      cor: novaCor,
      valor: Number(novoValor) || 0,
    };

    setCategorias([nova, ...categorias]);
    setNovaCategoria('');
    setNovaCor('#000000');
    setNovoValor('');
  };

  const getContraste = (hex: string) => {
    if (!hex) return '#FFF';
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#FFF';
  };

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

        <TouchableOpacity
          style={[styles.corPreview, { backgroundColor: novaCor }]}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.corText}>Selecionar Cor</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Valor inicial (opcional)"
          placeholderTextColor="#999"
          style={styles.input}
          value={novoValor}
          onChangeText={setNovoValor}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.addButton} onPress={adicionarCategoria}>
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.categoriaItem, { backgroundColor: item.cor || '#FFF' }]}>
            <Text style={styles.categoriaText}>{item.titulo} - R$ {item.valor.toFixed(2)}</Text>
          </View>
        )}
      />

      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.colorPickerContainer}>
            {coresDisponiveis.map((cor) => (
              <TouchableOpacity
                key={cor}
                style={[
                  styles.colorCircle,
                  { backgroundColor: cor },
                  cor === novaCor ? styles.colorCircleSelected : null,
                ]}
                onPress={() => {
                  setNovaCor(cor);
                  setPickerVisible(false);
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.fecharModal}
            onPress={() => setPickerVisible(false)}
          >
            <Text style={styles.fecharTexto}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
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
    flexWrap: 'wrap',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    justifyContent: 'center',
    maxWidth: 320,
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
});
