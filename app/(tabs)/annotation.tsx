import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatarValor } from ".";
import { Anotacao, useAnnotationDatabase } from "../../database/useAnnotationDatabase";

export default function Annotation() {
  const { listarAnotacoes, deletarAnotacao } = useAnnotationDatabase();
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);

  async function carregarAnotacoes() {
    const dados = await listarAnotacoes();
    setAnotacoes(dados);
  }

  useFocusEffect(
    useCallback(() => {
      carregarAnotacoes();
    }, [])
  );

  function handleEditar(id: number) {
    router.push({ pathname: "/anotacao", params: { id } });
  }

  function handleDeletar(id: number) {
    Alert.alert("Confirmar", "Deseja realmente excluir esta anotação?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          await deletarAnotacao(id);
          carregarAnotacoes();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anotações</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/anotacao")}>
        <Feather name="plus-circle" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Criar Anotação</Text>
      </TouchableOpacity>

      <FlatList
        data={anotacoes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const total = item.itens?.reduce((acc, current) => acc + current.valor, 0) || 0;

          return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => handleEditar(item.id)}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.mes}</Text>
                <Text style={styles.itemTotal}>{formatarValor(total)}</Text>
              </View>
              <View style={styles.divider} />
              {item.itens?.slice(0, 3).map((subItem, index) => (
                <View key={index} style={styles.subItemContainer}>
                  <Text style={styles.subItemContent}>{subItem.conteudo}</Text>
                  <Text style={styles.subItemValue}>{formatarValor(subItem.valor)}</Text>
                </View>
              ))}
              {item.itens && item.itens.length > 3 && (
                <View style={styles.subItemContainer}>
                  <Text style={[styles.subItemContent, { fontStyle: 'italic', color: '#004880'}]}>Outros...</Text>
                  <Text style={styles.subItemValue}>+{item.itens.length - 3} conteúdos</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => handleDeletar(item.id)} style={styles.deleteButton}>
                <Feather name="trash-2" size={22} color="#E53935" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma anotação encontrada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
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
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#005A9C",
    margin: 20,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004880",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },
  subItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  subItemContent: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  subItemValue: {
    fontSize: 16,
    color: "#666",
  },
  deleteButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    padding: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});