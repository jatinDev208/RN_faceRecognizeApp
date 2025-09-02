import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function OrdersScreen({ route }: any) {
  const { order, name } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Orders for {name}</Text>
      <FlatList
        data={order.products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>${item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#203a43" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  card: {
    backgroundColor: "#2c5364",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
  },
  text: { color: "#fff", fontSize: 16 },
});
