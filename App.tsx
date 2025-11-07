import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import { AuthProvider } from "./src/contexts/AuthContent";
import { AppNavigator } from "./src/navigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
