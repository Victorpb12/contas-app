// src/screens/LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authService } from "../services/authService";

// Ajuste esse tipo conforme seu RootStackParamList
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const emailIsValid = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const canSubmit =
    email.trim().length > 0 && password.length >= 4 && emailIsValid(email);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!emailIsValid(email)) {
      setErrorMsg("Insira um email válido.");
      return;
    }
    if (password.length < 4) {
      setErrorMsg("Senha muito curta.");
      return;
    }

    setLoading(true);
    try {
      // chamada para o service (atualmente stub) — trocar depois para Supabase
      const result = await authService.signIn(
        email.trim(),
        password,
        rememberMe
      );

      if (result.ok) {
        // navega para home ou rota principal
        navigation.replace("Home");
      } else {
        setErrorMsg(
          result.error || "Erro ao autenticar. Verifique email/senha."
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <View className="flex-1 bg-gray-50 px-6 pt-12">
        <View className="items-center mb-8">
          <View className="bg-blue-600 rounded-full p-4 mb-4 shadow">
            <Ionicons name="wallet-outline" size={36} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">Bem-vindo</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Faça login pra continuar
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-sm text-gray-600 font-semibold mb-2">
            Email
          </Text>
          <TextInput
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="seu@exemplo.com"
            value={email}
            onChangeText={(t) => setEmail(t)}
            className="bg-gray-100 rounded-lg px-3 py-3 mb-3"
            accessibilityLabel="campo email"
          />

          <Text className="text-sm text-gray-600 font-semibold mb-2">
            Senha
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-1 mb-3">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              autoCapitalize="none"
              textContentType="password"
              className="flex-1 py-3"
              accessibilityLabel="campo senha"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              accessibilityLabel={
                showPassword ? "Ocultar senha" : "Mostrar senha"
              }
              className="p-2"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity
              onPress={() => setRememberMe((v) => !v)}
              className="flex-row items-center"
              accessibilityLabel="Lembrar-me"
            >
              <View
                className={`w-5 h-5 rounded-sm mr-3 items-center justify-center ${
                  rememberMe ? "bg-blue-600" : "bg-white border border-gray-300"
                }`}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text className="text-sm text-gray-700">Lembrar-me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text className="text-sm text-blue-600 font-semibold">
                Esqueci a senha
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <Text className="text-sm text-red-600 mb-3">{errorMsg}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={!canSubmit || loading}
            className={`py-3 rounded-lg items-center ${
              canSubmit ? "bg-blue-600" : "bg-blue-300"
            }`}
            accessibilityLabel="Botão entrar"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Entrar</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600 mr-2">Não tem conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-blue-600 font-semibold">Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-xs text-gray-400 text-center px-6">
            Ao entrar você concorda com os termos (placeholder). A autenticação
            será implementada com Supabase em seguida.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
