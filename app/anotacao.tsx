import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnotacaoItem, useAnnotationDatabase } from '../database/useAnnotationDatabase';
import { formatarValor } from './(tabs)';


export default function Anotacao() {

  const { id } = useLocalSearchParams();
  const { salvarAnotacao, listarAnotacoes, deletarItem, atualizarAnotacaoCompleta, atualizarTipoAnotacao } = useAnnotationDatabase();

  const [mes, setMes] = useState('');
  const [conteudoAtual, setConteudoAtual] = useState('');
  const [valorAtual, setValorAtual] = useState(0);
  const [dados, setDados] = useState<AnotacaoItem[]>([]);
  const [anotacaoId, setAnotacaoId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<'pagar' | 'receber'>('pagar');
  const [concluido, setConcluido] = useState(0);

  const renderCheck = (checked: boolean) => (
    <View style={[styles.checkbox, checked && styles.checked]}>
      {checked && <View style={styles.checkboxInner} />}
    </View>
  );

  const conteudoRef = useRef<TextInput>(null);
  const valorRef = useRef<TextInput>(null);

  const valorTotal = dados.reduce((total, item) => total + item.valor, 0);

  useEffect(() => {
    if (id) {
      const loadAnotacao = async () => {
        const anotacoes = await listarAnotacoes();
        const anotacaoExistente = anotacoes.find(a => a.id === Number(id));
        if (anotacaoExistente) {
          setMes(anotacaoExistente.mes);
          setDados(anotacaoExistente.itens || []);
          setAnotacaoId(anotacaoExistente.id);
          setTipo(anotacaoExistente.tipo === 'pagar' ? 'pagar' : 'receber')

          console.log(anotacaoExistente)
        }
      };
      loadAnotacao();
    }
  }, [id]);

  async function adicionarConteudo() {
    if (!mes.trim()) {
      Alert.alert("Erro", "O campo 'Mês' é obrigatório.");
      return;
    }

    if (conteudoAtual.trim() && valorAtual) {
      const novoItem: AnotacaoItem = {
        conteudo: conteudoAtual,
        valor: valorAtual,
        concluido: concluido
      };

      const novaLista = [...dados, novoItem];
      setDados(novaLista);
      setConteudoAtual('');
      setValorAtual(0);

      conteudoRef.current?.focus();

      if (anotacaoId) {
        await atualizarAnotacao(novaLista);
      } else {
        const novoId = await handleSalvarAnotacao(novaLista);
        if (novoId) {
          setAnotacaoId(novoId);
        }
      }
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

  async function handleSalvarAnotacao(itens: AnotacaoItem[]): Promise<number | null> {
    try {
      const idCriado = await salvarAnotacao(mes, tipo, itens);
      return idCriado;
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a anotação.");
      console.error(error);
      return null;
    }
  }


  async function atualizarAnotacao(itens: AnotacaoItem[]) {

    if (anotacaoId) {
      try {
        await atualizarAnotacaoCompleta(anotacaoId, mes, tipo, itens);
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
              placeholder="Conteúdo"
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

          <View style={styles.containerCheck}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity onPress={() => {
                  setTipo('pagar');
                  if (anotacaoId) atualizarTipoAnotacao(anotacaoId, 'pagar');
                }} style={styles.checkboxWrapper}>
                  {renderCheck(tipo === 'pagar')}
                  <Text style={styles.labelPagar}>Pagar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity onPress={() => {
                  setTipo('receber');
                  if (anotacaoId) atualizarTipoAnotacao(anotacaoId, 'receber');
                }} style={styles.checkboxWrapper}>
                  {renderCheck(tipo === 'receber')}
                  <Text style={styles.labelReceber}>Receber</Text>
                </TouchableOpacity>
              </View>
            </View>

          <TouchableOpacity
            style={[styles.addButton, !mes.trim() && { opacity: 0.5 }]}
            onPress={adicionarConteudo}
            disabled={!mes.trim()}
          >
            <Feather name="plus-circle" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Adicionar Item</Text>
          </TouchableOpacity>
        </View>

        {dados.length > 0 && (
          <View style={styles.listaContainer}>
            <View style={styles.listaHeader}>
              <Text style={styles.listaTitulo}>Itens Adicionados</Text>
              <Text style={[styles.listaTotal,{color: tipo === 'pagar' ? '#E53935' : '#28a745'} ]}>{formatarValor(valorTotal)}</Text>
            </View>
            {dados.map((item, index) => (
              <View key={index} style={styles.itemLista}>

                <TouchableOpacity
                  onPress={() => {
                    const novaLista = [...dados];
                    novaLista[index].concluido = novaLista[index].concluido === 1 ? 0 : 1;
                    setDados(novaLista);
                    atualizarAnotacao(novaLista);
                  }}
                  style={[styles.checkboxConcluido, item.concluido === 1 && styles.checkboxAtivo]}
                >
                  {item.concluido === 1 && <View style={styles.checkboxInnerConcluido} />}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.itemTexto,
                    item.concluido === 1 && { textDecorationLine: 'line-through', color: '#999' }
                  ]}
                >
                  {item.conteudo}: <Text style={[styles.itemValor, item.concluido === 1 && { textDecorationLine: 'line-through', color: '#999' }]}>{formatarValor(item.valor)}</Text>
                </Text>

                <TouchableOpacity onPress={() => removerConteudo(index)}>
                  <Feather name="trash-2" size={22} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  listaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listaTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerCheck: {
    flexDirection: "row",
    paddingHorizontal: 20,
    width: "100%",
    justifyContent: "space-between"
  },
  checkboxRow: {
    marginBottom: 10,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#005A9C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#005A9C',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#005A9C',
    borderRadius: 2,
  },
  labelPagar: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#E53935',
  },
  labelReceber: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#4CAF50',
  },
  checkboxConcluido: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxAtivo: {
    backgroundColor: '#005A9C',
    borderColor: '#005A9C',
  },

  checkboxInnerConcluido: {
    width: 10,
    height: 10,
    backgroundColor: '#005A9C',
    borderRadius: 2,
  },
});
