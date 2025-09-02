import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { baseUrl } from "../utils/constant";

const products = [
  { id: "1", name: "iPhone 15", price: 1200 },
  { id: "2", name: "MacBook Pro", price: 2500 },
  { id: "3", name: "AirPods Pro", price: 250 },
];

export default function ProductsScreen() {
  const [cart, setCart] = useState<any[]>([]);
  const [checkoutLoader, setCheckoutLoader] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { name, faceImg } = route.params;

  const addToCart = (item: any) => {
    setCart([...cart, item]);
    Alert.alert("Added", `${item.name} added to cart`);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      Alert.alert("Cart Empty", "Please select products first");
      return;
    }

    try {
      setCheckoutLoader(true);

      const order = { id: Date.now().toString(), products: cart };

      // save order for that face/user
      await AsyncStorage.setItem(`order_${name}`, JSON.stringify(order));

      // save to backend with face
      await fetch(`${baseUrl}/register-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: faceImg, name }),
      });

      navigation.replace("Orders", { order, name });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while creating order");
    } finally {
      setCheckoutLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍️ Select Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinearGradient colors={["#36D1DC", "#5B86E5"]} style={styles.card}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>${item.price}</Text>
            <TouchableOpacity onPress={() => addToCart(item)} style={styles.btn}>
              <Text style={styles.btnText}>Add</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      />

      <TouchableOpacity
        onPress={checkout}
        disabled={checkoutLoader}
        style={[styles.checkout, checkoutLoader && { opacity: 0.6 }]}
      >
        {checkoutLoader ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutText}>Checkout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0f2027" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  card: { padding: 15, marginVertical: 8, borderRadius: 12 },
  text: { color: "#fff", fontSize: 16 },
  btn: { backgroundColor: "#000", padding: 8, borderRadius: 8, marginTop: 5 },
  btnText: { color: "#fff" },
  checkout: { marginTop: 20, backgroundColor: "#FF512F", padding: 15, borderRadius: 12 },
  checkoutText: { color: "#fff", textAlign: "center", fontSize: 18 },
});
