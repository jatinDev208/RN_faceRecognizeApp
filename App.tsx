import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FaceCapture from "./src/screens/FaceCapture";
import OrdersScreen from "./src/screens/OrdersScreen";
import ProductsScreen from "./src/screens/ProductsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {/* Start directly with FaceCapture */}
        <Stack.Screen name="FaceCapture" component={FaceCapture} options={{ title: "Face Recognition" }} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: "Select Products" }} />
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: "My Orders" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
