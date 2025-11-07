import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authService } from "../services/authService";

type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailIsValid = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const passwordStrongEnough = (p: string) => p.length >= 6;

  const handleRegister = async () => {
    setErrorMsg(null);

    if (!emailIsValid(email)) {
      setErrorMsg("Email inválido, corrige aí.");
      return;
    }
    if (!passwordStrongEnough(password)) {
      setErrorMsg("Senha muito curta — use pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("As senhas não batem. Confere aí.");
      return;
    }

    setLoading(true);
    try {
      const res = (await authService.signUp?.(email.trim(), password, {
        name,
      })) ?? { ok: false, error: "signUp não implementado no authService" };

      if (res.ok) {
        Alert.alert(
          "Conta criada",
          "Beleza — sua conta foi criada. Agora faça login.",
          [{ text: "Ok", onPress: () => navigation.replace("Login") }]
        );
      } else {
        setErrorMsg(res.error || "Erro ao criar conta.");
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
        <View className="items-center mb-6">
          <View className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-full p-4 mb-4 shadow">
            <Ionicons name="person-add-outline" size={36} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">Criar conta</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Rápido e seguro — bora!
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-sm text-gray-600 font-semibold mb-2">
            Nome (opcional)
          </Text>
          <TextInput
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            className="bg-gray-100 rounded-lg px-3 py-3 mb-3"
            accessibilityLabel="campo nome"
          />

          <Text className="text-sm text-gray-600 font-semibold mb-2">
            Email
          </Text>
          <TextInput
            placeholder="seu@exemplo.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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
              placeholder="Mínimo 6 caracteres"
              autoCapitalize="none"
              className="flex-1 py-3"
              accessibilityLabel="campo senha"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              className="p-2"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-600 font-semibold mb-2">
            Confirme a senha
          </Text>
          <TextInput
            placeholder="Repete a senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            className="bg-gray-100 rounded-lg px-3 py-3 mb-3"
            accessibilityLabel="campo confirmar senha"
          />

          {errorMsg ? (
            <Text className="text-sm text-red-600 mb-3">{errorMsg}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`py-3 rounded-lg items-center ${
              loading ? "bg-blue-300" : "bg-blue-600"
            }`}
            accessibilityLabel="Botão criar conta"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Criar conta</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600 mr-2">Já tem conta?</Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text className="text-blue-600 font-semibold">Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
