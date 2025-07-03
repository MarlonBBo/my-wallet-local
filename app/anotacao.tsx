import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnotacaoItem, useAnnotationDatabase } from '../database/useAnnotationDatabase';
import { formatarValor } from './(tabs)';

export default function Anotacao() {

  const { id } = useLocalSearchParams();
  const { salvarAnotacao, listarAnotacoes, deletarItem, atualizarAnotacaoCompleta } = useAnnotationDatabase();

  const [mes, setMes] = useState('');
  const [conteudoAtual, setConteudoAtual] = useState('');
  const [valorAtual, setValorAtual] = useState(0);
  const [dados, setDados] = useState<AnotacaoItem[]>([]);
  const [anotacaoId, setAnotacaoId] = useState<number | null>(null);

  const conteudoRef = useRef<TextInput>(null);
  const valorRef = useRef<TextInput>(null);

  useEffect(() => {
    if (id) {
      const loadAnotacao = async () => {
        const anotacoes = await listarAnotacoes();
        const anotacaoExistente = anotacoes.find(a => a.id === Number(id));
        if (anotacaoExistente) {
          setMes(anotacaoExistente.mes);
          setDados(anotacaoExistente.itens || []);
          setAnotacaoId(anotacaoExistente.id);
        }
      };
      loadAnotacao();
    }
  }, [id]);

  function adicionarConteudo() {
    if (conteudoAtual.trim() && valorAtual) {
      const novoItem: AnotacaoItem = {
        conteudo: conteudoAtual,
        valor: valorAtual
      };
      setDados(prev => [...prev, novoItem]);
      setConteudoAtual('');
      setValorAtual(0);
    }
  }

  function removerConteudo(indexParaRemover: number) {
    const itemParaRemover = dados[indexParaRemover];
    if (itemParaRemover.id) {
        Alert.alert(
            "Confirmar exclusão",
            "Você tem certeza que quer deletar este item?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Deletar", onPress: async () => {
                    await deletarItem(itemParaRemover.id!);
                    setDados(prev => prev.filter((_, index) => index !== indexParaRemover));
                }}
            ]
        );
    } else {
        setDados(prev => prev.filter((_, index) => index !== indexParaRemover));
    }
  }

  async function handleSalvarAnotacao() {
    if (!mes.trim()) {
      Alert.alert("Erro", "O campo 'Mês' é obrigatório.");
      return;
    }
    try {
      await salvarAnotacao(mes, dados);
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a anotação.");
      console.error(error);
    }
  }

  async function atualizarAnotacao() {
    if (!mes.trim()) {
      Alert.alert("Erro", "O campo 'Mês' é obrigatório.");
      return;
    }
    if (anotacaoId) {
      try {
        await atualizarAnotacaoCompleta(anotacaoId, mes, dados);
        router.back();
      } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar a anotação.");
        console.error(error);
      }
    } else {
      Alert.alert("Erro", "Anotação não encontrada.");
    }
  }

  const handleChange = (text: string) => {
    const numeros = text.replace(/\D/g, '');
    const numeroComoInt = parseInt(numeros || '0', 10);
    setValorAtual(Math.max(numeroComoInt, 0));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bloco de Anotações</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.inputMes}
            placeholder="Digite o Mês"
            placeholderTextColor="#999"
            textAlign='center'
            value={mes}
            onChangeText={setMes}
            onSubmitEditing={() => conteudoRef.current?.focus()}
            returnKeyType="next"
          />

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              placeholderTextColor="#999"
              value={conteudoAtual}
              onChangeText={setConteudoAtual}
              ref={conteudoRef}
              onSubmitEditing={() => valorRef.current?.focus()}
              returnKeyType="next"
            />
            <TextInput
              style={styles.inputValor}
              placeholder="R$ 0,00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={valorAtual === 0 ? '' : formatarValor(valorAtual)}
              onChangeText={handleChange}
              ref={valorRef}
              onSubmitEditing={adicionarConteudo}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={adicionarConteudo}>
            <Feather name="plus-circle" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Adicionar Item</Text>
          </TouchableOpacity>
        </View>

        {dados.length > 0 && (
          <View style={styles.listaContainer}>
            <Text style={styles.listaTitulo}>Itens Adicionados</Text>
            {dados.map((item, index) => (
              <View key={index} style={styles.itemLista}>
                <Text style={styles.itemTexto}>{item.conteudo}: <Text style={styles.itemValor}>{formatarValor(item.valor)}</Text></Text>
                <TouchableOpacity onPress={() => removerConteudo(index)}>
                  <Feather name="trash-2" size={22} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={id ? atualizarAnotacao : handleSalvarAnotacao}>
          <Feather name="save" size={20} color="#28a745" />
          <Text style={styles.saveButtonText}>Salvar Anotação</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#004880',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputMes: {
    width: '100%',
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    fontWeight: "500",
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 10,
  },
  inputValor: {
    width: 100,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#005A9C',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listaContainer: {
    marginHorizontal: 20,
    marginTop: 25,
  },
  listaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  itemLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  itemTexto: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  itemValor: {
    fontWeight: 'bold',
    color: '#004880',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F7E9',
    borderWidth: 1,
    borderColor: '#28a745',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  saveButtonText: {
    color: '#28a745',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
