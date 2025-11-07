import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContent";
import { ContasScreen } from "../screens/ContasScreen";
import { DetalhesContaScreen } from "../screens/DetalhesContaScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { NovaContaScreen } from "../screens/NovaContaScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { RootStackParamList } from "../types";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTab: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2563eb",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarStyle: {
            paddingBottom: (insets.bottom ?? 0) + 6,
            paddingTop: 5,
            height: 60 + (insets.bottom ?? 0),
          },
        }}
      >
        <Tab.Screen
          name="ContasTab"
          component={ContasStack}
          options={{
            tabBarLabel: "Contas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="NovaConta"
          component={NovaContaScreen}
          options={{
            tabBarLabel: "Nova Conta",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const ContasStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Contas" component={ContasScreen} />
      <Stack.Screen name="DetalhesConta" component={DetalhesContaScreen} />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTab />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
